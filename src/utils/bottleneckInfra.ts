// src/utils/bottleneckInfra.ts
// Infrastructure investment bottleneck detection (bunker, nightclub).

import type { Bottleneck, DetectionParams, ActiveEvent, DetectionFormData, NightclubState } from './bottleneckTypes';
import { WEEKLY_EVENTS, getExpiryLabel } from '../config/weeklyEvents.js';
import {
  calculateBunkerLeak,
  calculateNightclubOptimization,
  INFRASTRUCTURE_COSTS,
  NIGHTCLUB_FLOOR_AFK,
  getDiscountedPrice,
} from './infrastructureAdvisor.js';

// ============================================
// Bunker Infrastructure
// ============================================

/** Resolve bunker upgrade solution text and cost. */
const resolveBunkerUpgrade = (bunkerLeak: Record<string, unknown>): { solution: string; cost: number } => {
  const equipCost = INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade;
  const staffCost = INFRASTRUCTURE_COSTS.bunker.staffUpgrade;

  if (bunkerLeak.missingEquipment && bunkerLeak.missingStaff) {
    return {
      solution: `Buy Equipment ($${(equipCost / 1000000).toFixed(2)}M) + Staff ($${(staffCost / 1000).toFixed(0)}k) upgrades.`,
      cost: equipCost + staffCost,
    };
  }
  if (bunkerLeak.missingEquipment) {
    return { solution: `Buy Equipment Upgrade ($${(equipCost / 1000000).toFixed(2)}M)`, cost: equipCost };
  }
  return { solution: `Buy Staff Upgrade ($${(staffCost / 1000).toFixed(0)}k)`, cost: staffCost };
};

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

  const { solution, cost } = resolveBunkerUpgrade(bunkerLeak);

  return [{
    id: 'bunker_passive_leak',
    label: '\uD83D\uDEA8 BUNKER PASSIVE INCOME LEAK',
    critical: true,
    urgent: bunkerLeak.lostPerHour >= 30000,
    impact: 'high',
    solution,
    actionType: 'infrastructure',
    detail: `You're earning $${bunkerLeak.currentIncome.toLocaleString()}/hr instead of $${bunkerLeak.potentialIncome.toLocaleString()}/hr. Losing $${bunkerLeak.lostPerHour.toLocaleString()}/hr. ROI: ${bunkerLeak.roiHours} hours of passive income.`,
    timeHours: 0.25,
    savingsPerHour: bunkerLeak.lostPerHour,
    cost,
    roiHours: bunkerLeak.roiHours,
  }];
};

// ============================================
// Nightclub Infrastructure
// ============================================

