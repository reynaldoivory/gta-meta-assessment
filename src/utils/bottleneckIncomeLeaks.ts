// src/utils/bottleneckIncomeLeaks.ts
// Tier 1: Income leak detection — weekly events, combat prep, GTA+ bonuses.

import type {
  Bottleneck, DetectionParams, ActiveEvent,
  GtaPlusMonthlyBonus, IncomeLeakResult,
} from './bottleneckTypes';
import { WEEKLY_EVENTS, formatExpiry, getExpiryLabel } from '../config/weeklyEvents.js';

// ============================================
// Weekly Event Helpers
// ============================================

/** Calculate impact level for an event. */
const resolveEventImpact = (event: ActiveEvent): 'high' | 'medium' => {
  if (event.highValue || event.multiplier >= 3 || event.hourlyRate >= 300000) {
    return 'high';
  }
  return 'medium';
};

/** Build a demoted bottleneck for multiplayer events when player is solo. */
const buildSoloWarningBottleneck = (
  event: ActiveEvent,
  playMode: string,
  expiryIso: string,
): Bottleneck => {
  const modeLabel = playMode === 'invite' ? 'Invite Only' : 'Solo';
  const eventName = event.label || event.name;

  return {
    id: `weekly_event_${event.name}`,
    label: `\u26A0\uFE0F ${eventName} (Requires Other Players)`,
    critical: false,
    urgent: false,
    impact: 'low',
    solution: event.soloNote || `This bonus requires other players and is not effective in ${modeLabel} sessions.`,
    actionType: 'freemode',
    detail: `${getExpiryLabel(expiryIso)}. ${event.multiplier}X bonus active but requires multiplayer. Consider briefly joining a friend\u2019s org to earn the one-time challenge reward, then return to solo.`,
    timeHours: 0,
    savingsPerHour: 0,
    expiresAt: event.expiryTimestamp,
    eventTier: 3,
    hoursLeft: event.hoursLeft,
    daysLeft: event.daysLeft,
    filteredByPlayMode: true,
  };
};

/** Resolve solution text based on player mode and event data. */
const resolveSolutionText = (event: ActiveEvent, isSoloPlayer: boolean): string => {
  if (isSoloPlayer && event.soloTip) return event.soloTip;
  const eventName = event.label || event.name;
  if (event.hourlyRate > 0) {
    return `Take advantage of ${eventName} (~$${Math.round(event.hourlyRate / 1000)}k/hr) before it expires.`;
  }
  return `Take advantage of ${eventName} before it expires.`;
};

/** Resolve multiplier note for event detail text. */
const resolveMultiplierNote = (event: ActiveEvent): string => {
  if (event.multiplier > 1) {
    return `${event.multiplier}X bonus active \u2014 prioritize this over normal activities.`;
  }
  if (event.highValue) return 'High-value opportunity \u2014 prioritize this week.';
  return `${event.multiplier}X bonus active.`;
};

/** Build a bottleneck entry for a single weekly bonus event. */
const buildWeeklyEventBottleneck = (
  event: ActiveEvent,
  isSoloPlayer: boolean,
  playMode: string,
): Bottleneck | null => {
  if (event.category === 'discount' || event.category === 'gtaplus') return null;

  const expiryIso = event.expiryTimestamp
    ? new Date(event.expiryTimestamp).toISOString()
    : WEEKLY_EVENTS.meta.validUntil;

  if (isSoloPlayer && event.requiresMultiplayer) {
    return buildSoloWarningBottleneck(event, playMode, expiryIso);
  }

  const impactLevel = resolveEventImpact(event);
  const solutionText = resolveSolutionText(event, isSoloPlayer);
  const multiplierNote = resolveMultiplierNote(event);
  const hourlyRateNote = event.hourlyRate > 0
    ? ` Est. ~$${Math.round(event.hourlyRate / 1000)}k/hr.`
    : '';
  const eventName = event.label || event.name;
  const actionCategory = ({ mission: 'mission', passive: 'passive' } as Record<string, string>)[event.category] || 'freemode';

  return {
    id: `weekly_event_${event.name}`,
    label: `\u26A1 ${eventName} THIS WEEK`,
    critical: event.critical,
    urgent: event.urgent,
    impact: impactLevel,
    solution: solutionText,
    actionType: actionCategory,
    detail: `${getExpiryLabel(expiryIso)}. ${multiplierNote}${hourlyRateNote}`,
    timeHours: 0,
    savingsPerHour: event.hourlyRate || 0,
    expiresAt: event.expiryTimestamp,
    eventTier: event.tier,
    hoursLeft: event.hoursLeft,
    daysLeft: event.daysLeft,
  };
};

