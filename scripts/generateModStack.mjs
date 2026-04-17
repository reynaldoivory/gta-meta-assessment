#!/usr/bin/env node
// Generate a GTA V replacement-mod stack from public/data/vehicles.csv.
// Steam PC, Story Mode only — see docs/MOD_STACK_STEAM_PC_2026-04-17.md.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSV_PATH = resolve(__dirname, '..', 'public', 'data', 'vehicles.csv');

// ---------- tiny CSV parser (handles quoted fields with embedded commas) ----------

function parseCSV(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
      if (c === '"') { inQuotes = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ',') { row.push(field); field = ''; i++; continue; }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row);
      row = []; field = ''; i++; continue;
    }
    field += c; i++;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const [header, ...body] = rows.filter(r => r.some(v => v !== ''));
  return body.map(cols =>
    Object.fromEntries(header.map((h, idx) => [h, cols[idx] ?? '']))
  );
}

// ---------- row normalization ----------

const toBool = (v) => typeof v === 'string' && v.trim().toUpperCase() === 'TRUE';
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function normalize(row) {
  // Some rows have multi-value make/model fields. Use first comma-split token.
  const firstToken = (s) => (s || '').split(',')[0].trim();
  const make = firstToken(row.Real_World_Make);
  const model = firstToken(row.Real_World_Model);
  return {
    id: row.Vehicle_ID?.trim() || '',
    gtaMake: row.GTA_Make?.trim() || '',
    gtaModel: row.GTA_Model?.trim() || '',
    class: row.Class?.trim() || 'Unknown',
    realMake: make,
    realModel: model,
    realFull: [make, model].filter(Boolean).join(' ') || 'N/A',
    price: toNum(row.Price),
    shop: row.Shop?.trim() || 'Unknown',
    topSpeed: row.Top_Speed_MPH ? toNum(row.Top_Speed_MPH) : null,
    weaponized: toBool(row.Weaponized),
    hsw: toBool(row.HSW),
    imani: toBool(row.Imani),
    bennys: toBool(row.Bennys),
    arena: toBool(row.Arena),
    notes: row.Notes?.trim() || '',
  };
}

// ---------- URL builders ----------

const enc = encodeURIComponent;

function modsUrl(v) {
  const q = [v.realMake, v.realModel].filter(Boolean).join(' ').trim();
  if (!q) return null;
  return `https://www.gta5-mods.com/vehicles?search=${enc(q)}&tags=replace&sort=downloads`;
}

function wikiUrl(v) {
  const slug = `${v.gtaMake}_${v.gtaModel}`.replace(/\s+/g, '_');
  return `https://gta.fandom.com/wiki/${enc(slug)}`;
}

function gtabaseUrl(v) {
  const slug = `${v.gtaMake} ${v.gtaModel}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `https://www.gtabase.com/grand-theft-auto-v/vehicles/${enc(slug)}`;
}

// ---------- argv parsing ----------

function parseArgs(argv) {
  const args = { filters: {}, flags: new Set(), sort: 'id', limit: 0, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--class':      args.filters.class = next(); break;
      case '--shop':       args.filters.shop = next(); break;
      case '--make':       args.filters.make = next(); break;
      case '--ids':        args.filters.ids = new Set(next().split(',').map(s => s.trim().padStart(3, '0'))); break;
      case '--min-price':  args.filters.minPrice = Number(next()); break;
      case '--max-price':  args.filters.maxPrice = Number(next()); break;
      case '--hsw':        args.flags.add('hsw'); break;
      case '--imani':      args.flags.add('imani'); break;
      case '--weaponized': args.flags.add('weaponized'); break;
      case '--no-delisted': args.flags.add('noDelisted'); break;
      case '--sort':       args.sort = next(); break;
      case '--limit':      args.limit = Number(next()); break;
      case '--out':        args.out = next(); break;
      case '-h':
      case '--help':       args.help = true; break;
      default:
        if (a.startsWith('--')) console.error(`Unknown flag: ${a}`);
    }
  }
  return args;
}

