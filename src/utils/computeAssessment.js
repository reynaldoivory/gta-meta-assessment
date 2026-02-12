// src/utils/computeAssessment.js
// Orchestrator that coordinates income, bottleneck, and score calculations

import { MODEL_CONFIG } from './modelConfig.js';
import { validateStat, validateNumericInput } from './assessmentHelpers.js';
import { getCurrentEvents } from './eventHelpers.js';
import { calculateIncome } from './calculateIncome.js';
import { detectBottlenecks } from './detectBottlenecks.js';
import { calculateScore } from './calculateScore.js';

/** Normalize and validate form inputs into a clean params object. */
const normalizeFormData = (formData) => {
  const rank = Number(formData.rank) || 0;
  const timePlayed = Number(formData.timePlayed) || 0; // total hours (optional)
  const liquidCash = Number(formData.liquidCash) || 0;
  const totalIncomeCollected = Number(formData.totalIncomeCollected) || 0;
  const totalRPCollected = Number(formData.totalRPCollected) || 0;

  const strength = validateStat(formData.strength);
  const flying = validateStat(formData.flying);
  const shooting = validateStat(formData.shooting);

  const nightclubTechs = validateNumericInput(
    formData.nightclubTechs,
    0,
    5
  );
  
  // Calculate nightclubFeeders from nightclubSources (new format) or use legacy number
  let nightclubFeeders = 0;
  if (formData.nightclubSources && typeof formData.nightclubSources === 'object') {
    // New format: count active sources
    nightclubFeeders = Object.values(formData.nightclubSources).filter(Boolean).length;
  } else {
    // Legacy format: use number directly
    nightclubFeeders = validateNumericInput(formData.nightclubFeeders, 0, 7);
  }

  const securityContracts = validateNumericInput(
    formData.securityContracts,
    0,
    9999
  );

  const hasKosatka = !!formData.hasKosatka;
  const hasSparrow = !!formData.hasSparrow;
  const hasAgency = !!formData.hasAgency;
  const hasAcidLab = !!formData.hasAcidLab;
  const acidLabUpgraded = !!formData.acidLabUpgraded;
  const hasNightclub = !!formData.hasNightclub;
  const hasBunker = !!formData.hasBunker;
  const bunkerUpgraded = !!formData.bunkerUpgraded;
  const hasSalvageYard = !!formData.hasSalvageYard;
  const hasTowTruck = !!formData.hasTowTruck;
  const dreContractDone = !!formData.dreContractDone;
  const payphoneUnlocked = !!formData.payphoneUnlocked;
  const hasRaiju = !!formData.hasRaiju;
  const hasOppressor = !!formData.hasOppressor;
  const hasGTAPlus = !!formData.hasGTAPlus;
  const hasAutoShop = !!formData.hasAutoShop;
  const hasCarWash = !!formData.hasCarWash;
  const hasWeedFarm = !!formData.hasWeedFarm;
  const hasHeliTours = !!formData.hasHeliTours;
  const sellsToStreetDealers = !!formData.sellsToStreetDealers;
  const hasCoke = !!formData.hasCoke || !!formData.nightclubSources?.imports;
  const hasMeth = !!formData.hasMeth || !!formData.nightclubSources?.pharma;
  const hasCash = !!formData.hasCash || !!formData.nightclubSources?.cash;
  const playMode = formData.playMode || 'invite';

  return {
    rank,
    timePlayed,
    liquidCash,
    totalIncomeCollected,
    totalRPCollected,
    strength,
    flying,
    shooting,
    nightclubTechs,
    nightclubFeeders,
    securityContracts,
    hasKosatka,
    hasSparrow,
    hasAgency,
    hasAcidLab,
    acidLabUpgraded,
    hasNightclub,
    hasBunker,
    bunkerUpgraded,
    hasSalvageYard,
    hasTowTruck,
    dreContractDone,
    payphoneUnlocked,
    hasRaiju,
    hasOppressor,
    hasGTAPlus,
    hasAutoShop,
    hasCarWash,
    hasWeedFarm,
    hasHeliTours,
    sellsToStreetDealers,
    hasCoke,
    hasMeth,
    hasCash,
    playMode,
  };
};

/** Check heist leadership readiness criteria. */
const calculateHeistReadiness = (normalizedParams) => {
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
    hasWeedFarm,
    hasHeliTours,
    hasKosatka,
    hasCoke,
    hasMeth,
    hasCash,
  } = normalizedParams;

  const heistConfig = MODEL_CONFIG.heistReadiness || {};
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

