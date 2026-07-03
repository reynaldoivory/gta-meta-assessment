# Phase 1 -- Design Direction (DECIDED)

**Chosen direction: "Arcade HUD"** -- locked by Chad 2026-07-03, overriding the four auto-generated proposals (archived at the bottom for the record). This is the single direction implemented in Phase 2.

## Locked specs (owner-supplied)

- **Background:** `#050b14` (Deep Navy)
- **Surface:** `#0a192f` (Slate Blue)
- **Primary accent / status:** `#29d2e3` (HUD Blue) -- primary actions, focus, positive/info status.
- **Warning + danger accent:** `#ff007f` (Vice Pink) -- STRICTLY bottlenecks and warnings (e.g. the Car Wash MCT limitation). Never used for positive/primary.
- **Typography:** **Outfit** (sans-serif) for Display/UI, **Fira Code** (monospace) for Data/Numbers. Both OFL, self-hosted woff2 (no runtime Google Fonts).

This is a synthwave/arcade two-channel HUD: cyan = good/actionable, pink = bad/caution. Clean signal separation for a player scanning mid-session.

## Verified token set (contrast-checked, WCAG AA)

Neutral ramp + raised surface + borders derived here (owner specified base/surface/accents/type only). All ratios computed with relative-luminance math against `bg #050b14`, `surface #0a192f`, `raised #12294a`.

| Token | Hex | Contrast (bg / surface / raised) | Verdict |
|---|---|---|---|
| bg.base | `#050b14` | -- | page |
| bg.surface | `#0a192f` | -- | cards/panels |
| bg.raised | `#12294a` | -- | the one emphasized block per view |
| text.primary | `#E6EEF7` | 16.85 / 15.04 / 12.44 | AAA |
| text.secondary | `#A7BAD0` | 9.94 / 8.87 / 7.34 | AAA |
| text.muted | `#8399B4` | 6.75 / 6.02 / 4.98 | AA body on all three |
| accent (HUD Blue) | `#29d2e3` | 10.73 / 9.57 / 7.92 | AAA -- primary/focus/info/success |
| status.danger/warning (Vice Pink) | `#ff007f` | 5.22 / 4.66 / 3.86 | AA body on bg+surface; **on raised restrict to large/bold/chrome (>=3:1)** |
| accent.pink-text (body-safe pink tint) | `#ff5ba6` | 6.86 / 6.12 / 5.0 | for any pink text at body size, esp. on raised |
| ink-on-accent | `#050b14` | on HUD Blue fill 10.73 · on Vice Pink fill 5.22 | dark ink on filled buttons (white on pink = 3.78, fails body -- use ink) |
| border.subtle | `#17304f` | decorative (1.32 on surface) | hairlines |
| border.default | `#24406a` | decorative (1.69) | dividers |
| border.focus | `#29d2e3` | 9.57 on surface | focus ring, far above 3:1 non-text min |

**Two-channel status mapping** (per owner spec): `status.success` + `status.info` + `primary` all map to HUD Blue `#29d2e3`; `status.warning` + `status.danger` map to Vice Pink `#ff007f`. Money/positive/owned = cyan; bottleneck/expiring/wasted = pink. No third accent (kills the current cyan-vs-orange-vs-purple fight).

## Tailwind `theme.extend` sketch (Phase 2 target)

```js
colors: {
  bg:     { base: '#050b14', surface: '#0a192f', raised: '#12294a' },
  text:   { primary: '#E6EEF7', secondary: '#A7BAD0', muted: '#8399B4', 'on-accent': '#050b14' },
  border: { subtle: '#17304f', DEFAULT: '#24406a', focus: '#29d2e3' },
  accent: { DEFAULT: '#29d2e3', 'pink-text': '#ff5ba6' },
  status: { success: '#29d2e3', info: '#29d2e3', warning: '#ff007f', danger: '#ff007f' },
  hud:    { blue: '#29d2e3', pink: '#ff007f' }, // literal aliases if a component needs the raw channel
},
fontFamily: {
  display: ['Outfit', 'system-ui', 'sans-serif'],
  sans:    ['Outfit', 'system-ui', 'sans-serif'],
  mono:    ['"Fira Code"', 'ui-monospace', 'monospace'],
},
fontSize: { '2xs': ['0.625rem', { lineHeight: '0.875rem' }] }, // retires the text-[10px] cluster
```

Legacy `gta.*` aliases get re-pointed at these during Phase 3 and deleted in Phase 4 (grep-0). Raw `slate-*` (740 uses) migrates to `text.*`/`bg.*`/`border.*` per view.

---

## Archived: the four auto-generated proposals (SUPERSEDED)

Preserved for the audit trail. None of these is implemented; the owner selected the custom Arcade HUD above. Each was WCAG-AA verified and adversarially critiqued (contrast a non-issue across all four; slop ranking worst->best: After Hours, Phosphor Ledger, HUD Noir, Kingpin Dossier).

1. **After Hours** -- evolve the purple-dark (`#0f0a1a`/`#171126`, one purple accent, cyan/orange demoted). Highest slop risk (near-Tailwind-default palette).
2. **HUD Noir** -- GTA V HUD gun-metal (`#0B0D0C`), money-green single voice, Barlow Condensed. Low slop.
3. **Kingpin Dossier** -- ink-blue + brass gold (`#0A0E14`/`#D9A83D`), hairline borders, Archivo/Barlow/IBM Plex Mono. Lowest slop.
4. **Phosphor Ledger** -- black-green terminal (`#070B09`), phosphor/amber/signal/ice, JetBrains Mono display. Low-moderate slop.

(Full specs for the four are in git history at commit `c105c0f`.)