function applyFilters(vehicles, { filters, flags }) {
  return vehicles.filter(v => {
    if (filters.ids && !filters.ids.has(v.id)) return false;
    if (filters.class && v.class.toLowerCase() !== filters.class.toLowerCase()) return false;
    if (filters.shop && v.shop.toLowerCase() !== filters.shop.toLowerCase()) return false;
    if (filters.make && v.gtaMake.toLowerCase() !== filters.make.toLowerCase()) return false;
    if (filters.minPrice != null && v.price < filters.minPrice) return false;
    if (filters.maxPrice != null && v.price > filters.maxPrice) return false;
    if (flags.has('hsw') && !v.hsw) return false;
    if (flags.has('imani') && !v.imani) return false;
    if (flags.has('weaponized') && !v.weaponized) return false;
    if (flags.has('noDelisted') && v.shop === 'Delisted') return false;
    return true;
  });
}

function sortVehicles(vehicles, mode) {
  const copy = [...vehicles];
  switch (mode) {
    case 'price':      copy.sort((a, b) => a.price - b.price); break;
    case 'price-desc': copy.sort((a, b) => b.price - a.price); break;
    case 'name':       copy.sort((a, b) => `${a.gtaMake} ${a.gtaModel}`.localeCompare(`${b.gtaMake} ${b.gtaModel}`)); break;
    case 'id':
    default:           copy.sort((a, b) => a.id.localeCompare(b.id));
  }
  return copy;
}

// ---------- markdown renderer ----------