/** Estimate total net worth from properties and cash. */
const estimateNetWorth = (normalizedParams, formData, timePlayed) => {
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

/** Calculate time remaining to reach the next purchase goal. */
const calculateTimeToGoal = (normalizedParams, formData, liquidCash, incomePerHour, dynamicIncome) => {
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

/** Calculate efficiency metrics and compare to Feb 2026 benchmarks. */
const calculateEfficiencyMetrics = (timePlayed, totalIncomeCollected, totalRPCollected) => {
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
  const getGrade = (efficiency) => {
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

/**
 * Core logic engine.
 * Pure function: same formData → same result, no side effects.
 */
export const computeAssessment = (formData) => {
  // Validate formData exists
  if (!formData || typeof formData !== 'object') {
    throw new Error('Invalid formData: formData must be an object');
  }

  // Cache timestamp once at the start
  const now = Date.now();

  // ---------- 1. NORMALIZE INPUT ----------
  const normalizedParams = normalizeFormData(formData);
  const {
    timePlayed, liquidCash, totalIncomeCollected, totalRPCollected, strength, flying, shooting,
    hasKosatka, hasSparrow, hasAgency, hasAcidLab, acidLabUpgraded,
    hasNightclub, hasBunker, bunkerUpgraded, hasSalvageYard, hasTowTruck,
    hasRaiju, hasOppressor, hasGTAPlus, hasAutoShop,
  } = normalizedParams;

  // ---------- 2. INCOME CALCULATIONS ----------
  const incomeResult = calculateIncome(normalizedParams, formData);
  const { activeIncome, passiveIncome, gtaPlusBonusPerHour, incomePerHour, dynamicIncome } = incomeResult;

  // ---------- 3. GET ACTIVE EVENTS ----------
  const activeEvents = getCurrentEvents({ hasGTAPlus, hasAutoShop, hasAgency, hasNightclub }, now);

  // ---------- 4. BOTTLENECK DETECTION ----------
  const bottlenecks = detectBottlenecks(normalizedParams, now, activeEvents, incomePerHour, formData);

  // ---------- 5. HEIST LEADERSHIP READINESS ----------
  const { heistReady, heistReadyPercent } = calculateHeistReadiness(normalizedParams);

  // ---------- 6. SCORE CALCULATION ----------
  const scoreResult = calculateScore({
    activeIncome,
    passiveIncome,
    strength,
    flying,
    shooting,
    hasKosatka,
    hasSparrow,
    hasAgency,
    hasAcidLab,
    acidLabUpgraded,
    hasNightclub,
    hasBunker,
    bunkerUpgraded,
    hasSalvageYard,
    hasTowTruck,
    hasRaiju,
    hasOppressor,
  });

  // ---------- 7. NET WORTH ESTIMATE ----------
  const { estimatedNetWorth, netWorthPerHour } = estimateNetWorth(normalizedParams, formData, timePlayed);

  // ---------- 8. TIME TO GOAL CALCULATOR ----------
  const nextGoal = calculateTimeToGoal(normalizedParams, formData, liquidCash, incomePerHour, dynamicIncome);

  // ---------- 9. EFFICIENCY METRICS ----------
  const efficiencyMetrics = calculateEfficiencyMetrics(timePlayed, totalIncomeCollected, totalRPCollected);

  // ---------- 10. RETURN STRUCT ----------
  return {
    score: scoreResult.score,
    tier: scoreResult.tier,
    tierColor: scoreResult.tierColor,
    incomePerHour: Math.round(incomePerHour),
    activeIncome: Math.round(activeIncome),
    passiveIncome: Math.round(passiveIncome),
    gtaPlusBonus: Math.round(gtaPlusBonusPerHour),
    gtaPlusActive: hasGTAPlus,
    bottlenecks,
    heistReady,
    heistReadyPercent,
    totalHoursPlayed: timePlayed,
    currentCash: liquidCash,
    // Net worth estimate
    netWorth: Math.round(estimatedNetWorth),
    netWorthPerHour: Math.round(netWorthPerHour),
    // Dynamic income data
    dynamicIncome: {
      bestSource: dynamicIncome.bestSource,
      bestIncome: dynamicIncome.bestIncome,
      isEventBoosted: dynamicIncome.isEventBoosted,
      activeEvents: dynamicIncome.activeEvents,
      daysUntilExpiry: dynamicIncome.daysUntilExpiry,
    },
    // Time to Goal calculator
    nextGoal,
    // Efficiency metrics and Feb 2026 benchmarks
    efficiencyMetrics,
  };
};
