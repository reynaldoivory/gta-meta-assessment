// Helper functions for assessment calculations

/**
 * Convert 0-5 bars to percentage (0-100)
 */
export const barsToPercent = (bars: number | string | undefined) => (Number(bars) / 5) * 100;

/**
 * Validate stat value and convert to percentage
 */
export const validateStat = (statValue: number | string | undefined) => {
  return barsToPercent(Number(statValue) || 0);
};

/**
 * Validate numeric input within min/max bounds
 */
export const validateNumericInput = (value: number | string | undefined, min = 0, max = Infinity) => {
  const num = Number(value) || 0;
  return Math.max(min, Math.min(max, num));
};

