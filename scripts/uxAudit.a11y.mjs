// axe-core accessibility sweep across all four views at 390/768/1440.
// Reuses the same Playwright driver + view-navigation pattern as
// scripts/uxAudit.screenshots.mjs. Writes a violation report to
// docs/ux-overhaul/A11Y.md. Exit bar: 0 serious/critical violations.
//
// Usage:
//   npm run dev &
//   node scripts/uxAudit.a11y.mjs

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const globalRoot = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(globalRoot, 'playwright'));

const AXE_SOURCE = fs.readFileSync(
  path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'),
  'utf8'
);

const CHROMIUM_PATH = path.join(os.homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux64/chrome');
const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:5173/gta-meta-assessment/';
const OUT_FILE = path.join(process.cwd(), 'docs', 'ux-overhaul', 'A11Y.md');

const VIEWPORTS = [
  { label: 390, width: 390, height: 844 },
  { label: 768, width: 768, height: 1024 },
  { label: 1440, width: 1440, height: 900 },
];

const SEVERE = new Set(['serious', 'critical']);

async function navigateTo(page, view) {
  const runButton = page.getByRole('button', { name: /RUN ASSESSMENT/i });
  if (view === 'form') {
    await page.goto(BASE);
    await runButton.waitFor({ timeout: 15000 });
    return;
  }
  if (view === 'garage') {
    await page.goto(BASE);
    await runButton.waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: /Garage/i }).first().click();
    await page.getByText('THE GARAGE').waitFor({ timeout: 15000 });
    return;
  }
  if (view === 'results') {
    await page.goto(BASE);
    await runButton.waitFor({ timeout: 15000 });
    await runButton.click();
    await page.getByText('Empire Report Card').waitFor({ timeout: 20000 });
    return;
  }
  if (view === 'actionPlan') {
    await page.goto(BASE);
    await runButton.waitFor({ timeout: 15000 });
    await runButton.click();
    await page.getByText('Empire Report Card').waitFor({ timeout: 20000 });
    await page.getByRole('button', { name: /View Action Plan/i }).click();
    await page.getByText('Priority Action Plan').first().waitFor({ timeout: 15000 });
  }
}

async function run() {
  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROMIUM_PATH) ? CHROMIUM_PATH : undefined,
    args: ['--no-sandbox'],
  });

  const results = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    for (const view of ['form', 'results', 'actionPlan', 'garage']) {
      await navigateTo(page, view);
      await page.waitForTimeout(500);
      await page.evaluate(AXE_SOURCE);
      const axeResults = await page.evaluate(() => window.axe.run(document, {
        resultTypes: ['violations'],
      }));
      results.push({ view, width: vp.label, violations: axeResults.violations });
      const severeCount = axeResults.violations.filter((v) => SEVERE.has(v.impact)).length;
      console.log(`${view}@${vp.label}: ${axeResults.violations.length} violations (${severeCount} serious/critical)`);
    }

    await context.close();
  }

  await browser.close();

  const totalSevere = results.reduce(
    (sum, r) => sum + r.violations.filter((v) => SEVERE.has(v.impact)).length,
    0
  );

  const lines = [
    '# Accessibility Sweep (axe-core)',
    '',
    `Generated ${new Date().toISOString().split('T')[0]} by \`scripts/uxAudit.a11y.mjs\` across 4 views x 3 widths.`,
    `Exit bar: 0 serious/critical violations. **Result: ${totalSevere} serious/critical.**`,
    '',
  ];

  for (const r of results) {
    lines.push(`## ${r.view} @ ${r.width}px`);
    if (r.violations.length === 0) {
      lines.push('', 'No violations.', '');
      continue;
    }
    for (const v of r.violations) {
      lines.push(
        '',
        `### ${v.id} (${v.impact}) -- ${v.help}`,
        v.description,
        `Affected nodes: ${v.nodes.length}`,
        ...v.nodes.slice(0, 5).flatMap((n) => [
          `- \`${n.target.join(' ')}\``,
          `  html: \`${n.html.replace(/\s+/g, ' ').slice(0, 200)}\``,
          n.failureSummary ? `  ${n.failureSummary.replace(/\n/g, ' ')}` : null,
        ].filter(Boolean))
      );
    }
    lines.push('');
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, lines.join('\n') + '\n');
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`Total serious/critical violations: ${totalSevere}`);

  if (totalSevere > 0) {
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
