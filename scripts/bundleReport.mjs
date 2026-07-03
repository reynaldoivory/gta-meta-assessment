// Bundle-size guard for the UX overhaul. Compares dist/assets against
// docs/ux-overhaul/bundle-baseline.json and fails (exit 1) if the main
// JS chunk exceeds the +10% ceiling recorded there.
//
// Usage: npm run build && node scripts/bundleReport.mjs

import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ASSETS_DIR = path.join(ROOT, 'dist', 'assets');
const BASELINE_PATH = path.join(ROOT, 'docs', 'ux-overhaul', 'bundle-baseline.json');

const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));

// dist/assets names are content-hashed (index-C04O7aV2.js); strip the hash
// so chunks map onto the stable logical names used in the baseline.
const logicalName = (file) => file.replace(/-[A-Za-z0-9_-]{8,}(?=\.(?:js|css)$)/, '');

const rows = fs.readdirSync(ASSETS_DIR)
  .filter((f) => /\.(js|css)$/.test(f))
  .map((f) => {
    const buf = fs.readFileSync(path.join(ASSETS_DIR, f));
    return { name: logicalName(f), file: f, raw: buf.length, gzip: gzipSync(buf).length };
  })
  .sort((a, b) => b.raw - a.raw);

let failed = false;
console.log('chunk'.padEnd(26), 'raw'.padStart(9), 'gzip'.padStart(9), 'baseline'.padStart(9), 'delta'.padStart(8));
for (const row of rows) {
  const base = baseline.chunks[row.name];
  const delta = base ? row.raw - base.raw : null;
  const deltaStr = delta === null ? 'NEW' : `${delta >= 0 ? '+' : ''}${delta}`;
  console.log(row.name.padEnd(26), String(row.raw).padStart(9), String(row.gzip).padStart(9),
    String(base ? base.raw : '-').padStart(9), deltaStr.padStart(8));
  if (row.name === baseline.mainChunk && row.raw > baseline.mainChunkCeilingRaw) failed = true;
}

const main = rows.find((r) => r.name === baseline.mainChunk);
if (!main) {
  console.error(`\nFAIL: main chunk "${baseline.mainChunk}" not found in dist/assets`);
  process.exit(1);
}
console.log(`\nmain chunk ${main.raw} B vs ceiling ${baseline.mainChunkCeilingRaw} B (baseline ${baseline.chunks[baseline.mainChunk].raw} B +10%)`);
if (failed) {
  console.error('FAIL: main chunk exceeds the +10% growth ceiling');
  process.exit(1);
}
console.log('OK: within budget');
