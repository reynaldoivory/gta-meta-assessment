# GTA Meta Assessment — agent instructions

Single source of truth for AI coding agents (consolidated 2026-07-18 from
CLAUDE.md + .cursorrules + copilot-instructions + .roo; CLAUDE.md now just
imports this file). If this file and the code disagree, the code wins —
then fix this file.

Client-side GTA Online criminal empire evaluator. Players input their assets, stats, and upgrades; the app scores their setup, identifies bottlenecks, and generates a prioritized action plan. No backend -- everything runs in the browser with localStorage persistence.

**Live:** https://reynaldoivory.github.io/gta-meta-assessment/

## Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm test             # Jest unit tests
npm run lint         # ESLint (0 errors, ~73 warnings expected)
npm run type-check   # tsc --noEmit
npm run deploy       # Build + gh-pages push to GitHub Pages

node scripts/generateModStack.mjs [--class Super] [--hsw] [--ids 001,025] ...
                     # Emit a curated mod-stack markdown from vehicles.csv (Steam PC, Story Mode)
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (JSX + TSX mixed) |
| Build | Vite 7, TypeScript (strict: true, allowJs: true) |
| Styling | Tailwind CSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| Icons | lucide-react |
| CSV Parser | papaparse |
| Tests | Jest + jsdom |
| Deploy | gh-pages to reynaldoivory.github.io |

## Architecture

```
src/
├── views/                    # Page-level components (4 views -- QuickStartGuide
│   │                         # was removed 2026-07-03, it was unreachable dead code)
│   ├── AssessmentForm.jsx    # "Heist Planning Board" -- main input form
│   ├── AssessmentResults.jsx # Results display after assessment runs
│   ├── PriorityActionPlan.jsx # Prioritized action plan view
│   └── GarageTab.jsx         # Browse 795-vehicle database (read-only)
├── components/
│   ├── GTAAssessment.jsx     # Root component, view router
│   ├── ui/                   # Design-system primitives (Button, Card, Badge,
│   │                         # Modal, Stat, SectionHeader, AppShell, Table,
│   │                         # Field, EmptyState, Spinner/LoadingOverlay,
│   │                         # hooks/useFocusTrap) -- added 2026-07-03
│   ├── shared/                # Reusable UI (domain cards, panels, trackers)
│   ├── calculators/           # ROICalculator, SocialCardGenerator
│   ├── garage/                # DetailModal, FilterPanel, VehicleTable, VehicleCardList
│   └── gamification/         # Achievements, streaks, progress
├── context/                  # React context providers
│   ├── AssessmentContext.tsx  # Form state, results, step navigation
│   ├── EmpireContext.tsx      # Business ownership state
│   └── ToastContext.tsx       # Notification system
├── utils/                    # Business logic
│   ├── storage/               # appStorage.ts (all localStorage access, STORAGE_KEYS
│   │                          # registry) + useStoredState.ts -- added 2026-07-03.
│   │                          # UI components must not call localStorage directly.
│   ├── calculations/           # Extracted pure math: roi, strength, incomeComparison
│   │                          # -- added 2026-07-03
│   └── trackers/               # Extracted pure date/time math: gta6Countdown, acidLab,
│                              # dailyReset -- added 2026-07-03
├── config/                   # weeklyEvents.ts, gatekeeperSchema.ts
├── data/                     # Business definitions (verifiedProperty/)
└── types/                    # domain.types.ts, enterprise.types.ts, branded.ts (Dollars/
                               # Income/Hours/Days nominal types -- added 2026-07-03)
```

## Data Flow

```
User Input (AssessmentForm)
    │
    ▼
AssessmentContext.runAssessment()
    │
    ├── computeAssessment(formData)
    │       ├── calculateIncome(formData)    ← reads modelConfig.js
    │       ├── calculateScore(formData)     ← reads modelConfig.js
    │       └── detectBottlenecks(formData)  ← 6 bottleneck detector modules
    │
    ├── applyAssessmentGamification(...)     ← XP, achievements, streaks
    │
    └── setStep('results') → AssessmentResults view
                                │
                                └── PriorityActionPlan view
                                        ├── actionPlanBuilder.ts
                                        ├── dynamicIncome.ts (weekly event bonuses)
                                        └── AIAssistantTools (LLM prompt export)

Garage (independent read path): GarageTab.jsx → FilterPanel + VehicleTable → loads public/data/vehicles.csv via papaparse
```

