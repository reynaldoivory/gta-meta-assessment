// src/views/AssessmentForm.jsx - HEIST PLANNING BOARD
// Complete redesign with 12-column grid layout, GTA aesthetics

import { useRef, useMemo, useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Save, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
import { BusinessMatrixPanel } from '../components/shared/BusinessMatrixPanel';
import { AssessmentVitalsSidebar } from '../components/shared/AssessmentVitalsSidebar';
import { FinancialWorkbookPanel } from '../components/shared/FinancialWorkbookPanel';
import { EnterpriseFinancialGuidePanel } from '../components/shared/EnterpriseFinancialGuidePanel';
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
  const [openPanels, setOpenPanels] = useState({
    operations: true,
    workbook: false,
    enterpriseGuide: false,
  });

  const togglePanel = (panel) => {
    setOpenPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

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
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-body text-slate-50">
      {/* HEADER: HEIST PLANNING BOARD */}
      <div className="max-w-7xl mx-auto mb-8 animate-pop-in">
        <div className="flex items-center justify-between pb-6 border-b-4 border-gradient-to-r from-primary-purple-500 via-primary-cyan-500 to-primary-orange-500">
          <div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-white mb-2 tracking-tight">
              <span className="heading-gradient-purple">HEIST PLANNING</span>
              <span className="text-primary-orange-400"> BOARD</span>
            </h1>
            <p className="text-primary-cyan-400 text-base font-bold flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              {' '}
              Analyze your vitals & assets for operation success
            </p>
          </div>
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
          <section className="space-y-6">
            <button
              type="button"
              onClick={() => togglePanel('operations')}
              className="w-full bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-gta-green rounded-lg p-6 shadow-heist flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-xl font-bold text-gta-green font-heading uppercase mb-1">Assets & Operations</h2>
                <p className="text-xs text-gta-gray">Contains property matrix, workbook, and ledger.</p>
              </div>
              {openPanels.operations ? (
                <ChevronDown className="w-5 h-5 text-slate-300" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-300" />
              )}
            </button>

            {openPanels.operations && (
              <div className="space-y-6">
                <BusinessMatrixPanel
                  cascadeTraps={cascadeTraps}
                  criticalTraps={criticalTraps}
                  hasCriticalTrap={hasCriticalTrap}
                />

                <section className="bg-gta-panel border border-gta-green/30 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => togglePanel('workbook')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div>
                      <h3 className="text-sm font-bold uppercase text-gta-green">Financial Workbook</h3>
                      <p className="text-xs text-gta-gray mt-1">Hidden by default for a cleaner load view.</p>
                    </div>
                    {openPanels.workbook ? (
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  {openPanels.workbook && (
                    <div className="mt-4">
                      <FinancialWorkbookPanel
                        formData={formData}
                        setFormData={setFormData}
                      />
                    </div>
                  )}
                </section>

                <section className="bg-gta-panel border border-gta-green/30 rounded-lg p-4">
                  <button
                    type="button"
                    onClick={() => togglePanel('enterpriseGuide')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div>
                      <h3 className="text-sm font-bold uppercase text-gta-green">📊 VIEW LEDGER</h3>
                      <p className="text-xs text-gta-gray mt-1">Open CFO Mode financial sheets and heat controls.</p>
                    </div>
                    {openPanels.enterpriseGuide ? (
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  {openPanels.enterpriseGuide && (
                    <div className="mt-4">
                      <EnterpriseFinancialGuidePanel
                        formData={formData}
                        setFormData={setFormData}
                      />
                    </div>
                  )}
                </section>
              </div>
            )}
          </section>

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
