<!-- markdownlint-disable MD022 MD032 MD036 -->

# Changelog

All notable changes to the GTA Online Meta Assessment Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — 2026-04-17 · Garage vehicle database (commit d6ca7b5)
- New Garage tab browses 795-vehicle database (`public/data/vehicles.csv`) with filter/sort/search
- Detail modal links live to GTA Wiki, GTABase, and gta5-mods.com replace-mod searches
- "Garage" button on Planning Board header, routes to `step='garage'`
- Source: community-maintained `reynaldoivory/gta-online-database`, cross-checked Apr 17 2026
- `papaparse` added for CSV parsing
- `formatPriceShort` utility added to `src/utils/formatters.ts`
- Weekly events refreshed to Apr 16-23 2026 LD Organics 420 event
- See `docs/GARAGE_SHIP_2026-04-17.md` for full before/after log

### Security — 2026-04-17
- CSP `connect-src` changed from `'none'` to `'self'` for same-origin CSV fetch
- `AssessmentContext` localStorage hydration now key-allowlisted (blocks unexpected field injection)
- `DetailModal` external hrefs gated by origin allowlist (defense in depth against tampered CSV)

### Fixed — 2026-04-17
- `modelConfig.effectiveHourlyRate` recomputed from bumped $1.3M base payout (was stale at $367k)
- `calculateIncome.ts` payphone fallback reduced to 0 (canonical value lives in `modelConfig.js`)
- Inline `formatPrice` duplicates in garage components replaced with shared `formatPriceShort`

### Added
- GTA+ exclusive bonuses now visible to all users with locked state indicator
- Lock icon overlay on GTA+ monthly bonuses for non-subscribers
- "GTA+ Required" label on locked weekly bonus tiles
- Locked bonus tiles render with grayscale and 60% opacity for visual distinction

### Changed
- WeeklyBonusBanner now always renders (not conditionally for GTA+ users only)
- `getWeeklyBonuses()` function now accepts options object: `{ hasGTAPlus, includeGTAPlus }`
- GTA+ monthly bonuses separated from global weekly events into dedicated `gtaPlus.monthlyBonuses` array
- Continued migration from JS/JSX components and utilities toward TS/TSX-typed architecture
- Updated strategy flow for assessment/results/action-plan sections via extracted shared components and hooks
- Updated economy guidance and verified pricing references to align with the latest Feb 2026 audit pass

### Fixed
- GTA+ logic no longer bleeds into global weekly event bonuses
- Eliminated multiplier branching in weekly events (6X vs 3X for same event)

## [Previous Changes]

_(Add previous releases here as project evolves)_
