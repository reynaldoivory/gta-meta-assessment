// src/utils/computeAssessment/normalization.ts
// Form data normalization and validation

import { validateStat, validateNumericInput } from '../assessmentHelpers.js';
import type { AssessmentFormData } from '../../types/domain.types';

/**
 * Normalize and validate form inputs into a clean params object.
 *
 * This function sanitizes all form inputs, applies validation rules,
 * and returns a standardized object with consistent types.
 *
 * @param {AssessmentFormData} formData - Raw form data from the assessment form
 * @returns {Object} Normalized parameters object with validated values
 */
export const normalizeFormData = (formData: AssessmentFormData) => {
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
