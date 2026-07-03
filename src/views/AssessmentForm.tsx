// src/views/AssessmentForm.tsx - HEIST PLANNING BOARD
// Thin orchestrator composing VitalsSection, AssetsSection, and FormActionBar

import { useRef, useState } from 'react';
import { formatNumber } from '@gta-projects/ui';
import { useAssessment } from '../context/AssessmentContext';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
import { VitalsSection } from './AssessmentForm/VitalsSection';
import { AssetsSection } from './AssessmentForm/AssetsSection';
import { FormActionBarHeader } from './AssessmentForm/FormActionBar';

export default function AssessmentForm() {
  // 1. Context
  const {
    formData, setFormData, errors, setErrors, clearFieldError,
    manualSave, localStorageAvailable, isSaving, lastSaved, clearSavedData,
    runAssessment, isCalculating,
    cascadeTraps, criticalTraps, hasCriticalTrap
  } = useAssessment();

  // 2. Local State
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [openPanels, setOpenPanels] = useState({ operations: true, workbook: false });
  const [timePlayedMode, setTimePlayedMode] = useState('total');

  // 3. Helpers
  const togglePanel = (panel: keyof typeof openPanels) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };
  const formatCurrency = (val: string | number) => Number(val).toLocaleString();
  const formatHours = (val: string | number) => Number(val).toFixed(1);
  const errorBorder = (errs: Record<string, string>, field: string) => errs?.[field] ? 'border-gta-red' : 'border-slate-700';
  const errorBorderSimple = (errs: Record<string, string>, field: string) => errs?.[field] ? 'border-gta-red' : 'border-slate-700';

  // 4. Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; type: string; checked: boolean; value?: string } }) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) clearFieldError(name);
  };

  const handleStatChange = (key: string, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTimePlayedPartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimePlayedTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        timePlayed: '',
        timePlayedDays: '',
        timePlayedHours: '',
        timePlayedMinutes: '',
        timePlayedMode: 'total',
      }));
      clearFieldError('timePlayed');
      return;
    }

    const parsed = Number(value);
    const rounded = Number.isNaN(parsed) ? '' : String(Math.max(0, Math.round(parsed)));

    setFormData(prev => ({
      ...prev,
      timePlayed: rounded,
      timePlayedDays: '',
      timePlayedHours: '',
      timePlayedMinutes: '',
      timePlayedMode: 'total',
    }));

    clearFieldError('timePlayed');
  };

  const handleTimePlayedModeChange = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      timePlayedMode: mode,
      timePlayed: mode === 'parts' ? '' : prev.timePlayed,
      timePlayedDays: mode === 'total' ? '' : prev.timePlayedDays,
      timePlayedHours: mode === 'total' ? '' : prev.timePlayedHours,
      timePlayedMinutes: '',
    }));

    clearFieldError('timePlayed');
  };

  const handleTimePlayedModeFocus = (mode: string) => {
    setFormData(prev => {
      const hasParts = (prev.timePlayedDays !== undefined && prev.timePlayedDays !== '') ||
        (prev.timePlayedHours !== undefined && prev.timePlayedHours !== '');
      const hasTotal = prev.timePlayed !== undefined && prev.timePlayed !== '';

      if (mode === 'parts' && hasTotal && !hasParts) {
        return { ...prev, timePlayedMode: mode };
      }
      if (mode === 'total' && hasParts && !hasTotal) {
        return { ...prev, timePlayedMode: mode };
      }

      return prev;
    });
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
              <span className="text-2xl">{'\uD83C\uDFAF'}</span>
              {' '}
              Analyze your vitals & assets for operation success
            </p>
          </div>
          <FormActionBarHeader
            manualSave={manualSave}
            clearSavedData={clearSavedData}
            localStorageAvailable={localStorageAvailable}
            isSaving={isSaving}
            lastSaved={lastSaved}
          />
        </div>
      </div>

      {/* WEEKLY BONUS BANNER */}
      <div className="max-w-7xl mx-auto">
        <WeeklyBonusBanner hasGTAPlus={formData.hasGTAPlus} />
      </div>

      {/* MAIN 12-COLUMN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6" ref={formContainerRef}>

        <VitalsSection
          formData={formData}
          errors={errors}
          timePlayedMode={timePlayedMode}
          handleInputChange={handleInputChange}
          handleStatChange={handleStatChange}
          handleTimePlayedPartChange={handleTimePlayedPartChange}
          handleTimePlayedTotalChange={handleTimePlayedTotalChange}
          handleTimePlayedModeChange={handleTimePlayedModeChange}
          handleTimePlayedModeFocus={handleTimePlayedModeFocus}
          formatCurrency={formatCurrency}
          formatHours={formatHours}
          errorBorder={errorBorder}
          errorBorderSimple={errorBorderSimple}
        />

        <AssetsSection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          openPanels={openPanels}
          togglePanel={togglePanel}
          handleInputChange={handleInputChange}
          cascadeTraps={cascadeTraps}
          criticalTraps={criticalTraps}
          hasCriticalTrap={hasCriticalTrap}
          errorBorder={errorBorder}
          runAssessment={runAssessment}
          isCalculating={isCalculating}
        />
      </div>

    </div>
  );
}