const buildNightclubMuleTrapBottleneck = (ncOptimization: Record<string, unknown>): Bottleneck | null => {
  const issues = ncOptimization.issues as Array<{ id: string; detail: string }>;
  const muleTrap = issues.find(i => i.id === 'nc_mule_trap');
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

const buildNightclubEquipmentBottleneck = (
  ncOptimization: Record<string, unknown>,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck | null => {
  const issues = ncOptimization.issues as Array<{ id: string; detail: string }>;
  const needsEquipment = issues.find(i => i.id === 'nc_no_equipment');
  if (!needsEquipment) return null;

  const { price, isDiscounted, discountPercent } = getDiscountedPrice(
    INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
    'nightclub',
  ) as { price: number; savings: number; isDiscounted: boolean; discountPercent: number };

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
    expiresAt: isDiscounted && nightclubDiscountEvent ? nightclubDiscountEvent.expiryTimestamp : undefined,
  };
};

/** Calculate total cost to upgrade from current floors to 5. */
const calculateFloorUpgradeCost = (currentFloors: number): number => {
  const floorCosts = INFRASTRUCTURE_COSTS.nightclub.floors as Record<number, number>;
  let cost = 0;
  for (let f = currentFloors + 1; f <= 5; f++) {
    cost += floorCosts[f];
  }
  return cost;
};

/** Resolve discount-dependent display properties for nightclub floors. */
const resolveFloorDiscountDisplay = (
  isDiscounted: boolean,
  discountPercent: number,
  currentFloors: number,
  nightclubDiscountEvent: ActiveEvent | undefined,
) => {
  if (isDiscounted) {
    return {
      label: `\uD83D\uDCB0 NC Floors ${discountPercent}% OFF (AFK Limited)`,
      impact: 'high' as const,
      solutionSuffix: ` - ${discountPercent}% OFF!`,
      detailSuffix: ' \uD83C\uDF89 Discount expires soon!',
      expiresAt: nightclubDiscountEvent?.expiryTimestamp,
    };
  }
  return {
    label: `\uD83C\uDFAD Nightclub Floors ${currentFloors}/5 (AFK Limited)`,
    impact: 'medium' as const,
    solutionSuffix: '',
    detailSuffix: '',
    expiresAt: undefined,
  };
};

const buildNightclubFloorsBottleneck = (
  ncOptimization: Record<string, unknown>,
  nightclubState: NightclubState,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck | null => {
  const issues = ncOptimization.issues as Array<{ id: string; detail: string }>;
  const needsFloors = issues.find(i => i.id === 'nc_floors_low');
  if (!needsFloors) return null;

  const currentFloors = nightclubState.floors;
  const floorAFK = NIGHTCLUB_FLOOR_AFK as Record<number, { maxHours: number }>;
  const currentAFK = floorAFK[currentFloors]?.maxHours || 20;
  const maxAFK = floorAFK[5].maxHours;
  const floorCost = calculateFloorUpgradeCost(currentFloors);
  const { price, isDiscounted, discountPercent } = getDiscountedPrice(floorCost, 'nightclub') as { price: number; savings: number; isDiscounted: boolean; discountPercent: number };
  const display = resolveFloorDiscountDisplay(isDiscounted, discountPercent, currentFloors, nightclubDiscountEvent);

  return {
    id: 'nightclub_floors',
    label: display.label,
    critical: false,
    urgent: isDiscounted,
    impact: display.impact,
    solution: `Buy Floors ${currentFloors + 1}-5 ($${(price / 1000000).toFixed(2)}M${display.solutionSuffix})`,
    actionType: 'infrastructure',
    detail: `AFK limited to ${currentAFK} hours. With 5 floors: ${maxAFK} hours (overnight safe).${display.detailSuffix}`,
    timeHours: 0.25,
    cost: price,
    originalCost: floorCost,
    isDiscounted,
    expiresAt: display.expiresAt,
  };
};

const buildNightclubPounderBottleneck = (
  ncOptimization: Record<string, unknown>,
  nightclubState: NightclubState,
  hasMuleTrap: boolean,
): Bottleneck | null => {
  const recommendations = ncOptimization.recommendations as Array<{ id: string }>;
  const needsPounder = recommendations.find(r => r.id === 'buy_nc_pounder');
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

const buildNightclubTechFeederBottleneck = (
  ncOptimization: Record<string, unknown>,
  nightclubTechs: number,
  nightclubFeeders: number,
): Bottleneck | null => {
  if (nightclubTechs >= 5 && nightclubFeeders >= 5) return null;

  const issues = ncOptimization.issues as Array<{ id: string; detail: string }>;
  const techImbalance = issues.find(i => i.id === 'nc_tech_imbalance');

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

const detectNightclubInfra = (
  params: DetectionParams,
  formData: DetectionFormData,
  nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck[] => {
  const { hasNightclub, nightclubTechs, nightclubFeeders } = params;
  if (!hasNightclub) return [];

  const storage = (formData.nightclubStorage || {}) as Record<string, boolean>;
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

// ============================================
// Main Export
// ============================================

/**
 * Detect infrastructure investment bottlenecks (bunker and nightclub).
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

  if (!hasNightclub && nightclubDiscountEvent) {
    const hoursLeftDisplay = nightclubDiscountEvent.hoursLeft < 48
      ? nightclubDiscountEvent.hoursLeft + ' hours'
      : nightclubDiscountEvent.daysLeft + ' days';
    const expiryLabel = getExpiryLabel(
      nightclubDiscountEvent.expiryTimestamp
        ? new Date(nightclubDiscountEvent.expiryTimestamp).toISOString()
        : WEEKLY_EVENTS.meta.validUntil,
    );
    bottlenecks.push({
      id: 'nightclub_discount_buy',
      label: '\uD83C\uDFE2 40% Off Nightclub Properties THIS WEEK',
      critical: nightclubDiscountEvent.hoursLeft < 24,
      urgent: true,
      impact: 'high',
      solution: 'Purchase Nightclub from Maze Bank Foreclosures at 40% off. Best time to buy!',
      actionType: 'purchase',
      detail: `40% off Nightclub properties ${expiryLabel} (${hoursLeftDisplay} left). Save ~$600k on property. Unlocks passive income + Business Battles synergy.`,
      timeHours: 0.25,
      expiresAt: nightclubDiscountEvent.expiryTimestamp,
      savingsValue: 600000,
    });
  }

  return bottlenecks;
};
