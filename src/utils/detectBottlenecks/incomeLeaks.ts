// src/utils/detectBottlenecks/incomeLeaks.ts
// TIER 1: INCOME LEAKS (Costing you money every hour)

import { WEEKLY_EVENTS, formatExpiry, getExpiryLabel } from '../../config/weeklyEvents.js';
import type {
  DetectionParams,
  ActiveEvent,
  DetectionFormData,
  Bottleneck,
  IncomeLeakResult,
  GtaPlusMonthlyBonus,
} from '../bottleneckTypes';

/**
 * Detect income leaks from active events (TIER 1)
 */
export const detectIncomeLeaks = (
  params: DetectionParams,
  now: number,
  activeEvents: ActiveEvent[],
): IncomeLeakResult => {
  const { rank, strength, playMode } = params;
  const isSoloPlayer = playMode === 'invite' || playMode === 'solo';
  const bottlenecks: Bottleneck[] = [];

  // Build event lookups dynamically from whatever events are active this week
  const nightclubDiscountEvent = activeEvents.find(
    (e: ActiveEvent) => e.category === 'discount' && e.name.toLowerCase().includes('nightclub'),
  );

  // Helper to process a single event
  function processEvent(event: ActiveEvent): void {
    // Skip discount events (handled separately below) and GTA+ monthly events
    if (event.category === 'discount' || event.category === 'gtaplus') return;

    const expiryIso = event.expiryTimestamp
      ? new Date(event.expiryTimestamp).toISOString()
      : WEEKLY_EVENTS.meta.validUntil;

    // Play-mode filtering
    if (isSoloPlayer && event.requiresMultiplayer) {
      bottlenecks.push({
        id: `weekly_event_${event.name}`,
        label: `\u26A0\uFE0F ${event.label || event.name} (Requires Other Players)`,
        critical: false,
        urgent: false,
        impact: 'low',
        solution: event.soloNote || `This bonus requires other players and is not effective in ${playMode === 'invite' ? 'Invite Only' : 'Solo'} sessions.`,
        actionType: 'freemode',
        detail: `${getExpiryLabel(expiryIso)}. ${event.multiplier}X bonus active but requires multiplayer. Consider briefly joining a friend's org to earn the one-time challenge reward, then return to solo.`,
        timeHours: 0,
        savingsPerHour: 0,
        expiresAt: event.expiryTimestamp,
        eventTier: 3, // Demoted tier
        hoursLeft: event.hoursLeft,
        daysLeft: event.daysLeft,
        filteredByPlayMode: true,
      });
      return;
    }

    // Impact assessment
    let impactLevel: 'high' | 'medium' | 'low' = 'medium';
    if (
      event.highValue ||
      event.multiplier >= 3 ||
      event.hourlyRate >= 300000
    ) {
      impactLevel = 'high';
    }

    // Solution text
    let solutionText = `Take advantage of ${event.label || event.name} before it expires.`;
    if (isSoloPlayer && event.soloTip) {
      solutionText = event.soloTip;
    } else if (event.hourlyRate > 0) {
      solutionText = `Take advantage of ${event.label || event.name} (~$${Math.round(event.hourlyRate / 1000)}k/hr) before it expires.`;
    }

    // Detail text
    const hourlyRateNote = event.hourlyRate > 0
      ? ` Est. ~$${Math.round(event.hourlyRate / 1000)}k/hr.`
      : '';
    let multiplierNote = `${event.multiplier}X bonus active.`;
    if (event.multiplier > 1) {
      multiplierNote = `${event.multiplier}X bonus active \u2014 prioritize this over normal activities.`;
    } else if (event.highValue) {
      multiplierNote = 'High-value opportunity \u2014 prioritize this week.';
    }

    bottlenecks.push({
      id: `weekly_event_${event.name}`,
      label: `\u26A1 ${event.label || event.name} THIS WEEK`,
      critical: event.critical,
      urgent: event.urgent,
      impact: impactLevel,
      solution: solutionText,
      actionType: ({ mission: 'mission', passive: 'passive' } as Record<string, string>)[event.category] || 'freemode',
      detail: `${getExpiryLabel(expiryIso)}. ${multiplierNote}${hourlyRateNote}`,
      timeHours: 0,
      savingsPerHour: event.hourlyRate || 0,
      expiresAt: event.expiryTimestamp,
      eventTier: event.tier,
      hoursLeft: event.hoursLeft,
      daysLeft: event.daysLeft,
    });
  }

  // Process all events
  for (const event of activeEvents) {
    processEvent(event);
  }

  // Combat Prep Reminder for Rank < 100 during combat-heavy events
  // Logic aligned with buildSmartActionPlan for consistency
  // Thresholds: strength < 60% = needs full prep, strength 60-99% = just snacks/armor
  const hasCombatEvent = activeEvents.some((e: ActiveEvent) => e.category === 'mission' || e.category === 'adversary');
  if (rank < 100 && hasCombatEvent && strength < 100) {
    const maxHealthPercent = Math.floor(50 + (rank / 2)); // Approximate health calculation

    if (strength < 60) {
      // Strength is critically low - needs full prep (max strength + snacks/armor)
      bottlenecks.push({
        id: 'combat_prep_auto_shop',
        label: '\uD83D\uDCAA Prep for Auto Shop Combat (Low Strength)',
        critical: false,
        urgent: true,
        impact: 'high',
        solution: '1. Max Strength (30 min) - reduces damage taken. 2. Stock 10+ Snacks + 10 Super Heavy Armor. 3. Visit Agency armory for free snacks if owned.',
        actionType: 'preparation',
        detail: `Rank ${rank} = ~${maxHealthPercent}% max health. Strength is ${strength}% (low). Before grinding Auto Shop finales: Max Strength (30 min), stock snacks/armor. Without prep: high failure rate on Union Depository/Lost MC finales.`,
        timeHours: 0.5, // One-time 30-40 min investment
        eventTier: 1,
      });
    } else if (rank < 80) {
      // Strength is OK (60-99%) but rank is low - just need snacks/armor
      bottlenecks.push({
        id: 'combat_prep_auto_shop',
        label: '\uD83D\uDEE1\uFE0F Stock Snacks & Armor for Auto Shop',
        critical: false,
        urgent: false,
        impact: 'medium',
        solution: 'Stock 10+ Snacks + 10 Super Heavy Armor. Visit Agency armory for free snacks if owned.',
        actionType: 'preparation',
        detail: `Rank ${rank} = ~${maxHealthPercent}% max health. Strength is good (${strength}%), but you still take more damage at lower ranks. Stock snacks/armor before grinding.`,
        timeHours: 0.15, // 10 mins to stock up
        eventTier: 2,
      });
    }
    // Rank 80+ with strength >= 60 = no prep needed, skip bottleneck
  }

  // --- GTA+ Monthly Bonuses (e.g., 2X Security Contracts) ---
  const { hasGTAPlus, hasAgency } = params;
  if (hasGTAPlus && WEEKLY_EVENTS.gtaPlus?.monthlyBonuses) {
    const now_ts = Date.now();
    (WEEKLY_EVENTS.gtaPlus.monthlyBonuses as GtaPlusMonthlyBonus[]).forEach((bonus: GtaPlusMonthlyBonus) => {
      const expiryDate = new Date(bonus.expires);
      if (now_ts >= expiryDate.getTime()) return;

      // DEDUP: If a weekly bonus for the same activity exists, upgrade it instead of adding a duplicate.
      // e.g., 3X Lunar Stunt Races (weekly) vs 6X Lunar Stunt Races (GTA+) — show only 6X.
      const matchingWeeklyIdx = bottlenecks.findIndex((b: Bottleneck) =>
        b.id === `weekly_event_${bonus.activity}` ||
        (b.label && bonus.label && b.label.toLowerCase().includes(bonus.activity.replace(/_/g, ' ')))
      );
      if (matchingWeeklyIdx !== -1) {
        // GTA+ multiplier is higher — upgrade the existing bottleneck in-place
        const existing = bottlenecks[matchingWeeklyIdx];
        if (bonus.multiplier > (existing.multiplier || 0)) {
          existing.label = `\uD83D\uDC8E ${bonus.label}`;
          existing.detail = `GTA+ enhanced (${bonus.multiplier}X vs base). Expires ${formatExpiry(bonus.expires)} (${Math.ceil((expiryDate.getTime() - now_ts) / (1000 * 60 * 60 * 24))} days left).`;
          existing.savingsPerHour = bonus.estimatedHourlyRate || existing.savingsPerHour;
          existing.impact = (bonus.estimatedHourlyRate ?? 0) >= 200000 ? 'high' : existing.impact;
        }
        return; // Don't add a separate entry
      }

      // Skip if it exactly duplicates a weekly bonus already added
      const alreadyAdded = bottlenecks.some((b: Bottleneck) => b.id === `weekly_event_${bonus.activity}`);
      if (alreadyAdded) return;

      // Check asset prerequisites (e.g., security contracts need Agency)
      if (bonus.activity === 'security_contracts' && !hasAgency) return;

      const daysLeft = Math.ceil((expiryDate.getTime() - now_ts) / (1000 * 60 * 60 * 24));
      const solutionText = (isSoloPlayer && bonus.soloTip) ? bonus.soloTip : `Use ${bonus.label} before it expires.`;

      bottlenecks.push({
        id: `gtaplus_monthly_${bonus.activity}`,
        label: `\uD83D\uDC8E ${bonus.label}`,
        critical: false,
        urgent: false,
        impact: (bonus.estimatedHourlyRate ?? 0) >= 200000 ? 'high' : 'medium',
        solution: solutionText,
        actionType: 'mission',
        detail: `GTA+ monthly perk. Expires ${formatExpiry(bonus.expires)} (${daysLeft} days left). Est. ~$${Math.round((bonus.estimatedHourlyRate || 0) / 1000)}k/hr.`,
        timeHours: 0,
        savingsPerHour: bonus.estimatedHourlyRate || 0,
        expiresAt: expiryDate.getTime(),
        eventTier: 2,
        hoursLeft: daysLeft * 24,
        daysLeft,
      });
    });
  }

  return { bottlenecks, nightclubDiscountEvent };
};
