<!-- markdownlint-disable MD022 MD026 MD031 -->

# ADR-001: Separate GTA+ Bonuses from Global Weekly Events

**Status**: Accepted  
**Date**: 2026-02-14  
**Deciders**: Development Team  
**Related Issues**: Weekly bonus logic contamination  

## Context

The weekly events configuration previously mixed GTA+ exclusive bonuses with global bonuses in a single structure. This caused several issues:

1. **Logic Bleed**: GTA+ multipliers (e.g., 6X for Lunar New Year Stunt Races) were branching within global weekly events using conditional checks
2. **Visibility Problem**: Non-GTA+ subscribers couldn't see what exclusive benefits they were missing
3. **Maintenance Burden**: Every weekly update required careful attention to avoid mixing subscriber-only and global logic
4. **UX Confusion**: Users didn't understand the value proposition of GTA+ subscription

The original structure looked like:
```javascript
lunarNewYearStuntRaces: {
  multiplier: 3,
  gtaPlusMultiplier: 6, // Branching logic
}
```

## Decision

We will separate GTA+ exclusive monthly bonuses into a dedicated `gtaPlus.monthlyBonuses` array within the `WEEKLY_EVENTS` configuration object. The `getWeeklyBonuses()` function will accept an options object to control GTA+ bonus inclusion and subscription status.

### Implementation Pattern:

1. **Configuration Layer** (`src/config/weeklyEvents.js`):
   - Move GTA+ exclusive bonuses to `WEEKLY_EVENTS.gtaPlus.monthlyBonuses[]`
   - Modify `getWeeklyBonuses(options)` to accept `{ hasGTAPlus, includeGTAPlus }` flags
   - Add `locked` property to GTA+ bonuses when user is not a subscriber

2. **UI Layer** (`src/components/shared/WeeklyBonusBanner.jsx`):
   - Accept `hasGTAPlus` prop
   - Render locked state for GTA+ bonuses: grayscale, 60% opacity, lock icon overlay
   - Display "GTA+ Required" label on locked tiles

3. **View Layer** (`src/views/AssessmentForm.jsx`):
   - Always render `WeeklyBonusBanner` (not conditionally)
   - Pass `hasGTAPlus={formData.hasGTAPlus}` prop

## Consequences

### Positive:
✅ **Clear Separation**: GTA+ logic isolated from global events  
✅ **Upsell Visibility**: Non-subscribers see what they're missing (SaaS best practice)  
✅ **Maintainability**: Weekly updates no longer risk logic contamination  
✅ **Testability**: Can test GTA+ and non-GTA+ paths independently  
✅ **Scalability**: Easy to add more GTA+ perks without touching global logic  

### Negative:
⚠️ **Breaking Change**: Any component directly consuming `WEEKLY_EVENTS.bonuses` must be updated  
⚠️ **API Change**: `getWeeklyBonuses()` signature changed (but backward compatible with default params)  

### Neutral:
📝 **Documentation Requirement**: Test cases must verify locked state rendering  
📝 **Migration Note**: Existing code using old structure must be refactored  

## Notes

- The locked UI pattern (grayscale + opacity + lock icon) follows industry standards for freemium upsell
- The `includeGTAPlus` flag allows different views to show/hide GTA+ bonuses as needed
- The `locked` property is computed server-side to prevent client manipulation
- This pattern can be extended to other subscription tiers if introduced

## Related Work

- See `CHANGELOG.md` for user-facing changes
- See `docs/TESTING_GUIDE.md` Test Case 0 for locked state verification
- See commit `feat(gta-plus): separate GTA+ bonuses with locked state UI`