// ============================================
// Combat Preparation
// ============================================

/** Detect combat preparation needs for low-rank players during combat events. */
const detectCombatPrep = (params: DetectionParams, activeEvents: ActiveEvent[]): Bottleneck[] => {
  const { rank, strength } = params;
  const hasCombatEvent = activeEvents.some(e => e.category === 'mission' || e.category === 'adversary');
  if (rank >= 100 || !hasCombatEvent || strength >= 100) return [];

  const maxHealthPercent = Math.floor(50 + (rank / 2));

  if (strength < 60) {
    return [{
      id: 'combat_prep_auto_shop',
      label: '\uD83D\uDCAA Prep for Auto Shop Combat (Low Strength)',
      critical: false,
      urgent: true,
      impact: 'high',
      solution: '1. Max Strength (30 min) - reduces damage taken. 2. Stock 10+ Snacks + 10 Super Heavy Armor. 3. Visit Agency armory for free snacks if owned.',
      actionType: 'preparation',
      detail: `Rank ${rank} = ~${maxHealthPercent}% max health. Strength is ${strength}% (low). Before grinding Auto Shop finales: Max Strength (30 min), stock snacks/armor. Without prep: high failure rate on Union Depository/Lost MC finales.`,
      timeHours: 0.5,
      eventTier: 1,
    }];
  }

  if (rank < 80) {
    return [{
      id: 'combat_prep_auto_shop',
      label: '\uD83D\uDEE1\uFE0F Stock Snacks & Armor for Auto Shop',
      critical: false,
      urgent: false,
      impact: 'medium',
      solution: 'Stock 10+ Snacks + 10 Super Heavy Armor. Visit Agency armory for free snacks if owned.',
      actionType: 'preparation',
      detail: `Rank ${rank} = ~${maxHealthPercent}% max health. Strength is good (${strength}%), but you still take more damage at lower ranks. Stock snacks/armor before grinding.`,
      timeHours: 0.15,
      eventTier: 2,
    }];
  }

  return [];
};

// ============================================
// GTA+ Monthly Bonuses
// ============================================

/** Upgrade an existing weekly bottleneck with GTA+ enhanced multiplier. */
const upgradeExistingBonusEntry = (
  existing: Bottleneck,
  bonus: GtaPlusMonthlyBonus,
  expiryDate: Date,
  nowTs: number,
): void => {
  if (bonus.multiplier > ((existing as Record<string, unknown>).multiplier as number || 0)) {
    existing.label = `\uD83D\uDC8E ${bonus.label}`;
    existing.detail = `GTA+ enhanced (${bonus.multiplier}X vs base). Expires ${formatExpiry(bonus.expires)} (${Math.ceil((expiryDate.getTime() - nowTs) / (1000 * 60 * 60 * 24))} days left).`;
    existing.savingsPerHour = bonus.estimatedHourlyRate || existing.savingsPerHour;
    const threshold = 200000;
    existing.impact = bonus.estimatedHourlyRate && bonus.estimatedHourlyRate >= threshold ? 'high' : existing.impact;
  }
};

/** Find index of existing weekly bottleneck matching a GTA+ bonus. */
const findMatchingWeeklyBonusIndex = (
  bottlenecks: Bottleneck[],
  bonus: GtaPlusMonthlyBonus,
): number => {
  const activityKey = bonus.activity.split('_').join(' ');
  return bottlenecks.findIndex(b =>
    b.id === `weekly_event_${bonus.activity}` ||
    (b.label && bonus.label && b.label.toLowerCase().includes(activityKey))
  );
};

