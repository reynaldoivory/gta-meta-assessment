// src/context/AssessmentContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

const AssessmentContext = createContext(null);

/**
 * Migration helpers to upgrade old data formats to current version.
 * Each helper mutates and returns the data object for a single migration concern.
 */

/** MIGRATION: Nightclub Feeders (Number) -> Sources (Object) */
const migrateNightclubSources = (migrated) => {
  // If we have a number/string for feeders but no sources object, convert it
  if ((migrated.nightclubFeeders !== undefined && migrated.nightclubFeeders !== '') && 
      (!migrated.nightclubSources || Object.values(migrated.nightclubSources).every(v => v === false))) {
    const feederCount = Number(migrated.nightclubFeeders) || 0;
    
    // The ranking order (Best to Worst income per tech)
    const ORDER = ['imports', 'cargo', 'pharma', 'sporting', 'cash', 'organic', 'printing'];
    
    // Create the new object with all false
    const newSources = {
      imports: false, cargo: false, pharma: false, sporting: false, 
      cash: false, organic: false, printing: false
    };

    // Auto-check the top N businesses based on their old count
    // e.g., if they had 3 feeders, we assume they own the best 3 (Coke, Cargo, Meth)
    for (let i = 0; i < feederCount && i < ORDER.length; i++) {
      newSources[ORDER[i]] = true;
    }

    migrated.nightclubSources = newSources;
    console.log(`✅ Migrated Nightclub: Converted ${feederCount} generic feeders to specific sources:`, newSources);
  }

  // Ensure the nightclubSources object exists even if migration didn't run (for new users)
  if (!migrated.nightclubSources) {
    migrated.nightclubSources = {
      imports: false, cargo: false, pharma: false, sporting: false, 
      cash: false, organic: false, printing: false
    };
  }
  return migrated;
};

/** MIGRATION: hasPounderCustom/hasMuleCustom -> nightclubStorage */
const migrateNightclubStorage = (migrated) => {
  if (!migrated.nightclubStorage) {
    migrated.nightclubStorage = {
      hasPounder: migrated.hasPounderCustom || false,
      hasMule: migrated.hasMuleCustom || false
    };
    if (migrated.hasPounderCustom || migrated.hasMuleCustom) {
      console.log('✅ Migrated Nightclub delivery vehicles to nightclubStorage');
    }
  }
  return migrated;
};

/** MIGRATION: lungCapacity -> stamina (preserve both fields for UI) */
const migrateStamina = (migrated) => {
  if (migrated.lungCapacity !== undefined && migrated.stamina === undefined) {
    migrated.stamina = migrated.lungCapacity;
    console.log('✅ Migrated Lung Capacity → Stamina');
  }
  return migrated;
};

/** MIGRATION: bunkerUpgraded (boolean) -> individual upgrade fields */
const migrateBunkerUpgrades = (migrated) => {
  // If user had bunkerUpgraded=true, populate the new granular fields
  if (migrated.bunkerUpgraded && 
      migrated.bunkerEquipmentUpgrade === undefined && 
      migrated.bunkerStaffUpgrade === undefined) {
    migrated.bunkerEquipmentUpgrade = true;
    migrated.bunkerStaffUpgrade = true;
    // Security upgrade was not tracked before, default to false
    migrated.bunkerSecurityUpgrade = false;
    console.log('✅ Migrated bunkerUpgraded to granular upgrade fields');
  }

  // Ensure bunker upgrade fields exist (for new users or incomplete data)
  if (migrated.bunkerEquipmentUpgrade === undefined) {
    migrated.bunkerEquipmentUpgrade = false;
  }
  if (migrated.bunkerStaffUpgrade === undefined) {
    migrated.bunkerStaffUpgrade = false;
  }
  if (migrated.bunkerSecurityUpgrade === undefined) {
    migrated.bunkerSecurityUpgrade = false;
  }
  return migrated;
};

