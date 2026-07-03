# Phase 1 -- Design Direction Proposals

Four distinct visual directions for the UX overhaul, each tailored to the brief (dark-only, data-dense, criminal-empire fantasy; audience = a GTA Online player mid-session on a second monitor or phone). Every direction was contrast-checked against WCAG AA and then independently re-verified by an adversarial critic that recomputed each ratio with relative-luminance math and ranked slop risk. **Awaiting Chad's pick -- only the chosen direction is implemented.**

All four: dark theme only, 2 text families + 1 mono, all open-licensed (OFL) and self-hostable as woff2 (no runtime Google Fonts). Semantic token names throughout: `bg.base/surface/raised`, `text.primary/secondary/muted`, `border.subtle/default/focus`, `status.{success,warning,danger,info}`, `accent.*`.

Anti-patterns rejected by construction: warm-cream/serif/terracotta editorial look; generic Inter-on-purple-gradient; cookie-cutter glassmorphism; generic SaaS dashboard.

---

## Direction 1 -- "After Hours" (EVOLVES the current purple-dark)

The mandated "evolve, don't replace" option. Keeps the purple nightclub-neon identity the live audience recognizes, but crowns ONE boss accent (purple) and busts cyan/orange down to strict info/warning roles. Kills the 3-color rainbow gradient headings (solid text + a 2px purple underline bar instead). Adds the hierarchy the current UI lacks: `bg.raised` + a real border marks the ONE emphasized block per view.

| Token | Hex | Role |
|---|---|---|
| bg.base / surface / raised | `#0f0a1a` / `#171126` / `#221937` | page / card / the one emphasized block |
| text.primary / secondary / muted | `#ede9f6` / `#b6abcf` / `#8d80a8` | 16.3 / 9.0 / 5.4 : 1 on base -- all AA body |
| accent (purple) | `#a855f7` | ONE brand hue: CTAs, focus, active nav. Body-size text uses tint `#c9a4fd` |
| status.success (money) | `#4ade80` | $/hr, owned assets, positive ROI -- green only ever means money/done |
| status.warning | `#fb923c` | expiring bonuses, GTA+ gates. Bonus tiles lose orange borders; only the 3X/5X badge carries orange |
| status.info | `#22d3ee` | demoted from co-brand: Pro Tips, meta chips. Never headings/borders/buttons |

