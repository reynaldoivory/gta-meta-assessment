// src/views/AssessmentForm/VitalsSection.tsx
// Cash, RP, income, time played inputs + stat bars + GTA+ toggle

import { Check } from 'lucide-react';
import { AssessmentVitalsSidebar } from '../../components/shared/AssessmentVitalsSidebar';
import StatBar from '../../components/shared/StatBar';
import type { AssessmentFormData } from '../../types/domain.types';

interface VitalsSectionProps {
  formData: AssessmentFormData;
  errors: Record<string, string>;
  timePlayedMode: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; type: string; checked: boolean; value?: string } }) => void;
  handleStatChange: (key: string, value: number) => void;
  handleTimePlayedPartChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimePlayedTotalChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimePlayedModeChange: (mode: string) => void;
  handleTimePlayedModeFocus: (mode: string) => void;
  formatCurrency: (val: string | number) => string;
  formatHours: (val: string | number) => string;
  errorBorder: (errs: Record<string, string>, field: string) => string;
  errorBorderSimple: (errs: Record<string, string>, field: string) => string;
}

const STAT_FIELDS = [
  { label: 'Stamina', key: 'stamina' },
  { label: 'Shooting', key: 'shooting' },
  { label: 'Strength', key: 'strength' },
  { label: 'Stealth', key: 'stealth' },
  { label: 'Flying', key: 'flying' },
  { label: 'Driving', key: 'driving' },
  { label: 'Lung Capacity', key: 'lungCapacity' },
] as const;

export function VitalsSection({
  formData,
  errors,
  timePlayedMode,
  handleInputChange,
  handleStatChange,
  handleTimePlayedPartChange,
  handleTimePlayedTotalChange,
  handleTimePlayedModeChange,
  handleTimePlayedModeFocus,
  formatCurrency,
  formatHours,
  errorBorder,
  errorBorderSimple,
}: VitalsSectionProps) {
  const timePlayedHasParts = formData.timePlayedDays || formData.timePlayedHours;
  const timePlayedTotal = formData.timePlayed || 0;

  return (
    <>
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
            {errors?.liquidCash && <p className="text-xs text-gta-red mt-1">{'\u{1F4A2}'} {errors.liquidCash}</p>}
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
              {errors?.totalRPCollected && <p className="text-xs text-gta-red mt-1">{'\u{1F4A2}'} {errors.totalRPCollected}</p>}
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
              {errors?.totalIncomeCollected && <p className="text-xs text-gta-red mt-1">{'\u{1F4A2}'} {errors.totalIncomeCollected}</p>}
            </div>
          </div>
          <div className="text-[11px] text-gta-gray">
            Find these in Stats &rarr; Career Progress (Lifetime Stats). Used for efficiency comparisons.
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
                    className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorderSimple(errors, 'timePlayed')}`}
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
                    className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorderSimple(errors, 'timePlayed')}`}
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
                  className={`w-full bg-slate-800 border rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorderSimple(errors, 'timePlayed')}`}
                  min="0"
                  step="0.1"
                />
              </div>
            )}
            <div className="text-xs text-gta-gray mt-2">
              Total (rounded): <span className="text-slate-200">{timePlayedHasParts || formData.timePlayed ? formatHours(timePlayedTotal) : '\u2014'}</span> hours
            </div>
            {errors?.timePlayed ? (
              <p className="text-xs text-gta-red mt-1">{'\u{1F4A2}'} {errors.timePlayed}</p>
            ) : (
              <p className="text-xs text-gta-gray mt-1">Use days + hours from the GTA stats screen, or enter total hours directly.</p>
            )}
          </div>

        {/* STATS BARS */}
        <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
          {STAT_FIELDS.map(stat => {
            const statKey = stat.key;
            return (
              <div key={stat.label}>
                <StatBar
                  label={stat.label}
                  value={formData[statKey] || 0}
                  onChange={(val: number) => handleStatChange(statKey, val)}
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
    </>
  );
}
