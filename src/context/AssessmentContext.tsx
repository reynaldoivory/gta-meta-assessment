import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Create the Context
const AssessmentContext = createContext(null);

// Initial Data Helper
const createInitialFormData = () => ({
  // Vitals
  liquidCash: '',
  totalRPCollected: '',
  totalIncomeCollected: '',
  timePlayed: '',
  timePlayedDays: '',
  timePlayedHours: '',
  timePlayedMode: 'total', 
  // Stats
  stamina: 0,
  shooting: 0,
  strength: 0,
  stealth: 0,
  flying: 0,
  driving: 0,
  lungCapacity: 0,
  // Assets
  hasAgency: false,
  dreContractDone: false,
  payphoneUnlocked: false,
  securityContracts: '',
  hasArcade: false,
  hasArcadeMct: false,
  hasMansion: false,
  mansionType: '',
  hasCarWash: false,
  hasWeedFarm: false,
  hasHeliTours: false,
  hasGTAPlus: false,
  // Daily
  dailyStashHouse: false,
  dailyGsCache: false,
  dailySafeCollect: false,
  // Vehicles
  hasOppressor: false,
  hasTerrorbyte: false,
  hasOppressorMissiles: false,
  hasRaiju: false,
  hasArmoredKuruma: false,
  hasBrickade6x6: false
});

export const AssessmentProvider = ({ children }) => {
  // 1. State Initialization
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('gta_assessment_data');
      return saved ? JSON.parse(saved) : createInitialFormData();
    } catch (e) {
      console.warn("Failed to load saved data", e);
      return createInitialFormData();
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // 2. Calculated Logic (Traps)
  const cascadeTraps = useMemo(() => {
    const traps = [];
    if (formData.hasOppressor && !formData.hasTerrorbyte) traps.push('Missiles require Terrorbyte');
    // Add other logic here
    return traps;
  }, [formData]);

  const criticalTraps = useMemo(() => {
    return [];
  }, [formData]);

  const hasCriticalTrap = criticalTraps.length > 0;

  // 3. Actions
  const clearFieldError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const manualSave = () => {
    try {
      localStorage.setItem('gta_assessment_data', JSON.stringify(formData));
      setLastSaved(new Date());
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem('gta_assessment_data');
    setFormData(createInitialFormData());
    setLastSaved(null);
  };

  const runAssessment = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      console.log("Assessment Complete", formData);
    }, 1500);
  };

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      manualSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // 4. Context Value
  const value = {
    formData,
    setFormData,
    errors,
    setErrors,
    clearFieldError,
    manualSave,
    localStorageAvailable: true,
    isSaving: false,
    lastSaved,
    clearSavedData,
    runAssessment,
    isCalculating,
    cascadeTraps,
    criticalTraps,
    hasCriticalTrap
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};

AssessmentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom Hook for easy access
export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