/** MIGRATION: timePlayed -> timePlayedDays/Hours/Minutes */
const migrateTimePlayedParts = (migrated) => {
  const hasParts = migrated.timePlayedDays !== undefined || migrated.timePlayedHours !== undefined || migrated.timePlayedMinutes !== undefined;
  if (!hasParts && migrated.timePlayed !== undefined && migrated.timePlayed !== '') {
    const totalHours = Number(migrated.timePlayed);
    if (!Number.isNaN(totalHours) && totalHours >= 0) {
      let days = Math.floor(totalHours / 24);
      let remainder = totalHours - days * 24;
      let hours = Math.floor(remainder);
      let minutes = Math.round((remainder - hours) * 60);

      if (minutes === 60) {
        minutes = 0;
        hours += 1;
      }
      if (hours >= 24) {
        days += Math.floor(hours / 24);
        hours = hours % 24;
      }

      migrated.timePlayedDays = days ? String(days) : '';
      migrated.timePlayedHours = hours ? String(hours) : '';
      migrated.timePlayedMinutes = minutes ? String(minutes) : '';
    }
  }

  if (migrated.timePlayedDays === undefined) migrated.timePlayedDays = '';
  if (migrated.timePlayedHours === undefined) migrated.timePlayedHours = '';
  if (migrated.timePlayedMinutes === undefined) migrated.timePlayedMinutes = '';
  return migrated;
};

/** Ensure default fields exist (prevents TypeErrors on deep merge / missing arrays) */
const ensureDefaults = (migrated) => {
  if (!migrated.timePlayedMode) {
    const hasParts = migrated.timePlayedDays !== undefined || migrated.timePlayedHours !== undefined;
    const hasTotal = migrated.timePlayed !== undefined && migrated.timePlayed !== '';
    migrated.timePlayedMode = hasParts ? 'parts' : hasTotal ? 'total' : 'parts';
  }

  if (!migrated.purchaseDates || typeof migrated.purchaseDates !== 'object') {
    migrated.purchaseDates = {
      kosatka: null,
      sparrow: null,
      agency: null,
      nightclub: null,
      acidLab: null,
      bunker: null,
      autoShop: null,
      salvageYard: null,
    };
  }

  if (migrated.lungCapacity === undefined) {
    migrated.lungCapacity = migrated.stamina ?? 0;
  }

  // Clean up legacy Cayo fields from old saves
  delete migrated.cayoCompletions;
  delete migrated.cayoAvgTime;
  delete migrated.cayoHistory;
  delete migrated.lastCayoRun;
  // Ensure new fields have defaults
  if (migrated.hasWeedFarm === undefined) migrated.hasWeedFarm = false;
  if (migrated.hasHeliTours === undefined) migrated.hasHeliTours = false;
  if (migrated.hasArcade === undefined) migrated.hasArcade = false;
  if (migrated.hasArcadeMct === undefined) migrated.hasArcadeMct = false;
  if (migrated.hasTerrorbyte === undefined) migrated.hasTerrorbyte = false;
  if (migrated.hasOppressorMissiles === undefined) migrated.hasOppressorMissiles = false;
  if (migrated.hasBrickade6x6 === undefined) migrated.hasBrickade6x6 = false;
  if (migrated.sellsToStreetDealers === undefined) migrated.sellsToStreetDealers = false;
  if (migrated.dailyStashHouse === undefined) migrated.dailyStashHouse = false;
  if (migrated.dailyGsCache === undefined) migrated.dailyGsCache = false;
  if (migrated.dailySafeCollect === undefined) migrated.dailySafeCollect = false;
  return migrated;
};

/**
 * Migration pipeline to upgrade old data formats to current version.
 * @param {Object} data - Raw data from localStorage
 * @returns {Object} Migrated data with current structure
 */
const migrateUserData = (data) => {
  let migrated = { ...data };
  migrated = migrateNightclubSources(migrated);
  migrated = migrateNightclubStorage(migrated);
  migrated = migrateStamina(migrated);
  migrated = migrateBunkerUpgrades(migrated);
  migrated = migrateTimePlayedParts(migrated);
  migrated = ensureDefaults(migrated);
  return migrated;
};

