// src/context/AssessmentContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { migrateUserData } from '../utils/assessmentDataMigration';
import { createInitialFormData, LEGACY_STORAGE_KEYS } from '../utils/assessmentFormDefaults';
import { submitAnonymousStats, submitTrapStats } from '../utils/communityStats';
import { computeAssessment } from '../utils/computeAssessment';
import {
    applyAssessmentGamification,
    GAMIFICATION_STORAGE_KEY,
    loadGamificationState,
} from '../utils/gamificationEngine';
import { getProgressHistory, saveProgressSnapshot } from '../utils/progressTracker';
import { soundEffects } from '../utils/soundEffects';
import { recordAssessment } from '../utils/streakTracker';
import { detectTraps, getTrapSummary } from '../utils/trapDetector';
import { useDebounce } from '../utils/useDebounce';

// TODO: Import or define these types from your utils or types folder
// import { FormDataType, ResultsType, GamificationState, GamificationSummary } from '../types/assessment.types';

type AssessmentStep = 'form' | 'results' | 'guide' | 'actionPlan';

interface AssessmentContextType {
  formData: any; // TODO: Replace 'any' with FormDataType
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  results: any; // TODO: Replace 'any' with ResultsType
  setResults: React.Dispatch<React.SetStateAction<any>>;
  step: AssessmentStep;
  setStep: React.Dispatch<React.SetStateAction<AssessmentStep>>;
  hasDraft: boolean;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  whatIfText: string;
  setWhatIfText: React.Dispatch<React.SetStateAction<string>>;
  isCalculating: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  localStorageAvailable: boolean;
  gamification: any; // TODO: Replace 'any' with GamificationState
  gamificationSummary: any; // TODO: Replace 'any' with GamificationSummary
  runAssessment: () => void;
  resetForm: () => void;
  manualSave: () => void;
  clearSavedData: () => void;
  version: string;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

interface AssessmentProviderProps {
  children: ReactNode;
}

export const AssessmentProvider: React.FC<AssessmentProviderProps> = ({ children }) => {
  // 1. Initialize State
  const [formData, setFormData] = useState<any>(() => createInitialFormData()); // TODO: type
  const [results, setResults] = useState<any>(null); // TODO: type
  const [gamification, setGamification] = useState<any>(() => loadGamificationState()); // TODO: type
  const [gamificationSummary, setGamificationSummary] = useState<any>(null); // TODO: type
  const [step, setStep] = useState<AssessmentStep>('form');
  const [hasDraft, setHasDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatIfText, setWhatIfText] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [localStorageAvailable, setLocalStorageAvailable] = useState(true);

  // 2. Persistence Logic
  const STORAGE_KEY = 'gtaAssessmentDraft_v5';

  // Test localStorage availability
  useEffect(() => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      setLocalStorageAvailable(true);
    } catch (error) {
      console.error('❌ localStorage not available:', error);
      setLocalStorageAvailable(false);
    }
  }, []);

  // Migrate old storage keys
  useEffect(() => {
    LEGACY_STORAGE_KEYS.forEach(key => {
      try {
        const oldData = localStorage.getItem(key);
        if (oldData && !localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, oldData);
          console.log(`✅ Migrated data from ${key}`);
        }
      } catch (e) {
        console.warn(`Migration from ${key} failed:`, e);
      }
    });
  }, []);

  const debouncedFormData = useDebounce(formData, 1000);

  // Load on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      console.log('✅ Loaded saved data:', parsed);
      
      // Run all migrations (handles nightclubFeeders -> nightclubSources, etc.)
      const upgradedData = migrateUserData(parsed);
      
      // Save migrated data back if migrations occurred
      const didMigrate = JSON.stringify(parsed) !== JSON.stringify(upgradedData);
      if (didMigrate) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(upgradedData));
        console.log('💾 Saved migrated data');
      }
      
      if (upgradedData.rank || upgradedData.liquidCash) {
        // Merge recursively to ensure nested objects don't get overwritten by shallow defaults
        setFormData((prev: any) => ({ 
          ...prev, 
          ...upgradedData,
          // Deep merge nested objects (with fallbacks to prevent spread errors)
          nightclubSources: { ...prev.nightclubSources, ...upgradedData.nightclubSources },
          nightclubStorage: { ...prev.nightclubStorage, ...upgradedData.nightclubStorage },
          purchaseDates: { ...prev.purchaseDates, ...upgradedData.purchaseDates }
        }));
        setHasDraft(true);
      }
    } catch (e) { 
      console.error("❌ Load failed", e); 
    }
  }, []);

  // Save on Change (debounce is already handled by useDebounce above)
  useEffect(() => {
    if (!localStorageAvailable) return;
    
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedFormData));
      setLastSaved(new Date());
      setHasDraft(true);
      console.log('💾 Auto-saved to localStorage');
    } catch (e) { 
      console.error('❌ Save failed:', e);
      // Storage full or disabled
    } finally {
      setIsSaving(false);
    }
  }, [debouncedFormData, localStorageAvailable]);

  // 3. Actions
  const assessmentTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup assessment timeout on unmount
  useEffect(() => {
    return () => {
      if (assessmentTimerRef.current) {
        clearTimeout(assessmentTimerRef.current);
      }
    };
  }, []);

  const runAssessment = useCallback(() => {
    setIsCalculating(true);
    assessmentTimerRef.current = setTimeout(() => {
      try {
        const calculatedResults = computeAssessment(formData);
        setResults(calculatedResults);
        setStep('results');
        submitAnonymousStats(formData, calculatedResults);
        const progressHistory = getProgressHistory();
        const streakResult = recordAssessment();
        const gamificationResult = applyAssessmentGamification({
          formData,
          results: calculatedResults,
          history: progressHistory,
          streak: streakResult.streak,
        });
        setGamification(gamificationResult.state);
        setGamificationSummary(gamificationResult.summary);
        saveProgressSnapshot(formData, calculatedResults);
        const traps = detectTraps(formData, calculatedResults);
        const trapSummary = getTrapSummary(traps);
        submitTrapStats(trapSummary, formData);
        soundEffects.levelUp();
        if (calculatedResults.score >= 90) {
          soundEffects.achievement();
        }
      } catch (error: any) {
        console.error('Assessment failed:', error);
        setErrors({ general: `Failed to calculate assessment: ${error.message}. Please check your inputs.` });
      } finally {
        setIsCalculating(false);
      }
    }, 100);
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(createInitialFormData());
    setResults(null);
    setStep('form');
    setErrors({});
    setHasDraft(false);
    setLastSaved(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const manualSave = useCallback(() => {
    if (!localStorageAvailable) {
      alert('⚠️ Auto-save disabled. Are you in private browsing mode?');
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
      setHasDraft(true);
      console.log('💾 Manual save successful');
    } catch (error: any) {
      console.error('❌ Manual save failed:', error);
      alert('❌ Failed to save. Check console for details.');
    }
  }, [formData, localStorageAvailable]);

  const clearSavedData = useCallback(() => {
    if (confirm('⚠️ Clear all saved data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(GAMIFICATION_STORAGE_KEY);
      LEGACY_STORAGE_KEYS.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e);
        }
      });
      setFormData(createInitialFormData());
      setResults(null);
      setStep('form');
      setErrors({});
      setHasDraft(false);
      setLastSaved(null);
    }
  }, []);

  const contextValue = useMemo(() => ({
    formData, setFormData,
    results, setResults,
    step, setStep,
    hasDraft,
    errors, setErrors,
    whatIfText, setWhatIfText,
    isCalculating,
    isSaving,
    lastSaved,
    localStorageAvailable,
    gamification,
    gamificationSummary,
    runAssessment, resetForm, manualSave, clearSavedData,
    version: 'v6',
  }), [
    formData,
    results,
    step,
    hasDraft,
    errors,
    whatIfText,
    isCalculating,
    isSaving,
    lastSaved,
    localStorageAvailable,
    gamification,
    gamificationSummary,
    runAssessment,
    resetForm,
    manualSave,
    clearSavedData,
  ]);

  return (
    <AssessmentContext.Provider value={contextValue}>
      {children}
    </AssessmentContext.Provider>
  );
};

// Typed hook for context
export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};
