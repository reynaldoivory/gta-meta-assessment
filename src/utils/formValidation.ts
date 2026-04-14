// src/utils/formValidation.js
// Form validation utilities


/**
 * Helper to validate a number field with min/max constraints.
 * @param {any} value - The value to check
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value (optional)
 * @param {string} msg - Error message if invalid
 * @returns {string|null}
 */
function validateNumber(value: string | number | undefined, min: number, max: number | undefined, msg: string): string | null {
  const num = Number(value);
  if (value && (Number.isNaN(num) || num < min || (typeof max === 'number' && num > max))) {
    return msg;
  }
  return null;
}

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {string | null} Error message or null if valid
 */
export const validateField = (field: string, value: string | number | undefined): string | null => {
  switch (field) {
    case 'rank':
      return validateNumber(value, 1, 8000, 'Rank must be between 1-8000');
    case 'liquidCash':
      return validateNumber(value, 0, undefined, 'Cash cannot be negative');
    case 'totalIncomeCollected':
      return validateNumber(value, 0, undefined, 'Total income cannot be negative');
    case 'totalRPCollected':
      return validateNumber(value, 0, undefined, 'Total RP cannot be negative');
    case 'timePlayed':
      return validateNumber(value, 0, undefined, 'Time played cannot be negative');
    case 'timePlayedDays':
      return validateNumber(value, 0, undefined, 'Days played cannot be negative');
    case 'timePlayedHours':
      return validateNumber(value, 0, 23, 'Hours must be between 0-23');
    case 'nightclubTechs':
      return validateNumber(value, 0, 5, 'Technicians must be between 0-5');
    case 'nightclubFeeders':
      // Legacy validation - nightclubFeeders is now computed from nightclubSources
      // This case is kept for backwards compatibility
      if (typeof value === 'number' || typeof value === 'string') {
        return validateNumber(value, 0, 7, 'Feeder businesses must be between 0-7');
      }
      return null;
    case 'securityContracts':
      return validateNumber(value, 0, undefined, 'Security contracts cannot be negative');
    default:
      return null;
  }
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @returns {Object} Errors object with field names as keys
 */
export const validateForm = (formData: Record<string, string | number | undefined>): Record<string, string> => {
  const errors: Record<string, string> = {};
  const fieldsToValidate = [
    'rank', 'liquidCash', 'totalIncomeCollected', 'totalRPCollected', 'timePlayed', 'timePlayedDays', 'timePlayedHours',
    'nightclubTechs', 'nightclubFeeders', 'securityContracts'
  ];
  for (const field of fieldsToValidate) {
    const error = validateField(field, formData[field]);
    if (error) errors[field] = error;
  }
  return errors;
};
