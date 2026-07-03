// src/utils/detectBottlenecks/infrastructureGaps.ts
// INFRASTRUCTURE INVESTMENT BOTTLENECKS (Smart Shopping)

import {
  INFRASTRUCTURE_COSTS,
  NIGHTCLUB_FLOOR_AFK,
  calculateBunkerLeak,
  calculateNightclubOptimization,
  getDiscountedPrice,
} from '../infrastructureAdvisor.js';
import type { NightclubOptimizationResult } from '../infrastructureAdvisor.js';
import { WEEKLY_EVENTS, getExpiryLabel } from '../../config/weeklyEvents.js';
import type { DetectionParams, ActiveEvent, DetectionFormData, Bottleneck, NightclubState } from '../bottleneckTypes';

/**
 * Detect bunker infrastructure issues
 */
const detectBunkerInfra = (params: DetectionParams, formData: DetectionFormData): Bottleneck[] => {
  const { hasBunker, bunkerUpgraded } = params;
  if (!hasBunker) return [];

  const bunkerState = {
    owned: true,
    equipmentUpgrade: formData.bunkerEquipmentUpgrade || bunkerUpgraded,
    staffUpgrade: formData.bunkerStaffUpgrade || bunkerUpgraded,
  };

  const bunkerLeak = calculateBunkerLeak(bunkerState);
  if (!bunkerLeak.hasLeak) return [];

  let bunkerSolution: string, bunkerUpgradeCost: number;
  if (bunkerLeak.missingEquipment && bunkerLeak.missingStaff) {
    bunkerSolution = `Buy Equipment ($${(INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade / 1000000).toFixed(2)}M) + Staff ($${(INFRASTRUCTURE_COSTS.bunker.staffUpgrade / 1000).toFixed(0)}k) upgrades.`;
    bunkerUpgradeCost = INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade + INFRASTRUCTURE_COSTS.bunker.staffUpgrade;
  } else if (bunkerLeak.missingEquipment) {
    bunkerSolution = `Buy Equipment Upgrade ($${(INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade / 1000000).toFixed(2)}M)`;
    bunkerUpgradeCost = INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade;
  } else {
    bunkerSolution = `Buy Staff Upgrade ($${(INFRASTRUCTURE_COSTS.bunker.staffUpgrade / 1000).toFixed(0)}k)`;
    bunkerUpgradeCost = INFRASTRUCTURE_COSTS.bunker.staffUpgrade;
  }

  return [{
    id: 'bunker_passive_leak',
    label: '\uD83D\uDEA8 BUNKER PASSIVE INCOME LEAK',
    critical: true,
    urgent: bunkerLeak.lostPerHour >= 30000,
    impact: 'high',
    solution: bunkerSolution,
    actionType: 'infrastructure',
    detail: `You're earning $${bunkerLeak.currentIncome.toLocaleString()}/hr instead of $${bunkerLeak.potentialIncome.toLocaleString()}/hr. Losing $${bunkerLeak.lostPerHour.toLocaleString()}/hr. ROI: ${bunkerLeak.roiHours} hours of passive income.`,
    timeHours: 0.25,
    savingsPerHour: bunkerLeak.lostPerHour,
    cost: bunkerUpgradeCost,
    roiHours: bunkerLeak.roiHours,
  }];
};

/**
 * Build nightclub mule trap bottleneck
 */
const buildNightclubMuleTrapBottleneck = (ncOptimization: NightclubOptimizationResult): Bottleneck | null => {
  const muleTrap = ncOptimization.issues.find((i: any) => i.id === 'nc_mule_trap');
  if (!muleTrap) return null;

  return {
    id: 'nightclub_mule_trap',
    label: '\u26A0\uFE0F MULE CUSTOM TRAP DETECTED',
    critical: true,
    urgent: true,
    impact: 'high',
    solution: 'Buy Pounder Custom ($1.9M). The Mule cannot handle 90+ crate sales. This is a permanent fix.',
    actionType: 'infrastructure',
    detail: muleTrap.detail,
    timeHours: 0.25,
    cost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
    isTrap: true,
  };
};

/**
 * Build nightclub equipment bottleneck
 */
