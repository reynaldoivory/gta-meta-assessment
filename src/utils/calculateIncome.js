// src/utils/calculateIncome.js
// Income calculation logic extracted from computeAssessment.js

import { MODEL_CONFIG } from './modelConfig.js';
import { calculateDynamicIncome } from './dynamicIncome.js';

// ============================================
// 2026 Meta Rates (Dollars per Hour)
// Source: GTA Online After Hours Business Rates
// ============================================
const NC_RATES = {
  imports: 10000,  // Cocaine (South American Imports)
  cargo: 8570,     // CEO/Hangar (Cargo & Shipments)
  pharma: 8500,    // Meth (Pharmaceutical Research)
  sporting: 7500,  // Bunker (Sporting Goods)
  cash: 7000,      // Cash (Cash Creation)
  organic: 4500,   // Weed (Organic Produce) - BAD
  printing: 1500   // Documents (Printing & Copying) - TERRIBLE
};

/**
 * Calculate exact Nightclub passive income using "Exact Stack" method
 * Uses real per-hour rates and smart technician assignment logic
 * @param {Object} formData - Player form data
 * @returns {number} Income per hour in GTA$
 */
export const calculateNightclubIncome = (formData) => {
  // 1. Get Technician Count (max 5)
  const techs = Math.min(5, Number(formData.nightclubTechs) || 0);
  
  // 2. Exact Math (New System) - Uses nightclubSources object
  if (formData.nightclubSources) {
    // Identify which businesses are OWNED (set to true)
    const ownedIds = Object.keys(formData.nightclubSources)
      .filter(key => formData.nightclubSources[key]);

    // Sort owned businesses by value (Highest to Lowest)
    // This simulates "Smart Assignment": techs assigned to best available slots
    const activeAssignment = ownedIds
      .sort((a, b) => NC_RATES[b] - NC_RATES[a])
      .slice(0, techs); // Only take as many as we have techs for

    // Sum the exact rates
    return activeAssignment.reduce((sum, id) => sum + NC_RATES[id], 0);
  }

  // 3. Fallback Math (Old System for legacy data)
  // If user hasn't migrated yet, use efficiency formula matching incomeCalculators.js
  // This ensures consistent values between computeAssessment and trapDetector/prerequisiteEngine
  const oldFeeders = Number(formData.nightclubFeeders) || 0;
  const maxNc = 50000; // MODEL_CONFIG.income.passive.nightclubMax
  const efficiency = (techs / 5) * (Math.min(oldFeeders, 5) / 5);
  return maxNc * Math.max(0, Math.min(1, efficiency));
};

/**
 * Get the NC_RATES for external use (e.g., in UI components)
 */
export const getNightclubRates = () => NC_RATES;

/**
 * Calculate all income sources for a player
 * @param {Object} params - Normalized player data
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
 * @param {boolean} params.hasAutoShop - Owns Auto Shop
 * @param {boolean} params.hasCarWash - Owns Car Wash
 * @param {boolean} params.hasWeedFarm - Owns Weed Farm (Car Wash feeder)
 * @param {boolean} params.hasHeliTours - Owns Helicopter Tours (Car Wash feeder)
 * @param {boolean} params.sellsToStreetDealers - Sells to Street Dealers daily
 * @param {Object} formData - Original form data for dynamic income calculation
 * @returns {Object} Income calculation results
 */
export const calculateIncome = (params, formData) => {
  const {
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
    hasAutoShop,
    hasCarWash,
    hasWeedFarm,
    hasHeliTours,
    sellsToStreetDealers,
  } = params;

  let activeIncome = 0;   // GTA$/hr from active grinding
  let passiveIncome = 0;  // GTA$/hr from businesses + GTA+

  // --- 2.1 Cayo Perico (Kosatka) – one of many active income sources ---
  if (hasKosatka) {
    const config = MODEL_CONFIG.income?.cayo || {};
    const basePayout = config.basePayout ?? 700000;       // avg post-nerf payout
    // Assume ~75 min avg run (prep + heist) for a typical player
    const avgRunTime = 75; // minutes
    const runsPerHour = 60 / avgRunTime;
    activeIncome += basePayout * runsPerHour;             // ~$560k/hr
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

  // --- 2.4 Nightclub (Exact Stack Calculation) ---
  if (hasNightclub) {
    // Use the new exact calculation method
    passiveIncome += calculateNightclubIncome(formData);
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

  // --- 2.7 Car Wash (Passive + Feeders) ---
  if (hasCarWash) {
    const cwCfg = MODEL_CONFIG.income?.carWash || {};
    let carWashIncome = cwCfg.basePerHour ?? 5000;
    if (hasWeedFarm) carWashIncome += cwCfg.weedFarmBonus ?? 10000;
    if (hasHeliTours) carWashIncome += cwCfg.heliToursBonus ?? 8000;
    passiveIncome += carWashIncome;
  }

  // --- 2.8 Street Dealers (Daily Income) ---
  if (sellsToStreetDealers) {
    const sdCfg = MODEL_CONFIG.income?.streetDealers || {};
    const dailyAvg = sdCfg.avgDailyWithPremium ?? 250000;
    const timeMinutes = sdCfg.timeToSellAll ?? 15;
    // Convert daily income to $/hr equivalent (based on time investment)
    const streetDealerPerHour = dailyAvg / (timeMinutes / 60);
    activeIncome += streetDealerPerHour; // ~$1M/hr for 15 min of work
  }

  // --- 2.9 Auto Shop Contracts ---
  if (hasAutoShop) {
    // Union Depository ~$300k for ~30 min = ~$600k/hr. Average contracts ~$400k/hr.
    activeIncome += 400000;
  }

  // --- 2.10 GTA+ Passive Equivalent ---
  let gtaPlusBonusPerHour = 0;
  if (hasGTAPlus) {
    const gCfg = MODEL_CONFIG.income?.gtaPlus || {};
    const monthlyBonus = gCfg.monthlyBonus ?? 500000;
    const avgMonthlyHours = gCfg.avgMonthlyHours ?? 20;

    gtaPlusBonusPerHour = monthlyBonus / avgMonthlyHours; // ~25k/hr
    passiveIncome += gtaPlusBonusPerHour;
  }

  // --- 2.11 DYNAMIC INCOME WITH EVENTS ---
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
