<!-- markdownlint-disable MD022 MD031 MD032 MD036 MD009 -->

# 🧪 Testing Guide - Meta Awareness System

## 🎯 Critical Test Cases

### Test Case 0: GTA+ Locked Bonus Visibility ✅
**New Feature - Locked State for Non-Subscribers**

**Setup:**
- Has GTA+: **No**
- Weekly events have GTA+ monthly bonuses configured

**Expected UI Behavior:**
1. ✅ WeeklyBonusBanner always renders (not conditionally hidden)
2. ✅ GTA+ exclusive bonuses show with **locked state**:
   - Grayscale filter applied
   - 60% opacity
   - Lock icon (🔒) in top-right corner
   - "GTA+ Required" label at bottom of tile
3. ✅ Global bonuses render normally (full color, no lock)

**Expected Logic Behavior:**
1. ✅ GTA+ multipliers do NOT apply to payout calculations for non-subscribers
2. ✅ `getWeeklyBonuses({ hasGTAPlus: false, includeGTAPlus: true })` returns bonuses with `locked: true`
3. ✅ GTA+ bonuses isolated in `WEEKLY_EVENTS.gtaPlus.monthlyBonuses` array

**How to Test:**
```bash
npm run dev
# 1. Navigate to Assessment Form
# 2. UNCHECK "GTA+ Subscriber" (or leave it unchecked)
# 3. Observe WeeklyBonusBanner at top of form
# 4. Verify locked tiles have grayscale + opacity + lock icon
# 5. CHECK "GTA+ Subscriber"
# 6. Verify tiles become full color with no lock icon
```

**Pass Criteria:**
- [ ] WeeklyBonusBanner renders for both GTA+ and non-GTA+ users
- [ ] Locked tiles have grayscale CSS filter
- [ ] Locked tiles have opacity: 0.6 (60%)
- [ ] Lock icon from lucide-react appears in top-right
- [ ] "GTA+ Required" text appears at bottom of locked tiles
- [ ] Global bonuses never show locked state
- [ ] Toggling hasGTAPlus checkbox immediately updates locked state

---

### Test Case 1: Event-Aware Recommendations ✅
**The Original Issue - This is what we fixed**

**Setup:**
- Rank: 33
- Cash: $2,100,000
- Strength: 1/5 bars (20%)
- Flying: 2/5 bars (40%)
- Has GTA+: Yes
- Has Auto Shop: No
- Has Kosatka: No

**Expected Results:**
1. ✅ Action plan shows "⚡ URGENT: AUTO SHOP 2X MONTHLY BENEFIT (through Feb 4)"
2. ✅ Shows "BUY NOW" badge (green)
3. ✅ Income display shows `$600k/hr` for Auto Shop (not $300k)
4. ✅ Shows cost: `$850k` (GTA+ discount)
5. ✅ Shows blocker: "🚨 Fix Strength First (Critical)"
6. ✅ Blocker explains: "Strength 20% - need 60% for Auto Shop contracts"

**How to Test:**
```bash
npm run dev
# 1. Fill form with above stats
# 2. Check "GTA+ Subscriber"
# 3. Click "Run Assessment"
# 4. Navigate to "Priority Action Plan"
# 5. Verify urgent action appears first
# 6. Verify blocker appears second
```

**Pass Criteria:**
- [ ] Urgent action has yellow gradient background
- [ ] Animated ⚡ icon visible
- [ ] "BUY NOW" badge shows
- [ ] Cost shows $850k (not $1.8M)
- [ ] Blocker action appears before Auto Shop recommendation
- [ ] Income calculation shows $600k/hr

---

### Test Case 2: Stat Blocker Detection ✅

**Setup:**
- Has Auto Shop: Yes
- Strength: 1/5 bars (20%)
- Auto Shop 2X event: Active

**Expected Results:**
- ✅ Auto Shop NOT recommended in top 3 actions
- ✅ Shows: "🚨 BLOCKER: Fix Strength First (Critical)"
- ✅ Explains: "You'll take +40% damage and deal -40% melee damage"
- ✅ Shows time estimate: "40 minutes (Pier Pressure mission)"

**How to Test:**
```bash
# 1. Fill form with Auto Shop owned, Strength 1/5
# 2. Run assessment
# 3. Check action plan
```

**Pass Criteria:**
- [ ] Blocker appears before any Auto Shop grinding recommendations
- [ ] Blocker has red badge and border
- [ ] Auto Shop grinding is NOT in top 3 actions
- [ ] Clear explanation of why Strength blocks Auto Shop

---

### Test Case 3: Capital Phase Detection ✅

**Setup A: Survival Phase**
- Cash: $100,000
- No major assets

**Expected Results:**
- ✅ Phase: SURVIVAL
- ✅ Recommendations prioritize grinding for income
- ✅ No "BUY NOW" recommendations
- ✅ Shows "GRIND NOW" if event active

**Setup B: Optimization Phase**
- Cash: $2,500,000
- No Kosatka

**Expected Results:**
- ✅ Phase: OPTIMIZATION
- ✅ Shows "BUY NOW" for Kosatka ($2.2M)
- ✅ Prioritizes purchases over grinding

**How to Test:**
```bash
# Test A: Set cash to $100k, run assessment
# Test B: Set cash to $2.5M, run assessment
# Compare action plans
```

**Pass Criteria:**
- [ ] Survival phase shows grinding priorities
- [ ] Optimization phase shows purchase priorities
- [ ] Capital amount affects recommendation order

---

### Test Case 4: Event Expiry Countdown ✅

**Setup:**
- Current date: Jan 13, 2026
- Event ends: Jan 14, 2026 (tomorrow)
- Auto Shop 2X: Active

