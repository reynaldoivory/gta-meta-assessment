
// src/views/AssessmentForm.jsx - HEIST PLANNING BOARD
// Rebuilt on the Arcade HUD design system (AppShell, Button, responsive grids).

import { useRef, useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { useToast } from '../context/ToastContext';
import { Save, Trash2, ChevronDown, ChevronRight, Car, Target } from 'lucide-react';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
import { BusinessMatrixPanel } from '../components/shared/BusinessMatrixPanel';
import { AssessmentVitalsSidebar } from '../components/shared/AssessmentVitalsSidebar';
import { FinancialWorkbookPanel } from '../components/shared/FinancialWorkbookPanel';
import { AssetToggleCard } from '../components/shared/AssetToggleCard';
import { AppShell, Button } from '../components/ui';

export default function AssessmentForm() {
  // 1. Destructure all data/functions needed from your Context
  const {
    formData, setFormData, errors, setErrors, clearFieldError,
    manualSave, localStorageAvailable, isSaving, lastSaved, clearSavedData,
    runAssessment, isCalculating,
    cascadeTraps, criticalTraps, hasCriticalTrap,
    setStep,
  } = useAssessment();
  const { showToast } = useToast();

  // 2. Local State definitions
  const formContainerRef = useRef(null);
  const [openPanels, setOpenPanels] = useState({ operations: true, workbook: false });

  // 3. Helpers
  const togglePanel = (panel) => {
    setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };
  const errorBorder = (errs, field) => errs?.[field] ? 'border-hud-pink' : 'border-border';

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

  const savedStatus = !localStorageAvailable
    ? { text: 'Storage unavailable', className: 'text-hud-pink' }
    : isSaving
      ? { text: 'Saving...', className: 'text-text-muted' }
      : lastSaved
        ? { text: `Saved ${new Date(lastSaved).toLocaleTimeString()}`, className: 'text-hud-blue' }
        : null;

  return (
    <AppShell
      width="wide"
      title={(
        <>
          <span className="text-text-primary">HEIST PLANNING</span>{' '}
          <span className="text-hud-pink">BOARD</span>
        </>
      )}
      subtitle="🎯 Analyze your vitals & assets for operation success"
      actions={(
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Car} onClick={() => setStep('garage')} title="Browse the vehicle database">
              Garage
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Save}
              onClick={manualSave}
              disabled={!localStorageAvailable || isSaving}
              title="Save progress"
            >
              Save
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                clearSavedData();
                showToast('Empire wiped clean', 'success');
              }}
              title="Clear all data"
            >
              Clear
            </Button>
          </div>
          {savedStatus && <span className={`text-xs ${savedStatus.className}`}>{savedStatus.text}</span>}
        </div>
      )}
    >
      {/* WEEKLY BONUS BANNER - Always show with locked state for non-GTA+ users */}
      <WeeklyBonusBanner hasGTAPlus={formData.hasGTAPlus} />

      {/* MAIN 12-COLUMN GRID */}
      <div className="grid grid-cols-12 gap-6" ref={formContainerRef}>

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
              className="w-full bg-gradient-to-br from-bg-surface to-bg-base border-2 border-hud-blue rounded-lg p-6 shadow-float flex items-center justify-between text-left"
            >
              <div>
                <h2 className="text-xl font-bold text-hud-blue font-display uppercase mb-1">Assets & Operations</h2>
                <p className="text-xs text-text-muted">Contains property matrix, workbook, and ledger.</p>
              </div>
              {openPanels.operations ? (
                <ChevronDown className="w-5 h-5 text-text-secondary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-secondary" />
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

                  <section className="bg-bg-surface border border-hud-blue/30 rounded-lg p-4">
                    <button
                      type="button"
                      onClick={() => togglePanel('workbook')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div>
                        <h3 className="text-sm font-bold uppercase text-hud-blue">Financial Workbook</h3>
                        <p className="text-xs text-text-muted mt-1">Expand to plan your purchases and budget.</p>
                      </div>
                      {openPanels.workbook ? (
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-text-secondary" />
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
                <h3 className="text-lg font-bold text-hud-blue font-display uppercase mb-4">🏍️ Vehicles & Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasTerrorbyte"
                            checked={formData.hasTerrorbyte || false}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                            aria-label="Owns Terrorbyte"
                          />
                          <span className="text-xs text-text-secondary">Terrorbyte owned (requires Nightclub)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                          <input
                            type="checkbox"
                            name="hasOppressorMissiles"
                            checked={formData.hasOppressorMissiles || false}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                            aria-label="Oppressor Mk II missiles installed"
                          />
                          <span className="text-xs text-text-secondary">Missiles installed (Terrorbyte workshop)</span>
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

          <div className="bg-bg-surface border border-hud-blue/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-hud-blue font-display uppercase mb-4">🏢 Properties & Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                        <input
                          type="checkbox"
                          name="dreContractDone"
                          checked={formData.dreContractDone || false}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                          aria-label="Dre Contract"
                        />
                        <span className="text-xs text-text-secondary">Dre Contract</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                        <input
                          type="checkbox"
                          name="payphoneUnlocked"
                          checked={formData.payphoneUnlocked || false}
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                          aria-label="Payphone Hits"
                        />
                        <span className="text-xs text-text-secondary">Payphone Hits</span>
                      </label>
                    </div>
                    <div>
                      <label htmlFor="securityContracts" className="text-2xs text-text-muted font-bold uppercase mb-1 block">Security Contracts Completed</label>
                      <input
                        id="securityContracts"
                        name="securityContracts"
                        type="number"
                        placeholder="0"
                        value={formData.securityContracts || ''}
                        onChange={handleInputChange}
                        className={`w-full bg-bg-raised border rounded p-2 text-sm focus:border-hud-blue focus:ring-2 focus:ring-hud-blue/20 outline-none transition-colors ${errorBorder(errors, 'securityContracts')}`}
                      />
                      {errors?.securityContracts ? (
                        <p className="text-xs text-accent-pink-text mt-1">💢 {errors.securityContracts}</p>
                      ) : (
                        <p className="text-2xs text-text-muted mt-1">200+ contracts = max safe income</p>
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
                  <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasArcadeMct"
                      checked={formData.hasArcadeMct || false}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                      aria-label="Master Control Terminal"
                    />
                    <span className="text-xs text-text-secondary">Master Control Terminal (MCT) upgrade</span>
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
                    <label htmlFor="mansionType" className="block text-2xs text-text-muted mb-1">Mansion Location</label>
                    <select
                      id="mansionType"
                      name="mansionType"
                      value={formData.mansionType || ''}
                      onChange={handleInputChange}
                      className="w-full text-xs bg-bg-raised border border-border rounded px-2 py-2 text-text-secondary"
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
                    <div className="text-2xs text-text-muted">Add feeder businesses to boost passive income:</div>
                    <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasWeedFarm"
                        checked={formData.hasWeedFarm || false}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                        aria-label="Weed Farm feeder"
                      />
                      <span className="text-xs text-text-secondary">Smoke on the Water (Weed Farm) + ~$10k/hr</span>
                    </label>
                    <label className="flex items-center gap-2 p-2 rounded bg-bg-base/60 border border-border cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasHeliTours"
                        checked={formData.hasHeliTours || false}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded bg-bg-raised border-hud-blue checked:bg-hud-blue"
                        aria-label="Helicopter Tours feeder"
                      />
                      <span className="text-xs text-text-secondary">Helicopter Tours + ~$8k/hr</span>
                    </label>
                  </div>
                )}
              </AssetToggleCard>
            </div>
          </div>
        {/* End Properties & Services */}
      </section>

          {/* DAILY CASH LOOP */}
          <div className="bg-bg-surface border border-hud-blue/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-hud-blue font-display uppercase mb-2">💼 Daily Cash Loop</h3>
            <p className="text-xs text-text-muted mb-3">Check these if you already did them today.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 bg-bg-base border border-border rounded-lg hover:bg-bg-raised transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dailyStashHouse"
                  checked={formData.dailyStashHouse || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-bg-raised border-border checked:bg-hud-blue"
                  aria-label="Completed Stash House today"
                />
                <div>
                  <div className="font-medium text-text-primary">🏚️ Stash House</div>
                  <div className="text-xs text-text-muted">Daily raid for free supplies</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-bg-base border border-border rounded-lg hover:bg-bg-raised transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dailyGsCache"
                  checked={formData.dailyGsCache || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-bg-raised border-border checked:bg-hud-blue"
                  aria-label="Completed G's Cache today"
                />
                <div>
                  <div className="font-medium text-text-primary">🗺️ G's Cache</div>
                  <div className="text-xs text-text-muted">Daily cash + ammo/snacks</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-bg-base border border-border rounded-lg hover:bg-bg-raised transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dailySafeCollect"
                  checked={formData.dailySafeCollect || false}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-bg-raised border-border checked:bg-hud-blue"
                  aria-label="Collected safe income today"
                />
                <div>
                  <div className="font-medium text-text-primary">💰 Collect Safes</div>
                  <div className="text-xs text-text-muted">Nightclub/Agency safes</div>
                </div>
              </label>
            </div>
          </div>

          {/* FOOTER: SUBMIT */}
          <div className="space-y-6 mt-8 pt-6 border-t border-hud-blue/30">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={Target}
              onClick={runAssessment}
              disabled={isCalculating}
              className="uppercase tracking-widest text-lg"
            >
              {isCalculating ? 'Analyzing...' : 'Run Assessment'}
            </Button>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
