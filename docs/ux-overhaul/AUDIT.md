# UX Overhaul -- Phase 0 Audit

Date: 2026-07-03 · Base commit: `e9ccf71` · Governing doc: `docs/HANDOFF_UX_OVERHAUL_2026-07-03.md` (as amended -- structural refactor added, assessment-math + localStorage-schema constraints lifted, `src/data/*` / weekly-events data / vehicles.csv / export formats still constrained).

Method: static census (grep/read of all of `src/`), fresh production build, live screenshot pass (`scripts/uxAudit.screenshots.mjs`, Playwright + headless Chromium against `npm run dev`), characterization capture (`CHAR_CAPTURE=1 npm test -- characterization`).

## 1. Quality gates at baseline (measured)

| Gate | Result |
|---|---|
| `npm test` | 51/51 pass, 4 suites (all pure-logic utils) -- now 57/57 with the 6 new characterization tests |
| `npm run lint` | 0 errors / 78 warnings (all `complexity` / `max-lines`) |
| `npm run type-check` | 0 errors |
| `npm run build` | OK, 3.0s |

## 2. Bundle baseline (fresh build; guard = main chunk raw +10%)

| Chunk | Raw B | Gzip B |
|---|---|---|
| index.js (main) | 537,651 | 161,940 |
| ProgressChart.js (lazy) | 166,939 | 58,236 |
| ROICalculator.js (lazy) | 5,039 | 1,729 |
| SocialCardGenerator.js (lazy) | 3,035 | 1,425 |
| index.css | 75,421 | 12,408 |

Ceiling for main chunk: **591,416 B raw**. Machine baseline: `bundle-baseline.json`; per-commit check: `node scripts/bundleReport.mjs`. Note: the handoff's "~502 kB" figure predates the July 2026 content refresh. Self-hosted fonts (Phase 2) are static assets outside this guard.

## 3. Color/token census

Three overlapping color authorities coexist:

| Authority | Uses | Notes |
|---|---|---|
| Legacy `gta.*` tokens | 118 | Misleading names: `gta.green` = cyan #22d3ee, `gta.yellow` = orange #fb923c. Also `gta.dark` #0f0918, `gta.panel` #1a1128, `gta.red` #fb7185 (rose), `gta.gray` #94a3b8 |
| Newer `primary.purple/cyan/orange` + `surface.*` + `accent.*` | 137 | `surface.*` duplicates `gta.dark/panel`; `accent.pink` duplicates `gta.red` |
| Raw Tailwind palette | 1,300+ | **slate- 740 (the de-facto neutral, untokenized)**, red- 97, green- 92, blue- 71, yellow- 65, purple- 56, emerald- 48, orange- 31, amber- 30, cyan- 28, others <=10 |

