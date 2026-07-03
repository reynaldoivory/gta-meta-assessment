# Arcade HUD Design System

## GTA Meta Assessment -- July 2026

Supersedes the Feb 2026 "Enterprise Kid-Friendly" system in full. Locked by the
project owner 2026-07-03 as part of the UX overhaul (`docs/HANDOFF_UX_OVERHAUL_2026-07-03.md`,
`docs/ux-overhaul/DIRECTIONS.md`). A synthwave/arcade two-channel HUD: cyan
signals good/actionable, pink signals bad/caution. Single dark theme -- there is
no light mode and no `dark:` variants.

## Tokens

All tokens live in `tailwind.config.js` under `theme.extend.colors`. Use the
semantic names below, not raw Tailwind palette classes (`slate-*`, `purple-*`,
etc.) and not the deprecated `gta.*`/`primary.*`/`surface.*`/`accent.*` aliases
(kept only for un-migrated views until Phase 4 deletes them).

| Token | Hex | Use |
|---|---|---|
| `bg-bg-base` | `#050b14` | Page background (Deep Navy) |
| `bg-bg-surface` | `#0a192f` | Cards, panels (Slate Blue) |
| `bg-bg-raised` | `#12294a` | The ONE emphasized block per view |
| `bg-bg-overlay` | `rgba(5,11,20,.85)` | Modal/scrim backdrop |
| `text-text-primary` | `#E6EEF7` | Headings, primary copy (16.8:1 on base) |
| `text-text-secondary` | `#A7BAD0` | Secondary copy (9.9:1 on base) |
| `text-text-muted` | `#8399B4` | Captions, hints (6.75:1 on base -- AA body floor) |
| `text-text-on-accent` | `#050b14` | Dark ink on filled HUD-blue/Vice-pink buttons |
| `border-border-subtle` | `#17304f` | Hairlines |
| `border-border` (DEFAULT) | `#24406a` | Dividers, card borders |
| `border-border-strong` | `#345584` | Emphasized dividers |
| `border-border-focus` | `#29d2e3` | Focus ring (also `:focus-visible` default) |
| `bg-hud-blue` / `text-hud-blue` | `#29d2e3` | HUD Blue -- primary, success, info, actionable |
| `bg-hud-pink` / `text-hud-pink` | `#ff007f` | Vice Pink -- warning, danger, bottlenecks |
| `text-accent-pink-text` | `#ff5ba6` | Body-safe pink tint (use for pink text at body size, especially on `bg-raised`) |
| `status-success` / `status-info` | `#29d2e3` | Alias of HUD Blue |
| `status-warning` / `status-danger` | `#ff007f` | Alias of Vice Pink |

**Two-channel rule:** every status in the app is either "good" (cyan) or
"bad" (pink). Don't introduce a third hue for status. Use `text-accent-pink-text`
instead of raw `hud-pink` for pink body text -- pure Vice Pink drops to 3.86:1 on
`bg-raised`, which fails AA at body size (it's fine for large/bold text, icons,
borders, and filled buttons with dark ink).

**Type:** `font-display` / `font-body` = Outfit (self-hosted variable woff2,
`public/fonts/Outfit-var.woff2`). `font-mono` = Fira Code (self-hosted,
`public/fonts/FiraCode-var.woff2`), used for all dollar amounts, stats, and
tabular data via `tabular-nums`. `text-2xs` (0.625rem) is the smallest step --
use it instead of arbitrary `text-[10px]`/`text-[11px]` classes.

**Contrast reference:** full WCAG computation for every token pair (against
base/surface/raised) is in `docs/ux-overhaul/DIRECTIONS.md`. Re-run
`scripts/contrastAudit.mjs` (added Phase 4) after any hex change.

## Primitives

All in `src/components/ui/`, imported from the barrel: `import { Button, Card, ... } from '@/components/ui'` (or the relative path). All new UI is TypeScript.

