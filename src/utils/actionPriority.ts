// src/utils/actionPriority.js
/**
 * PRIORITIZATION ALGORITHM
 * 1. Expiring events (urgent: true) - ALWAYS FIRST
 * 2. Critical blockers (critical: true + impact: high)
 * 3. High ROI fixes (savingsPerHour)
 * 4. Quick wins (timeHours < 1)
 * 5. Impact level
 */
export const prioritizeActions = (bottlenecks, _liquidCash, _incomePerHour) => {
  return [...bottlenecks].sort((a, b) => {
    // 1. URGENT (Expiring events - ALWAYS first, regardless of ROI)
    if (a.urgent && !b.urgent) return -1;
    if (!a.urgent && b.urgent) return 1;
    
    // If both urgent, prioritize by time remaining (shorter = higher priority)
    if (a.urgent && b.urgent) {
      const aExpires = a.expiresAt || Infinity;
      const bExpires = b.expiresAt || Infinity;
      return aExpires - bExpires;
    }

    // 2. CRITICAL BLOCKERS (Critical + High Impact)
    const aIsCriticalBlocker = a.critical && a.impact === 'high';
    const bIsCriticalBlocker = b.critical && b.impact === 'high';
    if (aIsCriticalBlocker && !bIsCriticalBlocker) return -1;
    if (!aIsCriticalBlocker && bIsCriticalBlocker) return 1;

    // 3. ROI (Fix income leaks first)
    const aSavings = a.savingsPerHour || 0;
    const bSavings = b.savingsPerHour || 0;
    if (aSavings !== bSavings) return bSavings - aSavings;

    // 4. TIME COST (Quick wins)
    if (a.timeHours !== b.timeHours) return a.timeHours - b.timeHours;

    // 5. IMPACT
    const impactScore = { high: 3, medium: 2, low: 1 };
    return (impactScore[b.impact] || 0) - (impactScore[a.impact] || 0);
  });
};