- "Success green" exists 4 incompatible ways: raw `green-*` (92), `emerald-*` (48), `gta-green` (cyan!), `accent.green` #4ade80.
- 0 arbitrary-hex classes (`bg-[#...]`), 0 `dark:`/`light:` variants (single dark theme confirmed).
- 40 bracket utilities, dominated by `text-[10px]` x15 / `text-[11px]` x8 -- a missing `2xs` type step.
- Fonts: Inter + JetBrains Mono via Google Fonts `@import` at `src/index.css:1` (app's only third-party network dependency; CSP explicitly whitelists it). `fontFamily.display` and `.body` both resolve to Inter.

## 4. CSS inventory

| File | LOC | Status |
|---|---|---|
| `src/index.css` | 153 | LIVE global sheet: Google Fonts import, `:root` vars, body gradient, `@apply` primitives (`.btn-*` x3, `.card-enterprise`, `.badge*`, `.input-enterprise`, `.heading-gradient-*`) |
| `src/App.css` | 83 | **ORPHAN** -- imported nowhere. But `GTAAssessment.jsx:44-45` renders two `<div className="bg-orb-*">` whose classes exist only here: they are invisible no-ops at runtime. Delete file + both divs |
| `src/components/shared/TrapWarnings.css` | 299 | Raw-hex legacy; duplicate selectors vs its sibling below |
| `src/components/shared/CommunityTrapStats.css` | 293 | Raw-hex legacy; defines the SAME selectors (`.community-trap-stats`, `.trap-rate-item`, `.rate-fill.*`) with different values; `CommunityTrapStats.jsx` imports BOTH files -- cascade collision, last-import-wins |

`.btn-*` adoption: 12 uses vs 61 raw `<button>` elements (~80% of buttons hand-styled).

## 5. Component inventory

38 shared components + garage trio + 2 calculators + 6 gamification. Full used-by relationships verified by grep.

**Dead (imported nowhere reachable; ~1,112 LOC + 592 LOC CSS):**
- `shared/AssessmentAssetsPanel.jsx` (270)
- `shared/NightclubLogistics.jsx` (49) + `shared/NightclubLogisticsSections.jsx` (248) -- reachable only via the dead panel
- `shared/CarWashExpiryBadge.jsx` (52) -- deletion confirmed by owner 2026-07-03: the Master Control Terminal cannot monitor the Car Wash business, so the badge is mechanically useless. Its countdown logic is fully internal to the file; the live `hasCarWash` ownership/income feature is separate and stays
- `shared/DesignShowcase.jsx` (209) -- Feb 2026 design-system demo, unrouted
- `shared/EnterpriseFinancialGuidePanel.jsx` (284)
- `views/QuickStartGuide.jsx` (325) -- router case `'guide'` exists but no `setStep('guide')` anywhere; owner decision: delete

**Reusable pieces that survive into the new system:** `EmptyState.jsx` (24, raw-slate -- rewrite on tokens), `LoadingSpinner.jsx` (84, full-screen overlay -- split into Spinner + LoadingOverlay), `StatBar.jsx` (41, input control), `garage/DetailModal.jsx` (231, only true dialog: role=dialog + hand-rolled focus trap; weaknesses: getElementById-based container, focusables captured once in useEffect), `garage/VehicleTable.jsx` (119), `garage/FilterPanel.jsx` (100).

**No true primitives exist**: zero Button/Card/Badge/Modal/Stat/SectionHeader/Table components; ~7 hand-rolled domain cards (ActionCard, AssetCard, AssetToggleCard, BusinessCard, SessionCard, ResultsScoreCard, TrapCard).

## 6. View-by-view findings

Router: `switch(step)` in `GTAAssessment.jsx` over AssessmentContext string state; **five cases, not the handoff's three views** (`form`, `results`, `actionPlan`, `garage`, `guide`). No URL sync; no shared header/nav -- each view hand-rolls its own back buttons and base wrapper, and they disagree.

| View | LOC | Findings |
|---|---|---|
| `AssessmentForm.jsx` | 467 | Heaviest inline JSX. 12-col grid collapses only at `lg`. Fixed `grid-cols-2` at lines ~182/249/260 (cramped at 390). Weekly banner = 10 full-size tiles before any input |
| `AssessmentResults.jsx` | 158 | 15+ children. **Calls `setStep('form')` DURING render** when `!results` (fragile). Single column, minimal responsive tuning |
| `PriorityActionPlan.jsx` | 63 | Uses `bg-slate-950 font-sans` vs everyone else's `bg-transparent font-body` -- visible base-style divergence |
| `GarageTab.jsx` | 256 | Newest/best code (see `GARAGE_SHIP_2026-04-17.md`). Table = 10 fixed-width columns in `overflow-x-auto` |
| `QuickStartGuide.jsx` | 325 | Unreachable; off-system raw blue/slate palette; zero shared components. DELETE |

## 7. Screenshot observations (before/, 12 shots, 390/768/1440)

- **form-390**: the weekly-bonus banner alone fills the first 2+ viewports (10 full-size tiles, all visually identical orange-bordered cards -- no hierarchy). First interactive control appears ~2,500px down. Full page ~7,600px; RUN ASSESSMENT is at the very bottom. 2-up asset cards cramped; stat-bar tap targets small.
- **form-1440**: coherent structurally, but heading is a 3-color rainbow gradient (purple->cyan->orange in one line); accent colors compete (cyan buttons, orange bonus tiles, green/cyan CTA gradient); unowned business cards read as disabled.
- **results-390**: **9,646px tall.** Order: GTA 6 countdown -> daily KPIs -> XP/Level 2 -> weekly challenges -> achievements gallery -> trap stats -> daily cash loop... the actual **Empire Report Card (score) appears roughly a third of the way down** -- the page answers "what did I score?" last-ish, gamification first. Bottleneck cards are a monotone orange/red wall. Two floating action buttons overlap content at bottom.
- **garage-390**: table header truncates mid-word (`CLA...`); data requires horizontal scroll; filter block stacks acceptably but field widths are inconsistent.
- **actionPlan (all widths)**: darker base (slate-950) than sibling views is visible side-by-side; fixed 3-col stat rows squeeze at 390.
- No console errors during any pass (no console-errors.txt emitted).

## 8. Accessibility findings

- `focus-visible:` 0 · `sr-only` 0 · `prefers-reduced-motion`/`motion-reduce` 0 app-wide.
- `aria-*` concentrated in `AssessmentForm` (10, mostly the 18 checkbox aria-labels) + `DetailModal` (4); `role=` only in garage; `tabIndex` only on VehicleTable rows.
- Only true dialog: garage `DetailModal` (focus trap, Escape, restore -- from commit `62969c6`, which touched garage + 4 button `type` fixes and stopped there).
- `FilterPanel` search input is placeholder-only (no label); its select labels are visual-only (no htmlFor/id); price sliders lack `aria-valuetext`.
- Animations (`pop-in`, `pulse-glow`, `shimmer`, confetti, hover-scale) have no reduced-motion opt-out.
- Mobile: `sm:` used in exactly one component (AchievementsGallery); `xl:` nowhere. ~14 components carry fixed `grid-cols-2/3/4` that never collapse.

## 9. Structural-refactor censuses (Chad's 2026-07-03 amendment)

### 9a. Embedded logic in UI components (extraction targets, Phase R.2)

| Component | LOC | Embedded logic | Target module |
|---|---|---|---|
| `calculators/ROICalculator.jsx` | 239 | ROI/payback math | `utils/calculations/roi.ts` |
| `shared/AcidLabTracker.jsx` | 178 | resupply/cooldown math | `utils/trackers/acidLab.ts` |
| `shared/DailyTracker.jsx` | 253 | 6AM-UTC reset logic | `utils/trackers/dailyReset.ts` |
| `shared/StrengthCalc.jsx` | 54 | strength-training math | `utils/calculations/strength.ts` |
| `shared/HeistReadiness.jsx` | 60 | readiness gauge calc | `utils/calculations/heistReadiness.ts` |
| `shared/EfficiencyBenchmarks.jsx` | 89 | benchmark math | `utils/calculations/efficiency.ts` |
| `shared/CommunityComparison.jsx` | 157 | percentile calc | `utils/calculations/percentiles.ts` |
| `shared/IncomeComparison.jsx` | 79 | income comparison | `utils/calculations/incomeComparison.ts` |
| `gamification/EmpireProgressPanel.jsx` | 273 | XP/level math | `utils/calculations/empireProgress.ts` |
| `gamification/GTA6Countdown.jsx` | 149 | countdown date math | `utils/trackers/gta6Countdown.ts` |
| `views/AssessmentForm.jsx` | 467 | misc inline computations | fold into existing utils |

Rule: timers/`setInterval` stay in components; date math and $ math move out. All extractions behavior-preserving.

**Census correction (verified during R.2):** the list above over-counted. Genuinely extracted (6 new modules): `roi.ts`, `strength.ts`, `incomeComparison.ts` (calculations/), `gta6Countdown.ts`, `acidLab.ts`, `dailyReset.ts` (trackers/). Already clean before R.2 (delegate to a hook/util, no inline math): `EmpireProgressPanel` (uses `useEmpireProgressData`), `CommunityComparison` (uses `communityStats` util). No assessment math to extract (display formatting or form-input handling only, left as-is): `HeistReadiness`, `EfficiencyBenchmarks`, `AssessmentForm`. Remaining `Math.*` in components (CommunityTrapStats bar widths, StatBar fill %, LoadingSpinner/Confetti animation, AchievementsGallery grid) is cosmetic, not domain math.

### 9b. Direct localStorage call sites (Phase R.1; all move behind `utils/storage/appStorage.ts`)

| File | Calls | | File | Calls |
|---|---|---|---|---|
| `utils/streakTracker.js` | 14 | | `context/AssessmentContext.tsx` | 3 |
| `utils/communityStats.ts` | 10 | | `components/shared/DailyTracker.jsx` | 3 |
| `utils/trapDetector.js` | 4 | | `context/EmpireContext.tsx` | 2 |
| `utils/gamificationEngine.js` | 4 | | `components/shared/AcidLabTracker.jsx` | 2 |
| `components/shared/DevTools.jsx` | 4 | | `utils/csvExport.js` | 1 (why does an exporter read storage? investigate in R.1) |
| `utils/progressTracker.js` | 3 | | | |

Exit condition: `grep -rn "localStorage" src/components/ src/views/` returns 0.

### 9c. Characterization baseline (captured)

6 profiles x {`computeAssessment`, `buildCompactActionPlan`, `buildSessionPlan`} pinned in `docs/ux-overhaul/characterization/*.json`, clock frozen at 2026-07-05T12:00:00Z (inside the Jul 2-13 event window so weekly-event math is exercised). Now enforced on every `npm test` run. Re-capture legitimately only when `weeklyEvents.ts` DATA changes (verify via git diff first).

## 10. Post-removal addendum (Phase 0B, same day)

Dead-code commit removed: the 6 dead shared components, `QuickStartGuide.jsx` + its `'guide'` router case + import, `src/App.css` + the two no-op `bg-orb-*` divs in `GTAAssessment.jsx`. Result: tests 57/57, lint 0 errors / **76** warnings (was 78), tsc clean, main chunk **527,712 B** (was 537,651 -- ~10 kB headroom banked; ceiling stays at 591,416 B from the pre-removal baseline).

## 11. Deltas vs handoff assumptions

1. Handoff says "three views"; the router has five cases (actionPlan is a separate step; guide is unreachable).
2. Handoff bundle figure ~502 kB is stale; fresh baseline 537.7 kB (July content refresh) -- ceiling recalculated from the fresh number.
3. Repo `CLAUDE.md`/`README.md` doc drift found: "16 tests" (actual 51, now 57), "~71 lint warnings" (actual 78), CSP `connect-src 'none'` (actual `'self'`). Fix at wrap.
4. `npm run test:recommendations` references a file that does not exist (pre-existing breakage, out of scope; noted for wrap docs).
5. Handoff's "no touching assessment math / localStorage schema" constraints were lifted by owner amendment on 2026-07-03 (structural refactor added); `src/data/*`, weekly-events data, vehicles.csv, and export formats remain constrained.
