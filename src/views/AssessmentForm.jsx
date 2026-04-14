
// src/views/AssessmentForm.jsx - HEIST PLANNING BOARD
// Complete redesign with 12-column grid layout, GTA aesthetics

import { useRef, useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Save, Trash2, ChevronDown, ChevronRight, Check } from 'lucide-react';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
import { BusinessMatrixPanel } from '../components/shared/BusinessMatrixPanel';
import { AssessmentVitalsSidebar } from '../components/shared/AssessmentVitalsSidebar';
import { FinancialWorkbookPanel } from '../components/shared/FinancialWorkbookPanel';
import { AssetToggleCard } from '../components/shared/AssetToggleCard';
import StatBar from '../components/shared/StatBar';
import { formatCurrency, formatHoursShort as formatHours } from '../utils/formatters';

export default function AssessmentForm() {
  // 1. Destructure all data/functions needed from your Context
  const {
    formData, setFormData, errors, setErrors, clearFieldError,
    manualSave, localStorageAvailable, isSaving, lastSaved, clearSavedData,
    runAssessment, isCalculating,
    cascadeTraps, criticalTraps, hasCriticalTrap
  } = useAssessment();

  // 2. Local State definitions
  const formContainerRef = useRef(null);
  const [openPanels, setOpenPanels] = useState({ operations: true, workbook: false });
  const timePlayedMode = formData.timePlayedMode || 'total';

  // 3. Helpers
  const togglePanel = (panel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };
  const errorBorder = (errs, field) => errs?.[field] ? 'border-gta-red' : 'border-slate-700';

  // 4. Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) clearFieldError(name, errors, setErrors);
  };

  const handleStatChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTimePlayedPartChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculated values for display
  const timePlayedHasParts = (formData.timePlayedDays || formData.timePlayedHours);
  const timePlayedTotal = formData.timePlayed || 0;

  const handleTimePlayedTotalChange = (e) => {
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
      clearFieldError('timePlayed', errors, setErrors);
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

    clearFieldError('timePlayed', errors, setErrors);
  };

  const handleTimePlayedModeChange = (mode) => {
    setFormData(prev => ({
      ...prev,
      timePlayedMode: mode,
      timePlayed: mode === 'parts' ? '' : prev.timePlayed,
      timePlayedDays: mode === 'total' ? '' : prev.timePlayedDays,
      timePlayedHours: mode === 'total' ? '' : prev.timePlayedHours,
      timePlayedMinutes: '',
    }));

    clearFieldError('timePlayed', errors, setErrors);
  };

  const handleTimePlayedModeFocus = (mode) => {
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
            {!localStorageAvailable ? (
              <span className="text-xs text-amber-400">Storage unavailable</span>
            ) : isSaving ? (
              <span className="text-xs text-slate-400">Saving...</span>
            ) : lastSaved ? (
              <span className="text-xs text-emerald-400">Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            ) : null}
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
            
            <div>
              <label htmlFor="liquidCash" className="text-xs text-gta-gray font-bold uppercase block mb-2">Available Cash</label>
              <div className="relative">
                <input 
                  id="liquidCash"
                  name="liquidCash" 
                  type="number" 
                  placeholder="0"
                  value={formData.liquidCash || ''} 
                  onChange={handleInputChange}
                  className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors ${formData.liquidCash && formData.liquidCash !== '0' ? 'text-transparent' : 'text-white'} ${errorBorder(errors, 'liquidCash')}`}
                />
                {formData.liquidCash && formData.liquidCash !== '0' && !errors?.liquidCash && (
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gta-green font-mono text-lg">$ {formatCurrency(formData.liquidCash)}</div>
                )}
              </div>
              {errors?.liquidCash && <p className="text-xs text-gta-red mt-1">💢 {errors.liquidCash}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="totalRPCollected" className="text-xs text-gta-gray font-bold uppercase block mb-2">Total RP (lifetime)</label>
                <div className="relative">
                  <input
                    id="totalRPCollected"
                    name="totalRPCollected"
                    type="number"
                    placeholder="0"
                    value={formData.totalRPCollected || ''}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors ${formData.totalRPCollected && formData.totalRPCollected !== '0' ? 'text-transparent' : 'text-white'} ${errorBorder(errors, 'totalRPCollected')}`}
                  />
                  {formData.totalRPCollected && formData.totalRPCollected !== '0' && !errors?.totalRPCollected && (
                    <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-purple-400 font-mono text-sm">{formatCurrency(formData.totalRPCollected)} RP</div>
                  )}
                </div>
                {errors?.totalRPCollected && <p className="text-xs text-gta-red mt-1">💢 {errors.totalRPCollected}</p>}
              </div>
              <div>
                <label htmlFor="totalIncomeCollected" className="text-xs text-gta-gray font-bold uppercase block mb-2">Total Income (lifetime)</label>
                <div className="relative">
                  <input
                    id="totalIncomeCollected"
                    name="totalIncomeCollected"
                    type="number"
                    placeholder="0"
                    value={formData.totalIncomeCollected || ''}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors ${formData.totalIncomeCollected && formData.totalIncomeCollected !== '0' ? 'text-transparent' : 'text-white'} ${errorBorder(errors, 'totalIncomeCollected')}`}
                  />
                  {formData.totalIncomeCollected && formData.totalIncomeCollected !== '0' && !errors?.totalIncomeCollected && (
                    <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gta-green font-mono text-sm">$ {formatCurrency(formData.totalIncomeCollected)}</div>
                  )}
                </div>
                {errors?.totalIncomeCollected && <p className="text-xs text-gta-red mt-1">💢 {errors.totalIncomeCollected}</p>}
              </div>
            </div>
            <div className="text-[11px] text-gta-gray">
              Find these in Stats → Career Progress (Lifetime Stats). Used for efficiency comparisons.
            </div>

            <div>
              <label htmlFor="timePlayedDays" className="text-xs text-gta-gray font-bold uppercase block mb-2">
                Total Hours Played
              </label>
              <p className="text-[11px] text-gta-gray mb-2">Cumulative time, used for efficiency calculation.</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleTimePlayedModeChange('parts')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${timePlayedMode === 'parts'
                    ? 'bg-gta-green/20 border-gta-green/60 text-gta-green'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                >
                  Days + Hours
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePlayedModeChange('total')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${timePlayedMode === 'total'
                    ? 'bg-gta-green/20 border-gta-green/60 text-gta-green'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                >
                  Total Hours
                </button>
              </div>
              {timePlayedMode === 'parts' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="timePlayedDays" className="text-[11px] text-gta-gray font-bold uppercase block mb-1">Days</label>
                    <input
                      id="timePlayedDays"
                      name="timePlayedDays"
                      type="number"
                      placeholder="0"
                      value={formData.timePlayedDays || ''}
                      onChange={handleTimePlayedPartChange}
                      onFocus={() => handleTimePlayedModeFocus('parts')}
                      className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorder(errors, 'timePlayed')}`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="timePlayedHours" className="text-[11px] text-gta-gray font-bold uppercase block mb-1">Hours</label>
                    <input
                      id="timePlayedHours"
                      name="timePlayedHours"
                      type="number"
                      placeholder="0"
                      value={formData.timePlayedHours || ''}
                      onChange={handleTimePlayedPartChange}
                      onFocus={() => handleTimePlayedModeFocus('parts')}
                      className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorder(errors, 'timePlayed')}`}
                      min="0"
                      max="23"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="timePlayed" className="text-[11px] text-gta-gray font-bold uppercase block mb-1">Total Hours (rounded)</label>
                  <input
                    id="timePlayed"
                    name="timePlayed"
                    type="number"
                    placeholder="e.g. 142"
                    value={formData.timePlayed || ''}
                    onChange={handleTimePlayedTotalChange}
                    onFocus={() => handleTimePlayedModeFocus('total')}
                    className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorder(errors, 'timePlayed')}`}
                    min="0"
                    step="0.1"
                  />
                </div>
              )}
              <div className="text-xs text-gta-gray mt-2">
                Total (rounded): <span className="text-slate-200">{timePlayedHasParts || formData.timePlayed ? formatHours(timePlayedTotal) : '—'}</span> hours
              </div>
              {errors?.timePlayed ? (
                <p className="text-xs text-gta-red mt-1">💢 {errors.timePlayed}</p>
              ) : (
                <p className="text-xs text-gta-gray mt-1">Use days + hours from the GTA stats screen, or enter total hours directly.</p>
              )}
            </div>
          </div>

          {/* STATS BARS */}
          <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
            {[
              { label: 'Stamina', key: 'stamina' },
              { label: 'Shooting', key: 'shooting' },
              { label: 'Strength', key: 'strength' },
              { label: 'Stealth', key: 'stealth' },
              { label: 'Flying', key: 'flying' },
              { label: 'Driving', key: 'driving' },
              { label: 'Lung Capacity', key: 'lungCapacity' },
            ].map(stat => {
              const statKey = stat.key;
              return (
                <div key={stat.label}>
                  <StatBar 
                    label={stat.label} 
                    value={formData[statKey] || 0} 
                    onChange={(val) => handleStatChange(statKey, val)}
                  />
                  {errors?.[statKey] && <p className="text-xs text-gta-red mt-1 ml-1">{errors[statKey]}</p>}
                </div>
              );
            })}
          </div>

          {/* GTA+ STATUS */}
          <div className={`border-2 rounded-lg p-4 transition-all ${formData.hasGTAPlus ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-purple-500/60' : 'bg-gta-panel border-gta-green/30'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="hasGTAPlus"
                checked={formData.hasGTAPlus || false} 
                onChange={handleInputChange}
                className="w-5 h-5 rounded bg-slate-700 border-gta-green checked:bg-purple-500"
              />
              <div className="flex-1">
                <div className="text-white font-bold text-sm">GTA+ Subscriber</div>
                <div className="text-xs text-gta-gray">+$500k/month, bonuses</div>
              </div>
              {formData.hasGTAPlus && <Check className="w-4 h-4 text-gta-green" />}
            </label>
          </div>
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
              <>
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
                        <p className="text-xs text-gta-gray mt-1">Expand to plan your purchases and budget.</p>
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
                </div>
                <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-4">🏍️ Vehicles & Tools</h3>
                <div className="grid grid-cols-2 gap-3">
                  <AssetToggleCard 
                    label="Oppressor Mk II"
                    emoji="🏍️"
                    cost="$6.8M"
                    details="Missiles require Nightclub + Terrorbyte (Specialized Workshop)"
                    isOwned={formData.hasOppressor || false}
                    onChange={() => handleInputChange({ target: { name: 'hasOppressor', type: 'checkbox', checked: !formData.hasOppressor } })}
                    compact
                  >
                    {formData.hasOppressor && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasTerrorbyte"
                            checked={formData.hasTerrorbyte || false}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                            aria-label="Owns Terrorbyte"
                          />
                          <span className="text-xs text-slate-300">Terrorbyte owned (requires Nightclub)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasOppressorMissiles"
                            checked={formData.hasOppressorMissiles || false}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                            aria-label="Oppressor Mk II missiles installed"
                          />
                          <span className="text-xs text-slate-300">Missiles installed (Terrorbyte workshop)</span>
                        </label>
                      </div>
                    )}
                  </AssetToggleCard>
                  <AssetToggleCard 
                    label="F-160 Raiju"
                    emoji="✈️"
                    cost="$6.8M"
                    isOwned={formData.hasRaiju || false}
                    onChange={() => handleInputChange({ target: { name: 'hasRaiju', type: 'checkbox', checked: !formData.hasRaiju } })}
                    compact
                  />
                  <AssetToggleCard 
                    label="Armored Kuruma"
                    emoji="🛡️"
                    cost="$1.532M"
                    isOwned={formData.hasArmoredKuruma || false}
                    onChange={() => handleInputChange({ target: { name: 'hasArmoredKuruma', type: 'checkbox', checked: !formData.hasArmoredKuruma } })}
                    compact
                  />
                  <AssetToggleCard 
                    label="Brickade 6x6"
                    emoji="🚚"
                    cost="$650k"
                    isOwned={formData.hasBrickade6x6 || false}
                    onChange={() => handleInputChange({ target: { name: 'hasBrickade6x6', type: 'checkbox', checked: !formData.hasBrickade6x6 } })}
                    compact
                  />
                </div>
              </>
            )}

          <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-4">🏢 Properties & Services</h3>
            <div className="grid grid-cols-2 gap-3">
              <AssetToggleCard 
                label="Agency"
                emoji="🕵️"
                cost="$2.025M"
                isOwned={formData.hasAgency || false}
                onChange={() => handleInputChange({ target: { name: 'hasAgency', type: 'checkbox', checked: !formData.hasAgency } })}
                compact
              >
                {formData.hasAgency && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          name="dreContractDone"
                          checked={formData.dreContractDone || false}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                          aria-label="Dre Contract"
                        />
                        <span className="text-xs text-slate-300">Dre Contract</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          name="payphoneUnlocked"
                          checked={formData.payphoneUnlocked || false}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                          aria-label="Payphone Hits"
                        />
                        <span className="text-xs text-slate-300">Payphone Hits</span>
                      </label>
                    </div>
                    <div>
                      <label htmlFor="securityContracts" className="text-[11px] text-gta-gray font-bold uppercase mb-1 block">Security Contracts Completed</label>
                      <input
                        id="securityContracts"
                        name="securityContracts"
                        type="number"
                        placeholder="0"
                        value={formData.securityContracts || ''}
                        onChange={handleInputChange}
                        className={`w-full bg-slate-800 border rounded p-2 text-sm focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors ${errorBorder(errors, 'securityContracts')}`}
                      />
                      {errors?.securityContracts ? (
                        <p className="text-xs text-gta-red mt-1">💢 {errors.securityContracts}</p>
                      ) : (
                        <p className="text-[11px] text-gta-gray mt-1">200+ contracts = max safe income</p>
                      )}
                    </div>
                  </div>
                )}
              </AssetToggleCard>
              <AssetToggleCard 
                label="Arcade"
                emoji="🎮"
                cost="$672k+"
                isOwned={formData.hasArcade || false}
                onChange={() => handleInputChange({ target: { name: 'hasArcade', type: 'checkbox', checked: !formData.hasArcade } })}
                compact
              >
                {formData.hasArcade && (
                  <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasArcadeMct"
                      checked={formData.hasArcadeMct || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                      aria-label="Master Control Terminal"
                    />
                    <span className="text-xs text-slate-300">Master Control Terminal (MCT) upgrade</span>
                  </label>
                )}
              </AssetToggleCard>
              <AssetToggleCard 
                label="Mansion"
                emoji="🏰"
                cost="$4.65M"
                isOwned={formData.hasMansion || false}
                onChange={() => {
                  const nextOwned = !formData.hasMansion;
                  setFormData(prev => ({
                    ...prev,
                    hasMansion: nextOwned,
                    mansionType: nextOwned ? prev.mansionType : '',
                  }));
                }}
                compact
              >
                {formData.hasMansion && (
                  <div className="ml-6">
                    <label htmlFor="mansionType" className="block text-[11px] text-gta-gray mb-1">Mansion Location</label>
                    <select
                      id="mansionType"
                      name="mansionType"
                      value={formData.mansionType || ''}
                      onChange={handleInputChange}
                      className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2 py-2 text-slate-200"
                    >
                      <option value="">Select location...</option>
                      <option value="tongva">Tongva Estate ($11.5M)</option>
                      <option value="vinewood">Vinewood Residence ($12.2M)</option>
                      <option value="richman">Richman Villa ($12.8M)</option>
                    </select>
                  </div>
                )}
              </AssetToggleCard>
              <AssetToggleCard 
                label="Car Wash"
                emoji="🚗"
                cost="$1.5M"
                isOwned={formData.hasCarWash || false}
                onChange={() => handleInputChange({ target: { name: 'hasCarWash', type: 'checkbox', checked: !formData.hasCarWash } })}
                compact
              >
                {formData.hasCarWash && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-gta-gray">Add feeder businesses to boost passive income:</div>
                    <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasWeedFarm"
                        checked={formData.hasWeedFarm || false}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                        aria-label="Weed Farm feeder"
                      />
                      <span className="text-xs text-slate-300">Smoke on the Water (Weed Farm) + ~$10k/hr</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasHeliTours"
                        checked={formData.hasHeliTours || false}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded bg-slate-800 border-gta-green checked:bg-gta-green"
                        aria-label="Helicopter Tours feeder"
                      />
                      <span className="text-xs text-slate-300">Helicopter Tours + ~$8k/hr</span>
                    </label>
                  </div>
                )}
              </AssetToggleCard>
            </div>
          </div>
        {/* End Properties & Services */}
      </section>

          {/* DAILY CASH LOOP */}
          <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-2">💼 Daily Cash Loop</h3>
            <p className="text-xs text-gta-gray mb-3">Check these if you already did them today.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dailyStashHouse"
                  checked={formData.dailyStashHouse || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-gta-green"
                  aria-label="Completed Stash House today"
                />
                <div>
                  <div className="font-medium text-slate-100">🏚️ Stash House</div>
                  <div className="text-xs text-slate-400">Daily raid for free supplies</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dailyGsCache"
                  checked={formData.dailyGsCache || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-gta-green"
                  aria-label="Completed G's Cache today"
                />
                <div>
                  <div className="font-medium text-slate-100">🗺️ G's Cache</div>
                  <div className="text-xs text-slate-400">Daily cash + ammo/snacks</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dailySafeCollect"
                  checked={formData.dailySafeCollect || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-gta-green"
                  aria-label="Collected safe income today"
                />
                <div>
                  <div className="font-medium text-slate-100">💰 Collect Safes</div>
                  <div className="text-xs text-slate-400">Nightclub/Agency safes</div>
                </div>
              </label>
            </div>
          </div>

          {/* FOOTER: SUBMIT */}
          <div className="space-y-6 mt-8 pt-6 border-t border-gta-green/30">
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

  );
}
