// src/utils/calculateScore.js
// Score calculation logic extracted from computeAssessment.js

import { MODEL_CONFIG as _MODEL_CONFIG } from './modelConfig.js';
const MODEL_CONFIG = _MODEL_CONFIG;

/**
 * Calculate assessment score and tier based on player data
 * @param {Object} params - Score calculation parameters
 * @param {number} params.activeIncome - Active income per hour
 * @param {number} params.passiveIncome - Passive income per hour
 * @param {number} params.strength - Strength stat (0-100)
 * @param {number} params.flying - Flying stat (0-100)
 * @param {number} params.shooting - Shooting stat (0-100)
 * @param {boolean} params.hasKosatka - Owns Kosatka submarine
 * @param {boolean} params.hasSparrow - Owns Sparrow helicopter
 * @param {boolean} params.hasAgency - Owns Agency
 * @param {boolean} params.hasAcidLab - Owns Acid Lab
 * @param {boolean} params.acidLabUpgraded - Acid Lab is upgraded
 * @param {boolean} params.hasNightclub - Owns Nightclub
 * @param {boolean} params.hasBunker - Owns Bunker
 * @param {boolean} params.bunkerUpgraded - Bunker is upgraded
 * @param {boolean} params.hasSalvageYard - Owns Salvage Yard
 * @param {boolean} params.hasTowTruck - Owns Tow Truck
 * @param {boolean} params.hasRaiju - Owns Raiju
 * @param {boolean} params.hasOppressor - Owns Oppressor
 * @returns {Object} Score calculation results
 */
interface ScoreParams {
  activeIncome: number;
  passiveIncome: number;
  strength: number;
  flying: number;
  shooting: number;
  hasKosatka: boolean;
  hasSparrow: boolean;
  hasAgency: boolean;
  hasAcidLab: boolean;
  acidLabUpgraded: boolean;
  hasNightclub: boolean;
  hasBunker: boolean;
  bunkerUpgraded: boolean;
  hasSalvageYard: boolean;
  hasTowTruck: boolean;
  hasRaiju: boolean;
  hasOppressor: boolean;
}

export const calculateScore = (params: ScoreParams) => { // NOSONAR
  const {
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
  } = params;

  // Config guarantees scoring.weights (see modelConfig.js). No `|| {}` / `?? N`
  // fallbacks: with MODEL_CONFIG no longer cast to `any`, TypeScript now enforces
  // this block exists -- deleting it from config would be a compile error, not a
  // silent fall-through to defaults (the bug this whole change fixes).
  const weights = MODEL_CONFIG.scoring.weights;

  const wActive = weights.activeIncome;
  const wPassive = weights.passiveIncome;
  const wAssets = weights.assets;
  const wStats = weights.stats;

  let score = 0;

  // Active income: $0 → 0, $1M/hr → wActive
  score += Math.min(wActive, (activeIncome / 1000000) * wActive);

  // Passive income: $0 → 0, $200k/hr → wPassive
  score += Math.min(wPassive, (passiveIncome / 200000) * wPassive);

  // Asset score
  let assetScore = 0;
  if (hasKosatka) assetScore += 5;
  if (hasSparrow) assetScore += 3;
  if (hasAgency) assetScore += 3;
  if (hasAcidLab) assetScore += 2;
  if (acidLabUpgraded) assetScore += 2;
  if (hasNightclub) assetScore += 2;
  if (hasBunker) assetScore += 1;
  if (bunkerUpgraded) assetScore += 1;
  if (hasSalvageYard && hasTowTruck) assetScore += 1;
  if (hasRaiju || hasOppressor) assetScore += 2;

  score += Math.min(wAssets, assetScore);

  // Stats: average of key stats scaled to wStats
  const avgCoreStat = (strength + flying + shooting) / 3; // already 0–100
  score += (avgCoreStat / 100) * wStats;

  const finalScore = Math.round(score);

  // Tier mapping
  let tier = 'D';
  let tierColor = 'text-slate-500';

  if (finalScore >= 90) {
    tier = 'S';
    tierColor = 'text-yellow-400';
  } else if (finalScore >= 80) {
    tier = 'A+';
    tierColor = 'text-green-400';
  } else if (finalScore >= 75) {
    tier = 'A';
    tierColor = 'text-green-300';
  } else if (finalScore >= 60) {
    tier = 'B';
    tierColor = 'text-blue-400';
  } else if (finalScore >= 40) {
    tier = 'C';
    tierColor = 'text-purple-400';
  }

  return {
    score: finalScore,
    tier,
    tierColor,
  };
};

