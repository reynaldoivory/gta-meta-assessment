// WCAG contrast audit for the Arcade HUD token system. Computes relative-
// luminance contrast ratios for every semantic foreground token against every
// background layer, and flags anything under the WCAG AA thresholds
// (4.5:1 body text, 3:1 large/bold text and UI components).
//
// Usage: node scripts/contrastAudit.mjs

const BACKGROUNDS = {
  'bg.base': '#050b14',
  'bg.surface': '#0a192f',
  'bg.raised': '#12294a',
};

const FOREGROUNDS = {
  'text.primary': '#E6EEF7',
  'text.secondary': '#A7BAD0',
  'text.muted': '#8399B4',
  'hud.blue': '#29d2e3',
  'hud.pink': '#ff007f',
  'accent.pink-text': '#ff5ba6',
  'border.focus (non-text, 3:1 floor)': '#29d2e3',
};

// Non-text UI components (borders, focus rings) only need 3:1, not 4.5:1.
const NON_TEXT_KEYS = new Set(['border.focus (non-text, 3:1 floor)']);

// Documented policy exceptions (see docs/DESIGN_SYSTEM.md): these token pairs
// fail the 4.5:1 body-text floor but are restricted by convention to
// large/bold text, icons, and chrome (>=3:1), so a sub-4.5 result here is
// expected, not a regression. Any FAIL not in this list is a real problem.
const KNOWN_EXCEPTIONS = [
  { fgName: 'hud.pink', bgName: 'bg.raised', floor: 3.0, reason: 'restricted to large/bold text + chrome on bg-raised; use accent.pink-text for body copy there' },
];

const isKnownException = (fgName, bgName) =>
  KNOWN_EXCEPTIONS.find((e) => e.fgName === fgName && e.bgName === bgName);

function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(hexA, hexB) {
  const [l1, l2] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

const rows = [];
let hasUnexpectedFailure = false;

for (const [fgName, fgHex] of Object.entries(FOREGROUNDS)) {
  const isNonText = NON_TEXT_KEYS.has(fgName);
  const floor = isNonText ? 3.0 : 4.5;
  for (const [bgName, bgHex] of Object.entries(BACKGROUNDS)) {
    const ratio = contrastRatio(fgHex, bgHex);
    const exception = isKnownException(fgName, bgName);
    const pass = ratio >= (exception ? exception.floor : floor);
    if (!pass) hasUnexpectedFailure = true;
    rows.push({ fgName, bgName, ratio: ratio.toFixed(2), floor, pass, exception });
  }
}

console.log('token'.padEnd(32), 'on'.padEnd(14), 'ratio'.padStart(6), 'floor'.padStart(6), 'verdict');
for (const r of rows) {
  const verdict = r.pass ? (r.exception ? 'PASS (policy exception)' : 'PASS') : 'FAIL';
  console.log(
    r.fgName.padEnd(32),
    r.bgName.padEnd(14),
    String(r.ratio).padStart(6),
    String(r.floor).padStart(6),
    verdict
  );
  if (r.exception) console.log(' '.repeat(32), `note: ${r.exception.reason}`);
}

if (hasUnexpectedFailure) {
  console.error('\nFAIL: one or more token pairs are below their WCAG threshold (and not a documented exception).');
  process.exit(1);
}
console.log('\nOK: every token pair clears its WCAG AA threshold (or is a documented, restricted-use exception).');
