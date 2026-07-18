import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AssessmentFormData } from '../types/domain.types';
import { computeAssessment } from '../utils/computeAssessment';
import { applyAssessmentGamification } from '../utils/gamificationEngine';
import { getProgressHistory } from '../utils/progressTracker';
import { checkStreak } from '../utils/streakTracker';
import { STORAGE_KEYS, getJSON, setJSON, remove } from '../utils/storage/appStorage';
import { TRAP_SEVERITY } from '../utils/trapDetector';
import { useEmpire } from './EmpireContext';
import { deriveAssessmentFlags, mergeDerivedFlags } from '../utils/deriveAssessmentFlags';

export interface CascadeTrap {
  id: string;
  severity: string;
  title: string;
  problem: string;
  solution: string;
  isCascadeTrap: true;
}

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
  results: ReturnType<typeof computeAssessment> | null;
  step: string;
  setStep: (s: string) => void;
  gamification: ReturnType<typeof applyAssessmentGamification>['state'] | null;
  gamificationSummary: ReturnType<typeof applyAssessmentGamification>['summary'] | null;
  whatIfText: string;
  setWhatIfText: (s: string) => void;
  isCalculating: boolean;
  cascadeTraps: CascadeTrap[];
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
  // Business ownership marked in the Property Matrix UI (BusinessMatrixPanel /
  // BusinessCard) lives in EmpireContext, separate from this context's flat
  // formData flags. deriveAssessmentFlags() bridges the two at assessment time.
  const { state: empireState } = useEmpire();

  // 1. State Initialization
  const [formData, setFormData] = useState<AssessmentFormData>(() => {
    const defaults = createInitialFormData();
    // Key-allowlisted, type-checked merge (prototype-pollution guard). Runs
    // inside the storage service's try/catch; returning null falls back to defaults.
    return getJSON<AssessmentFormData>(STORAGE_KEYS.ASSESSMENT_DATA, defaults, (parsed) => {
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      const source = parsed as Record<string, unknown>;
      const allowed = Object.keys(defaults) as (keyof AssessmentFormData)[];
      const safe: Partial<AssessmentFormData> = {};
      for (const key of allowed) {
        if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
        const defaultVal = defaults[key];
        const parsedVal = source[key];
        (safe as Record<string, unknown>)[key as string] =
          typeof parsedVal === typeof defaultVal ? parsedVal : defaultVal;
      }
      return { ...defaults, ...safe } as AssessmentFormData;
    });
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [step, setStep] = useState<string>('form');
  const [results, setResults] = useState<ReturnType<typeof computeAssessment> | null>(null);
  const [gamification, setGamification] = useState<ReturnType<typeof applyAssessmentGamification>['state'] | null>(null);
  const [gamificationSummary, setGamificationSummary] = useState<ReturnType<typeof applyAssessmentGamification>['summary'] | null>(null);
  const [whatIfText, setWhatIfText] = useState<string>('');
  
  // 2. Calculated Logic (Traps)
  const cascadeTraps = useMemo(() => {
    const traps: CascadeTrap[] = [];
    if (formData.hasOppressor && !formData.hasTerrorbyte) {
      traps.push({
        id: 'oppressor-missiles-need-terrorbyte',
        severity: TRAP_SEVERITY.HIGH,
        title: 'Missiles require Terrorbyte',
        problem: 'The Oppressor Mk II\'s homing missiles are locked without a Terrorbyte.',
        solution: 'Buy a Terrorbyte (Nightclub required) to unlock missile use, or acknowledge and continue without them.',
        isCascadeTrap: true,
      });
    }
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
    if (setJSON(STORAGE_KEYS.ASSESSMENT_DATA, formData)) {
      setLastSaved(new Date());
    }
  };

  const clearSavedData = () => {
    remove(STORAGE_KEYS.ASSESSMENT_DATA);
    setFormData(createInitialFormData());
    setResults(null);
    setLastSaved(null);
  };

  const runAssessment = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const derivedFlags = deriveAssessmentFlags(empireState);
        const mergedFormData = mergeDerivedFlags(formData, derivedFlags);

        if (import.meta.env.DEV) {
          console.table(derivedFlags);
        }

        const assessmentResults = computeAssessment(mergedFormData);
        setResults(assessmentResults);

        const history = getProgressHistory();
        // checkStreak() lives in a JS module whose JSDoc declares only `Object`;
        // narrow to the field we read here.
        const streakInfo = checkStreak() as { streak?: number };
        const gamResult = applyAssessmentGamification({
          formData: mergedFormData,
          results: assessmentResults,
          history,
          streak: streakInfo.streak ?? 0,
        });
        setGamification(gamResult.state);
        setGamificationSummary(gamResult.summary);
      } catch (e) {
        console.error("Assessment failed", import.meta.env.DEV ? e : (e instanceof Error ? e.message : 'unknown error'));
      } finally {
        setIsCalculating(false);
        setStep('results');
      }
    }, 0);
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
    results,
    step,
    setStep,
    gamification,
    gamificationSummary,
    whatIfText,
    setWhatIfText,
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
