import { MODEL_CONFIG } from './modelConfig.js';

/**
 * Calculate Cayo Perico income per hour
 * @param {number} avgTime - Average run time in minutes
 * @param {number} completions - Total runs completed
 * @returns {number} Income per hour
 */
export const calculateCayoIncome = (avgTime, completions) => {
  const config = MODEL_CONFIG.income?.cayo || {};
  const basePayout = config.basePayout ?? 700000;
  const masteryBonus = config.masteryBonus ?? 1.1;
  const masteryThreshold = config.masteryThreshold ?? 10;
  
  // Convert minutes to hours for per-hour calculation
  const runsPerHour = 60 / avgTime;
  
  // Apply mastery bonus if experienced
  const multiplier = completions >= masteryThreshold ? masteryBonus : 1;
  
  return basePayout * runsPerHour * multiplier;
};

/**
 * Calculate Nightclub efficiency
 * @param {number} techs - Technicians hired (0-5)
 * @param {number} feeders - Linked businesses (0-5)
 * @returns {number} Income per hour
 */
export const calculateNightclubIncome = (techs, feeders) => {
  const pCfg = MODEL_CONFIG.income?.passive || {};
  const maxNc = pCfg.nightclubMax ?? 50000;
  
  // Both need to be maxed for full efficiency
  const efficiency = (techs / 5) * (feeders / 5);
  
  return maxNc * Math.max(0, Math.min(1, efficiency));
};

/**
 * Calculate GTA+ effective hourly rate
 * @param {number} monthlyHours - User's average hours per month (optional)
 * @returns {number} Income per hour
 */
export const calculateGTAPlusIncome = (monthlyHours = null) => {
  const gCfg = MODEL_CONFIG.income?.gtaPlus || {};
  const monthlyBonus = gCfg.monthlyBonus ?? 500000;
  const avgMonthlyHours = gCfg.avgMonthlyHours ?? 20;
  
  // Use custom hours if provided, otherwise use default
  const hours = monthlyHours || avgMonthlyHours;
  
  return monthlyBonus / hours;
};
