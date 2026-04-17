# GTA V Mod Stack — Real-World Vehicles (Steam PC)

**Platform:** Steam PC, Story Mode only.
**Date stamped:** April 17, 2026.
**Source CSV:** `public/data/vehicles.csv` (795 rows).
**Generator:** `node scripts/generateModStack.mjs` (see §6 for flags).

---

## ⚠ BAN SAFETY PROTOCOL — READ FIRST

**Replacement mods will get your GTA Online account banned.** BattlEye anti-cheat flags modified game files the moment you connect to Online. This stack is Story Mode only.

Safe practices:

1. **Never join GTA Online with modded files installed.**
2. Before each Online session: Steam Library → GTA V → Properties → Installed Files → **Verify integrity of game files** (restores vanilla) or keep a second Steam install of GTA V for Online.
3. Back up your Rockstar Social Club save folder (`Documents\Rockstar Games\GTA V\Profiles`) before installing any mod.
4. Back up any RPF file before replacing it inside OpenIV.

---

## 1. Game Version Compatibility (Apr 2026)

| Edition | Steam | Mod support |
|--------|------|-------------|
| **GTA 5 Legacy** (1.0.3095+) | Still installable via Steam "Enhanced / Legacy" toggle | **Fully supported** — all replace mods work |
| **GTA 5 Enhanced** (Mar 2025 release) | Default Steam install | **Partial** — ScriptHookV and OpenIV have Enhanced builds; many replace mods still require Legacy or dual-version packaging |

**Recommendation:** Pin Steam to the Legacy build for modding. If you want ray tracing and keep Enhanced: double-install GTA V in two Steam Library folders, one vanilla (Online), one modded (Story).

---

## 2. Core Prerequisites — Install in Order

| # | Tool | Purpose | Where |
|---|------|---------|-------|
| 1 | .NET 8 Desktop Runtime | Required by SHVDN and many .NET-based mods | dotnet.microsoft.com |
| 2 | Visual C++ 2015-2022 Redistributable (x64) | Required by ScriptHookV, native .asi plugins | microsoft.com |
| 3 | **OpenIV** | RPF archive editor — *the* tool for replace mods | openiv.com |
| 4 | OpenIV "ASI Manager" → enable **ASI Loader** and **OpenIV.asi** | Enables the `mods/` folder mirror so base game files stay untouched | OpenIV → Tools → ASI Manager |
| 5 | **ScriptHookV** | Native script hook; prerequisite for .asi mods | dev-c.com/gtav/scripthookv |
| 6 | **Community Script Hook V .NET (SHVDN)** | C# scripting framework | github.com/scripthookvdotnet/scripthookvdotnet |
| 7 | **Heap Adjuster** | Raises heap limits so 10+ car mods load without CTDs | gta5-mods.com search `Heap Adjuster` |
| 8 | **Packfile Limit Adjuster** | Raises RPF load limit | gta5-mods.com search `Packfile Limit Adjuster` |
| 9 | **gameconfig.xml (Dilapidated / latest)** | Patches game config to allow more custom vehicles | gta5-mods.com search `gameconfig` |
| 10 | Create `GTA V\mods\` folder mirror | OpenIV writes edits here instead of base files → lets you wipe mods by deleting the folder | OpenIV → Tools → Copy vanilla files to mods folder |

**Install order matters.** Run the game vanilla first after each numbered step to confirm it still launches. If step N breaks the game, you know exactly which mod is the culprit.

---

## 3. Per-Vehicle Install Workflow

For every vehicle replacement mod you download:

1. Download the ZIP from gta5-mods.com
2. Extract. You'll get a mix of `.yft` (model), `.ytd` (texture dict), `.ycd` (animation), `_hi.yft` (hi-detail LOD), sometimes `handling.meta` / `carcols.meta` / `carvariations.meta` fragments
3. Open OpenIV → Edit Mode ON → navigate to `mods\x64e.rpf\levels\gta5\vehicles.rpf`
4. Find the vanilla file matching the target slot (e.g. `turismor.yft`) and replace-with the modded file
5. Repeat for every file in the ZIP
6. If the mod ships `.meta` fragments: navigate to `mods\update\update.rpf\common\data\levels\gta5\`, open `handling.meta` / `vehicles.meta` / `carcols.meta` / `carvariations.meta` in OpenIV's built-in text editor, paste the mod's XML block into the matching section
7. Save RPF, close OpenIV
8. Launch game — the replaced vehicle loads when spawned

**Tip:** If the mod has 50+ texture variations or LODs, use OpenIV's "Install" button on the mod's `.oiv` package if provided; it auto-places everything.

---

## 4. Tier S — Verified Real-World Pairings (10/10 agreement)

These 10 have modder consensus from the Apr 17 2026 audit. Each link points to the live top-downloaded replace mod for that real-world car on gta5-mods.com.

| # | GTA Vehicle | Real-World | gta5-mods.com (top replace mods) |
|---|-------------|-----------|----------------------------------|
| 1 | Obey 10F | Audi R8 V10 | `https://www.gta5-mods.com/vehicles?search=Audi+R8&tags=replace&sort=downloads` |
| 2 | Pegassi Zentorno | Lamborghini Aventador | `https://www.gta5-mods.com/vehicles?search=Lamborghini+Aventador&tags=replace&sort=downloads` |
| 3 | Grotti Turismo R | Ferrari LaFerrari | `https://www.gta5-mods.com/vehicles?search=Ferrari+LaFerrari&tags=replace&sort=downloads` |
| 4 | Pfister 811 | Porsche 918 Spyder | `https://www.gta5-mods.com/vehicles?search=Porsche+918+Spyder&tags=replace&sort=downloads` |
| 5 | Progen T20 | McLaren P1 | `https://www.gta5-mods.com/vehicles?search=McLaren+P1&tags=replace&sort=downloads` |
| 6 | Karin Sultan RS | Subaru WRX STi | `https://www.gta5-mods.com/vehicles?search=Subaru+WRX+STI&tags=replace&sort=downloads` |
| 7 | Annis Elegy RH8 | Nissan GT-R R35 | `https://www.gta5-mods.com/vehicles?search=Nissan+GT-R+R35&tags=replace&sort=downloads` |
| 8 | Bravado Buffalo | Dodge Charger | `https://www.gta5-mods.com/vehicles?search=Dodge+Charger&tags=replace&sort=downloads` |
| 9 | Albany Cavalcade | Cadillac Escalade | `https://www.gta5-mods.com/vehicles?search=Cadillac+Escalade&tags=replace&sort=downloads` |
| 10 | Truffade Adder | Bugatti Veyron | `https://www.gta5-mods.com/vehicles?search=Bugatti+Veyron&tags=replace&sort=downloads` |