function dollars(n) {
  if (!n) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function renderMarkdown(vehicles, args) {
  const today = new Date().toISOString().slice(0, 10);
  const filterSummary = [
    args.filters.class && `class=${args.filters.class}`,
    args.filters.shop && `shop=${args.filters.shop}`,
    args.filters.make && `make=${args.filters.make}`,
    args.filters.ids && `ids=${[...args.filters.ids].join(',')}`,
    args.filters.minPrice != null && `min=$${args.filters.minPrice.toLocaleString()}`,
    args.filters.maxPrice != null && `max=$${args.filters.maxPrice.toLocaleString()}`,
    args.flags.has('hsw') && 'HSW',
    args.flags.has('imani') && 'Imani',
    args.flags.has('weaponized') && 'Weaponized',
    args.flags.has('noDelisted') && 'no-delisted',
    args.limit > 0 && `limit=${args.limit}`,
    `sort=${args.sort}`,
  ].filter(Boolean).join(' · ');

  const header = [
    `# GTA V Mod Stack — Generated ${today}`,
    '',
    '> **Steam PC, Story Mode ONLY.** Replacement mods will get you banned from GTA Online. See `docs/MOD_STACK_STEAM_PC_2026-04-17.md` for the safety protocol, prerequisites, and install order before touching anything below.',
    '',
    `**Vehicles in stack:** ${vehicles.length}`,
    `**Filter:** ${filterSummary || '(none — full database)'}`,
    '',
    '## Prerequisites (install once, in order)',
    '',
    '1. .NET 8 Desktop Runtime',
    '2. Visual C++ 2015-2022 Redist (x64)',
    '3. OpenIV + ASI Loader + OpenIV.asi (enable `mods/` folder)',
    '4. ScriptHookV',
    '5. Community Script Hook V .NET (SHVDN)',
    '6. Heap Adjuster',
    '7. Packfile Limit Adjuster',
    '8. gameconfig.xml (Dilapidated or latest)',
    '',
    '## Per-vehicle replacement mods',
    '',
    '| # | ID | GTA Vehicle | Class | Real-World | Price | Flags | gta5-mods.com (top-downloaded replace) |',
    '|---|----|-------------|-------|-----------|-------|-------|-----------------------------------------|',
  ];

  const rows = vehicles.map((v, i) => {
    const flags = [
      v.hsw && 'HSW',
      v.imani && 'IMANI',
      v.weaponized && 'WPN',
      v.bennys && 'BNY',
      v.arena && 'ARN',
      v.shop === 'Delisted' && 'DELISTED',
    ].filter(Boolean).join('/') || '—';

    const url = modsUrl(v);
    const link = url ? `[search](${url})` : '— (no real-world mapping)';
    const priceCell = v.shop === 'Delisted' ? `~~${dollars(v.price)}~~` : dollars(v.price);

    return `| ${i + 1} | ${v.id} | ${v.gtaMake} ${v.gtaModel} | ${v.class} | ${v.realFull} | ${priceCell} | ${flags} | ${link} |`;
  });

  const footer = [
    '',
    '## References',
    '',
    ...vehicles.slice(0, 25).map(v => {
      const mods = modsUrl(v);
      return `- **${v.gtaMake} ${v.gtaModel}** (${v.realFull}): [Wiki](${wikiUrl(v)}) · [GTABase](${gtabaseUrl(v)})${mods ? ` · [Top replace mods](${mods})` : ''}`;
    }),
    vehicles.length > 25 ? `- …and ${vehicles.length - 25} more (full list in table above)` : null,
    '',
    '## Install order (for each vehicle above)',
    '',
    '1. Download the mod ZIP from the gta5-mods.com link',
    '2. Extract — `.yft`, `.ytd`, `_hi.yft` files + optional `.meta` XML fragments',
    '3. OpenIV → Edit Mode ON → navigate `mods\\x64e.rpf\\levels\\gta5\\vehicles.rpf`',
    '4. Replace the matching vanilla filename (e.g. `turismor.yft`) with the mod file',
    '5. Paste any `.meta` fragments into `mods\\update\\update.rpf\\common\\data\\levels\\gta5\\handling.meta` (etc.)',
    '6. Save RPF. Repeat for each mod. Launch game.',
    '',
    '---',
    '',
    `_Generated from \`public/data/vehicles.csv\` via \`scripts/generateModStack.mjs\` on ${today}._`,
    '',
  ].filter(x => x !== null);

  return [...header, ...rows, ...footer].join('\n');
}

// ---------- main ----------

function usage() {
  return [
    'Usage: node scripts/generateModStack.mjs [flags]',
    '',
    'Filters:',
    '  --class <name>         Super | Sports | Muscle | Sedans | Coupes | SUVs | Off-Road | …',
    '  --shop <name>          Legendary | Warstock | Bennys | Southern SA | Delisted | …',
    '  --make <name>          Grotti | Pegassi | Annis | Bravado | …',
    '  --ids 025,339,340      Explicit comma-separated list (zero-padded 3-digit)',
    '  --min-price N          Minimum price',
    '  --max-price N          Maximum price',
    '  --hsw                  Only HSW-upgradeable',
    '  --imani                Only Imani Tech',
    '  --weaponized           Only weaponized',
    '  --no-delisted          Exclude delisted rows',
    '',
    'Output:',
    '  --sort id|price|price-desc|name   Default: id',
    '  --limit N                         Cap row count',
    '  --out path.md                     Write to file (default: stdout)',
    '',
    'Examples:',
    '  node scripts/generateModStack.mjs --class Super --sort price-desc --limit 25',
    '  node scripts/generateModStack.mjs --hsw --max-price 2000000 --out my-hsw-stack.md',
    '  node scripts/generateModStack.mjs --ids 001,025,339,340',
  ].join('\n');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(usage()); process.exit(0); }

  let csv;
  try { csv = readFileSync(CSV_PATH, 'utf8'); }
  catch (e) { console.error(`Failed to read ${CSV_PATH}: ${e.message}`); process.exit(1); }

  const parsed = parseCSV(csv).map(normalize).filter(v => v.id);
  const filtered = applyFilters(parsed, args);
  const sorted = sortVehicles(filtered, args.sort);
  const capped = args.limit > 0 ? sorted.slice(0, args.limit) : sorted;
  const md = renderMarkdown(capped, args);

  if (args.out) {
    writeFileSync(args.out, md, 'utf8');
    console.error(`Wrote ${capped.length} vehicles → ${args.out}`);
  } else {
    process.stdout.write(md);
  }
}

main();
