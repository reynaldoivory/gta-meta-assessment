# UX Overhaul + Structural Refactor -- Final Report

Engagement: 2026-07-03, single session. Governing docs: `docs/HANDOFF_UX_OVERHAUL_2026-07-03.md`
(original scope) and the approved phased plan (Phase 0 -> Phase 5, amended mid-planning to add
the structural refactor -- see `AUDIT.md` decisions section and `CHANGELOG.md` [Unreleased]).

## Summary

One documented "Arcade HUD" design system now covers all four views (form, results, action plan,
garage), replacing three overlapping and undocumented color authorities. A structural refactor
(scope explicitly widened by the owner mid-engagement) pulled all assessment math and localStorage
access out of UI components into dedicated, unit-tested modules. Accessibility was swept twice
(axe-core + Lighthouse) and every serious/critical finding was fixed. Bundle size held flat despite
the new design-system primitives, because dead-code and legacy-token removal offset the addition.

## Before / after screenshots

- Before: `docs/ux-overhaul/before/` (12 JPEGs: 4 views x 3 widths, captured Phase 0)
- After: `docs/ux-overhaul/after/` (12 JPEGs, same matrix, captured Phase 5)

## Bundle size

| Chunk | Before (raw) | After (raw) | Delta |
|---|---|---|---|
| `index.js` (main) | 537,651 B | 531,131 B | -6,520 B |
| `ProgressChart.js` (lazy) | 166,939 B | 166,905 B | -34 B |
| `index.css` | 75,421 B | 35,478 B | -39,943 B |
| `ROICalculator.js` (lazy) | 5,039 B | 5,312 B | +273 B |
| `SocialCardGenerator.js` (lazy) | 3,035 B | 3,005 B | -30 B |

Main-chunk ceiling: 591,416 B (baseline +10%, enforced by `scripts/bundleReport.mjs`). Final: within
budget with headroom, despite adding an entire `src/components/ui/` primitive library, self-hosted
fonts, branded types, and three new `src/utils/` module directories. The CSS drop is the deprecated
`@apply` layer + legacy token blocks being deleted in Phase 4's token endgame.

## Tests

| | Before | After |
|---|---|---|
| Test suites | 4 | 15 |
| Tests | 51 | 139 |
| Lint warnings | 78 | 76 |
| Lint errors | 0 | 0 |
| tsc errors | 0 | 0 |

New coverage: storage service (13 tests, incl. prototype-pollution guard), extracted calculation/
tracker modules (~2 suites), `src/components/ui/*` primitives + `useFocusTrap` hook (46 tests), and
a 6-fixture characterization suite pinning `computeAssessment`/`buildCompactActionPlan`/
`buildSessionPlan` output across the entire refactor (frozen clock `2026-07-05T12:00:00Z`, goldens
in `docs/ux-overhaul/characterization/*.json`). The characterization suite never needed
re-capturing -- confirmed via import-graph grep that the branded-types work in Phase 3.2 never
touched the scoring pipeline.

## Accessibility

### axe-core (`docs/ux-overhaul/A11Y.md`, 4 views x 3 widths)

| | Serious/critical violations |
|---|---|
| Before Phase 4 fixes | 12 |
| After Phase 4 fixes | 0 |

Fixed: 4 instances of an `opacity-N` wrapper silently multiplying an already-muted or
policy-restricted text color below the WCAG 4.5:1 floor (`AssetCard`, `WeeklyBonusBanner`,
`AchievementsGallery`, `DailyTracker`); one raw `hud-pink` body-text usage that should have been
`accent-pink-text`; two unlabeled form controls (a checkbox, a `<select>`); a `<main>` landmark
resolving both `landmark-one-main` and ~44 `region` violations at once (which in turn surfaced a
real duplicate-`<main>` conflict in `AssessmentForm.jsx`, fixed by demoting the inner one to a
`<div>`); a keyboard-inoperable sortable table header (mouse-only `onClick` div -> real `<button>`).

Remaining (moderate, outside the 0-serious/critical exit bar, deferred): `heading-order` on
results/actionPlan (1 each) -- `GTA6Countdown`'s `<h3>` doesn't nest cleanly under the page `<h1>`
in every child component. Would need a broader heading-level audit across the `gamification/`
component suite; noted in repo `CLAUDE.md` Known Technical Debt.

### Lighthouse (`docs/ux-overhaul/LIGHTHOUSE.md`, user-flow snapshot API -- the SPA has no URL
routing, so Lighthouse's normal per-URL runner can't reach results/actionPlan/garage)

