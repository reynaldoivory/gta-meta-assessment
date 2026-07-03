import { MODEL_CONFIG } from './modelConfig.ts';

/**
 * Calculate Cayo Perico income per hour
 */
export const calculateCayoIncome = (avgTime: number, completions: number): number => {
  const config = MODEL_CONFIG.income.cayo;
  const basePayout = config.basePayout;
  const masteryBonus = config.masteryBonus;
  const masteryThreshold = config.masteryThreshold;

  // Convert minutes to hours for per-hour calculation
  const runsPerHour = 60 / avgTime;

  // Apply mastery bonus if experienced
  const multiplier = completions >= masteryThreshold ? masteryBonus : 1;

  return basePayout * runsPerHour * multiplier;
};

/**
 * Calculate Nightclub efficiency (LEGACY/SIMPLE VERSION)
 *
 * NOTE: This is the simplified calculation used for trap detection and prerequisite checks.
 * For exact passive income calculation with per-business rates, use the function
 * in calculateIncome.ts which takes formData and uses NC_RATES for precise math.
 */
export const calculateNightclubIncome = (techs: number, feeders: number): number => {
  const maxNc = MODEL_CONFIG.income.passive.nightclubMax;

  // Both need to be maxed for full efficiency
  // This uses a simplified efficiency calculation
  const efficiency = (techs / 5) * (Math.min(feeders, 5) / 5);

  return maxNc * Math.max(0, Math.min(1, efficiency));
};

/**
 * Calculate GTA+ effective hourly rate
 */
export const calculateGTAPlusIncome = (monthlyHours: number | null = null): number => {
  const monthlyBonus = MODEL_CONFIG.income.gtaPlus.monthlyBonus;
  const avgMonthlyHours = MODEL_CONFIG.income.gtaPlus.avgMonthlyHours;

  // Use custom hours if provided, otherwise use default
  const hours = monthlyHours || avgMonthlyHours;

  return monthlyBonus / hours;
};
