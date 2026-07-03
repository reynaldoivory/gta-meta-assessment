// src/views/AssessmentForm/FormActionBar.tsx
// Save, clear, run assessment buttons

import { Save, Trash2 } from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { renderSaveStatus } from './SaveStatus';

interface FormActionBarProps {
  // Header actions
  manualSave: () => void;
  clearSavedData: () => void;
  localStorageAvailable: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  // Footer action
  runAssessment: () => void;
  isCalculating: boolean;
}

export function FormActionBarHeader({
  manualSave,
  clearSavedData,
  localStorageAvailable,
  isSaving,
  lastSaved,
}: Pick<FormActionBarProps, 'manualSave' | 'clearSavedData' | 'localStorageAvailable' | 'isSaving' | 'lastSaved'>) {
  return (
    <div className="text-right">
      <div className="flex justify-end gap-3 mb-3">
        <button
          type="button"
          onClick={manualSave}
          disabled={!localStorageAvailable || isSaving}
          className="btn-secondary text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save progress"
        >
          <Save className="w-4 h-4 inline-block mr-2" /> Save
        </button>
        <button
          type="button"
          onClick={clearSavedData}
          className="px-4 py-2 rounded-xl font-bold text-accent-pink border-2 border-accent-pink/40 bg-accent-pink/10 hover:bg-accent-pink/20 transition-all duration-200 hover:scale-105 text-sm"
          title="Clear all data"
        >
          <Trash2 className="w-4 h-4 inline-block mr-2" /> Clear
        </button>
      </div>
      {renderSaveStatus(localStorageAvailable, isSaving, lastSaved)}
    </div>
  );
}

export function FormActionBarFooter({
  runAssessment,
  isCalculating,
}: Pick<FormActionBarProps, 'runAssessment' | 'isCalculating'>) {
  return (
    <div className="space-y-6 mt-8 pt-6 border-t border-gta-green/30">
      {/* SUBMIT */}
      <button
        type="button"
        onClick={runAssessment}
        disabled={isCalculating}
        className="w-full py-4 bg-gradient-to-r from-gta-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold font-heading rounded-lg shadow-heist transition-transform active:scale-[0.98] text-lg uppercase tracking-widest"
      >
        {isCalculating ? '\u23F3 Analyzing...' : '\uD83C\uDFAF RUN ASSESSMENT'}
      </button>
    </div>
  );
}
