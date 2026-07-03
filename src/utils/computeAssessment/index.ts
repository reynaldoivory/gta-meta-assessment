// src/utils/computeAssessment/index.ts
// Orchestrator that coordinates income, bottleneck, and score calculations

import { getCurrentEvents } from '../eventHelpers.js';
import { calculateIncome } from '../calculateIncome';
import { detectBottlenecks } from '../detectBottlenecks/index.js';
import { calculateScore } from '../calculateScore';
import { normalizeFormData } from './normalization';
import {
  calculateHeistReadiness,
  estimateNetWorth,
  calculateTimeToGoal,
  calculateEfficiencyMetrics,
} from './calculations';

/**
 * Core logic engine for GTA Online player assessment.
 *
 * This is a pure function that takes form data and returns comprehensive
 * assessment results. Same formData → same result, no side effects.
 *
 * The assessment includes:
 * 1. Income calculations (active, passive, GTA+ bonuses)
 * 2. Bottleneck detection (prioritized opportunities/issues)
 * 3. Heist readiness evaluation
 * 4. Score calculation (tier ranking)
 * 5. Net worth estimation
 * 6. Time-to-goal calculator
 * 7. Efficiency metrics (vs community benchmarks)
 *
 * @param {Object} formData - Raw form data from AssessmentForm
 * @returns {Object} Comprehensive assessment results
 * @throws {Error} If formData is invalid
 */
export const computeAssessment = (formData: any) => {
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