export const AssessmentProvider = ({ children }) => {
  // 1. Initialize State
  const [formData, setFormData] = useState({
    rank: '', timePlayed: '', timePlayedDays: '', timePlayedHours: '', timePlayedMinutes: '', timePlayedMode: 'parts', liquidCash: '0', 
    totalIncomeCollected: '', totalRPCollected: '',
    strength: 0, flying: 0, shooting: 0, stealth: 0, stamina: 0, driving: 0, lungCapacity: 0,
    hasKosatka: false, hasSparrow: false,
    hasAgency: false, dreContractDone: false, payphoneUnlocked: false, securityContracts: '',
    hasAcidLab: false, acidLabUpgraded: false, 
    hasNightclub: false, 
    nightclubTechs: '', 
    // Detailed tracking for precise Nightclub logistics
    nightclubSources: {
      imports: false,  // Coke (South American Imports)
      cargo: false,    // Hangar/CEO (Cargo & Shipments)
      pharma: false,   // Meth (Pharmaceutical Research)
      sporting: false, // Bunker (Sporting Goods)
      cash: false,     // Cash (Cash Creation)
      organic: false,  // Weed (Organic Produce)
      printing: false  // Docs (Printing & Copying)
    },
    nightclubFloors: '1',
    nightclubStorage: {
      hasPounder: false,
      hasMule: false
    },
    hasSalvageYard: false, hasTowTruck: false,
    hasSafehouse: false, hasRaiju: false, hasOppressor: false, hasOppressorMissiles: false, hasArmoredKuruma: false,
    hasTerrorbyte: false,
    hasBrickade6x6: false,
    hasBunker: false, 
    bunkerUpgraded: false, // Legacy field (kept for backward compatibility)
    bunkerEquipmentUpgrade: false,
    bunkerStaffUpgrade: false,
    bunkerSecurityUpgrade: false,
    hasAutoShop: false,
    hasArcade: false,
    hasArcadeMct: false,
    hasMansion: false,
    mansionType: '',
    hasCarWash: false,
    hasWeedFarm: false,      // Car Wash feeder business
    hasHeliTours: false,     // Car Wash feeder business
    sellsToStreetDealers: false, // Daily street dealer sells
    dailyStashHouse: false,
    dailyGsCache: false,
    dailySafeCollect: false,
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
  });

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
    const oldKeys = ['gta_assessment_draft_v1', 'gta_assessment_draft_v2', 'gta_assessment_draft_v3', 'gta_assessment_draft_v4', 'gtaAssessmentDraft_v1', 'gtaAssessmentDraft_v2', 'gtaAssessmentDraft_v3', 'gtaAssessmentDraft_v4'];
    
    oldKeys.forEach(key => {
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
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('✅ Loaded saved data:', parsed);
        
        // Run all migrations (handles nightclubFeeders -> nightclubSources, etc.)
        const upgradedData = migrateUserData(parsed);
        
        // Save migrated data back if migrations occurred
        if (JSON.stringify(parsed) !== JSON.stringify(upgradedData)) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(upgradedData));
            console.log('💾 Saved migrated data');
          } catch (e) {
            console.warn('Could not save migrated data:', e);
          }
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
    setFormData({
      rank: '', timePlayed: '', timePlayedDays: '', timePlayedHours: '', timePlayedMinutes: '', timePlayedMode: 'parts', liquidCash: '0', 
      totalIncomeCollected: '', totalRPCollected: '',
      strength: 0, flying: 0, shooting: 0, stealth: 0, stamina: 0, driving: 0,
      hasKosatka: false, hasSparrow: false,
      hasAgency: false, dreContractDone: false, payphoneUnlocked: false, securityContracts: '',
      hasAcidLab: false, acidLabUpgraded: false, 
      hasNightclub: false, 
      nightclubTechs: '', 
      nightclubSources: {
        imports: false,
        cargo: false,
        pharma: false,
        sporting: false,
        cash: false,
        organic: false,
        printing: false
      },
      nightclubFloors: '1',
      nightclubStorage: {
        hasPounder: false,
        hasMule: false
      },
      hasSalvageYard: false, hasTowTruck: false,
      hasSafehouse: false, hasRaiju: false, hasOppressor: false, hasArmoredKuruma: false,
      hasOppressorMissiles: false,
      hasTerrorbyte: false,
      hasBrickade6x6: false,
      hasBunker: false, 
      bunkerUpgraded: false,
      bunkerEquipmentUpgrade: false,
      bunkerStaffUpgrade: false,
      bunkerSecurityUpgrade: false,
      hasAutoShop: false,
      hasArcade: false,
      hasArcadeMct: false,
      hasMansion: false,
      mansionType: '',
      hasCarWash: false,
      hasWeedFarm: false,
      hasHeliTours: false,
      sellsToStreetDealers: false,
      dailyStashHouse: false,
      dailyGsCache: false,
      dailySafeCollect: false,
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
    });
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
      ['gta_assessment_draft_v1', 'gta_assessment_draft_v2', 'gta_assessment_draft_v3', 'gta_assessment_draft_v4', 'gtaAssessmentDraft_v1', 'gtaAssessmentDraft_v2', 'gtaAssessmentDraft_v3', 'gtaAssessmentDraft_v4'].forEach(key => {
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