## Single Sources of Truth

These files are authoritative. Do not duplicate their values elsewhere.

| Data | File | Notes |
|------|------|-------|
| **Income rates** | `src/utils/modelConfig.js` | All $/hr values. `infrastructureAdvisor.js` derives from this. |
| **Upgrade prices** | `src/data/verifiedProperty/coreBusinesses.ts` | Must match `infrastructureAdvisor.js` INFRASTRUCTURE_COSTS. |
| **Weekly events** | `src/config/weeklyEvents.ts` | Update every Thursday. Has `validUntil` expiry dates per bonus. `getWeeklyBonuses()` auto-filters expired events. |
| **Scoring rules** | `src/utils/modelConfig.js` | Thresholds, tier boundaries, weights. |
| **Form defaults** | `src/utils/assessmentFormDefaults.js` | Initial form state. |
| **Business catalog** | `src/data/verifiedProperty/*.ts` | 7 category files, re-exported from `index.ts`. |
| **Vehicle database** | `public/data/vehicles.csv` | 795 vehicles, updated Apr 17 2026. Source: github.com/reynaldoivory/gta-online-database |
| **Formatting** | `src/utils/formatters.ts` | `formatCurrency`, `formatDollars`, `formatHours`, `formatHoursShort`. Do not redefine inline. |
| **Domain types** | `src/types/domain.types.ts` | `AssessmentFormData`, `AssessmentResult`. |
| **Design tokens** | `tailwind.config.js` | "Arcade HUD" system (locked 2026-07-03): `bg.*`/`text.*`/`border.*`/`status.*`/`hud.*` semantic tokens. Full usage docs + contrast matrix in `docs/DESIGN_SYSTEM.md`. |

## Weekly Events Update Process

Every Thursday when Rockstar announces new bonuses:

1. Edit `src/config/weeklyEvents.ts`
2. Update `meta.lastUpdated`, `meta.validFrom`, `meta.validUntil`, `meta.displayDate`
3. Update bonus entries: set `isActive`, `multiplier`, `validUntil` per bonus
4. Old bonuses auto-expire via `getWeeklyBonuses()` date check -- no need to delete them
5. `npm run deploy`

## Security

- **CSP** in `index.html`: `script-src 'self'; connect-src 'self'; font-src 'self'`. No external scripts, network calls, or font requests -- fonts are self-hosted under `public/fonts/` (2026-07-03).
- **localStorage reads**: All access goes through `src/utils/storage/appStorage.ts` (added 2026-07-03), which wraps every read/write in try/catch with `Array.isArray` / shape validation.
- **Gamification state**: Allowlist-filtered spread (`GAMIFICATION_ALLOWED_KEYS`) prevents prototype pollution.
- **CSV export**: `escapeCsvCell()` prevents formula injection.
- **No secrets**: Fully client-side, no API keys, no backend.
- **npm audit**: 0 high/critical. 4 low in test-only jsdom chain.

## Testing

```bash
npm test                       # 194 tests across 19 suites (Jest + jsdom)
```

Core scoring: `src/utils/__tests__/computeAssessment.test.js`. Tests beginner/intermediate/veteran/edge profiles against income and score ranges. When changing income values in `modelConfig.js`, check test bounds.

Also covered (added during the 2026-07-03 UX overhaul + structural refactor): `characterization.test.js` (6 frozen-clock golden fixtures pinning `computeAssessment`/`buildCompactActionPlan`/`buildSessionPlan` output -- the refactor safety net; re-capture via `CHAR_CAPTURE=1 npm test -- characterization` only if the underlying arithmetic is meant to change), `appStorage.test.ts`, `calculations.test.ts`, `trackers.test.ts`, and `src/components/ui/__tests__/*` + `hooks/__tests__/useFocusTrap.test.tsx`.

## Known Technical Debt

