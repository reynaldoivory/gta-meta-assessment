import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AssessmentFormData } from '../types/domain.types';

export interface AssessmentContextValue {
  formData: AssessmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssessmentFormData>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clearFieldError: (field: string) => void;
  manualSave: () => void;
  localStorageAvailable: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  clearSavedData: () => void;
  runAssessment: () => void;
  results?: any;
  setStep?: (s: string) => void;
  gamification?: any;
  gamificationSummary?: any;
  whatIfText?: string;
  setWhatIfText?: (s: string) => void;
  isCalculating: boolean;
  cascadeTraps: string[];
  criticalTraps: string[];
  hasCriticalTrap: boolean;
}

// Create the Context
const AssessmentContext = createContext<AssessmentContextValue | null>(null);

// Initial Data Helper
const createInitialFormData = (): AssessmentFormData => ({
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

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  // 1. State Initialization
  const [formData, setFormData] = useState<AssessmentFormData>(() => {
    try {
      const saved = localStorage.getItem('gta_assessment_data');
      return saved ? (JSON.parse(saved) as AssessmentFormData) : createInitialFormData();
    } catch (e) {
      console.warn("Failed to load saved data", e);
      return createInitialFormData();
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // 2. Calculated Logic (Traps)
  const cascadeTraps = useMemo(() => {
    const traps: string[] = [];
    if (formData.hasOppressor && !formData.hasTerrorbyte) traps.push('Missiles require Terrorbyte');
    // Add other logic here
    return traps;
  }, [formData]);

  const criticalTraps = useMemo(() => {
    const traps: string[] = [];
    return traps;
  }, [formData]);

  const hasCriticalTrap = criticalTraps.length > 0;

  // 3. Actions
  const clearFieldError = (field: string) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // 4. Context Value
  const value: AssessmentContextValue = {
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

// Custom Hook for easy access
export const useAssessment = (): AssessmentContextValue => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
