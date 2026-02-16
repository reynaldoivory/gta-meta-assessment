// src/utils/bottleneckStats.ts
// Tier 2: Context-aware stat checks (strength, flying, rank).

import type { Bottleneck, DetectionParams, ActiveEvent, DetectionFormData } from './bottleneckTypes';
import { MODEL_CONFIG } from './modelConfig.js';
import { WEEKLY_EVENTS, formatExpiry } from '../config/weeklyEvents.js';

// Pre-compute config threshold (avoids repeated ?./??  in every function)
const CRITICAL_STAT_THRESHOLD: number = MODEL_CONFIG.thresholds?.stats?.critical ?? 60;

// ============================================
// Strength Gap Helpers
// ============================================

/** Rough net-worth estimate based on owned assets. */
const estimatePlayerNetWorth = (params: DetectionParams, hasMansion: boolean): number => {
  const assetValues: [boolean, number][] = [
    [params.hasKosatka, 2200000],
    [params.hasSparrow, 1815000],
    [params.hasAgency, 2010000],
    [params.hasAcidLab, 750000],
    [params.hasAutoShop, 1670000],
    [params.hasNightclub, 1000000],
    [params.hasBunker, 1165000],
    [hasMansion, 11500000],
  ];
  return params.liquidCash + assetValues.reduce((sum, [owned, val]) => sum + (owned ? val : 0), 0);
};

/** Resolve strength training recommendation text. */
const resolveStrengthSolution = (hasMansion: boolean, estimatedNetWorth: number): string => {
  if (hasMansion) {
    return 'Use Mansion Gym (20 mins) - FASTEST METHOD: Bench press or sparring minigame in your Mansion gym';
  }
  if (estimatedNetWorth > 15000000) {
    return 'Buy Mansion ($11.5M+) OR use Pier Pressure (free)';
  }
  return 'Launch "Pier Pressure" mission \u2192 Punch NPCs (20 mins, free)';
};

const detectStrengthGap = (params: DetectionParams, formData: DetectionFormData): Bottleneck | null => {
  const { strength, rank } = params;
  if (strength >= CRITICAL_STAT_THRESHOLD) return null;

  const hasMansion = formData.hasMansion || false;
  const estimatedNetWorth = estimatePlayerNetWorth(params, hasMansion);
  const isUnderRank100 = rank < 100;

  return {
    id: 'strength_low',
    label: 'Strength Critical for Survival',
    critical: true,
    impact: isUnderRank100 ? 'high' : 'medium',
    solution: resolveStrengthSolution(hasMansion, estimatedNetWorth),
    actionType: 'mission',
    detail: 'Strength provides damage resistance in all combat situations (not just melee). Low strength means you take significantly more damage from bullets, explosions, and falls. Critical for surviving Auto Shop contracts, heists, and PVP.',
    timeHours: 0.33,
  };
};

// ============================================
// Flying Gap Helpers
// ============================================

/** Determine flying skill impact level based on player context. */
const resolveFlyingImpact = (
  hasTimeLimitedEvent: boolean,
  hasSparrow: boolean,
  hasFastTravel: boolean,
): 'high' | 'medium' | 'low' => {
  if (hasTimeLimitedEvent) return 'medium';
  if (hasSparrow) return 'high';
  if (hasFastTravel) return 'medium';
  return 'low';
};

/** Generate flying skill detail text. */
const resolveFlyingDetail = (hasSparrowOrRaiju: boolean, hasFastTravel: boolean): string => {
  if (hasSparrowOrRaiju) {
    return 'Low flying skill causes severe turbulence when using Sparrow/Raiju. This slows down heist preps and freeroam missions (adds 5-10 mins per prep). Flight School fixes this.';
  }
  if (hasFastTravel) {
    return 'Flying skill affects vehicle stability. Low skill = more turbulence = slower prep times.';
  }
  return 'No fast travel vehicle. Turbulence causes crashes and wastes time.';
};