- **~50 `any` annotations** (was 56; the `AssessmentContext` results/gamification values are now precisely typed). Largest remaining cluster: `actionPlanBuilder.ts` (1200 LOC, file-wide eslint disable). Needs proper interface extraction.
- **`tsconfig.json` strict: true** (enabled 2026-07-18). Reached by annotating implicit-any params + adding null-safety guards across the assessment engine, all gated by the characterization goldens (byte-identical) + 194 unit tests. `checkJs` stays off, so JS modules are still only surfaced via their JSDoc/inferred types. Keep new code strict-clean; the remaining `any`s are isolated and do not block the flag.
- **Mixed file extensions**: 45 `.jsx` + 19 `.tsx` (the `.tsx` count grew with the 2026-07-03 `src/components/ui/` design-system primitives and the extracted `calculations/`/`trackers/` modules, all written in TypeScript per that session's new-code convention). Gradual migration of remaining `.jsx` continues.
- **`actionPlanBuilder.ts`** is 1200 lines with complexity 53. Candidate for splitting into scoring, annotation, and compound-efficiency modules.
- **`src/utils/` subdirectory split partially done** (2026-07-03): `storage/`, `calculations/`, and `trackers/` now exist (see Architecture above). Still flat/uncategorized: bottleneck detectors, action-planning modules. `actionPlanBuilder.ts` splitting (above) would be the next candidate for its own subdirectory.
- **Chunk size** warning on build (main chunk ~531 kB as of 2026-07-03, ceiling 591 kB via `scripts/bundleReport.mjs`). Could benefit from dynamic imports for ProgressChart and calculators.

**Resolved 2026-07-04**: the `heading-order` moderate axe violation on results/actionPlan (flagged 2026-07-03, listed as deferred above at the time) has been fixed. Every card-level section title across `AssessmentResults.jsx`/`PriorityActionPlan.jsx` and their children is now `h2` (the page title from `AppShell` is the sole `h1`); one level of true nesting (e.g. `ROICalculator`'s "Time to Goal", trap cards within the trap-warnings section) steps down exactly one level at a time. `docs/ux-overhaul/A11Y.md` now reports 0 violations of any severity (was 1 moderate each on results/actionPlan). No regressions: gates stayed green (139/139 tests, 76 warnings, tsc clean) and the fix is tag-only -- every heading kept its existing Tailwind typography classes, so nothing shifted visually.

## Persisted Data & Migration Safety (do not break)

localStorage shapes users already have (live key `gta_assessment_data`;
migrations in `src/utils/assessmentDataMigration.js` are field-presence
based — there is no numbered format version; `gtaAssessmentDraft_v5` is a
read-only ghost key nothing writes):

- `formData.nightclubSources` — object of booleans (imports, cargo, pharma,
  sporting, cash, organic, printing)
- `formData.nightclubStorage` — `{ hasPounder, hasMule }` booleans
- `formData.nightclubFloors` ('1'–'5') / `nightclubTechs` ('0'–'5') — strings
- `formData.bunker{Equipment,Staff,Security}Upgrade` — booleans
- `formData.purchaseDates` — object of nullable ISO date strings
- `formData.cayoHistory` — array of run objects

Rules: check legacy field names before new ones; fallback patterns like
`formData.nightclubStorage?.hasPounder || formData.hasPounderCustom`; never
delete legacy fields during migration — only add; when refactoring
persistence, preserve the migration call in the load path and legacy
initializations in defaults; test fresh, migrated, AND partially-migrated
state. If uncertain, ask before touching persisted shapes.

## Conventions

- **Immutable updates**: Spread, never mutate.
- **Formatting functions**: Import from `src/utils/formatters.ts`. Never define `formatCurrency` or `formatHours` inline.
- **Error boundaries**: `ErrorBoundary.jsx` wraps the app. Uses `import.meta.env.DEV` (not `process.env.NODE_ENV`) for dev-only error details.
- **Notifications**: Use `useToast()` from `ToastContext`. Never use `alert()`.
- **GTA tone**: User-facing text should feel like a criminal empire briefing, not a developer tool. "Empire Report Card" not "Assessment Results". "Wasted!" not "Something went wrong".
- **Commit style**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`. No co-author attribution.
