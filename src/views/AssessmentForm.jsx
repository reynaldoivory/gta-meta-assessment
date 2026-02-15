// src/views/AssessmentForm.jsx - HEIST PLANNING BOARD
// Complete redesign with 12-column grid layout, GTA aesthetics

import { useRef, useMemo } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Save, Trash2 } from 'lucide-react';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
import { AssessmentAssetsPanel } from '../components/shared/AssessmentAssetsPanel';
import { AssessmentVitalsSidebar } from '../components/shared/AssessmentVitalsSidebar';
import { detectTraps, TRAP_SEVERITY } from '../utils/trapDetector';

// HELPER: Format last saved
const formatLastSaved = (date) => {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

const renderSaveStatus = (localStorageAvailable, isSaving, lastSaved) => {
  if (!localStorageAvailable) return <span className="text-xs text-gta-red">⚠️ Private Mode</span>;
  if (isSaving) return <span className="text-xs text-gta-gray animate-pulse">💾 Saving...</span>;
  if (lastSaved) return <span className="text-xs text-gta-green">✓ Saved {formatLastSaved(lastSaved)}</span>;
  return null;
};

const clearFieldError = (name, errors, setErrors) => {
  if (errors?.[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};

const handleCheckboxChange = (name, checked, setFormData, errors, setErrors) => {
  const propertyKey = name.replace('has', '').charAt(0).toLowerCase() + name.replace('has', '').slice(1);
  setFormData(prev => {
    const currentPurchaseDates = prev.purchaseDates || {};
    const newPurchaseDates = { ...currentPurchaseDates };
    if (checked && !newPurchaseDates[propertyKey]) {
      newPurchaseDates[propertyKey] = Date.now();
    }
    return {
      ...prev,
      [name]: checked,
      purchaseDates: newPurchaseDates,
    };
  });
  clearFieldError(name, errors, setErrors);
};

// MAIN FORM COMPONENT
export default function AssessmentForm() {
  const { 
    formData, setFormData, runAssessment, isCalculating,
    isSaving, lastSaved, localStorageAvailable, manualSave, clearSavedData, errors, setErrors
  } = useAssessment();
  const formContainerRef = useRef(null);

  const detectedTraps = useMemo(() => detectTraps(formData), [formData]);
  const criticalTraps = detectedTraps.filter(t => t.severity === TRAP_SEVERITY.CRITICAL);
  const cascadeTraps = detectedTraps.filter(t => t.isCascadeTrap);
  const hasCriticalTrap = criticalTraps.length > 0;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name.startsWith('has')) {
      handleCheckboxChange(name, checked, setFormData, errors, setErrors);
      return;
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    clearFieldError(name, errors, setErrors);
  };

  const handleStatChange = (statKey, value) => {
    setFormData(prev => ({ ...prev, [statKey]: value }));
  };

  return (
    <div className="min-h-screen bg-gta-dark p-4 md:p-8 font-body text-slate-200">
      {/* HEADER: HEIST PLANNING BOARD */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between border-b-2 border-gta-green pb-4">
          <div>
            <h1 className="text-5xl font-bold text-white font-heading tracking-wider">HEIST PLANNING BOARD</h1>
            <p className="text-gta-green text-sm mt-1">↳ Analyze your vitals & assets for operation success</p>
          </div>
          <div className="text-right">
            <div className="flex justify-end gap-3 mb-3">
              <button
                type="button"
                onClick={manualSave}
                disabled={!localStorageAvailable || isSaving}
                className="px-3 py-1 bg-gta-green/20 hover:bg-gta-green/40 border border-gta-green/60 text-gta-green rounded text-xs transition flex items-center gap-1 disabled:opacity-50"
                title="Save progress"
              >
                <Save className="w-3 h-3" /> Save
              </button>
              <button
                type="button"
                onClick={clearSavedData}
                className="px-3 py-1 bg-gta-red/20 hover:bg-gta-red/40 border border-gta-red/60 text-gta-red rounded text-xs transition flex items-center gap-1"
                title="Clear all data"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            {renderSaveStatus(localStorageAvailable, isSaving, lastSaved)}
          </div>
        </div>
      </div>

      {/* WEEKLY BONUS BANNER - Always show with locked state for non-GTA+ users */}
      <div className="max-w-7xl mx-auto">
        <WeeklyBonusBanner hasGTAPlus={formData.hasGTAPlus} />
      </div>

      {/* MAIN 12-COLUMN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6" ref={formContainerRef}>
        
        {/* =========== SIDEBAR (COL-SPAN-4): VITALS =========== */}
        <AssessmentVitalsSidebar
          formData={formData}
          errors={errors}
          handleInputChange={handleInputChange}
          handleStatChange={handleStatChange}
        />

        {/* =========== MAIN (COL-SPAN-8): ASSETS & OPERATIONS =========== */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* ASSETS HEADER */}
          <div className="bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-gta-green rounded-lg p-6 shadow-heist">
            <h2 className="text-xl font-bold text-gta-green font-heading uppercase mb-1">Assets & Operations</h2>
            <p className="text-xs text-gta-gray">Toggle owned properties</p>
          </div>

          <AssessmentAssetsPanel
            formData={formData}
            handleInputChange={handleInputChange}
            setFormData={setFormData}
            cascadeTraps={cascadeTraps}
            criticalTraps={criticalTraps}
            hasCriticalTrap={hasCriticalTrap}
          />

          {/* FOOTER: TIME PLAYED & SUBMIT */}
          <div className="space-y-6 mt-8 pt-6 border-t border-gta-green/30">
            
            {/* TIME PLAYED */}
            <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6">
              <label htmlFor="timePlayed" className="text-xs text-gta-gray font-bold uppercase block mb-2">Total Hours Played</label>
              <input 
                id="timePlayed"
                name="timePlayed"
                type="number"
                placeholder="e.g. 500"
                value={formData.timePlayed || ''}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-gta-green/50 rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white"
              />
              <p className="text-xs text-gta-gray mt-2">Cumulative hours for efficiency calculation</p>
            </div>

            {/* SUBMIT */}
            <button 
              type="button"
              onClick={runAssessment}
              disabled={isCalculating}
              className="w-full py-4 bg-gradient-to-r from-gta-green to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold font-heading rounded-lg shadow-heist transition-transform active:scale-[0.98] text-lg uppercase tracking-widest"
            >
              {isCalculating ? '⏳ Analyzing...' : '🎯 RUN ASSESSMENT'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
