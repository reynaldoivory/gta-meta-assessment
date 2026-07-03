// src/utils/computeAssessment/calculations.ts
// Additional calculations: heist readiness, net worth, time to goal, efficiency

import { MODEL_CONFIG } from '../modelConfig.js';

/**
 * Check heist leadership readiness criteria.
 *
 * Evaluates if a player is ready to lead heists based on:
 * - Rank (50+)
 * - Strength (80+)
 * - Flying (80+)
 * - Income diversification (multiple businesses)
 * - Travel optimization (fast travel vehicle)
 * - Core businesses (Agency, Nightclub, Acid Lab)
 *
 * @param {Object} normalizedParams - Normalized player parameters
 * @returns {Object} Heist readiness results with scores and tier
 */
export const calculateHeistReadiness = (normalizedParams: any) => {
  const {
    rank,
    strength,
    flying,
    hasSparrow,
    hasRaiju,
    hasOppressor,
    hasAcidLab,
    hasNightclub,
    hasAgency,
    hasAutoShop,
    hasCarWash,
    sellsToStreetDealers,
    hasBunker,
    hasSalvageYard,
    hasKosatka,
    hasCoke,
    hasMeth,
    hasCash,
  } = normalizedParams;

  const heistConfig: any = MODEL_CONFIG.heistReadiness || {};
  const diversifiedConfig = heistConfig.diversifiedIncome || {};
  const points = diversifiedConfig.points || {};
  const mcPoints = diversifiedConfig.mcPoints || {};

  let diversifiedIncomePoints = 0;
  if (hasAcidLab) diversifiedIncomePoints += points.acidLab ?? 3;
  if (hasAgency) diversifiedIncomePoints += points.agency ?? 3;
  if (hasNightclub) diversifiedIncomePoints += points.nightclub ?? 3;
  if (hasKosatka) diversifiedIncomePoints += points.kosatka ?? 2;
  if (hasBunker) diversifiedIncomePoints += points.bunker ?? 2;
  if (hasAutoShop) diversifiedIncomePoints += points.autoShop ?? 1;
  if (hasSalvageYard) diversifiedIncomePoints += points.salvageYard ?? 1;
  if (hasCarWash) diversifiedIncomePoints += points.carWash ?? 1;
  if (sellsToStreetDealers) diversifiedIncomePoints += points.streetDealers ?? 1;
  if (hasCoke) diversifiedIncomePoints += mcPoints.coke ?? 0.5;
  if (hasMeth) diversifiedIncomePoints += mcPoints.meth ?? 0.5;
  if (hasCash) diversifiedIncomePoints += mcPoints.cash ?? 0.5;

  diversifiedIncomePoints = Math.round(diversifiedIncomePoints * 10) / 10;

  const tiers = diversifiedConfig.tiers || {};
  const tierScores = diversifiedConfig.tierScores || {};
  const tierLabels = diversifiedConfig.tierLabels || {};

  let diversifiedIncomeTier = 'Paper';
  if (diversifiedIncomePoints >= (tiers.platinum ?? 15)) {
    diversifiedIncomeTier = 'Platinum';
  } else if (diversifiedIncomePoints >= (tiers.gold ?? 10)) {
    diversifiedIncomeTier = 'Gold';
  } else if (diversifiedIncomePoints >= (tiers.silver ?? 6)) {
    diversifiedIncomeTier = 'Silver';
  } else if (diversifiedIncomePoints >= (tiers.bronze ?? 3)) {
    diversifiedIncomeTier = 'Bronze';
  }

  const diversifiedIncomeScore =
    tierScores[diversifiedIncomeTier.toLowerCase()] ?? 0;
  const diversifiedIncomeLabel =
    tierLabels[diversifiedIncomeTier.toLowerCase()] ?? diversifiedIncomeTier;

  const heistReady = {
    rank50: rank >= 50,
    strength80: strength >= 80,
    flying80: flying >= 80,
    diversifiedIncome: diversifiedIncomeTier !== 'Paper',
    diversifiedIncomeTier,
    diversifiedIncomePoints,
    diversifiedIncomeLabel,
    diversifiedIncomeScore,
    travelOptimized: hasSparrow || hasRaiju || hasOppressor,
    bizCore: hasAcidLab && hasNightclub && hasAgency,
  };

  const weights = heistConfig.weights || {
    rank: 16,
    strength: 16,
    flying: 16,
    diversifiedIncome: 20,
    travelOptimized: 16,
    bizCore: 16,
  };

  const weightTotal =
    weights.rank +
    weights.strength +
    weights.flying +
    weights.diversifiedIncome +
    weights.travelOptimized +
    weights.bizCore;

  const weightedScore =
    (heistReady.rank50 ? weights.rank : 0) +
    (heistReady.strength80 ? weights.strength : 0) +
    (heistReady.flying80 ? weights.flying : 0) +
    (heistReady.travelOptimized ? weights.travelOptimized : 0) +
    (heistReady.bizCore ? weights.bizCore : 0) +
    (diversifiedIncomeScore / 100) * weights.diversifiedIncome;

  const heistReadyPercent = weightTotal > 0 ? (weightedScore / weightTotal) * 100 : 0;

  return { heistReady, heistReadyPercent };
};

