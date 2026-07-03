// src/context/AssessmentProviders.tsx
// Composition wrapper — nests the 3 focused providers in dependency order.
// FormData is outermost because Results depends on it.
import type { ReactNode } from 'react';
import { FormDataProvider } from './FormDataContext';
import { ResultsProvider } from './ResultsContext';
import { GamificationProvider } from './GamificationContext';

export const AssessmentProviders = ({ children }: { children: ReactNode }) => (
  <FormDataProvider>
    <ResultsProvider>
      <GamificationProvider>
        {children}
      </GamificationProvider>
    </ResultsProvider>
  </FormDataProvider>
);
