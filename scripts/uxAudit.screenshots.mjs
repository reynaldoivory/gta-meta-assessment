// UX-overhaul screenshot harness. Drives the running dev/preview server with
// the globally-installed Playwright (not a repo dependency) and captures
// full-page shots of every view at phone/tablet/desktop widths.
//
// Usage:
//   npm run dev &        (or npm run preview -- port differs, pass --base)
//   node scripts/uxAudit.screenshots.mjs --out docs/ux-overhaul/before
//   node scripts/uxAudit.screenshots.mjs --out docs/ux-overhaul/after --base http://localhost:4173/gta-meta-assessment/
//
// The app has no URL routing (step state lives in AssessmentContext), so each
// view is reached by clicking through the real UI. Selectors are role/name
// based to survive restyling.

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const OUT_DIR = argValue('--out', 'docs/ux-overhaul/before');
const BASE = argValue('--base', 'http://localhost:5173/gta-meta-assessment/');

const globalRoot = execSync('npm root -g').toString().trim();
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(globalRoot, 'playwright'));

const CHROMIUM_PATH = process.env.CHROMIUM_PATH
  || path.join(os.homedir(), '.cache/ms-playwright/chromium-1228/chrome-linux64/chrome');

const VIEWPORTS = [
  { label: 390, width: 390, height: 844 },
  { label: 768, width: 768, height: 1024 },
  { label: 1440, width: 1440, height: 900 },
];

const SETTLE_MS = 800; // let pop-in/confetti animations settle

const shoot = async (page, view, label, { fullPage = true } = {}) => {
  await page.waitForTimeout(SETTLE_MS);
  // JPEG q75: full-page PNGs of these long views are ~2MB+ each and would
  // bloat the repo; JPEG keeps the committed audit set small.
  const file = path.join(OUT_DIR, `${view}-${label}.jpg`);
  await page.screenshot({ path: file, fullPage, type: 'jpeg', quality: 75 });
  console.log('captured', file);
};

const run = async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const consoleErrors = [];
  const browser = await chromium.launch({
    executablePath: fs.existsSync(CHROMIUM_PATH) ? CHROMIUM_PATH : undefined,
    args: ['--no-sandbox'],
  });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`[${vp.label}] ${msg.text()}`);
    });
    page.on('pageerror', (err) => consoleErrors.push(`[${vp.label}] pageerror: ${err.message}`));

    // form (initial view)
    await page.goto(BASE);
    const runButton = page.getByRole('button', { name: /RUN ASSESSMENT/i });
    await runButton.waitFor({ timeout: 15000 });
    await shoot(page, 'form', vp.label);

    // garage (from the form header)
    // viewport-only: full-page would render all 795 table rows (~40k px tall)
    await page.getByRole('button', { name: /Garage/i }).first().click();
    await page.getByText('THE GARAGE').waitFor({ timeout: 15000 });
    await shoot(page, 'garage', vp.label, { fullPage: false });

    // results (fresh load -> submit with default form values)
    await page.goto(BASE);
    await runButton.waitFor({ timeout: 15000 });
    await runButton.click();
    await page.getByText('Empire Report Card').waitFor({ timeout: 20000 });
    await shoot(page, 'results', vp.label);

    // action plan (from results)
    await page.getByRole('button', { name: /View Action Plan/i }).click();
    await page.getByText('Priority Action Plan').first().waitFor({ timeout: 15000 });
    await shoot(page, 'actionPlan', vp.label);

    await context.close();
  }

  await browser.close();
  if (consoleErrors.length) {
    const file = path.join(OUT_DIR, 'console-errors.txt');
    fs.writeFileSync(file, consoleErrors.join('\n') + '\n');
    console.log(`console errors captured: ${consoleErrors.length} -> ${file}`);
  }
  console.log('done: 12 screenshots');
};

run().catch((err) => {
  console.error('screenshot run failed:', err);
  process.exit(1);
});
