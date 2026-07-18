// Helper functions for assessment calculations

type NumericLike = number | string | null | undefined;

/**
 * Convert 0-5 bars to percentage (0-100)
 */
export const barsToPercent = (bars: NumericLike) => (Number(bars) / 5) * 100;

/**
 * Validate stat value and convert to percentage
 */
export const validateStat = (statValue: NumericLike) => {
  return barsToPercent(Number(statValue) || 0);
};

/**
 * Validate numeric input within min/max bounds
 */
export const validateNumericInput = (value: NumericLike, min = 0, max = Infinity) => {
  const num = Number(value) || 0;
  return Math.max(min, Math.min(max, num));
};