/**
 * Estimate total net worth from properties and cash.
 *
 * Calculates approximate net worth by summing:
 * - Liquid cash
 * - Estimated value of owned properties
 * - Estimated value of owned vehicles
 *
 * @param {Object} normalizedParams - Normalized player parameters
 * @param {Object} formData - Raw form data
 * @param {number} timePlayed - Total hours played
 * @returns {Object} Net worth estimates
 */
export const estimateNetWorth = (normalizedParams: any, formData: any, timePlayed: number) => {
  const {
    liquidCash, hasKosatka, hasSparrow, hasAgency, hasAcidLab,
    hasNightclub, hasBunker, hasSalvageYard, hasAutoShop, hasRaiju, hasOppressor,
    hasCarWash, hasWeedFarm, hasHeliTours,
  } = normalizedParams;

  const estimatedNetWorth = liquidCash +
    (hasKosatka ? 2200000 : 0) +
    (hasSparrow ? 1815000 : 0) +
    (hasAgency ? 2010000 : 0) +
    (hasAcidLab ? 750000 : 0) +
    (hasNightclub ? 1500000 : 0) +
    (hasBunker ? 1150000 : 0) +
    (hasSalvageYard ? 500000 : 0) +
    (hasAutoShop ? 1670000 : 0) +
    (hasCarWash ? 1400000 : 0) +
    (hasWeedFarm ? 715000 : 0) +
    (hasHeliTours ? 750000 : 0) +
    (formData.hasMansion ? 13500000 : 0) +
    (hasRaiju ? 6000000 : 0) +
    (hasOppressor ? 3500000 : 0) +
    0;

  const netWorthPerHour = timePlayed > 0 ? estimatedNetWorth / timePlayed : 0;

  return { estimatedNetWorth, netWorthPerHour };
};

/**
 * Calculate time remaining to reach the next purchase goal.
 *
 * Determines the next recommended property purchase and estimates
 * hours needed to save enough money at current income rate.
 *
 * @param {Object} normalizedParams - Normalized player parameters
 * @param {Object} formData - Raw form data
 * @param {number} liquidCash - Current liquid cash
 * @param {number} incomePerHour - Current income per hour
 * @param {Object} dynamicIncome - Dynamic income data
 * @returns {Object|null} Time to goal data or null if no goals
 */