const buildNightclubEquipmentBottleneck = (
  ncOptimization: NightclubOptimizationResult,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck | null => {
  const needsEquipment = ncOptimization.issues.find((i: any) => i.id === 'nc_no_equipment');
  if (!needsEquipment) return null;

  const { price, isDiscounted, discountPercent } = getDiscountedPrice(
    INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
    'nightclub'
  );
  return {
    id: 'nightclub_equipment',
    label: isDiscounted
      ? `\uD83D\uDCB0 NC Equipment ${discountPercent}% OFF (Production 50% Slower)`
      : '\uD83C\uDFAD Nightclub Equipment Upgrade Missing',
    critical: isDiscounted,
    urgent: isDiscounted,
    impact: 'high',
    solution: `Buy Equipment Upgrade ($${(price / 1000000).toFixed(2)}M${isDiscounted ? ' - ' + discountPercent + '% OFF!' : ''})`,
    actionType: 'infrastructure',
    detail: needsEquipment.detail + (isDiscounted ? ` \uD83C\uDF89 ${discountPercent}% OFF expires soon!` : ''),
    timeHours: 0.25,
    cost: price,
    originalCost: INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
    isDiscounted,
    expiresAt: isDiscounted && nightclubDiscountEvent ? nightclubDiscountEvent.expiryTimestamp : null,
  };
};

/**
 * Build nightclub floors bottleneck
 */
const buildNightclubFloorsBottleneck = (
  ncOptimization: NightclubOptimizationResult,
  nightclubState: NightclubState,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck | null => {
  const needsFloors = ncOptimization.issues.find((i: any) => i.id === 'nc_floors_low');
  if (!needsFloors) return null;

  const currentFloors = nightclubState.floors;
  const currentAFK = NIGHTCLUB_FLOOR_AFK[currentFloors]?.maxHours || 20;
  const maxAFK = NIGHTCLUB_FLOOR_AFK[5].maxHours;
  let floorCost = 0;
  for (let f = currentFloors + 1; f <= 5; f++) {
    floorCost += (INFRASTRUCTURE_COSTS.nightclub.floors as Record<number, number>)[f];
  }
  const { price, isDiscounted, discountPercent } = getDiscountedPrice(floorCost, 'nightclub');
  return {
    id: 'nightclub_floors',
    label: isDiscounted
      ? `\uD83D\uDCB0 NC Floors ${discountPercent}% OFF (AFK Limited)`
      : `\uD83C\uDFAD Nightclub Floors ${currentFloors}/5 (AFK Limited)`,
    critical: false,
    urgent: isDiscounted,
    impact: isDiscounted ? 'high' : 'medium',
    solution: `Buy Floors ${currentFloors + 1}-5 ($${(price / 1000000).toFixed(2)}M${isDiscounted ? ' - ' + discountPercent + '% OFF!' : ''})`,
    actionType: 'infrastructure',
    detail: `AFK limited to ${currentAFK} hours. With 5 floors: ${maxAFK} hours (overnight safe).${isDiscounted ? ' \uD83C\uDF89 Discount expires soon!' : ''}`,
    timeHours: 0.25,
    cost: price,
    originalCost: floorCost,
    isDiscounted,
    expiresAt: isDiscounted && nightclubDiscountEvent ? nightclubDiscountEvent.expiryTimestamp : null,
  };
};

/**
 * Build nightclub pounder bottleneck
 */
const buildNightclubPounderBottleneck = (
  ncOptimization: NightclubOptimizationResult,
  nightclubState: NightclubState,
  hasMuleTrap: boolean,
): Bottleneck | null => {
  const needsPounder = ncOptimization.recommendations.find((r: any) => r.id === 'buy_nc_pounder');
  if (!needsPounder || hasMuleTrap) return null;

  return {
    id: 'nightclub_pounder',
    label: '\uD83D\uDE9A Need Pounder Custom for Large Sales',
    critical: false,
    urgent: nightclubState.floors >= 4 || nightclubState.techs >= 4,
    impact: 'high',
    solution: 'Buy Pounder Custom ($1.9M) from Warstock. DO NOT buy Mule Custom.',
    actionType: 'infrastructure',
    detail: 'Essential for selling 90+ crates. The Mule is slow and buggy - skip it entirely.',
    timeHours: 0.25,
    cost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
  };
};

/**
 * Build nightclub tech/feeder bottleneck
 */
const buildNightclubTechFeederBottleneck = (
  ncOptimization: NightclubOptimizationResult,
  nightclubTechs: number,
  nightclubFeeders: number,
): Bottleneck | null => {
  if (nightclubTechs >= 5 && nightclubFeeders >= 5) return null;

  const techImbalance = ncOptimization.issues.find((i: any) => i.id === 'nc_tech_imbalance');
  return {
    id: 'nightclub_partial',
    label: 'Nightclub Not Fully Optimized',
    critical: false,
    impact: 'medium',
    solution: techImbalance
      ? `Hire ${nightclubFeeders - nightclubTechs} more technicians. You have idle businesses.`
      : 'Add more technicians and link feeder businesses.',
    actionType: 'optimization',
    detail: techImbalance?.detail || `${nightclubTechs}/5 techs, ${nightclubFeeders}/5 feeders. Missing up to 50% potential income.`,
    timeHours: 0.5,
  };
};

/**
 * Detect nightclub infrastructure issues
 */
const detectNightclubInfra = (
  params: DetectionParams,
  formData: DetectionFormData,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck[] => {
  const { hasNightclub, nightclubTechs, nightclubFeeders } = params;
  if (!hasNightclub) return [];

  const storage = (formData.nightclubStorage || {}) as Record<string, any>;
  const nightclubState: NightclubState = {
    owned: true,
    floors: Number(formData.nightclubFloors) || 1,
    equipmentUpgrade: formData.nightclubEquipmentUpgrade,
    staffUpgrade: formData.nightclubStaffUpgrade,
    hasPounder: storage.hasPounder || formData.hasPounderCustom || false,
    hasMule: storage.hasMule || formData.hasMuleCustom || false,
    techs: nightclubTechs,
    feeders: nightclubFeeders,
  };

  const ncOptimization = calculateNightclubOptimization(nightclubState);
  const muleTrapResult = buildNightclubMuleTrapBottleneck(ncOptimization);

  return [
    muleTrapResult,
    buildNightclubEquipmentBottleneck(ncOptimization, nightclubDiscountEvent),
    buildNightclubFloorsBottleneck(ncOptimization, nightclubState, nightclubDiscountEvent),
    buildNightclubPounderBottleneck(ncOptimization, nightclubState, !!muleTrapResult),
    buildNightclubTechFeederBottleneck(ncOptimization, nightclubTechs, nightclubFeeders),
  ].filter((b): b is Bottleneck => b !== null);
};

/**
 * Detect infrastructure gaps
 */
export const detectInfrastructureGaps = (
  params: DetectionParams,
  formData: DetectionFormData,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck[] => {
  const { hasNightclub } = params;
  const bottlenecks: Bottleneck[] = [
    ...detectBunkerInfra(params, formData),
    ...detectNightclubInfra(params, formData, nightclubDiscountEvent),
  ];

  // Recommend buying Nightclub if player doesn't have one and discount is active
  if (!hasNightclub && nightclubDiscountEvent) {
    bottlenecks.push({
      id: 'nightclub_discount_buy',
      label: '\uD83C\uDFE2 40% Off Nightclub Properties THIS WEEK',
      critical: (nightclubDiscountEvent.hoursLeft ?? 0) < 24,
      urgent: true,
      impact: 'high',
      solution: 'Purchase Nightclub from Maze Bank Foreclosures at 40% off. Best time to buy!',
      actionType: 'purchase',
      detail: `40% off Nightclub properties ${getExpiryLabel(nightclubDiscountEvent.expiryTimestamp ? new Date(nightclubDiscountEvent.expiryTimestamp).toISOString() : WEEKLY_EVENTS.meta.validUntil)} (${(nightclubDiscountEvent.hoursLeft ?? 0) < 48 ? nightclubDiscountEvent.hoursLeft + ' hours' : nightclubDiscountEvent.daysLeft + ' days'} left). Save ~$600k on property. Unlocks passive income + Business Battles synergy.`,
      timeHours: 0.25,
      expiresAt: nightclubDiscountEvent.expiryTimestamp,
      savingsValue: 600000,
    });
  }

  return bottlenecks;
};