| View | Score | Gate |
|---|---|---|
| form | 100 | >= 95 -- PASS |
| garage | 100 | >= 95 -- PASS |
| results | 98 | >= 95 -- PASS |
| actionPlan | 97 | reference (same tree/tokens as results, not separately gated) |

### Contrast (`scripts/contrastAudit.mjs`, computed against final token hex values)

Every semantic foreground/background pair clears its WCAG AA floor (4.5:1 body text, 3:1
non-text/large-bold), with one documented policy exception: `hud.pink` on `bg.raised` = 3.86:1,
restricted by convention to large/bold text and chrome (use `accent.pink-text` for body copy on
raised surfaces). The script fails only on undocumented regressions.

## Token census

| | Before | After |
|---|---|---|
| Color authorities | 3 (`gta.*` 118 uses, `primary/surface/accent` 137 uses, raw Tailwind ~740 `slate-` uses) | 1 (Arcade HUD semantic tokens: `bg.*`/`text.*`/`border.*`/`status.*`/`hud.*`) |
| True component primitives | 0 | 11 (`src/components/ui/`) |
| Deprecated `@apply` classes in `index.css` | 8 (thin adoption, 12/61 buttons) | 0 (deleted at grep-0 in Phase 4) |
| Documented palette exceptions | 0 (undocumented drift) | 2 (achievement tiers, vehicle class colors -- both categorical, not status) |

## Structural refactor

- `src/utils/storage/appStorage.ts` + `useStoredState.ts`: centralizes all localStorage access
  (`STORAGE_KEYS` registry preserves every historical key string verbatim). 11 direct call sites
  migrated (contexts + `DevTools`/`DailyTracker`/`AcidLabTracker`). `grep -rn "localStorage"
  src/components/ src/views/` = 0.
- `src/utils/calculations/{roi,strength,incomeComparison}.ts` +
  `src/utils/trackers/{gta6Countdown,acidLab,dailyReset}.ts`: pure math extracted from UI
  components. `src/types/branded.ts` adds compile-time `Dollars`/`Income`/`Hours`/`Days` nominal
  types (via `unique symbol`, zero runtime cost) at the calculation modules' public boundaries.
- Deleted (confirmed zero importers before each `git rm`): `CarWashExpiryBadge` (owner-confirmed
  mechanically useless -- the Master Control Terminal cannot monitor the Car Wash business),
  `AssessmentAssetsPanel`, `NightclubLogistics(Sections)`, `DesignShowcase`,
  `EnterpriseFinancialGuidePanel`, `QuickStartGuide` (unreachable), `LoadingSpinner`, `ActionCard`
  (a second, genuinely unrelated dead file discovered during Phase 4's token-endgame grep --
  `ActionPlanList.jsx` has its own internal `ActionCard` function).

## Deviations from the plan

- **CSP `unsafe-inline`**: the plan's exit condition was "drop `unsafe-inline` from `style-src`
  only if inline-style usage reaches zero." It didn't -- 9 components remain (down from 13),
  all dynamic-value cases (progress-bar widths, animation delays) that don't map cleanly to
  static Tailwind classes. `unsafe-inline` stays; the count and rationale are documented in
  `index.html`'s CSP comment.
- **`<main>` landmark**: not explicitly scoped in the Phase 4 checklist, added opportunistically
  because it resolved ~44 axe `region` violations at once. Surfaced and fixed a real duplicate-
  `<main>` conflict in `AssessmentForm.jsx` as a side effect.
- **`heading-order`**: deferred as a moderate-severity, out-of-gate finding (see Accessibility
  above and repo `CLAUDE.md` Known Technical Debt).
- **URL routing**: explicitly out of scope per the plan (the `setStep`-during-render fix was
  scoped to a `useEffect` + `EmptyState`, not a router migration). This is also why Lighthouse
  needed the user-flow snapshot API instead of a normal per-URL run.

## Gates (final state)

```
npm test           139/139 passing, 15 suites
npm run lint       0 errors, 76 warnings
npm run type-check 0 errors
npm run build       main chunk 531,131 B (ceiling 591,416 B)
axe-core            0 serious/critical (4 views x 3 widths)
Lighthouse a11y     100 / 100 / 98 / 97 (form / garage / results / actionPlan)
```

All phases committed individually and deployed to
<https://reynaldoivory.github.io/gta-meta-assessment/> after gates passed, per the owner's
per-phase-deploy decision.