| Component | File | Notes |
|---|---|---|
| `Button` | `Button.tsx` | `variant`: primary/secondary/accent/ghost/danger. `size`: sm/md/lg. Optional `icon` (lucide) + `iconPosition`. `fullWidth`. Absorbs the deprecated `.btn-*` classes and the 61 hand-styled `<button>`s. |
| `Card` | `Card.tsx` | `variant`: default/elevated/interactive. `padding`: none/sm/md. `as` polymorphic tag. Absorbs `.card-enterprise` and the ~7 hand-rolled domain cards. |
| `Badge` | `Badge.tsx` | `tone`: success/warning/danger/info/neutral/accent (two-channel: success/info/accent render blue, warning/danger render pink). `size` sm/md. Optional icon. |
| `Modal` | `Modal.tsx` | `open`, `onClose`, `title`, `size` (md/lg/full-mobile), `footer`, `initialFocusRef`. Built on `useFocusTrap`. `role="dialog"`, `aria-modal`, labelled by title, Escape closes, backdrop-click closes, body scroll locked. |
| `useFocusTrap` | `hooks/useFocusTrap.ts` | Ref-based (not `getElementById`), re-queries focusable elements on every Tab keydown (handles dynamic content), restores focus to the trigger on close. Generalizes the old garage `DetailModal` trap and fixes its two known weaknesses. |
| `Stat` | `Stat.tsx` | Read-only label/value tile. `tone`, `icon`, `size` (sm/md/lg). Value renders in `font-mono` with `tabular-nums`. |
| `SectionHeader` | `SectionHeader.tsx` | `title`, `subtitle`, `icon`, `actions`, `as` (h2/h3). |
| `AppShell` | `AppShell.tsx` | Shared page frame: title/subtitle, optional `onBack`, optional `nav` (tab strip with `aria-current="page"`), header `actions`, `width` (default=`max-w-5xl` / wide=`max-w-7xl`). Presentational -- never imports `AssessmentContext`, so views pass `setStep` handlers in. Closes the "every view hand-rolls its own header and they disagree" gap. |
| `Table`, `TableWrap`, `THead`, `TBody`, `TR`, `TH`, `TD` | `Table.tsx` | Styled table primitives only -- row/sort/filter logic stays in the consumer (e.g. `VehicleTable`). `TableWrap` provides the `overflow-x-auto` scroll container. |
| `Field`, `Input` | `Field.tsx` | `Field` guarantees `<label htmlFor>` association (fixes the old placeholder-only pattern in `FilterPanel`); renders hint/error text, error gets `role="alert"`. |
| `EmptyState` | `EmptyState.tsx` | Token-based rewrite of the old raw-slate `shared/EmptyState.jsx`. |
| `Spinner`, `LoadingOverlay` | `Spinner.tsx`, `LoadingOverlay.tsx` | Split of the old monolithic `LoadingSpinner.jsx`: `Spinner` is inline/small, `LoadingOverlay` is the full-screen busy state. |

## Responsive rules

- **390px is first-class**, not an afterthought. Every new/rebuilt layout must
  be verified at 390 (phone), 768 (tablet), and 1440 (desktop) -- the audit
  screenshot script (`scripts/uxAudit.screenshots.mjs`) covers exactly these
  three widths for all four views.
- Default to `grid-cols-1 sm:grid-cols-N` (or `md:`) for any multi-column card
  grid. Never ship a bare `grid-cols-2/3/4` with no responsive prefix --
  the pre-overhaul app had ~14 such instances that were cramped at 390px.
- Data tables (the garage vehicle list) use a **card-reflow pattern** below
  `md`, not horizontal scroll: render `TableWrap`+`Table` in a `hidden md:block`
  wrapper, and a card-list view in a sibling `md:hidden` wrapper, both fed by
  the SAME filtered/sorted/paginated row slice so the DOM cost stays bounded
  (never render both simultaneously).

## Motion + accessibility rules

- Global `:focus-visible` ring (`border-border-focus`, `@layer base` in
  `src/index.css`) applies everywhere by default -- new components should not
  need to hand-roll focus styles.
- Every `animate-*` utility must have a corresponding behavior under
  `@media (prefers-reduced-motion: reduce)` (already neutralized globally in
  `src/index.css`, but decorative elements with inline `animationDuration`
  overrides should double-check they respect it -- see Phase 4 sweep).
- Contrast matrix: filled in during Phase 4 (`scripts/contrastAudit.mjs` output
  will be pasted here once run against final component usage).

## Migration status

- **Phase 2 (this doc):** tokens + primitives exist; `gta.*`/`primary.*`/
  `surface.*`/`accent.*` are deprecated aliases pointed at Arcade HUD hexes so
  un-migrated components shift color coherently rather than clashing.
- **Phase 3:** each view (form, results, actionPlan, garage) is rebuilt on
  these primitives, one per commit.
- **Phase 4:** legacy aliases and the `@layer components` `.btn-*`/`.card-enterprise`/
  `.badge*`/`.input-enterprise`/`.heading-gradient-*` classes in `src/index.css`
  are deleted once `grep -rn "gta-\|primary-\|surface-\|btn-primary\|btn-secondary\|btn-accent\|card-enterprise\|badge-\|input-enterprise\|heading-gradient" src/` returns 0.
