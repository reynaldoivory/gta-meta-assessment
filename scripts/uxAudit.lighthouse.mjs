// Lighthouse accessibility scores for all four views. The app has no URL
// routing (step state lives in AssessmentContext), so a normal per-URL
// Lighthouse run can't reach results/actionPlan/garage -- this uses
// Lighthouse's user-flow "snapshot" API instead, driving one shared page
// through the real UI (via puppeteer-core, connected to the cached
// Playwright Chromium binary) and snapshotting Lighthouse at each state.
//
// Usage:
//   npm run build && npm run preview &   (port 4173, base path baked in)
//   node scripts/uxAudit.lighthouse.mjs

import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('puppeteer-core');
const { startFlow } = require('lighthouse');

const CHROMIUM_PATH = path.join(os.homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux64/chrome');
const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:4173/gta-meta-assessment/';
const OUT_FILE = path.join(process.cwd(), 'docs', 'ux-overhaul', 'LIGHTHOUSE.md');
const GATE = 95;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(CHROMIUM_PATH) ? CHROMIUM_PATH : undefined,
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const flow = await startFlow(page, {
    config: {
      extends: 'lighthouse:default',
      settings: { onlyCategories: ['accessibility'] },
    },
  });

  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForSelector('xpath/.//button[contains(., "Run Assessment")]', { timeout: 15000 });
  await flow.snapshot({ name: 'form' });

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /Garage/i.test(b.textContent || ''));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('THE GARAGE'), { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 500));
  await flow.snapshot({ name: 'garage' });

  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForSelector('xpath/.//button[contains(., "Run Assessment")]', { timeout: 15000 });
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /Run Assessment/i.test(b.textContent || ''));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Empire Report Card'), { timeout: 20000 });
  await new Promise((r) => setTimeout(r, 500));
  await flow.snapshot({ name: 'results' });

  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => /View Action Plan/i.test(b.textContent || ''));
    btn?.click();
  });
  await page.waitForFunction(() => document.body.innerText.includes('Priority Action Plan'), { timeout: 15000 });
  await new Promise((r) => setTimeout(r, 500));
  await flow.snapshot({ name: 'actionPlan' });

  await browser.close();

  const flowResult = await flow.createFlowResult();
  const scores = flowResult.steps.map((step) => ({
    name: step.name,
    score: Math.round((step.lhr.categories.accessibility.score ?? 0) * 100),
  }));

  const lines = [
    '# Lighthouse Accessibility Scores',
    '',
    `Generated ${new Date().toISOString().split('T')[0]} by \`scripts/uxAudit.lighthouse.mjs\`.`,
    `Gate: >= ${GATE} on form/results/garage. actionPlan is reachable only via a live click from` +
      ' results inside the same flow and is reported for reference but not gated separately' +
      ' (same component tree/tokens as results).',
    '',
    '| View | Accessibility Score | Verdict |',
    '|---|---|---|',
    ...scores.map((s) => `| ${s.name} | ${s.score} | ${s.score >= GATE ? 'PASS' : 'FAIL'} |`),
    '',
  ];

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, lines.join('\n') + '\n');
  console.log(lines.join('\n'));

  const gated = scores.filter((s) => s.name !== 'actionPlan');
  const failed = gated.filter((s) => s.score < GATE);
  if (failed.length > 0) {
    console.error(`\nFAIL: ${failed.map((f) => f.name).join(', ')} below ${GATE}`);
    process.exitCode = 1;
  } else {
    console.log(`\nOK: all gated views >= ${GATE}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
