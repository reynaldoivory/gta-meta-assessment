# 📅 Weekly Events Update Guide

## 🔄 How to Update Weekly Events

**Update every Thursday** when Rockstar announces new bonuses (usually around 4AM ET / 9AM UTC).

---

## 📝 Update Process (5 Minutes)

### Step 1: Get New Event Data
1. Visit [Rockstar Newswire](https://www.rockstargames.com/newswire)
2. Find the latest weekly update post
3. Note all bonuses and discounts

### Step 2: Update `src/config/weeklyEvents.js`

```javascript
export const WEEKLY_EVENTS = {
  meta: {
    weekID: '2026-JAN-15', // Update this
    validUntil: '2026-01-22T09:00:00Z', // Next Thursday 4AM ET / 9AM UTC
    displayDate: 'Jan 15–21, 2026', // Update this
  },
  bonuses: [
    {
      activity: 'New Activity Name',
      multiplier: '2X', // or '3X', '4X', etc.
      note: 'Through Jan 21',
      isGTAPlus: false, // true if GTA+ only
    },
    // ... more bonuses
  ],
  discounts: [
    { item: 'Property Name', discount: '50% off' },
    // ... more discounts
  ],
};
```

### Step 3: Test the Update
```bash
npm run dev
# Fill form and run assessment
# Verify new bonuses appear in action plan
# Verify income calculations use new multipliers
```

---

## 📋 Common Event Types

### Weekly Bonuses (Change Every Thursday)
- **Cayo Perico:** Usually 1.5X or 2X
- **Auto Shop Contracts:** Usually 2X
- **Agency Contracts:** Usually 2X or 3X
- **Bunker Sales:** Usually 2X
- **Nightclub Sales:** Usually 2X

### Monthly GTA+ Benefits (Change Monthly)
- **Auto Shop 2X:** Usually active all month
- **Free Vehicle:** Changes monthly
- **Property Discounts:** Usually 50% off

### Special Events (Rare)
- **Triple Money:** 3X on specific activities
- **Quadruple Money:** 4X (usually GTA+ only)
- **Double RP:** 2X RP (doesn't affect income)

---

## 🎯 Event Detection Logic

The app automatically detects:

1. **Weekly Events:** From `WEEKLY_EVENTS.bonuses` array
2. **Monthly Benefits:** Hardcoded in `dynamicIncome.js` (Auto Shop 2X through Feb 4)
3. **GTA+ Benefits:** Checked via `formData.hasGTAPlus`

---

## ⚠️ Important Notes

### Timezone Handling
- Always use UTC for `validUntil`
- Format: `'YYYY-MM-DDTHH:MM:SSZ'`
- Thursday 4AM ET = Thursday 9AM UTC

### Multiplier Format
- Use string format: `'2X'`, `'3X'`, `'4X'`
- The app parses this automatically
- Supports decimals: `'1.5X'`

### Activity Name Matching
The app matches activities by keywords:
- "Auto Shop" or "Robbery Contract" → Auto Shop
- "Cayo" or "Perico" → Cayo Perico
- "Payphone" or "Agency" → Agency
- "Paper Trail" → Paper Trail (Agency)

**Be consistent with naming!**

---

## 📅 Calendar Reminder

**Set a recurring reminder:**
- **When:** Every Thursday at 4:30 AM ET
- **Action:** Update `weeklyEvents.js`
- **Time:** 5 minutes

**Or use a GitHub Action:**
```yaml
# .github/workflows/weekly-reminder.yml
name: Weekly Events Reminder
on:
  schedule:
    - cron: '30 8 * * 4' # Thursday 8:30 AM UTC
```

---

## 🔍 Verification Checklist

After updating, verify:

- [ ] `validUntil` is next Thursday 9AM UTC
- [ ] `displayDate` matches the week
- [ ] All bonuses are listed
- [ ] Multipliers are correct (2X, 3X, etc.)
- [ ] `isGTAPlus` flags are correct
- [ ] Discounts are listed
- [ ] App shows correct income rates
- [ ] Action plan prioritizes active events

---

## 📊 Example Update

### Before (Jan 8-14):
```javascript
meta: {
  weekID: '2026-JAN-08',
  validUntil: '2026-01-15T09:00:00Z',
  displayDate: 'Jan 8–14, 2026',
},
bonuses: [
  { activity: 'Auto Shop Robbery Contracts', multiplier: '2X', ... }
]
```

### After (Jan 15-21):
```javascript
meta: {
  weekID: '2026-JAN-15',
  validUntil: '2026-01-22T09:00:00Z',
  displayDate: 'Jan 15–21, 2026',
},
bonuses: [
  { activity: 'Cayo Perico Heist', multiplier: '1.5X', ... },
  { activity: 'Bunker Sales', multiplier: '2X', ... }
]
```

---

## 🚨 Common Mistakes

### ❌ Wrong Timezone
```javascript
validUntil: '2026-01-15T04:00:00Z' // Wrong - this is 4AM UTC, not ET
```

### ✅ Correct Timezone
```javascript
validUntil: '2026-01-15T09:00:00Z' // Correct - 4AM ET = 9AM UTC
```

### ❌ Wrong Multiplier Format
```javascript
multiplier: 2 // Wrong - should be string
```

### ✅ Correct Multiplier Format
```javascript
multiplier: '2X' // Correct
```

### ❌ Inconsistent Activity Names
```javascript
activity: 'Auto Shop' // One week
activity: 'Auto Shop Contracts' // Next week
// App won't match these consistently
```

### ✅ Consistent Activity Names
```javascript
activity: 'Auto Shop Robbery Contracts' // Always use full name
```

---

## 💡 Pro Tips

1. **Keep a backup** of last week's events (in case you need to revert)
2. **Test immediately** after updating (don't wait for users to report issues)
3. **Document special events** (like monthly GTA+ benefits) in code comments
4. **Set calendar reminder** for every Thursday
5. **Check Rockstar Twitter** for early announcements (sometimes posted Wednesday night)

---

## 🔗 Resources

- **Rockstar Newswire:** https://www.rockstargames.com/newswire
- **GTA Online Events:** Usually posted Thursday 4AM ET
- **GTA+ Benefits:** Usually posted first Thursday of month

---

**Last Updated:** January 2026  
**Next Update Due:** January 15, 2026 (Thursday)
