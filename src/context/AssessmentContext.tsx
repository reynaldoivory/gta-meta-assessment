// src/context/AssessmentContext.tsx
// BACKWARD-COMPATIBLE FACADE
// Wave 2: The monolithic context has been split into 3 focused contexts.
// This file re-exports the composed provider and a unified hook so that
// existing consumers continue to work without any import changes.

import type { ReactNode } from 'react';
import { AssessmentProviders } from './AssessmentProviders';
import { useFormData, type FormDataContextValue } from './FormDataContext';
import { useResults, type ResultsContextValue } from './ResultsContext';
import { useGamification, type GamificationContextValue } from './GamificationContext';

// ── Unified value type (union of all 3 contexts) ───────────────────
export type AssessmentContextValue =
  FormDataContextValue &
  ResultsContextValue &
  GamificationContextValue;

// ── Provider (drop-in replacement for the old AssessmentProvider) ───
export const AssessmentProvider = ({ children }: { children: ReactNode }) => (
  <AssessmentProviders>{children}</AssessmentProviders>
);

// ── Backward-compatible hook ────────────────────────────────────────
// Merges all 3 focused hooks into a single object so that existing
// consumers like AssessmentForm, DevTools, QuickStartGuide, etc.
// continue to work with zero changes.
export const useAssessment = (): AssessmentContextValue => {
  const form = useFormData();
  const results = useResults();
  const gamification = useGamification();
  return { ...form, ...results, ...gamification };
};
