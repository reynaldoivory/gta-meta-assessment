// src/utils/calculateIncome.js
// Income calculation logic extracted from computeAssessment.js

import { MODEL_CONFIG } from './modelConfig.js';
import { calculateDynamicIncome } from './dynamicIncome.js';

/**
 * Calculate all income sources for a player
 * @param {Object} params - Normalized player data
 * @param {number} params.cayoCompletions - Number of Cayo completions
 * @param {number} params.cayoAvgTime - Average Cayo completion time in minutes
 * @param {number} params.nightclubTechs - Number of nightclub technicians (0-5)
 * @param {number} params.nightclubFeeders - Number of nightclub feeder businesses (0-5)
 * @param {number} params.securityContracts - Number of security contracts completed
 * @param {boolean} params.hasKosatka - Owns Kosatka submarine
 * @param {boolean} params.hasAgency - Owns Agency
 * @param {boolean} params.hasAcidLab - Owns Acid Lab
 * @param {boolean} params.acidLabUpgraded - Acid Lab is upgraded
 * @param {boolean} params.hasNightclub - Owns Nightclub
 * @param {boolean} params.hasBunker - Owns Bunker
 * @param {boolean} params.bunkerUpgraded - Bunker is upgraded
 * @param {boolean} params.hasSalvageYard - Owns Salvage Yard
 * @param {boolean} params.hasTowTruck - Owns Tow Truck
 * @param {boolean} params.payphoneUnlocked - Payphone hits unlocked
 * @param {boolean} params.hasGTAPlus - Has GTA+ subscription
 * @param {Object} formData - Original form data for dynamic income calculation
 * @returns {Object} Income calculation results
 */
export const calculateIncome = (params, formData) => {
  const {
    cayoCompletions,
    cayoAvgTime,
    nightclubTechs,
    nightclubFeeders,
    securityContracts,
    hasKosatka,
    hasAgency,
    hasAcidLab,
    acidLabUpgraded,
    hasNightclub,
    hasBunker,
    bunkerUpgraded,
    hasSalvageYard,
    hasTowTruck,
    payphoneUnlocked,
    hasGTAPlus,
  } = params;

  let activeIncome = 0;   // GTA$/hr from active grinding
  let passiveIncome = 0;  // GTA$/hr from businesses + GTA+

  // --- 2.1 Cayo Perico (Kosatka) ---
  if (hasKosatka) {
    const config = MODEL_CONFIG.income?.cayo || {};
    const basePayout = config.basePayout ?? 700000;       // avg post-nerf
    const masteryRuns = config.masteryThreshold ?? 10;    // runs for mastery
    const masteryBonus = config.masteryBonus ?? 1.1;      // 10% faster when mastered

    const runsPerHour = 60 / cayoAvgTime;
    const mastered = cayoCompletions >= masteryRuns;
    const multiplier = mastered ? masteryBonus : 1;

    const cayoPerHour = basePayout * runsPerHour * multiplier;
    activeIncome += cayoPerHour;
  }

  // --- 2.2 Agency / Payphone Hits ---
  if (hasAgency && payphoneUnlocked) {
    const agencyCfg = MODEL_CONFIG.income?.agency || {};
    const hitPayout = agencyCfg.payphoneBase ?? 85000;    // per hit
    const hitsPerHour = agencyCfg.hitsPerHour ?? 3;       // realistic solo
    activeIncome += hitPayout * hitsPerHour;              // ~255k/hr default
  }

  // (Optional) security contracts contribution – minor
  if (hasAgency && securityContracts > 0 && !payphoneUnlocked) {
    activeIncome += 50000; // small filler if player only spams contracts
  }

  // --- 2.3 Acid Lab ---
  if (hasAcidLab) {
    const pCfg = MODEL_CONFIG.income?.passive || {};
    const base = pCfg.acidLabBase ?? 75000;               // /hr
    const upgradeMult = acidLabUpgraded
      ? pCfg.acidLabUpgrade ?? 1.4
      : 1.0;
    passiveIncome += base * upgradeMult;
  }

  // --- 2.4 Nightclub ---
  if (hasNightclub) {
    const pCfg = MODEL_CONFIG.income?.passive || {};
    const maxNc = pCfg.nightclubMax ?? 50000;             // /hr at 5 techs + 5 feeders
    const efficiency = (nightclubTechs / 5) * (nightclubFeeders / 5);
    passiveIncome += maxNc * Math.max(0, Math.min(1, efficiency));
  }

  // --- 2.5 Bunker ---
  if (hasBunker) {
    const pCfg = MODEL_CONFIG.income?.passive || {};
    const base = pCfg.bunkerBase ?? 30000;
    const mult = bunkerUpgraded ? pCfg.bunkerUpgrade ?? 2.5 : 1;
    passiveIncome += base * mult;
  }

  // --- 2.6 Salvage Yard ---
  if (hasSalvageYard && hasTowTruck) {
    const pCfg = MODEL_CONFIG.income?.passive || {};
    passiveIncome += pCfg.salvageYard ?? 35000;
  }

  // --- 2.7 GTA+ Passive Equivalent ---
  let gtaPlusBonusPerHour = 0;
  if (hasGTAPlus) {
    const gCfg = MODEL_CONFIG.income?.gtaPlus || {};
    const monthlyBonus = gCfg.monthlyBonus ?? 500000;
    const avgMonthlyHours = gCfg.avgMonthlyHours ?? 20;

    gtaPlusBonusPerHour = monthlyBonus / avgMonthlyHours; // ~25k/hr
    passiveIncome += gtaPlusBonusPerHour;
  }

  // --- 2.8 DYNAMIC INCOME WITH EVENTS ---
  const dynamicIncome = calculateDynamicIncome(formData);
  
  // Use dynamic income if events are active and boost income
  if (dynamicIncome.isEventBoosted) {
    // Replace static active income with event-boosted income
    const eventBoostedActive = Math.max(
      dynamicIncome.autoShopIncome,
      dynamicIncome.cayoIncome,
      dynamicIncome.agencyIncome
    );
    activeIncome = Math.max(activeIncome, eventBoostedActive);
  }

  const incomePerHour = activeIncome + passiveIncome;

  return {
    activeIncome,
    passiveIncome,
    gtaPlusBonusPerHour,
    incomePerHour,
    dynamicIncome,
  };
};
