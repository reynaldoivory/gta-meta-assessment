// src/context/AssessmentContext.jsx
import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDebounce } from '../utils/useDebounce';
import { computeAssessment } from '../utils/computeAssessment';
import { submitAnonymousStats, submitTrapStats } from '../utils/communityStats';
import { detectTraps, getTrapSummary } from '../utils/trapDetector';
import { saveProgressSnapshot, getProgressHistory } from '../utils/progressTracker';
import { soundEffects } from '../utils/soundEffects';
import { recordAssessment } from '../utils/streakTracker';
import {
  applyAssessmentGamification,
  loadGamificationState,
  GAMIFICATION_STORAGE_KEY,
} from '../utils/gamificationEngine';
import { createInitialFormData, LEGACY_STORAGE_KEYS } from '../utils/assessmentFormDefaults';
import { migrateUserData } from '../utils/assessmentDataMigration';

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  // 1. Initialize State
  const [formData, setFormData] = useState(() => createInitialFormData());

  const [results, setResults] = useState(null);
  const [gamification, setGamification] = useState(() => loadGamificationState());
  const [gamificationSummary, setGamificationSummary] = useState(null);
  const [step, setStep] = useState('form'); // 'form', 'results', 'guide', 'actionPlan'
  const [hasDraft, setHasDraft] = useState(false);
  const [errors, setErrors] = useState({});
  const [whatIfText, setWhatIfText] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
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
        setFormData(prev => ({ 
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
  const assessmentTimerRef = useRef(null);

  // Cleanup assessment timeout on unmount
  useEffect(() => {
    return () => {
      if (assessmentTimerRef.current) {
        clearTimeout(assessmentTimerRef.current);
      }
    };
  }, []);

  const runAssessment = useCallback(() => {
    // Validation logic could live here or in utils
    setIsCalculating(true);
    // Small delay to show loading state (prevents flash)
    assessmentTimerRef.current = setTimeout(() => {
      try {
        const calculatedResults = computeAssessment(formData);
        setResults(calculatedResults);
        setStep('results');
        
        // Submit stats and save progress
        submitAnonymousStats(formData, calculatedResults);
        const progressHistory = getProgressHistory();
        const streakResult = recordAssessment(); // Track streak
        const gamificationResult = applyAssessmentGamification({
          formData,
          results: calculatedResults,
          history: progressHistory,
          streak: streakResult.streak,
        });

        setGamification(gamificationResult.state);
        setGamificationSummary(gamificationResult.summary);
        saveProgressSnapshot(formData, calculatedResults);
        
        // Submit trap statistics for community tracking
        const traps = detectTraps(formData, calculatedResults);
        const trapSummary = getTrapSummary(traps);
        submitTrapStats(trapSummary, formData);
        
        // Sound effects
        soundEffects.levelUp();
        if (calculatedResults.score >= 90) {
          soundEffects.achievement();
        }
      } catch (error) {
        console.error('Assessment failed:', error);
        console.error('Error details:', error.message, error.stack);
        console.error('FormData at error:', formData);
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
    } catch (error) {
      console.error('❌ Manual save failed:', error);
      alert('❌ Failed to save. Check console for details.');
    }
  }, [formData, localStorageAvailable]);

  const clearSavedData = useCallback(() => {
    if (confirm('⚠️ Clear all saved data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(GAMIFICATION_STORAGE_KEY);
      // Also clear old keys
      LEGACY_STORAGE_KEYS.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e);
        }
      });
      globalThis.location.reload();
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
    // Version for migration support
    version: 'v6'
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

AssessmentProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Function declaration for React Fast Refresh compatibility
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
}
