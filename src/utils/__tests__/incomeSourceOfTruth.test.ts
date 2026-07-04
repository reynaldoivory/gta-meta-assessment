import fs from 'node:fs';
import path from 'node:path';

// Regression guard for the 2026-07-04 income-consolidation pass: the canonical
// Cayo ($433k) and Auto Shop ($1.0M) rates live ONLY in modelConfig.js. These
// files must read them from config, never re-hardcode a disagreeing constant or
// bake a dollar rate into a user-facing string. If one of these patterns comes
// back, a screen of the app will contradict another (the exact thing that gets
// a tool called slop). Scans source text, so it catches literals the runtime
// path might not exercise this week.

// Strip block + line comments so a comment that documents the OLD value
// (e.g. "was a ?? 700000 fallback") doesn't trip the guard -- only executable
// code and string literals are checked. Rate patterns don't legitimately
// appear in string literals in these files after the consolidation.
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

const read = (rel: string) =>
  stripComments(fs.readFileSync(path.join(__dirname, '..', rel), 'utf8'));

const INCOME_FILES = [
  'calculateIncome.ts',
  'dynamicIncome.ts',
  'calculations/incomeComparison.ts',
  'actionPlanBuilder.ts',
  'incomeCalculators.js',
];

// Each entry: a banned pattern and why it was wrong.
const BANNED: Array<{ re: RegExp; reason: string }> = [
  { re: /466[_]?000/, reason: 'old hardcoded Cayo rate; use MODEL_CONFIG.income.cayo.solo.effectiveHourlyRate' },
  { re: /\?\?\s*700000/, reason: 'disagreeing Cayo basePayout fallback; route through config' },
  { re: /1[_]?800[_]?000/, reason: 'inflated savingsPerHour literal; derive from config auto-shop rate' },
  { re: /300000\s*\*\s*\(?\s*60\s*\/\s*25/, reason: 'local 720k auto-shop formula; use MODEL_CONFIG.income.autoShop.perHour' },
  { re: /\$1\.3M[\s\S]{0,4}\$?1\.5M\s*\/?\s*hr/i, reason: 'aspirational $1.3M-$1.5M/hr string baked into UI text' },
  { re: /beats\s+cayo/i, reason: 'static "beats Cayo" claim; compute dynamically vs the config Cayo rate' },
];

describe('income rates trace to modelConfig.js (no local overrides)', () => {
  for (const file of INCOME_FILES) {
    const src = read(file);
    for (const { re, reason } of BANNED) {
      test(`${file} is free of /${re.source}/ (${reason})`, () => {
        expect(src).not.toMatch(re);
      });
    }
  }

  test('modelConfig.js is the single home for the canonical Cayo + Auto Shop rates', () => {
    const config = read('modelConfig.js');
    expect(config).toMatch(/effectiveHourlyRate:\s*433000/);
    expect(config).toMatch(/perHour:\s*1000000/); // autoShop canonical
  });
});