**Expected Results:**
- ✅ Shows "⚡ URGENT: 1 day left" (or "expires tomorrow")
- ✅ Higher visual prominence (more urgent)
- ✅ Clear expiry messaging

**How to Test:**
```bash
# Temporarily change weeklyEvents.js validUntil to tomorrow
# Run assessment
# Check action plan urgency
```

**Pass Criteria:**
- [ ] Days remaining is accurate
- [ ] Visual prominence increases as expiry approaches
- [ ] Expiry date is clearly displayed

---

### Test Case 5: No Active Events ✅

**Setup:**
- Change `weeklyEvents.js` validUntil to past date (e.g., '2026-01-01')

**Expected Results:**
- ✅ No "⚡ URGENT" badges
- ✅ Income shows normal rates ($300k/hr for Auto Shop)
- ✅ Recommendations revert to standard priority
- ✅ No event expiry warnings

**How to Test:**
```bash
# 1. Edit src/config/weeklyEvents.js
# 2. Set validUntil: '2026-01-01'
# 3. Run assessment
# 4. Verify no urgent badges
```

**Pass Criteria:**
- [ ] No urgent actions appear
- [ ] Income rates are standard (no multipliers)
- [ ] Action plan uses normal priority order

---

## 🔍 Edge Cases

### Edge Case 1: Event Expired Yesterday
```javascript
// In weeklyEvents.js
validUntil: '2026-01-09' // (today is Jan 10)
```

**Expected:** Event multiplier NOT applied, normal rates shown

---

### Edge Case 2: Multiple Events Active
```javascript
bonuses: [
  { activity: 'Auto Shop Contracts', multiplier: '2X' },
  { activity: 'Cayo Perico', multiplier: '1.5X' }
]
```

**Expected:** 
- Compares both incomes
- Recommends highest income source
- Shows both events in activeEvents array

---

### Edge Case 3: Player Has $0 Cash + Event Active
```javascript
liquidCash: 0
hasAutoShop: false
eventActive: true
```

**Expected:**
- Does NOT say "BUY NOW"
- Says "GRIND NOW" or "GRIND FOR AUTO SHOP"
- Shows hours needed to afford purchase

---

### Edge Case 4: Perfect Stats
```javascript
strength: 5/5 (100%)
flying: 5/5 (100%)
shooting: 5/5 (100%)
```

**Expected:**
- No blocker warnings
- No stat prerequisite messages
- Actions proceed normally

---

### Edge Case 5: Event Active But Player Already Owns
```javascript
hasAutoShop: true
eventActive: true
```

**Expected:**
- Shows "GRIND AUTO SHOP NOW (2X active)"
- Emphasizes time-limited opportunity
- Shows boosted income rate

---

## 📋 Quick Test Checklist

### Form Validation
- [ ] Invalid rank shows error (e.g., 9000)
- [ ] Negative cash shows error
- [ ] Errors clear when fixed
- [ ] All numeric fields validate

### Loading States
- [ ] Progress bar animates
- [ ] Steps update every 400ms
- [ ] Percentage increases smoothly
- [ ] Loading completes at 100%

### Empty States
- [ ] Progress chart shows empty state (< 2 assessments)
- [ ] Empty state has icon, title, description
- [ ] Call-to-action is clear

### Toast Notifications
- [ ] CSV export shows success toast
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Can manually close toast
- [ ] Multiple toasts stack correctly

### Meta Awareness
- [ ] Event multipliers applied correctly
- [ ] Urgent actions have yellow badge
- [ ] Blocker actions have red badge
- [ ] Capital phase affects recommendations
- [ ] Stat prerequisites block activities

---

## 🐛 Common Issues & Fixes

### Issue: "Event shows as expired when it shouldn't"
**Fix:** Check timezone handling in `dynamicIncome.js`
```javascript
// Should use Date.now() and .getTime()
const now = Date.now();
const eventEnd = new Date(WEEKLY_EVENTS.meta.validUntil).getTime();
```

### Issue: "Auto Shop shows $300k/hr instead of $600k/hr"
**Fix:** Check GTA+ monthly benefit detection
```javascript
// Should check monthly benefit separately from weekly events
if (formData.hasGTAPlus) {
  const monthlyEnd = new Date('2026-02-05T09:00:00Z').getTime();
  if (Date.now() < monthlyEnd) {
    multiplier = 2.0; // Monthly benefit
  }
}
```

### Issue: "Blocker doesn't appear"
**Fix:** Check stat prerequisite validation
```javascript
// Should check strength before recommending Auto Shop
if (strength < 60 && autoShopIncome > 0) {
  // Add blocker
}
```

---

## 📊 Test Results Template

```text
Date: ___________
Tester: ___________

Test Case 1: Event-Aware ✅ / ❌
Test Case 2: Stat Blocker ✅ / ❌
Test Case 3: Capital Phase ✅ / ❌
Test Case 4: Event Expiry ✅ / ❌
Test Case 5: No Active Events ✅ / ❌

Edge Cases: ✅ / ❌
Form Validation: ✅ / ❌
Loading States: ✅ / ❌
Empty States: ✅ / ❌
Toast Notifications: ✅ / ❌

Issues Found:
1. ___________
2. ___________

Overall: PASS / FAIL
```

---

## 🚀 Ready to Deploy Checklist

- [ ] All 5 test cases pass
- [ ] Edge cases handled correctly
- [ ] No console errors
- [ ] No linting errors
- [ ] Form validation works
- [ ] Loading states work
- [ ] Empty states display correctly
- [ ] Toast notifications work
- [ ] Event multipliers apply correctly
- [ ] Urgent actions display correctly
- [ ] Stat blockers display correctly
- [ ] Capital phase detection works
- [ ] Mobile responsive
- [ ] Production build succeeds

**Status:** Ready for deployment ✅
