// src/utils/formValidation.ts
// Form validation utilities – refactored from switch to lookup map

// ======================================================================
// Types & Interfaces
// ======================================================================

export interface FormData {
  [key: string]: unknown;
}

/**
 * A pure validator function.
 * Returns an error message string when invalid, or `null` when valid.
 */
export type ValidationRule = (value: unknown, formData?: FormData) => string | null;

export type ValidatorMap = Record<string, ValidationRule>;

// ======================================================================
// Shared Helpers (private)
// ======================================================================

/**
 * Validate a numeric field with a minimum and optional maximum bound.
 * Returns an error message or `null`.
 */
const _numericRange = (
  value: unknown,
  label: string,
  min: number,
  max?: number,
): string | null => {
  if (!value && value !== 0) return null; // empty / falsy → optional, skip
  const num = Number(value);
  if (Number.isNaN(num)) return `${label} must be a number`;
  if (num < min) return `${label} cannot be negative`;
  if (max !== undefined && num > max) return `${label} must be between ${min}-${max}`;
  return null;
};

// ======================================================================
// Validator Lookup Map
// ======================================================================

const validators: ValidatorMap = {
  rank: (value: unknown): string | null => {
    if (!value && value !== 0) return null;
    const num = Number(value);
    if (Number.isNaN(num) || num < 1 || num > 8000) {
      return 'Rank must be between 1-8000';
    }
    return null;
  },

  liquidCash: (value: unknown): string | null =>
    _numericRange(value, 'Cash', 0),

  totalIncomeCollected: (value: unknown): string | null =>
    _numericRange(value, 'Total income', 0),

  totalRPCollected: (value: unknown): string | null =>
    _numericRange(value, 'Total RP', 0),

  timePlayed: (value: unknown): string | null =>
    _numericRange(value, 'Time played', 0),

  timePlayedDays: (value: unknown): string | null =>
    _numericRange(value, 'Days played', 0),

  timePlayedHours: (value: unknown): string | null => {
    if (!value && value !== 0) return null;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 23) {
      return 'Hours must be between 0-23';
    }
    return null;
  },

  nightclubTechs: (value: unknown): string | null => {
    if (!value && value !== 0) return null;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 5) {
      return 'Technicians must be between 0-5';
    }
    return null;
  },

  nightclubFeeders: (value: unknown): string | null => {
    // Legacy validation – nightclubFeeders is now computed from nightclubSources.
    // Kept for backwards compatibility.
    if (typeof value === 'number' || typeof value === 'string') {
      if (!value && value !== 0) return null;
      const feeders = Number(value);
      if (Number.isNaN(feeders) || feeders < 0 || feeders > 7) {
        return 'Feeder businesses must be between 0-7';
      }
    }
    return null;
  },

  securityContracts: (value: unknown): string | null =>
    _numericRange(value, 'Security contracts', 0),
};

// ======================================================================
// Public API (signatures preserved exactly)
// ======================================================================

/**
 * Validate a single field.
 * @param field  - Field name (key into the validator map)
 * @param value  - Field value
 * @returns Error message or `null` if valid
 */
export const validateField = (
  field: string,
  value: unknown,
): string | null => {
  const validator = validators[field];
  return validator ? validator(value) : null;
};

/**
 * Validate an entire form.
 * @param formData - Form data object with field names as keys
 * @returns Errors object – keys are field names, values are error strings
 */
export const validateForm = (
  formData: FormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const fieldsToValidate: string[] = [
    'rank',
    'liquidCash',
    'totalIncomeCollected',
    'totalRPCollected',
    'timePlayed',
    'timePlayedDays',
    'timePlayedHours',
    'nightclubTechs',
    'nightclubFeeders',
    'securityContracts',
  ];

  for (const field of fieldsToValidate) {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};
