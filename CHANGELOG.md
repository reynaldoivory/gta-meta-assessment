<!-- markdownlint-disable MD022 MD032 MD036 -->

# Changelog

All notable changes to the GTA Online Meta Assessment Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed — 2026-07-03 · UX overhaul + structural refactor ("Arcade HUD")
One documented design system across every view, plus a structural refactor separating
assessment math and localStorage access from the UI layer. Full audit trail, before/after
screenshots, and phase-by-phase notes in `docs/ux-overhaul/` (see `REPORT.md` for the summary).

- **Design system**: new "Arcade HUD" visual direction (Deep Navy `#050b14` / Slate Blue
  `#0a192f`, HUD Blue `#29d2e3` + Vice Pink `#ff007f` two-channel status system, Outfit +
  Fira Code typefaces, self-hosted woff2) replaces three overlapping, undocumented color
  authorities. Full token reference + contrast matrix in `docs/DESIGN_SYSTEM.md`.
- **New `src/components/ui/` primitives**: Button, Card, Badge, Modal (with a re-queried
  `useFocusTrap`), Stat, SectionHeader, AppShell, Table, Field/Input, EmptyState,
  Spinner/LoadingOverlay. All four views (form, results, action plan, garage) rebuilt on
  these, mobile-first at 390px through 1440px.
- **Garage**: table view (desktop) and a new card-list view (phone) are mounted
  conditionally via a `useMediaQuery` hook, never both at once. Sortable column headers are
  now real keyboard-operable buttons (previously mouse-only `onClick` divs).
- **Structural refactor** (scope explicitly widened by the owner mid-engagement, superseding
  the original "don't touch assessment math / localStorage" constraint): all assessment math
  (ROI, strength training, income comparisons) and date/time tracker math (Acid Lab, daily
  reset, GTA VI countdown) extracted out of UI components into `src/utils/calculations/` and
  `src/utils/trackers/`; every localStorage read/write centralized behind
  `src/utils/storage/appStorage.ts` + a `useStoredState` hook — UI components no longer call
  `localStorage` directly. A 6-fixture characterization test suite (frozen clock, golden
  JSON) pins `computeAssessment` output across the whole refactor as a behavior-preserving
  guard.
- **Compile-time branded types** (`src/types/branded.ts`): `Dollars`/`Income`/`Hours`/`Days`
  nominal types via the `unique symbol` pattern, applied at the ROI/income calculation
  modules' public boundaries. Zero runtime cost; catches unit-confusion bugs (e.g. passing an
  hourly rate where a total was expected) at compile time.
- **Accessibility**: WCAG AA contrast verified for every semantic token pair
  (`scripts/contrastAudit.mjs`); axe-core sweep across 4 views x 3 widths found and fixed 5
  serious/critical issues (down to 0) — the most notable was an `opacity-N` dimming pattern
  used on several "locked"/"unselected"/"completed" card states that silently multiplied an
  already-muted text color below the 4.5:1 floor; fixed by using fully-opaque, independently
  AA-passing colors instead of opacity. Lighthouse accessibility >= 97 on every view
  (`docs/ux-overhaul/LIGHTHOUSE.md`). Global `prefers-reduced-motion` support; a `<main>`
  landmark added.
- **Removed**: unreachable `QuickStartGuide.jsx` view, 6 dead shared components (~1,100 LOC,
  including `CarWashExpiryBadge` — the Master Control Terminal cannot monitor the Car Wash
  business, making it mechanically useless), the legacy `gta.*`/`primary.*`/`surface.*` color
  token aliases and their matching deprecated `index.css` `@apply` classes (all confirmed
  zero-usage via exhaustive grep before deletion).
- CSP tightened: fonts are now self-hosted, so `fonts.googleapis.com`/`gstatic.com` are gone
  from `style-src`/`font-src` entirely — the policy is fully same-origin.
- Bundle size held flat (~531 kB main chunk, within the 591 kB ceiling) despite the new
  design-system primitives, because dead-code removal and legacy-token deletion offset the
  addition.

### Changed — 2026-07-03 · July 2026 content + hygiene refresh
- Weekly events refreshed Apr 16-23 -> **Jul 2-13 2026 Independence Day Special** (free Lago Zancudo
  Bunker, 2X Bunker sells/research, 3X Stunt Races, 5X G's Cache + 2X Smuggler/KnoWay Out as GTA+
  exclusives, $500K login + $1M heist bonus, Jugular podium, Viseris prize ride, Stromberg GTA+ car).
  Sources: Rockstar Newswire via powerupgaming/rockstarintel/gtabase recaps, pulled live 2026-07-03
- Added `src/vite-env.d.ts` (vite/client types) — fixes 3 `import.meta.env` type-check errors
- Flattened deep nesting in `AssessmentContext` localStorage hydration — fixes the one ESLint error

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
