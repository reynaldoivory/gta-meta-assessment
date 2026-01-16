// src/utils/computeAssessment.js
// Orchestrator that coordinates income, bottleneck, and score calculations

import { MODEL_CONFIG } from './modelConfig.js';
import { validateStat, validateNumericInput } from './assessmentHelpers.js';
import { getCurrentEvents } from './eventHelpers.js';
import { calculateIncome } from './calculateIncome.js';
import { detectBottlenecks } from './detectBottlenecks.js';
import { calculateScore } from './calculateScore.js';

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
  const rank = Number(formData.rank) || 0;
  const timePlayed = Number(formData.timePlayed) || 0; // total hours (optional)
  const liquidCash = Number(formData.liquidCash) || 0;

  const strength = validateStat(formData.strength);
  const flying = validateStat(formData.flying);
  const shooting = validateStat(formData.shooting);

  const cayoCompletions = validateNumericInput(
    formData.cayoCompletions,
    0,
    10000
  );
  const cayoAvgTime = validateNumericInput(
    formData.cayoAvgTime,
    30,  // min 30 min (preps + heist)
    180  // max 3 hours
  );

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

  // Normalized params object for passing to modules
  const normalizedParams = {
    rank,
    timePlayed,
    liquidCash,
    strength,
    flying,
    shooting,
    cayoCompletions,
    cayoAvgTime,
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
  };

  // ---------- 2. INCOME CALCULATIONS ----------
  const incomeResult = calculateIncome(normalizedParams, formData);
  const { activeIncome, passiveIncome, gtaPlusBonusPerHour, incomePerHour, dynamicIncome } = incomeResult;

  // ---------- 3. GET ACTIVE EVENTS ----------
  const activeEvents = getCurrentEvents({ hasGTAPlus, hasAutoShop, hasAgency, hasNightclub }, now);

  // ---------- 4. BOTTLENECK DETECTION ----------
  const bottlenecks = detectBottlenecks(normalizedParams, now, activeEvents, incomePerHour, formData);

  // ---------- 5. HEIST LEADERSHIP READINESS ----------
  const heistReady = {
    rank50: rank >= 50,
    strength80: strength >= 80,
    flying80: flying >= 80,
    cayo10: cayoCompletions >= (MODEL_CONFIG.thresholds?.cayo?.masteryRuns ?? 10),
    travelOptimized: hasSparrow || hasRaiju || hasOppressor,
    bizCore: hasAcidLab && hasNightclub && hasAgency,
  };

  const heistReadyFlags = Object.values(heistReady);
  const heistReadyPercent =
    heistReadyFlags.length > 0
      ? (heistReadyFlags.filter(Boolean).length / heistReadyFlags.length) * 100
      : 0;

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
  const estimatedNetWorth = liquidCash + 
    (hasKosatka ? 2200000 : 0) +
    (hasSparrow ? 1815000 : 0) +
    (hasAgency ? 2010000 : 0) +
    (hasAcidLab ? 750000 : 0) +
    (hasNightclub ? 1500000 : 0) +
    (hasBunker ? 1150000 : 0) +
    (hasSalvageYard ? 500000 : 0) +
    (formData.hasAutoShop ? 1670000 : 0) +
    (formData.hasCarWash ? 1400000 : 0) +
    (formData.hasMansion ? 13500000 : 0) + // Mansion value (base + upgrades)
    (hasRaiju ? 6000000 : 0) +
    (hasOppressor ? 3500000 : 0) +
    0;

  const netWorthPerHour = timePlayed > 0 ? estimatedNetWorth / timePlayed : 0;

  // ---------- 8. TIME TO GOAL CALCULATOR ----------
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

  let hoursToNextTarget = 0;
  if (nextTarget && incomePerHour > 0) {
    const needed = nextTarget.cost - liquidCash;
    hoursToNextTarget = needed / incomePerHour;
  }

  // ---------- 9. RETURN STRUCT ----------
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
    nextGoal: nextTarget ? {
      name: nextTarget.name,
      cost: nextTarget.cost,
      currentCash: liquidCash,
      needed: Math.max(0, nextTarget.cost - liquidCash),
      hoursRemaining: Math.max(0, Number(hoursToNextTarget.toFixed(1))),
      canAffordNow: liquidCash >= nextTarget.cost,
      // Show which activity is fastest to grind
      fastestGrind: dynamicIncome.bestSource, // e.g., "Auto Shop (2X)"
    } : null,
  };
};
