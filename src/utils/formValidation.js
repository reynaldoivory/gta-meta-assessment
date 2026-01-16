// src/utils/formValidation.js
// Form validation utilities

/**
 * Validate a single field
 * @param {string} field - Field name
 * @param {any} value - Field value
 * @returns {string | null} Error message or null if valid
 */
export const validateField = (field, value) => {
  switch (field) {
    case 'rank':
      const rankNum = Number(value);
      if (value && (isNaN(rankNum) || rankNum < 1 || rankNum > 8000)) {
        return 'Rank must be between 1-8000';
      }
      return null;
      
    case 'liquidCash':
      const cashNum = Number(value);
      if (value && (isNaN(cashNum) || cashNum < 0)) {
        return 'Cash cannot be negative';
      }
      return null;
      
    case 'timePlayed':
      const timeNum = Number(value);
      if (value && (isNaN(timeNum) || timeNum < 0)) {
        return 'Time played cannot be negative';
      }
      return null;
      
    case 'cayoCompletions':
      const cayoNum = Number(value);
      if (value && (isNaN(cayoNum) || cayoNum < 0 || cayoNum > 10000)) {
        return 'Cayo completions must be between 0-10000';
      }
      return null;
      
    case 'cayoAvgTime':
      const timeAvg = Number(value);
      if (value && (isNaN(timeAvg) || timeAvg < 30 || timeAvg > 180)) {
        return 'Average time must be between 30-180 minutes';
      }
      return null;
      
    case 'nightclubTechs':
      const techs = Number(value);
      if (value && (isNaN(techs) || techs < 0 || techs > 5)) {
        return 'Technicians must be between 0-5';
      }
      return null;
      
    case 'nightclubFeeders':
      // Legacy validation - nightclubFeeders is now computed from nightclubSources
      // This case is kept for backwards compatibility
      if (typeof value === 'number' || typeof value === 'string') {
        const feeders = Number(value);
        if (value && (isNaN(feeders) || feeders < 0 || feeders > 7)) {
          return 'Feeder businesses must be between 0-7';
        }
      }
      return null;
      
    case 'securityContracts':
      const contracts = Number(value);
      if (value && (isNaN(contracts) || contracts < 0)) {
        return 'Security contracts cannot be negative';
      }
      return null;
      
    default:
      return null;
  }
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @returns {Object} Errors object with field names as keys
 */
export const validateForm = (formData) => {
  const errors = {};
  
  // Validate all numeric fields
  const fieldsToValidate = [
    'rank', 'liquidCash', 'timePlayed', 'cayoCompletions', 
    'cayoAvgTime', 'nightclubTechs', 'nightclubFeeders', 'securityContracts'
  ];
  
  fieldsToValidate.forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};
