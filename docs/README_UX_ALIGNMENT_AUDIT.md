# README UX Alignment Audit

Date: 2026-02-15  
Contract source: `origin/main:docs/README.md`

## Summary

This audit checks whether the **user-facing UX** currently supports the README feature statements.

- **Supported:** 12
- **Partially supported:** 2
- **Needs correction (README drift / UX drift):** 2

## Feature-by-feature alignment

### Core Assessment

- ✅ Comprehensive GTA Online progress analysis — supported in form + results + action plan flow.
- ✅ Score/tier system with bottleneck detection — supported in Results and Bottlenecks sections.
- ✅ Income calculation (active + passive) — supported in results score card and benchmark cards.
- ✅ Heist readiness evaluation — supported in Heist Readiness section.

### Gamification

- ⚠️ "13 achievement badges" — **README drift**: app currently defines **16** achievements in `src/utils/achievements.js`.
- ✅ Daily streak tracking — supported via streak banner and gamification state.
- ✅ Progress over time charts — supported via Community Comparison chart section.
- ✅ Confetti animations — supported in results entry/celebration flow.
- ✅ Sound effects — supported via SoundToggle and sound effects hooks.

### Export Tools

- ✅ CSV export (community stats) — supported from Community Comparison panel.
- ✅ CSV export (progress history) — **now supported in UX** via "Export Progress CSV" button in Community Comparison.
- ✅ LLM prompt generators — supported via AI Assistant Tools (LLM prompt, plan critique, JSON payload, what-if).
- ✅ Google Doc formatted reports — supported via AI Assistant Tools.
- ✅ Social media share cards — supported via SocialCardGenerator in results.

### Calculators

- ✅ ROI calculator ("What are you saving for?") — supported in ROICalculator.
- ✅ Community comparison percentile — supported.
- ✅ Income breakdown visualizations — supported in score and efficiency sections.

## UX quality risks vs README positioning

Even where features exist, current UX can still feel misaligned with product goal due to:

1. **Narrative overload in Results:** too many mixed-priority cards before key decision CTA.
2. **Mixed voice/tone:** tactical optimization mixed with novelty/gamification messaging.
3. **Scattered value hierarchy:** users must scan many sections to identify "what to do next".

## Recommended next UX alignment pass

1. **Top-of-results decision strip:** score, blockers, next best action, time-to-goal only.
2. **Collapse secondary sections by default:** gamification, motivational, deep analytics.
3. **Single primary CTA hierarchy:** "View Action Plan" as dominant action.
4. **README sync:** update README claim from 13 to 16 achievements (or reduce badges to 13 deliberately).

## Changes made in this pass

- Added a user-visible progress-history CSV export action in:
  - `src/components/shared/CommunityComparison.jsx`

This directly aligns UX with the README statement that both community stats and progress history can be exported.
