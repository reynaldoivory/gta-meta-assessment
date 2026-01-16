# Recommendation Engine Tests

## Running the Tests

### Option 1: Using Node.js directly

```bash
node test/testRecommendations.js
```

### Option 2: Using npm script (if configured)

```bash
npm run test:recommendations
```

## Expected Output

The test should output:

1. **Raw Recommendations** - 5 prioritized recommendations with:
   - Priority level (critical/high/medium)
   - Type (one_time_bonus, expiring_event, skill_training, money_grind)
   - Reasoning and value calculations
   - Time investment and expiry information

2. **Formatted Recommendations** - UI-ready format with:
   - Icons (🎁, ⚡, 💰, 🚗, 📚, 💵)
   - Formatted values and descriptions
   - Action buttons

## Test Data

The test uses a sample user profile:
- Rank 75
- $342k cash
- GTA+ member
- Low flying/stealth stats (good for ROI testing)
- Owns: Kosatka, Agency, Acid Lab, Nightclub, Auto Shop

## Troubleshooting

If you see import errors:
- Ensure you're running from the project root
- Check that `src/data/weeklyEvents.json` exists
- Verify all dependencies are installed (`npm install`)

If recommendations are empty:
- Check that `weeklyEvents.json` has valid dates (not expired)
- Verify user data structure matches expected format
- Check console for warnings about missing data
