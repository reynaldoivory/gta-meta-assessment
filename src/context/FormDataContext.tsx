// src/context/FormDataContext.tsx
// Focused context for form state: data entry, validation, persistence.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AssessmentFormData } from '../types/domain.types';

// ── Public value shape ──────────────────────────────────────────────
export interface FormDataContextValue {
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
  cascadeTraps: string[];
  criticalTraps: string[];
  hasCriticalTrap: boolean;
}

// ── Context ─────────────────────────────────────────────────────────
const FormDataContext = createContext<FormDataContextValue | null>(null);

// ── Initial data helper ─────────────────────────────────────────────
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
  hasBrickade6x6: false,
});

const STORAGE_KEY = 'gta_assessment_data';

// ── Provider ────────────────────────────────────────────────────────
export const FormDataProvider = ({ children }: { children: ReactNode }) => {
  // State
  const [formData, setFormData] = useState<AssessmentFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as AssessmentFormData) : createInitialFormData();
    } catch {
      return createInitialFormData();
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Cascade / critical trap detection
  const cascadeTraps = useMemo(() => {
    const traps: string[] = [];
    if (formData.hasOppressor && !formData.hasTerrorbyte) traps.push('Missiles require Terrorbyte');
    return traps;
  }, [formData]);

  const criticalTraps = useMemo<string[]>(() => [], [formData]); // eslint-disable-line react-hooks/exhaustive-deps
  const hasCriticalTrap = criticalTraps.length > 0;

  // Actions
  const clearFieldError = (field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const manualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setLastSaved(new Date());
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(createInitialFormData());
    setLastSaved(null);
  };

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => { manualSave(); }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const value: FormDataContextValue = {
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
    cascadeTraps,
    criticalTraps,
    hasCriticalTrap,
  };

  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
};

// ── Hook ────────────────────────────────────────────────────────────
export const useFormData = (): FormDataContextValue => {
  const ctx = useContext(FormDataContext);
  if (!ctx) throw new Error('useFormData must be used within a FormDataProvider');
  return ctx;
};