export const calculateTimeToGoal = (
  normalizedParams: any,
  formData: any,
  liquidCash: number,
  incomePerHour: number,
  dynamicIncome: any
) => {
  const { hasKosatka, hasAgency, hasAutoShop, hasGTAPlus, hasAcidLab, hasSparrow } = normalizedParams;

  const targets = [];

  if (!hasKosatka) targets.push({ name: 'Kosatka', cost: 2200000, priority: 1 });
  if (!hasAgency) targets.push({ name: 'Agency', cost: 2010000, priority: 2 });
  if (!hasAutoShop && hasGTAPlus) {
    // Auto Shop 50% off for GTA+ = ~$835k
    targets.push({ name: 'Auto Shop (GTA+ Discount)', cost: 835000, priority: 3 });
  } else if (!hasAutoShop) {
    targets.push({ name: 'Auto Shop', cost: 1670000, priority: 3 });
  }
  if (!hasAcidLab) targets.push({ name: 'Acid Lab', cost: 750000, priority: 4 });
  if (!hasSparrow && hasKosatka) targets.push({ name: 'Sparrow', cost: 1815000, priority: 5 });

  // Sort by priority, filter affordable
  const nextTarget = targets
    .filter(t => liquidCash < t.cost) // Only show what they can't afford yet
    .sort((a, b) => a.priority - b.priority)[0] || null;

  if (!nextTarget) return null;

  let hoursToNextTarget = 0;
  if (incomePerHour > 0) {
    const needed = nextTarget.cost - liquidCash;
    hoursToNextTarget = needed / incomePerHour;
  }

  return {
    name: nextTarget.name,
    cost: nextTarget.cost,
    currentCash: liquidCash,
    needed: Math.max(0, nextTarget.cost - liquidCash),
    hoursRemaining: Math.max(0, Number(hoursToNextTarget.toFixed(1))),
    canAffordNow: liquidCash >= nextTarget.cost,
    // Show which activity is fastest to grind
    fastestGrind: dynamicIncome.bestSource, // e.g., "Auto Shop (2X)"
  };
};

/**
 * Calculate efficiency metrics and compare to Feb 2026 benchmarks.
 *
 * Compares player's lifetime performance (income/RP per hour) against
 * community benchmarks to provide efficiency grades and insights.
 *
 * @param {number} timePlayed - Total hours played
 * @param {number} totalIncomeCollected - Total lifetime income
 * @param {number} totalRPCollected - Total lifetime RP
 * @returns {Object} Efficiency metrics and grades
 */
export const calculateEfficiencyMetrics = (
  timePlayed: number,
  totalIncomeCollected: number,
  totalRPCollected: number
) => {
  // Feb 2026 Benchmarks (community average/realistic expectations)
  const BENCHMARKS = {
    incomePerHour: 750000,        // Post-Cayo nerf avg grind
    rpPerHour: 4500,              // Average grind RP rate
    incomePerHourHardcore: 1200000, // Optimized grind (Acid Lab 2X + AE + Agency)
    rpPerHourHardcore: 6000,       // Optimized RP grinding
  };

  if (!timePlayed || timePlayed <= 0) {
    return {
      incomePerHour: 0,
      rpPerHour: 0,
      incomeEfficiency: 0,
      rpEfficiency: 0,
      incomeGrade: '—',
      rpGrade: '—',
      incomeVsBench: 'Not enough data',
      rpVsBench: 'Not enough data',
    };
  }

  const incomePerHour = Math.round(totalIncomeCollected / timePlayed);
  const rpPerHour = Math.round(totalRPCollected / timePlayed);

  // Efficiency as percentage of benchmark
  const incomeEfficiency = Math.round((incomePerHour / BENCHMARKS.incomePerHour) * 100);
  const rpEfficiency = Math.round((rpPerHour / BENCHMARKS.rpPerHour) * 100);

  // Grade letter (A+ to F)
  const getGrade = (efficiency: number) => {
    if (efficiency >= 150) return 'S+';
    if (efficiency >= 130) return 'A+';
    if (efficiency >= 110) return 'A';
    if (efficiency >= 90) return 'B+';
    if (efficiency >= 70) return 'B';
    if (efficiency >= 50) return 'C';
    return 'D';
  };

  const incomeGrade = getGrade(incomeEfficiency);
  const rpGrade = getGrade(rpEfficiency);

  // Comparison to benchmark
  const incomeVsBench = incomePerHour >= BENCHMARKS.incomePerHour * 0.9 ? 'On Par' : 'Below Average';
  const rpVsBench = rpPerHour >= BENCHMARKS.rpPerHour * 0.9 ? 'On Par' : 'Below Average';

  return {
    incomePerHour,
    rpPerHour,
    incomeEfficiency,
    rpEfficiency,
    incomeGrade,
    rpGrade,
    incomeVsBench,
    rpVsBench,
    benchmarks: BENCHMARKS,
  };
};
