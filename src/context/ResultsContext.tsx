// src/context/ResultsContext.tsx
// Focused context for assessment results, navigation step, and what-if analysis.
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AssessmentResult } from '../types/domain.types';
import { useFormData } from './FormDataContext';

// ── Public value shape ──────────────────────────────────────────────
export interface ResultsContextValue {
  results: AssessmentResult | null;
  isCalculating: boolean;
  runAssessment: () => void;
  step: string;
  setStep: (s: string) => void;
  version: string;
  whatIfText: string;
  setWhatIfText: (s: string) => void;
}

// ── Context ─────────────────────────────────────────────────────────
const ResultsContext = createContext<ResultsContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────
export const ResultsProvider = ({ children }: { children: ReactNode }) => {
  const { formData } = useFormData();

  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [step, setStep] = useState('form');
  const [whatIfText, setWhatIfText] = useState('');

  const version = '2.0.0';

  const runAssessment = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      console.log('Assessment Complete', formData);
      // NOTE: real calculation populates setResults() — wired by the assessment engine
    }, 1500);
  };

  const value: ResultsContextValue = {
    results,
    isCalculating,
    runAssessment,
    step,
    setStep,
    version,
    whatIfText,
    setWhatIfText,
  };

  return <ResultsContext.Provider value={value}>{children}</ResultsContext.Provider>;
};

// ── Hook ────────────────────────────────────────────────────────────
export const useResults = (): ResultsContextValue => {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used within a ResultsProvider');
  return ctx;
};