Type: **Archivo** (condensed/heavy caps display, the open analog of GTA's Chalet UI face) + **Inter** body (kept) + **JetBrains Mono** for all currency. Minimal-change per the evolve mandate: only the display layer changes.

- Distinct: yes. **Slop risk: HIGHEST of the four** -- the raw palette is near-verbatim Tailwind defaults (`purple-500`/`green-400`/`cyan-400`/`orange-400`) on violet-black with Inter, the exact AI-default it evolves from. Fix if chosen: de-Tailwind the hexes to hand-tuned analogs (e.g. purple `#9b4de0`, success `#43c977`, info `#1fbcd6`, warning `#f0863a`) so it stops reading as generated.
- Contrast: all pass; only sub-4.5 value is `#a855f7` on raised = 4.20, already policy-restricted to large/bold/chrome (>=3:1), body use routed to `#c9a4fd`.

---

## Direction 2 -- "HUD Noir" (GTA V's own HUD grammar)

Lifts GTA V's in-game HUD: desaturated near-black gun-metal chrome, off-white type, the money-counter green as the ONE signature voice (money/success only), restrained blood red. Utilitarian, high-contrast, minimal glow.

| Token | Hex | Role |
|---|---|---|
| bg.base / surface / raised | `#0B0D0C` / `#131614` / `#1B1F1C` | near-black gun-metal |
| text.primary / secondary / muted | `#F2F4F0` / `#ADB5AC` / `#868F86` | 17.6 / 9.3 / 5.8 : 1 on base |
| accent.money | `#6BD968` | the single signature: cash, positive deltas, tier grades, primary CTA, focus |
| accent.money-deep | `#3FA84C` | filled variant for bars/badges/buttons (ink text on top) |
| status.warning | `#E8B341` | expiring bonuses, time callouts -- at most one per viewport |
| status.danger | `#FF6659` | Wasted / bottleneck flags / destructive only |

Type: **Barlow Condensed** (Rockstar-poster caps display) + **Barlow** body (built on California highway-signage DNA = Los Santos) + **JetBrains Mono** for money. One superfamily = one voice.

- Distinct: yes. **Slop risk: LOW** -- sourced from the actual game HUD, no Inter/purple/rainbow, reads deliberate.
- Contrast: every token clears 4.5:1 on all three surfaces. No fixes needed.
- Watch: shares "near-black + green primary" with Direction 4. Keep it strictly monochrome-green (resist adding amber+red as co-equal channels) and lean the Barlow poster type hard to hold them apart.

---

## Direction 3 -- "Kingpin Dossier" (intel-briefing ledger)

An intel/heist-planning dossier: ink blue-black base (darker + bluer than today's purple), matte surfaces with **hairline borders instead of glows**, brass gold as the single primary (money/tiers/scores), signal red for danger. Strong editorial hierarchy for 795 vehicles + 20 businesses. The only direction with no green primary.

| Token | Hex | Role |
|---|---|---|
| bg.base / surface / raised | `#0A0E14` / `#111826` / `#182230` | ink blue-black |
| text.primary / secondary / muted | `#E9EEF5` / `#A9B4C4` / `#7C8AA0` | 16.6 / 9.2 / 5.5 : 1 on base |
| accent.gold | `#D9A83D` | primary: money figures, tier grades, scores, focus, CTA (dark ink on gold fill) |
| status.success / warning / danger / info | `#59C98B` / `#F0A24B` / `#FF5C52` / `#6FB3E8` | positive delta / caution / wasted / links |

Type: **Archivo** (Expanded, 700-900, all-caps headers, one ink color + a 2px gold rule, never gradients) + **Barlow** body + **IBM Plex Mono** for tabular ledger figures. Squared-off matte cards (`radius 6px`, no glow); hierarchy from borders + type.

- Distinct: yes. **Slop risk: LOWEST** -- explicitly drops both Inter and JetBrains Mono (the two biggest AI-stack tells); most differentiated; only direction with a non-green primary.
- Contrast: all pass; `muted #7C8AA0` on raised = 4.58 (thin but passing -- use secondary for long body on raised, or bump to `#8695AB`).

---

## Direction 4 -- "Phosphor Ledger" (Master Control Terminal)

The in-game arcade Master Control Terminal / hacker fantasy: deep black-green base, phosphor accents (terminal green in, amber for this week's multipliers, red for what's bleeding you), mono-forward type, ruled 1px ledger grids. No CRT/scanline gimmicks (a11y-safe; the terminal feel is type + color + structure).

| Token | Hex | Role |
|---|---|---|
| bg.base / surface / raised | `#070B09` / `#0D1512` / `#14201A` | black phosphor terminal |
| text.primary / secondary / muted | `#E6F1EA` / `#A3BCAE` / `#7A9587` | 17.1 / 9.8 / 6.1 : 1 on base |
| accent.phosphor (success) | `#3DDC84` | money in, success, focus, RUN ASSESSMENT |
| accent.amber (warning) | `#FFB224` | 2X-5X multipliers, GTA+ gates -- a visible resting co-channel |
| accent.signal (danger) | `#FF7A68` | bottlenecks, Wasted, negative deltas |
| accent.ice (info) | `#5CD3E8` | links, secondary chart series, meta chips |

Type: **JetBrains Mono** 700/800 caps for display (headers, tier grades, big $) + **IBM Plex Sans** body + JetBrains Mono tabular for ledgers.

- Distinct: yes. **Slop risk: LOW-MODERATE** -- ledger framing + Plex Sans is coherent, but JetBrains-Mono-as-display is itself a "hacker terminal" cliche and JetBrains Mono is already in the old stack (reads as least-effort). Fix if chosen: promote a real display mono (e.g. IBM Plex Mono) so Plex Sans + Plex Mono reads as a chosen superfamily.
- Contrast: all pass on all three surfaces; primary + 3 of 4 accents clear AAA 7:1.
- Watch: shares "near-black + green primary" with Direction 2. Make amber a visible resting co-channel to separate them.

---

## Critic's summary

- **Contrast: a non-issue across all four.** Every body token clears 4.5:1 on base and surface; every large/UI accent clears 3:1; worst raised-layer body token is 4.58 (passing). The one sub-4.5 value (After Hours purple on raised = 4.20) is self-flagged and policy-restricted. All four contrastNotes are honest.
- **Distinctness: four genuine poles** -- purple nightclub / GTA-HUD gun-metal / gold-ink dossier / CRT terminal. One real collision: HUD Noir vs Phosphor Ledger (both near-black + green-primary); separable on type + accent breadth but must be enforced.
- **Slop ranking (worst -> best): After Hours, Phosphor Ledger, HUD Noir, Kingpin Dossier.** For maximum distance from generic output, Kingpin Dossier and HUD Noir are the safe picks; After Hours needs its palette de-slopped first.
