# GTA Meta Assessment

Client-side GTA Online criminal empire evaluator. Players input their assets, stats, and upgrades; the app scores their setup, identifies bottlenecks, and generates a prioritized action plan. No backend -- everything runs in the browser with localStorage persistence.

**Live:** https://reynaldoivory.github.io/gta-meta-assessment/

## Commands

```bash
npm run dev          # Vite dev server (localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm test             # Jest unit tests
npm run lint         # ESLint (0 errors, ~71 warnings expected)
npm run type-check   # tsc --noEmit
npm run deploy       # Build + gh-pages push to GitHub Pages

node scripts/generateModStack.mjs [--class Super] [--hsw] [--ids 001,025] ...
                     # Emit a curated mod-stack markdown from vehicles.csv (Steam PC, Story Mode)
```

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 (JSX + TSX mixed) |
| Build | Vite 7, TypeScript (strict: false, allowJs: true) |
| Styling | Tailwind CSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| Icons | lucide-react |
| CSV Parser | papaparse |
| Tests | Jest + jsdom |
| Deploy | gh-pages to reynaldoivory.github.io |

## Architecture

```
src/
├── views/                    # Page-level components (5 views)
│   ├── AssessmentForm.jsx    # "Heist Planning Board" -- main input form
│   ├── AssessmentResults.jsx # Results display after assessment runs
│   ├── PriorityActionPlan.jsx # Prioritized action plan view
│   ├── QuickStartGuide.jsx   # Onboarding guide
│   └── GarageTab.jsx         # Browse 795-vehicle database (read-only)
├── components/
│   ├── GTAAssessment.jsx     # Root component, view router
│   ├── shared/               # Reusable UI (40 components)
│   ├── calculators/          # ROICalculator, SocialCardGenerator
│   ├── garage/               # DetailModal, FilterPanel, VehicleTable
│   └── gamification/         # Achievements, streaks, progress
├── context/                  # React context providers
│   ├── AssessmentContext.tsx  # Form state, results, step navigation
│   ├── EmpireContext.tsx      # Business ownership state
│   └── ToastContext.tsx       # Notification system
├── utils/                    # Business logic (48 files)
├── config/                   # weeklyEvents.ts, gatekeeperSchema.ts
├── data/                     # Business definitions (verifiedProperty/)
└── types/                    # domain.types.ts, enterprise.types.ts
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

## Weekly Events Update Process

Every Thursday when Rockstar announces new bonuses:

1. Edit `src/config/weeklyEvents.ts`
2. Update `meta.lastUpdated`, `meta.validFrom`, `meta.validUntil`, `meta.displayDate`
3. Update bonus entries: set `isActive`, `multiplier`, `validUntil` per bonus
4. Old bonuses auto-expire via `getWeeklyBonuses()` date check -- no need to delete them
5. `npm run deploy`

## Security

- **CSP** in `index.html`: `script-src 'self'; connect-src 'none'`. No external scripts or network calls.
- **localStorage reads**: All wrapped in try/catch with `Array.isArray` / shape validation before use.
- **Gamification state**: Allowlist-filtered spread (`GAMIFICATION_ALLOWED_KEYS`) prevents prototype pollution.
- **CSV export**: `escapeCsvCell()` prevents formula injection.
- **No secrets**: Fully client-side, no API keys, no backend.
- **npm audit**: 0 high/critical. 4 low in test-only jsdom chain.

## Testing

```bash
npm test                       # 16 tests in computeAssessment.test.js
npm run test:recommendations   # Recommendation engine smoke test
```

Test file: `src/utils/__tests__/computeAssessment.test.js`. Tests beginner/intermediate/veteran/edge profiles against income and score ranges. When changing income values in `modelConfig.js`, check test bounds.

## Known Technical Debt

- **50 `any` annotations** across 10 files. Largest cluster: `actionPlanBuilder.ts` (1200 LOC, file-wide eslint disable). Needs proper interface extraction.
- **`tsconfig.json` strict: false**. Enable after clearing `any` backlog.
- **Mixed file extensions**: 50 `.jsx` + 6 `.tsx`. Gradual migration to `.tsx` with proper types.
- **`actionPlanBuilder.ts`** is 1200 lines with complexity 53. Candidate for splitting into scoring, annotation, and compound-efficiency modules.
- **`src/utils/` is flat** (48 files). Candidate for subdirectories: `bottlenecks/`, `calculations/`, `actionPlanning/`, `hooks/`.
- **Chunk size** warning on build (~502 kB). Could benefit from dynamic imports for ProgressChart and calculators.

## Conventions

- **Immutable updates**: Spread, never mutate. See `~/.claude/rules/common/coding-style.md`.
- **Formatting functions**: Import from `src/utils/formatters.ts`. Never define `formatCurrency` or `formatHours` inline.
- **Error boundaries**: `ErrorBoundary.jsx` wraps the app. Uses `import.meta.env.DEV` (not `process.env.NODE_ENV`) for dev-only error details.
- **Notifications**: Use `useToast()` from `ToastContext`. Never use `alert()`.
- **GTA tone**: User-facing text should feel like a criminal empire briefing, not a developer tool. "Empire Report Card" not "Assessment Results". "Wasted!" not "Something went wrong".
- **Commit style**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`. No co-author attribution.