const detectFlyingGap = (params: DetectionParams, activeEvents: ActiveEvent[]): Bottleneck | null => {
  const { flying, hasSparrow, hasRaiju, hasOppressor } = params;
  if (flying >= CRITICAL_STAT_THRESHOLD) return null;

  const hasFastTravel = hasSparrow || hasRaiju || hasOppressor;
  const hasSparrowOrRaiju = hasSparrow || hasRaiju;
  const flyingCritical = hasSparrowOrRaiju && flying < CRITICAL_STAT_THRESHOLD;
  const hasTimeLimitedEvent = activeEvents.some(e => e.multiplier >= 2 && e.tier <= 2);

  return {
    id: 'flying_low',
    label: 'Flying Skill Low',
    critical: hasTimeLimitedEvent ? false : flyingCritical,
    impact: resolveFlyingImpact(hasTimeLimitedEvent, hasSparrow, hasFastTravel),
    solution: hasFastTravel
      ? 'Flight School at LSIA (45 mins) - Reduces turbulence during heist prep flights'
      : 'Buy Sparrow ($1.8M) OR do Flight School',
    actionType: hasFastTravel ? 'mission' : 'property_purchase',
    detail: resolveFlyingDetail(hasSparrowOrRaiju, hasFastTravel),
    timeHours: hasFastTravel ? 0.75 : 0,
  };
};

// ============================================
// Rank Gap
// ============================================

/** Build rank bottleneck using Paper Trail event data when available. */
const buildRankBottleneckForPaperTrail = (
  rank: number,
  paperTrail4X: ActiveEvent | undefined,
  paperTrail2X: ActiveEvent | undefined,
): { solution: string; timeHours: number; savingsPerHour: number } => {
  if (paperTrail4X) {
    return {
      solution: 'Farm Operation Paper Trail (4X RP & 4X GTA$ for GTA+ this week) - Magic Bullet for Rank + Good money variety',
      timeHours: 1.5,
      savingsPerHour: 400000,
    };
  }
  if (paperTrail2X) {
    const monthlyBonuses = WEEKLY_EVENTS.gtaPlus?.monthlyBonuses;
    const expiry = monthlyBonuses?.[0]?.expires || WEEKLY_EVENTS.meta.validUntil;
    return {
      solution: `Farm Operation Paper Trail (2X RP through ${formatExpiry(expiry)})`,
      timeHours: 2,
      savingsPerHour: 200000,
    };
  }
  return {
    solution: `Run missions & heists (Cayo, Auto Shop, Security Contracts for RP + $). Rank ${rank} needs active grinding.`,
    timeHours: 2.5,
    savingsPerHour: 0,
  };
};

const detectRankGap = (params: DetectionParams, activeEvents: ActiveEvent[]): Bottleneck[] => {
  const { rank } = params;
  const paperTrail4XEvent = activeEvents.find(e => e.name === 'paperTrail4X');
  const paperTrail2XEvent = activeEvents.find(e => e.name === 'paperTrail2X');

  if (rank < 50) {
    const config = buildRankBottleneckForPaperTrail(rank, paperTrail4XEvent, paperTrail2XEvent);
    return [{
      id: 'rank_low',
      label: 'Rank Under 50 (Max Health & Armor Locked)',
      critical: true,
      urgent: !!paperTrail4XEvent,
      impact: 'high',
      solution: config.solution,
      actionType: 'mission',
      detail: `Rank ${rank} = ~${Math.floor(50 + (rank / 2))}% max health. You die instantly in Auto Shop raids. Cannot carry full body armor. Makes combat-heavy content much harder.`,
      timeHours: config.timeHours,
      savingsPerHour: config.savingsPerHour,
    }];
  }

  if (rank < 100 && paperTrail4XEvent) {
    return [{
      id: 'rank_medium',
      label: 'Rank Under 100 (GTA+ Paper Trail 4X Opportunity)',
      critical: false,
      urgent: true,
      impact: 'medium',
      solution: 'Farm Operation Paper Trail (4X RP & GTA$ for GTA+ this week) - Fastest way to Rank 100+',
      actionType: 'mission',
      detail: `Rank ${rank}. Operation Paper Trail is paying 4X RP & 4X GTA$ this week for GTA+ members. Good variety option if you get bored of Auto Shop grinding. This is the fastest way to unlock Rank 100+ benefits.`,
      timeHours: 1.5,
      savingsPerHour: 400000,
    }];
  }

  return [];
};

// ============================================
// Main Export
// ============================================

/**
 * Tier 2: Detect stat-related bottlenecks (strength, flying, rank).
 */
export const detectStatBottlenecks = (
  params: DetectionParams,
  activeEvents: ActiveEvent[],
  formData: DetectionFormData,
): Bottleneck[] => {
  const strengthGap = detectStrengthGap(params, formData);
  const flyingGap = detectFlyingGap(params, activeEvents);
  const rankGaps = detectRankGap(params, activeEvents);
  return [strengthGap, flyingGap, ...rankGaps].filter((b): b is Bottleneck => b !== null);
};
