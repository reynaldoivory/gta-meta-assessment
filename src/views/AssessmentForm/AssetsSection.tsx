// src/views/AssessmentForm/AssetsSection.tsx
// Assets & Operations: business matrix, financial workbook, vehicles, properties, daily cash loop

import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { BusinessMatrixPanel } from '../../components/shared/BusinessMatrixPanel';
import { FinancialWorkbookPanel } from '../../components/shared/FinancialWorkbookPanel';
import { AssetToggleCard } from '../../components/shared/AssetToggleCard';
import type { AssessmentFormData } from '../../types/domain.types';

interface AssetsSectionProps {
  formData: AssessmentFormData;
  setFormData: React.Dispatch<React.SetStateAction<AssessmentFormData>>;
  errors: Record<string, string>;
  openPanels: { operations: boolean; workbook: boolean };
  togglePanel: (panel: 'operations' | 'workbook') => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; type: string; checked: boolean; value?: string } }) => void;
  cascadeTraps: any[];
  criticalTraps: any[];
  hasCriticalTrap: boolean;
  errorBorder: (errs: Record<string, string>, field: string) => string;
  runAssessment: () => void;
  isCalculating: boolean;
}

export function AssetsSection({
  formData,
  setFormData,
  errors,
  openPanels,
  togglePanel,
  handleInputChange,
  cascadeTraps,
  criticalTraps,
  hasCriticalTrap,
  errorBorder,
  runAssessment,
  isCalculating,
}: AssetsSectionProps) {
  return (
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
            </div>
            <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-4">{'\uD83C\uDFCD\uFE0F'} Vehicles & Tools</h3>
            <div className="grid grid-cols-2 gap-3">
              <AssetToggleCard
                label="Oppressor Mk II"
                emoji={'\uD83C\uDFCD\uFE0F'}
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
                emoji={'\u2708\uFE0F'}
                cost="$6.8M"
                isOwned={formData.hasRaiju || false}
                onChange={() => handleInputChange({ target: { name: 'hasRaiju', type: 'checkbox', checked: !formData.hasRaiju } })}
                compact
              />
              <AssetToggleCard
                label="Armored Kuruma"
                emoji={'\uD83D\uDEE1\uFE0F'}
                cost="$1.532M"
                isOwned={formData.hasArmoredKuruma || false}
                onChange={() => handleInputChange({ target: { name: 'hasArmoredKuruma', type: 'checkbox', checked: !formData.hasArmoredKuruma } })}
                compact
              />
              <AssetToggleCard
                label="Brickade 6x6"
                emoji={'\uD83D\uDE9A'}
                cost="$650k"
                isOwned={formData.hasBrickade6x6 || false}
                onChange={() => handleInputChange({ target: { name: 'hasBrickade6x6', type: 'checkbox', checked: !formData.hasBrickade6x6 } })}
                compact
              />
            </div>
          </>
        )}

      <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-4">{'\uD83C\uDFE2'} Properties & Services</h3>
        <div className="grid grid-cols-2 gap-3">
          <AssetToggleCard
            label="Agency"
            emoji={'\uD83D\uDD75\uFE0F'}
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
                    <p className="text-xs text-gta-red mt-1">{'\u{1F4A2}'} {errors.securityContracts}</p>
                  ) : (
                    <p className="text-[11px] text-gta-gray mt-1">200+ contracts = max safe income</p>
                  )}
                </div>
              </div>
            )}
          </AssetToggleCard>
          <AssetToggleCard
            label="Arcade"
            emoji={'\uD83C\uDFAE'}
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
            emoji={'\uD83C\uDFF0'}
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
            emoji={'\uD83D\uDE97'}
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
          <h3 className="text-lg font-bold text-gta-green font-heading uppercase mb-2">{'\uD83D\uDCBC'} Daily Cash Loop</h3>
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
                <div className="font-medium text-slate-100">{'\uD83C\uDFDA\uFE0F'} Stash House</div>
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
                <div className="font-medium text-slate-100">{'\uD83D\uDDFA\uFE0F'} G's Cache</div>
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
                <div className="font-medium text-slate-100">{'\uD83D\uDCB0'} Collect Safes</div>
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
            {isCalculating ? '\u23F3 Analyzing...' : '\uD83C\uDFAF RUN ASSESSMENT'}
          </button>
        </div>
    </main>
  );
}