/** Build a GTA+ monthly bonus bottleneck. */
const buildGtaPlusMonthlyBottleneck = (
  bonus: GtaPlusMonthlyBonus,
  isSoloPlayer: boolean,
  expiryDate: Date,
  nowTs: number,
): Bottleneck => {
  const daysLeft = Math.ceil((expiryDate.getTime() - nowTs) / (1000 * 60 * 60 * 24));
  const solutionText = (isSoloPlayer && bonus.soloTip)
    ? bonus.soloTip
    : `Use ${bonus.label} before it expires.`;
  const hourlyRate = bonus.estimatedHourlyRate || 0;
  const threshold = 200000;
  const impact = bonus.estimatedHourlyRate && bonus.estimatedHourlyRate >= threshold ? 'high' : 'medium';

  return {
    id: `gtaplus_monthly_${bonus.activity}`,
    label: `\uD83D\uDC8E ${bonus.label}`,
    critical: false,
    urgent: false,
    impact,
    solution: solutionText,
    actionType: 'mission',
    detail: `GTA+ monthly perk. Expires ${formatExpiry(bonus.expires)} (${daysLeft} days left). Est. ~$${Math.round(hourlyRate / 1000)}k/hr.`,
    timeHours: 0,
    savingsPerHour: hourlyRate,
    expiresAt: expiryDate.getTime(),
    eventTier: 2,
    hoursLeft: daysLeft * 24,
    daysLeft,
  };
};

/** Process GTA+ monthly bonuses and merge/add them into the bottleneck list. */
const processGtaPlusMonthlyBonuses = (
  params: DetectionParams,
  isSoloPlayer: boolean,
  bottlenecks: Bottleneck[],
): void => {
  const gtaPlusBonuses = WEEKLY_EVENTS.gtaPlus?.monthlyBonuses;
  if (!params.hasGTAPlus || !gtaPlusBonuses) return;

  const nowTs = Date.now();
  const bonuses = gtaPlusBonuses as GtaPlusMonthlyBonus[];

  for (const bonus of bonuses) {
    const expiryDate = new Date(bonus.expires);
    if (nowTs >= expiryDate.getTime()) continue;

    const matchingIdx = findMatchingWeeklyBonusIndex(bottlenecks, bonus);
    if (matchingIdx !== -1) {
      upgradeExistingBonusEntry(bottlenecks[matchingIdx], bonus, expiryDate, nowTs);
      continue;
    }

    if (bottlenecks.some(b => b.id === `weekly_event_${bonus.activity}`)) continue;
    if (bonus.activity === 'security_contracts' && !params.hasAgency) continue;

    bottlenecks.push(buildGtaPlusMonthlyBottleneck(bonus, isSoloPlayer, expiryDate, nowTs));
  }
};

// ============================================
// Main Export
// ============================================

/**
 * Tier 1: Detect income leaks — active weekly events, combat prep, GTA+ bonuses.
 */
export const detectIncomeLeaks = (
  params: DetectionParams,
  _now: number,
  activeEvents: ActiveEvent[],
): IncomeLeakResult => {
  const isSoloPlayer = params.playMode === 'invite' || params.playMode === 'solo';
  const nightclubDiscountEvent = activeEvents.find(
    e => e.category === 'discount' && e.name.toLowerCase().includes('nightclub'),
  );
  const bottlenecks: Bottleneck[] = [];

  for (const event of activeEvents) {
    const result = buildWeeklyEventBottleneck(event, isSoloPlayer, params.playMode);
    if (result) bottlenecks.push(result);
  }

  bottlenecks.push(...detectCombatPrep(params, activeEvents));
  processGtaPlusMonthlyBonuses(params, isSoloPlayer, bottlenecks);

  return { bottlenecks, nightclubDiscountEvent };
};
