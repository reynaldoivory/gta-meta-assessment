// src/context/AssessmentContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDebounce } from '../utils/useDebounce';
import { computeAssessment } from '../utils/computeAssessment';
import { submitAnonymousStats, submitTrapStats } from '../utils/communityStats';
import { detectTraps, getTrapSummary } from '../utils/trapDetector';
import { saveProgressSnapshot } from '../utils/progressTracker';
import { soundEffects } from '../utils/soundEffects';
import { recordAssessment } from '../utils/streakTracker';

const AssessmentContext = createContext(null);

export const AssessmentProvider = ({ children }) => {
  // 1. Initialize State
  const [formData, setFormData] = useState({
    rank: '', timePlayed: '', liquidCash: '0', 
    strength: 0, flying: 0, shooting: 0, stealth: 0, stamina: 0, driving: 0,
    hasKosatka: false, hasSparrow: false, cayoCompletions: '', cayoAvgTime: '',
    hasAgency: false, dreContractDone: false, payphoneUnlocked: false, securityContracts: '',
    hasAcidLab: false, acidLabUpgraded: false, 
    hasNightclub: false, nightclubTechs: '', nightclubFeeders: '',
    hasSalvageYard: false, hasTowTruck: false,
    hasSafehouse: false, hasRaiju: false, hasOppressor: false, hasArmoredKuruma: false,
    hasBunker: false, bunkerUpgraded: false, hasAutoShop: false,
    hasMansion: false,
    mansionType: '',
    hasCarWash: false,
    claimedFreeCar: false,
    claimedWheelSpin: false,
    hasGTAPlus: false, playMode: 'invite',
    // Purchase date tracking (timestamps)
    purchaseDates: {
      kosatka: null,
      sparrow: null,
      agency: null,
      nightclub: null,
      acidLab: null,
      bunker: null,
      autoShop: null,
      salvageYard: null,
    },
    // Cayo performance history for efficiency decay detection
    cayoHistory: [], // Array of { time: number, date: timestamp }
    lastCayoRun: null, // Timestamp of last completion
  });

  const [results, setResults] = useState(null);
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
    const oldKeys = ['gta_assessment_draft_v1', 'gta_assessment_draft_v2', 'gta_assessment_draft_v3', 'gta_assessment_draft_v4', 'gtaAssessmentDraft_v1', 'gtaAssessmentDraft_v2', 'gtaAssessmentDraft_v3', 'gtaAssessmentDraft_v4'];
    
    oldKeys.forEach(key => {
      try {
        const oldData = localStorage.getItem(key);
        if (oldData && !localStorage.getItem(STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, oldData);
          console.log(`✅ Migrated data from ${key}`);
        }
      } catch (e) {
        // Ignore migration errors
      }
    });
  }, []);

  const debouncedFormData = useDebounce(formData, 1000);

  // Load on Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Loaded saved data:', parsed); // Debug log
        
        // MIGRATION: Convert lungCapacity to stamina if stamina is missing
        if (parsed.lungCapacity !== undefined && parsed.stamina === undefined) {
          parsed.stamina = parsed.lungCapacity; // Carry over the value (0-5)
          delete parsed.lungCapacity;
          console.log('✅ Migrated Lung Capacity → Stamina');
          // Save migrated data back
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch (e) {
            console.warn('Could not save migrated data:', e);
          }
        }
        
        if (parsed.rank || parsed.liquidCash) {
          setFormData(prev => ({ ...prev, ...parsed }));
          setHasDraft(true);
        }
      }
    } catch (e) { 
      console.error("❌ Load failed", e); 
    }
  }, []);

  // Save on Change
  useEffect(() => {
    if (!localStorageAvailable) return;
    
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedFormData));
        setLastSaved(new Date());
        setHasDraft(true);
        setIsSaving(false);
        console.log('💾 Auto-saved to localStorage'); // Debug log
      } catch (e) { 
        console.error('❌ Save failed:', e);
        setIsSaving(false);
        // Storage full or disabled
      }
    }, 1000); // Match debounce delay

    return () => clearTimeout(timer);
  }, [debouncedFormData, localStorageAvailable]);

  // 3. Actions
  const runAssessment = () => {
    // Validation logic could live here or in utils
    setIsCalculating(true);
    try {
      // Small delay to show loading state (prevents flash)
      setTimeout(() => {
        try {
          const calculatedResults = computeAssessment(formData);
          setResults(calculatedResults);
          setStep('results');
          
          // Submit stats and save progress
          submitAnonymousStats(formData, calculatedResults);
          saveProgressSnapshot(formData, calculatedResults);
          recordAssessment(); // Track streak
          
          // Submit trap statistics for community tracking
          const traps = detectTraps(formData, calculatedResults);
          const trapSummary = getTrapSummary(traps);
          submitTrapStats(trapSummary, formData);
          
          // Sound effects
          soundEffects.levelUp();
          if (calculatedResults.score >= 90) {
            soundEffects.achievement();
          }
          setIsCalculating(false);
        } catch (error) {
          console.error('Assessment failed:', error);
          console.error('Error details:', error.message, error.stack);
          console.error('FormData at error:', formData);
          setErrors({ general: `Failed to calculate assessment: ${error.message}. Please check your inputs.` });
          setIsCalculating(false);
        }
      }, 100);
    } catch (error) {
      console.error('Assessment failed:', error);
      setErrors({ general: 'Failed to calculate assessment. Please check your inputs.' });
      setIsCalculating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      rank: '', timePlayed: '', liquidCash: '0', 
      strength: 0, flying: 0, shooting: 0, stealth: 0, stamina: 0, driving: 0,
      hasKosatka: false, hasSparrow: false, cayoCompletions: '', cayoAvgTime: '',
      hasAgency: false, dreContractDone: false, payphoneUnlocked: false, securityContracts: '',
      hasAcidLab: false, acidLabUpgraded: false, 
      hasNightclub: false, nightclubTechs: '', nightclubFeeders: '',
      hasSalvageYard: false, hasTowTruck: false,
      hasSafehouse: false, hasRaiju: false, hasOppressor: false, hasArmoredKuruma: false,
      hasBunker: false, bunkerUpgraded: false, hasAutoShop: false,
      hasMansion: false,
      mansionType: '',
      hasCarWash: false,
      claimedFreeCar: false,
      claimedWheelSpin: false,
      hasGTAPlus: false, playMode: 'invite',
      purchaseDates: {
        kosatka: null,
        sparrow: null,
        agency: null,
        nightclub: null,
        acidLab: null,
        bunker: null,
        autoShop: null,
        salvageYard: null,
      },
      cayoHistory: [],
      lastCayoRun: null,
    });
    setResults(null);
    setStep('form');
    setErrors({});
    setHasDraft(false);
    setLastSaved(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const manualSave = () => {
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
  };

  const clearSavedData = () => {
    if (confirm('⚠️ Clear all saved data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      // Also clear old keys
      ['gta_assessment_draft_v1', 'gta_assessment_draft_v2', 'gta_assessment_draft_v3', 'gta_assessment_draft_v4', 'gtaAssessmentDraft_v1', 'gtaAssessmentDraft_v2', 'gtaAssessmentDraft_v3', 'gtaAssessmentDraft_v4'].forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore
        }
      });
      window.location.reload();
    }
  };

  // Update Cayo history with a new run time for efficiency decay tracking
  const updateCayoHistory = (runTime) => {
    setFormData(prev => {
      const newEntry = {
        time: parseFloat(runTime),
        timestamp: Date.now(),
      };
      
      // Keep only last 50 runs to prevent storage bloat
      const currentHistory = prev.cayoHistory || [];
      const updatedHistory = [...currentHistory, newEntry].slice(-50);
      
      // Calculate new average from history
      const avgTime = updatedHistory.length > 0
        ? (updatedHistory.reduce((sum, entry) => sum + entry.time, 0) / updatedHistory.length).toFixed(1)
        : prev.cayoAvgTime;
      
      return {
        ...prev,
        cayoHistory: updatedHistory,
        lastCayoRun: Date.now(),
        cayoAvgTime: avgTime,
        cayoCompletions: String((Number(prev.cayoCompletions) || 0) + 1),
      };
    });
  };

  return (
    <AssessmentContext.Provider value={{
      formData, setFormData,
      results, setResults,
      step, setStep,
      hasDraft,
      errors, setErrors,
      whatIfText, setWhatIfText,
      isCalculating,
      isSaving,
      updateCayoHistory,
      lastSaved,
      localStorageAvailable,
      runAssessment, resetForm, manualSave, clearSavedData,
      // Version for migration support
      version: 'v5'
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};

// Function declaration for React Fast Refresh compatibility
export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
}
