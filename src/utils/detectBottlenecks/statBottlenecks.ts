// src/utils/detectBottlenecks/statBottlenecks.ts
// TIER 2: CONTEXT-AWARE STAT CHECKS

import { MODEL_CONFIG } from '../modelConfig.js';
import { WEEKLY_EVENTS, formatExpiry } from '../../config/weeklyEvents.js';
import type { DetectionParams, ActiveEvent, DetectionFormData, Bottleneck } from '../bottleneckTypes';

/**
 * Detect strength gap
 */
const detectStrengthGap = (params: DetectionParams, formData: DetectionFormData): Bottleneck | null => {
  const { strength, rank, liquidCash, hasKosatka, hasSparrow, hasAgency, hasAcidLab, hasAutoShop, hasNightclub, hasBunker } = params;
  const criticalStatThreshold = MODEL_CONFIG.thresholds?.stats?.critical ?? 60;
  if (strength >= criticalStatThreshold) return null;

  const hasMansion = formData.hasMansion || false;
  const estimatedNetWorth = liquidCash +
    (hasKosatka ? 2200000 : 0) + (hasSparrow ? 1815000 : 0) +
    (hasAgency ? 2010000 : 0) + (hasAcidLab ? 750000 : 0) +
    (hasAutoShop ? 1670000 : 0) + (hasNightclub ? 1000000 : 0) +
    (hasBunker ? 1165000 : 0) + (hasMansion ? 11500000 : 0);
  const isUnderRank100 = rank < 100;

  let strengthSolution: string;
  if (hasMansion) {
    strengthSolution = 'Use Mansion Gym (20 mins) - FASTEST METHOD: Bench press or sparring minigame in your Mansion gym';
  } else if (estimatedNetWorth > 15000000) {
    strengthSolution = 'Buy Mansion ($11.5M+) OR use Pier Pressure (free)';
  } else {
    strengthSolution = 'Launch "Pier Pressure" mission \u2192 Punch NPCs (20 mins, free)';
  }

  return {
    id: 'strength_low',
    label: 'Strength Critical for Survival',
    critical: true,
    impact: isUnderRank100 ? 'high' : 'medium',
    solution: strengthSolution,
    actionType: 'mission',
    detail: 'Strength provides damage resistance in all combat situations (not just melee). Low strength means you take significantly more damage from bullets, explosions, and falls. Critical for surviving Auto Shop contracts, heists, and PVP.',
    timeHours: 0.33,
  };
};

/**
 * Detect flying skill gap
 */
const detectFlyingGap = (params: DetectionParams, activeEvents: ActiveEvent[]): Bottleneck | null => {
  const { flying, hasSparrow, hasRaiju, hasOppressor } = params;
  const criticalStatThreshold = MODEL_CONFIG.thresholds?.stats?.critical ?? 60;
  if (flying >= criticalStatThreshold) return null;

  const hasFastTravel = hasSparrow || hasRaiju || hasOppressor;
  const hasSparrowOrRaiju = hasSparrow || hasRaiju;
  const flyingCritical = hasSparrowOrRaiju && flying < criticalStatThreshold;
  const hasTimeLimitedEvent = activeEvents.some((e: ActiveEvent) => e.multiplier >= 2 && e.tier <= 2);

  let flyingImpact: 'high' | 'medium' | 'low';
  if (hasTimeLimitedEvent) flyingImpact = 'medium';
  else if (hasSparrow) flyingImpact = 'high';
  else if (hasFastTravel) flyingImpact = 'medium';
  else flyingImpact = 'low';

  let flyingDetail: string;
  if (hasSparrowOrRaiju) {
    flyingDetail = 'Low flying skill causes severe turbulence when using Sparrow/Raiju. This slows down heist preps and freeroam missions (adds 5-10 mins per prep). Flight School fixes this.';
  } else if (hasFastTravel) {
    flyingDetail = 'Flying skill affects vehicle stability. Low skill = more turbulence = slower prep times.';
  } else {
    flyingDetail = 'No fast travel vehicle. Turbulence causes crashes and wastes time.';
  }

  return {
    id: 'flying_low',
    label: 'Flying Skill Low',
    critical: hasTimeLimitedEvent ? false : flyingCritical,
    impact: flyingImpact,
    solution: hasFastTravel
      ? 'Flight School at LSIA (45 mins) - Reduces turbulence during heist prep flights'
      : 'Buy Sparrow ($1.8M) OR do Flight School',
    actionType: hasFastTravel ? 'mission' : 'property_purchase',
    detail: flyingDetail,
    timeHours: hasFastTravel ? 0.75 : 0,
  };
};

/**
 * Detect rank gap
 */
const detectRankGap = (params: DetectionParams, activeEvents: ActiveEvent[]): Bottleneck[] => {
  const { rank } = params;
  const paperTrail4XEvent = activeEvents.find((e: ActiveEvent) => e.name === 'paperTrail4X');
  const paperTrail2XEvent = activeEvents.find((e: ActiveEvent) => e.name === 'paperTrail2X');

  if (rank < 50) {
    let rankSolution: string, rankTimeHours: number, rankSavingsPerHour: number;
    if (paperTrail4XEvent) {
      rankSolution = 'Farm Operation Paper Trail (4X RP & 4X GTA$ for GTA+ this week) - Magic Bullet for Rank + Good money variety';
      rankTimeHours = 1.5;
      rankSavingsPerHour = 400000;
    } else if (paperTrail2XEvent) {
      rankSolution = `Farm Operation Paper Trail (2X RP through ${formatExpiry(WEEKLY_EVENTS.gtaPlus?.monthlyBonuses?.[0]?.expires || WEEKLY_EVENTS.meta.validUntil)})`;
      rankTimeHours = 2;
      rankSavingsPerHour = 200000;
    } else {
      rankSolution = 'Run missions & heists (Cayo, Auto Shop, Security Contracts for RP + $)';
      rankTimeHours = 2.5;
      rankSavingsPerHour = 0;
    }

    return [{
      id: 'rank_low',
      label: 'Rank Under 50 (Max Health & Armor Locked)',
      critical: true,
      urgent: !!paperTrail4XEvent,
      impact: 'high',
      solution: rankSolution,
      actionType: 'mission',
      detail: `Rank ${rank} = ~${Math.floor(50 + (rank / 2))}% max health. You die instantly in Auto Shop raids. Cannot carry full body armor. Makes combat-heavy content much harder.`,
      timeHours: rankTimeHours,
      savingsPerHour: rankSavingsPerHour,
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

/**
 * Detect stat bottlenecks (TIER 2)
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