---

## 5. Uninstall / Go Online Safely

Option A — wipe the mods folder (fastest):

```
# Delete GTA V\mods\ folder entirely
# Launch from vanilla Steam shortcut
```

Option B — Steam integrity verify:

```
Steam Library → GTA V → Properties → Installed Files → Verify integrity of game files
```

Option C — dual-install: keep two Steam Library folders, one modded + Legacy, one vanilla + Enhanced. Switch shortcuts by Library location.

---

## 6. Generate a Custom Stack for Your Garage

The `scripts/generateModStack.mjs` CLI reads the canonical CSV and emits a ready-to-use stack file filtered to whatever subset you care about.

```bash
# All Super class vehicles
node scripts/generateModStack.mjs --class Super > my-super-stack.md

# Only HSW-eligible cars under $2M
node scripts/generateModStack.mjs --hsw --max-price 2000000

# Just the 25 most expensive legendary Motorsport pieces
node scripts/generateModStack.mjs --shop Legendary --sort price-desc --limit 25

# Specific vehicle IDs
node scripts/generateModStack.mjs --ids 025,339,340,370
```

Flags:

| Flag | Effect |
|------|--------|
| `--class <name>` | Filter by vehicle class (Super, Sports, Muscle, etc.) |
| `--shop <name>` | Filter by shop (Legendary, Warstock, Southern SA, Bennys, Delisted, …) |
| `--make <name>` | Filter by in-game make (e.g. Grotti) |
| `--hsw` | Only HSW-upgradeable |
| `--imani` | Only Imani Tech cars |
| `--weaponized` | Only weaponized |
| `--no-delisted` | Exclude Delisted rows |
| `--min-price N` / `--max-price N` | Price bounds |
| `--ids 025,339,...` | Explicit vehicle ID list |
| `--sort id|price|name|price-desc` | Sort output |
| `--limit N` | Cap to N rows |
| `--out path.md` | Write to file (default: stdout) |

Output columns: Vehicle ID, GTA Make Model, Class, Real-World Make Model, gta5-mods.com search URL, GTA Wiki link, GTABase link.

---

## 7. Known Risks / Edge Cases

- **Lampadati Furore GT** — CSV maps to Lamborghini Estoque (a concept). Top mods often substitute the Audi A5-shape or Maserati Quattroporte instead. Stack will list the canonical mapping; verify with the top-downloaded result.
- **Grotti Stinger** — CSV maps to Ferrari 250 GTO. Modder community splits between 250 GTO and 250 California. Either is period-correct.
- **Emergency / Utility / Industrial / Boats / Planes / Helis** — fewer real-world mods exist on gta5-mods.com; expect sparse stacks for these classes.
- **Some 795-row `Real_World_*` columns contain comma-separated lists** (e.g. RE-7B). The generator uses the first make/model token. Edge-case vehicles may benefit from a manual pick.

---

## 8. License + Attribution

- CSV source: `github.com/reynaldoivory/gta-online-database` (community-maintained, Apr 17 2026 snapshot).
- Mod links point to gta5-mods.com — all mods credited to their authors per the page; download counts fluctuate.
- This document is part of the `gta-meta-assessment` project. See `/CLAUDE.md` for project conventions.
