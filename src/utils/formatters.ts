/**
 * Shared formatting utilities.
 * Single source of truth -- do not redefine these in components.
 */

/** Format a number as locale string (no dollar sign). Returns '' for empty/NaN. */
export const formatCurrency = (value: string | number): string => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('en-US');
};

/** Format a number as dollar string ($X,XXX). Returns '$0' for falsy/NaN. */
export const formatDollars = (value: string | number): string => {
  return `$${(Number(value) || 0).toLocaleString()}`;
};

/** Format hours with smart decimal places: integers stay whole, decimals get 2 places. */
export const formatHours = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

/** Format hours with 1 decimal place (form display). */
export const formatHoursShort = (value: number): string => {
  return Number(value).toFixed(1);
};
