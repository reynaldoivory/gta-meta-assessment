# Handoff -- UX Overhaul, GTA Online Meta Assessment
**Authored by Fable 5, 2026-07-03, for a fresh Claude Code session (Fable 5 or Opus 4.8, effort xhigh).**
Repo: `~/projects/gta-meta-assessment` (public: github.com/reynaldoivory/gta-meta-assessment, live on GitHub Pages).

---

## Paste-ready kickoff prompt

> ultrathink. You are running a UX overhaul of `~/projects/gta-meta-assessment`. Before anything:
> read `CLAUDE.md`, `AGENTS.md`, `docs/HANDOFF_UX_OVERHAUL_2026-07-03.md` (this file governs),
> and `CHANGELOG.md` [Unreleased]. Enter Plan Mode and produce a phased plan per the handoff's
> Phase protocol; do not write code before I approve the plan and pick a design direction from
> your Phase 1 proposals. Baseline gates that must stay green after every phase:
> `npm test` (51/51), `npm run lint` (0 errors), `npm run type-check` (0 errors), `npm run build`.
> You may commit per phase. You may NOT run `npm run deploy` -- I deploy.

---

## Mission

Take the app from "engineer's dashboard that grew features" to a coherent, fast, mobile-usable
product with one visual system -- without touching the assessment math, data files, or export
formats. The audience is a GTA Online player mid-session on a second monitor or a phone: dense
information is fine, incoherent information is not.

**Definition of done**
1. One documented design system (tokens in `tailwind.config.js`, usage rules in `docs/DESIGN_SYSTEM.md`).
2. All three views (`form`, `results`, `garage`) rebuilt on it; no orphan styles in `App.css`/`CommunityTrapStats.css` that fight Tailwind.
3. Mobile (390px) and desktop (1440px) both first-class for every view; garage table usable on phone.
4. Keyboard + screen-reader pass: visible focus everywhere, correct roles/labels on the form and modals, WCAG AA contrast on the dark palette.
5. Before/after screenshots for each view committed to `docs/ux-overhaul/`.
6. All four baseline gates green; Lighthouse a11y >= 95 on all three views.

## Current state (verified 2026-07-03 -- trust but re-audit)

- React 19 + Vite 7 + Tailwind, single dark theme (custom `gta` palette, `#0f0918` base; no `dark:` variants -- the app IS the dark theme). Chart.js via react-chartjs-2. Zero backend; localStorage persistence.
- Three step-routed views in `GTAAssessment.jsx`: `form` -> `results` -> plus `garage` (795-vehicle CSV browser with detail modal).
- ~35 components in `src/components/shared/` -- grown organically: form sidebar (`AssessmentVitalsSidebar`), results sections (`ResultsScoreCard`, `AssessmentResultsSections`, `PriorityActionPlanSections`), trackers (`DailyTracker`, `AcidLabTracker`, `CarWashExpiryBadge`), banners (`WeeklyBonusBanner`), gamification dir (XP, 13 achievements, streaks), calculators dir (exports, `SocialCardGenerator`), `DesignShowcase.jsx` (an existing design-system seed -- start your audit there).
- Known UX debt from recent history: results-view navigation needed a fallback fix (June); vitals/stats were recently moved to a sidebar (form density pressure); accessibility/focus pass was started (`62969c6`) but not completed; a CSP-removal TODO sits in `index.html` territory (`1d79620`).
- Quality state: 51/51 tests, 0 lint errors / 78 warnings (style debt -- reduce opportunistically, no mass-disable), 0 tsc errors, SonarCloud gate on CI.

## Constraints (hard)

- **Do not modify**: `src/config/weeklyEvents.ts` data, `src/data/*`, `public/data/vehicles.csv`, scoring/engine files (`computeAssessment`, `calculateIncome`, `gatekeeper*`, `bottleneck*`, `cfoModeLedger`), export output formats, localStorage schema (`gta_assessment_data` -- migrations live in `assessmentDataMigration.js` if a UI change truly needs state shape changes, extend, never break).
- No new runtime dependencies without a one-line justification in the plan (icon set: lucide-react is already present -- use it; no component libraries, no CSS-in-JS).
- Bundle must not grow >10% (current build ~2.9s; check `dist` sizes before/after).
- Keep PropTypes/TS typing conventions per file type; new components in TypeScript.
- Repo style rules per its own `CLAUDE.md`/`AGENTS.md`; SonarCloud gate must stay green on push.

## Design-direction protocol (do this, in this order)

Fable/Opus models carry a persistent default house style (warm cream, serif display, terracotta)
that is WRONG for this product -- a neon-dark GTA companion tool. Do not let it leak in. Also avoid
generic AI-slop aesthetics: no Inter-on-purple-gradient, no cookie-cutter card grids.

**Phase 1 gate:** before building, propose **4 distinct visual directions tailored to this brief**,
each as: background hex / surface hex / accent hex(es) / type pairing / one-line rationale / one
Tailwind-token sketch. At least one direction should evolve the existing `gta` purple-dark palette
rather than replace it (users have muscle memory; the live site has an audience). Present the four
to Chad and STOP for his pick. Implement only the chosen direction.

## Phase protocol

0. **Audit** (parallel subagents fine): run `npm run dev`, screenshot all three views at 390/768/1440
   via Playwright (MCP if the session has it, else scripted `NODE_PATH=$(npm root -g) node` with the
   installed Chromium). Inventory every shared component: used-by, visual inconsistencies, a11y
   violations (axe or manual). Output: `docs/ux-overhaul/AUDIT.md` + before screenshots.
1. **Direction** (gate above). Output: 4 proposals -> Chad picks.
2. **System**: tokens into `tailwind.config.js`, primitives (Button, Card, Badge, Modal, Stat,
   SectionHeader, Table) as typed components; retire orphan CSS; document in `docs/DESIGN_SYSTEM.md`.
3. **Views**: rebuild form -> results -> garage on the primitives, one view per commit, gates green
   each time. Mobile layout is part of each view's acceptance, not a later pass.
4. **A11y + polish**: focus order, roles, reduced-motion, contrast audit, empty/loading states
   (`EmptyState`, `LoadingSpinner` exist -- unify them).
5. **Wrap**: after screenshots, Lighthouse scores, CHANGELOG entry under [Unreleased], final report
   comparing before/after per view. NO DEPLOY -- hand the `npm run deploy` command back to Chad.

## Working rules

- Plan Mode first; the approved plan is the contract. Verify progress claims against tool output.
- Commit per phase with conventional messages; never force-push; `main` only.
- If a change requires touching a constrained file, stop and ask -- do not creatively route around.
- If the dev server or screenshots reveal the audit assumptions above are stale, update AUDIT.md
  and say so before proceeding.

## Context pointers

- `README.md` -- feature map and audience framing (badges/claims must stay true).
- `docs/GARAGE_SHIP_2026-04-17.md` -- how the garage shipped; its patterns are the newest code.
- `CHANGELOG.md` -- July 2026 refresh entry documents current data state.
- Chad's global rules apply to chat output (no em dashes, terse); repo files follow repo style.
