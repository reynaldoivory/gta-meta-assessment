// src/views/AssessmentForm.jsx
import React, { useRef, useMemo } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Activity, Zap, Briefcase, CheckCircle, Cloud, Save, Trash2, AlertCircle } from 'lucide-react';
import StatBar from '../components/shared/StatBar';
import AssetCard from '../components/shared/AssetCard';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
import CarWashExpiryBadge from '../components/shared/CarWashExpiryBadge';
import { TrapBlockingWarning } from '../components/shared/TrapWarnings';
import NightclubLogistics from '../components/shared/NightclubLogistics';
import { detectTraps, TRAP_SEVERITY } from '../utils/trapDetector';
import { WEEKLY_EVENTS } from '../config/weeklyEvents';

// Helper function to format last saved time
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

export default function AssessmentForm() {
  const { 
    formData, setFormData, runAssessment, resetForm, setStep, hasDraft, errors, setErrors, isCalculating,
    isSaving, lastSaved, localStorageAvailable, manualSave, clearSavedData
  } = useAssessment();
  const formContainerRef = useRef(null);
  
  // Detect traps in real-time as user fills form
  const detectedTraps = useMemo(() => detectTraps(formData), [formData]);
  const criticalTraps = detectedTraps.filter(t => t.severity === TRAP_SEVERITY.CRITICAL);
  const cascadeTraps = detectedTraps.filter(t => t.isCascadeTrap);
  const hasCriticalTrap = criticalTraps.length > 0;

  // Input change handler with auto purchase date tracking
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-track purchase dates when property checkboxes are toggled ON
    if (type === 'checkbox' && name.startsWith('has')) {
      // Convert hasKosatka -> kosatka, hasNightclub -> nightclub, etc.
      const propertyKey = name.replace('has', '').charAt(0).toLowerCase() + name.replace('has', '').slice(1);
      
      setFormData(prev => {
        const currentPurchaseDates = prev.purchaseDates || {};
        const newPurchaseDates = { ...currentPurchaseDates };
        
        // Only set purchase date if checkbox is being checked AND no date exists
        if (checked && !newPurchaseDates[propertyKey]) {
          newPurchaseDates[propertyKey] = Date.now();
        }
        
        return {
          ...prev,
          [name]: checked,
          purchaseDates: newPurchaseDates,
        };
      });
      
      // Clear error for this field
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Stat change handler
  const handleStatChange = (statKey, value) => {
    setFormData(prev => ({
      ...prev,
      [statKey]: value
    }));
  };

  // Quick fill presets
  const quickFill = (preset) => {
    const presets = {
      'New Player': {
        rank: '25',
        timePlayed: '10',
        liquidCash: '500000',
        strength: 2,
        flying: 2,
        shooting: 2,
        stealth: 1,
        stamina: 2,
        driving: 2,
        hasKosatka: false,
        hasSparrow: false,
        hasAgency: false,
        hasAcidLab: false,
        hasNightclub: false,
        hasBunker: false,
        hasAutoShop: false,
        hasGTAPlus: false,
        playMode: 'invite'
      },
      'Mid Grinder': {
        rank: '75',
        timePlayed: '100',
        liquidCash: '5000000',
        strength: 4,
        flying: 4,
        shooting: 4,
        stealth: 3,
        stamina: 4,
        driving: 4,
        hasKosatka: true,
        hasSparrow: true,
        hasAgency: true,
        hasAcidLab: true,
        acidLabUpgraded: true,
        hasNightclub: true,
        nightclubTechs: 3,
        nightclubSources: {
          imports: true,   // Coke
          cargo: true,     // Hangar/CEO
          pharma: true,    // Meth
          sporting: false, // Bunker
          cash: false,
          organic: false,
          printing: false
        },
        nightclubFloors: '2',
        nightclubEquipmentUpgrade: false,
        nightclubStaffUpgrade: false,
        nightclubStorage: {
          hasPounder: false,
          hasMule: false
        },
        hasBunker: true,
        bunkerEquipmentUpgrade: true,
        bunkerStaffUpgrade: true,
        bunkerSecurityUpgrade: false,
        hasAutoShop: true,
        cayoCompletions: '25',
        cayoAvgTime: '60',
        dreContractDone: true,
        payphoneUnlocked: true,
        securityContracts: '150',
        hasGTAPlus: false,
        playMode: 'invite'
      },
      'Endgame 2026': {
        rank: '150',
        timePlayed: '500',
        liquidCash: '50000000',
        strength: 5,
        flying: 5,
        shooting: 5,
        stealth: 5,
        stamina: 5,
        driving: 5,
        hasKosatka: true,
        hasSparrow: true,
        hasAgency: true,
        dreContractDone: true,
        payphoneUnlocked: true,
        securityContracts: '200',
        hasAcidLab: true,
        acidLabUpgraded: true,
        hasNightclub: true,
        nightclubTechs: 5,
        nightclubSources: {
          imports: true,   // Coke
          cargo: true,     // Hangar/CEO
          pharma: true,    // Meth
          sporting: true,  // Bunker
          cash: true,      // Cash
          organic: false,  // Weed (low value)
          printing: false  // Docs (low value)
        },
        nightclubFloors: '5',
        nightclubEquipmentUpgrade: true,
        nightclubStaffUpgrade: true,
        nightclubStorage: {
          hasPounder: true,
          hasMule: false
        },
        hasBunker: true,
        bunkerEquipmentUpgrade: true,
        bunkerStaffUpgrade: true,
        bunkerSecurityUpgrade: true,
        hasAutoShop: true,
        hasMansion: true,
        hasSalvageYard: true,
        hasTowTruck: true,
        hasRaiju: true,
        hasOppressor: true,
        hasArmoredKuruma: true,
        cayoCompletions: '100',
        cayoAvgTime: '45',
        hasGTAPlus: true,
        playMode: 'invite'
      }
    };

    if (presets[preset]) {
      setFormData(prev => ({ ...prev, ...presets[preset] }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans text-slate-200">
      <div className="max-w-xl mx-auto space-y-8" ref={formContainerRef}>
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-white">GTA Manager</h1>
            
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2">
              {!localStorageAvailable ? (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <span className="text-xs">⚠️ Private Mode</span>
                </div>
              ) : isSaving ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Cloud className="w-4 h-4 animate-pulse" />
                  <span className="text-xs">Saving...</span>
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Saved {formatLastSaved(lastSaved)}</span>
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-900/50">{(() => { const d = new Date(WEEKLY_EVENTS.meta.validFrom); return `${d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })} ${d.getUTCFullYear()} Meta`; })()}</span>
              {hasDraft && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-900/50">Draft Saved</span>}
              <button
                type="button"
                onClick={() => setStep('guide')}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded text-xs transition"
              >
                📘 Quick Start Guide
              </button>
            </div>
            
            {/* Manual Save & Clear Buttons */}
            <div className="flex gap-2 items-center">
              <button
                type="button"
                onClick={manualSave}
                disabled={!localStorageAvailable || isSaving}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded text-xs transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Manually save your progress"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                type="button"
                onClick={clearSavedData}
                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded text-xs transition flex items-center gap-1"
                title="Clear all saved data"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Bonus Banner - Only show for GTA+ subscribers */}
        {formData.hasGTAPlus && <WeeklyBonusBanner />}

        {/* Free GTA+ Vehicle Reminder */}
        {formData.hasGTAPlus && !formData.claimedFreeCar && !formData.hasRaiju && !formData.hasOppressor && (
          <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center gap-4">
            <div className="text-3xl">🏎️</div>
            <div className="flex-1">
              <div className="font-bold text-white mb-1">Don't Forget: Free {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}</div>
              <div className="text-sm text-slate-300">
                Claim it at {WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'The Vinewood Car Club'}. Worth ${((WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1850000) / 1000000).toFixed(1)}M for free. Perfect for early-game transport.
              </div>
            </div>
          </div>
        )}

        {/* Quick Fill */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['New Player', 'Mid Grinder', 'Endgame 2026'].map(preset => (
            <button 
              key={preset} 
              onClick={() => quickFill(preset)} 
              className="whitespace-nowrap px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg hover:border-blue-500 text-sm transition-colors"
            >
              {preset}
            </button>
          ))}
          <button 
            onClick={resetForm}
            className="px-4 py-2 bg-red-900/20 border border-red-900/50 text-red-400 rounded-lg text-sm hover:bg-red-900/30 transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="space-y-8">
          
          {/* 1. Vitals */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Activity className="text-blue-500"/> Vitals</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="rank" className="text-xs text-slate-500 font-bold uppercase block mb-1">Rank</label>
                <input 
                  id="rank"
                  name="rank" 
                  type="number" 
                  value={formData.rank} 
                  onChange={handleInputChange} 
                  className={`w-full bg-slate-900 border rounded p-3 focus:border-blue-500 outline-none ${
                    errors.rank ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                {errors.rank && (
                  <p className="text-xs text-red-400 mt-1">{errors.rank}</p>
                )}
              </div>
              <div>
                <label htmlFor="liquidCash" className="text-xs text-slate-500 font-bold uppercase block mb-1">Cash</label>
                <input 
                  id="liquidCash"
                  name="liquidCash" 
                  type="number" 
                  value={formData.liquidCash} 
                  onChange={handleInputChange} 
                  className={`w-full bg-slate-900 border rounded p-3 focus:border-green-500 outline-none transition-colors ${
                    errors.liquidCash ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700'
                  }`}
                />
                {errors.liquidCash && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.liquidCash}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <input 
                  type="checkbox" 
                  name="hasGTAPlus"
                  checked={formData.hasGTAPlus} 
                  onChange={handleInputChange} 
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-blue-500 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-white font-medium">GTA+ Subscriber ($7.99/mo)</div>
                  <div className="text-xs text-slate-500">
                    Adds $500k/month + 2X Lucky Wheel + current weekly bonuses
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Assumes ~$500k/month extra (~115k/hour averaged over a 4–5h weekly grind).
                  </div>
                </div>
              </label>
            </div>
            <div>
              <label htmlFor="timePlayed" className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Total Hours Played
                <span className="text-slate-600 ml-1 font-normal">(cumulative, for efficiency calculation)</span>
              </label>
              <input 
                id="timePlayed"
                name="timePlayed" 
                type="number" 
                placeholder="e.g. 150"
                value={formData.timePlayed} 
                onChange={handleInputChange} 
                className={`w-full bg-slate-900 border rounded p-3 focus:border-yellow-500 outline-none ${
                  errors.timePlayed ? 'border-red-500' : 'border-slate-700'
                }`}
                min="0"
              />
              {errors.timePlayed ? (
                <p className="text-xs text-red-400 mt-1">{errors.timePlayed}</p>
              ) : (
                <div className="text-xs text-slate-600 mt-1">Your total playtime across all sessions. Leave blank to see theoretical max only.</div>
              )}
            </div>
          </section>

          {/* 2. Stats (Visual Bars) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Zap className="text-yellow-500"/> Stats (Click bars to fill)</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
              {['Strength', 'Shooting', 'Flying', 'Stealth', 'Driving', 'Stamina'].map(stat => {
                const statKey = stat.toLowerCase();
                return (
                  <div key={stat}>
                    <StatBar 
                      label={stat} 
                      value={formData[statKey] || 0} 
                      onChange={(val) => handleStatChange(statKey, val)}
                    />
                    {errors[statKey] && (
                      <p className="text-xs text-red-400 mt-1 ml-1">{errors[statKey]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. Assets (Nested Toggles) */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-purple-500"/> Assets & Upgrades</h2>
            <div className="space-y-3">
              
              {/* ACID LAB */}
              <AssetCard 
                label="Acid Lab" 
                emoji="🧪" 
                cost="$750k"
                isOwned={formData.hasAcidLab} 
                onToggle={() => setFormData(p => ({ ...p, hasAcidLab: !p.hasAcidLab }))}
              >
                <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="acidLabUpgraded"
                    checked={formData.acidLabUpgraded} 
                    onChange={handleInputChange} 
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-purple-500 focus:ring-purple-500"
                    aria-label="Acid Lab Equipment Upgrade"
                  />
                  <div className="flex-1">
                    <div className="text-slate-200 group-hover:text-white font-medium">Equipment Upgrade</div>
                    <div className="text-xs text-slate-500">Cost: $250k • Boosts production speed by 40% • Requires 10 Fooligan Jobs</div>
                  </div>
                </label>
              </AssetCard>

              {/* KOSATKA */}
              <AssetCard 
                label="Kosatka Submarine" 
                emoji="🚢" 
                cost="$2.2M"
                isOwned={formData.hasKosatka} 
                onToggle={() => setFormData(p => ({ ...p, hasKosatka: !p.hasKosatka }))}
              >
                <label className="flex items-center gap-3 cursor-pointer mb-4 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="hasSparrow"
                    checked={formData.hasSparrow} 
                    onChange={handleInputChange} 
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-blue-500 focus:ring-blue-500"
                    aria-label="Sparrow Helicopter"
                  />
                  <div className="flex-1">
                    <div className="text-slate-200 font-medium">Sparrow Helicopter</div>
                    <div className="text-xs text-slate-500">Cost: $1.8M • Essential for fast preps</div>
                  </div>
                </label>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cayoCompletions" className="text-xs text-slate-500 font-bold uppercase mb-1 block">Cayo Perico Completions</label>
                    <input 
                      id="cayoCompletions"
                      name="cayoCompletions"
                      type="number" 
                      placeholder="0" 
                      value={formData.cayoCompletions} 
                      onChange={handleInputChange} 
                      className={`w-full bg-slate-800 border rounded p-2 text-sm focus:border-blue-500 outline-none transition-colors ${
                        errors.cayoCompletions ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700'
                      }`}
                    />
                    {errors.cayoCompletions && (
                      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.cayoCompletions}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cayoAvgTime" className="text-xs text-slate-500 font-bold uppercase mb-1 block">Avg Run Time (minutes)</label>
                    <input 
                      id="cayoAvgTime"
                      name="cayoAvgTime"
                      type="number" 
                      placeholder="e.g. 65" 
                      value={formData.cayoAvgTime} 
                      onChange={handleInputChange} 
                      className={`w-full bg-slate-800 border rounded p-2 text-sm focus:border-blue-500 outline-none transition-colors ${
                        errors.cayoAvgTime ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700'
                      }`}
                    />
                    {errors.cayoAvgTime ? (
                      <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>{errors.cayoAvgTime}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 mt-1">Includes prep + heist time. Elite: &lt;50min</div>
                    )}
                    {formData.cayoCompletions && Number(formData.cayoCompletions) > 0 && (
                      <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-400">
                        ⚠️ <strong>2023 Nerf Impact:</strong> Tequila (~60% drop rate) pays ~$630k total. 
                        Pink Diamond/Panther pay $1M-1.9M but are rare. Average: $700k/run.
                      </div>
                    )}
                  </div>
                </div>
              </AssetCard>

              {/* AGENCY */}
              <AssetCard 
                label="The Agency" 
                emoji="🏢" 
                cost="$2.0M"
                isOwned={formData.hasAgency} 
                onToggle={() => setFormData(p => ({ ...p, hasAgency: !p.hasAgency }))}
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                    <input 
                      type="checkbox" 
                      name="dreContractDone"
                      checked={formData.dreContractDone} 
                      onChange={handleInputChange} 
                      className="w-4 h-4 rounded bg-slate-900 border-slate-600 checked:bg-purple-500"
                      aria-label="Dre Contract"
                    />
                    <span className="text-sm text-slate-300">Dre Contract</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                     <input 
                       type="checkbox" 
                       name="payphoneUnlocked"
                       checked={formData.payphoneUnlocked} 
                       onChange={handleInputChange} 
                       className="w-4 h-4 rounded bg-slate-900 border-slate-600 checked:bg-purple-500"
                       aria-label="Payphone Hits"
                     />
                     <span className="text-sm text-slate-300">Payphone Hits</span>
                  </label>
                </div>
                <div>
                  <label htmlFor="securityContracts" className="text-xs text-slate-500 font-bold uppercase mb-1 block">Security Contracts Completed</label>
                  <input 
                    id="securityContracts"
                    name="securityContracts"
                    type="number" 
                    placeholder="0" 
                    value={formData.securityContracts} 
                    onChange={handleInputChange} 
                    className={`w-full bg-slate-800 border rounded p-2 text-sm focus:border-purple-500 outline-none transition-colors ${
                      errors.securityContracts ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700'
                    }`}
                  />
                  {errors.securityContracts ? (
                    <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>{errors.securityContracts}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 mt-1">200+ contracts = max passive safe income ($20k/48min)</div>
                  )}
                </div>
              </AssetCard>

              {/* NIGHTCLUB */}
              <AssetCard 
                label="Nightclub" 
                emoji="🎭" 
                cost="$1.5M+"
                isOwned={formData.hasNightclub} 
                onToggle={() => setFormData(p => ({ ...p, hasNightclub: !p.hasNightclub }))}
              >
                <div className="space-y-4">
                  {/* Warehouse Floors */}
                  <div>
                    <label htmlFor="nightclubFloors" className="text-xs text-slate-500 font-bold uppercase mb-1 block">
                      Warehouse Floors (1-5)
                      <span className="text-yellow-400 ml-1 font-normal">← Affects AFK Duration</span>
                    </label>
                    <select
                      id="nightclubFloors"
                      name="nightclubFloors"
                      value={formData.nightclubFloors || 1}
                      onChange={handleInputChange}
                      className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:border-purple-500 outline-none"
                    >
                      <option value="1">1 Floor (20hr AFK cap)</option>
                      <option value="2">2 Floors (32hr AFK cap)</option>
                      <option value="3">3 Floors (44hr AFK cap)</option>
                      <option value="4">4 Floors (56hr AFK cap)</option>
                      <option value="5">5 Floors (66hr+ AFK - Overnight Safe)</option>
                    </select>
                    <div className="text-xs text-slate-500 mt-1">More floors = longer AFK before goods cap out</div>
                  </div>

                  {/* Upgrades */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                      <input 
                        type="checkbox" 
                        name="nightclubEquipmentUpgrade"
                        checked={formData.nightclubEquipmentUpgrade} 
                        onChange={handleInputChange} 
                        className="w-4 h-4 rounded bg-slate-900 border-slate-600 checked:bg-purple-500"
                      />
                      <div>
                        <span className="text-sm text-slate-300">Equipment</span>
                        <div className="text-[10px] text-green-400">+100% Speed</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                      <input 
                        type="checkbox" 
                        name="nightclubStaffUpgrade"
                        checked={formData.nightclubStaffUpgrade} 
                        onChange={handleInputChange} 
                        className="w-4 h-4 rounded bg-slate-900 border-slate-600 checked:bg-purple-500"
                      />
                      <div>
                        <span className="text-sm text-slate-300">Staff</span>
                        <div className="text-[10px] text-slate-500">Popularity</div>
                      </div>
                    </label>
                  </div>

                  {/* Delivery Vehicles */}
                  <div>
                    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">
                      Delivery Vehicles
                      <span className="text-red-400 ml-1 font-normal">← Critical for Large Sales</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.nightclubStorage?.hasPounder || false} 
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            nightclubStorage: {
                              ...prev.nightclubStorage,
                              hasPounder: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-600 checked:bg-green-500"
                        />
                        <div>
                          <span className="text-sm text-slate-300">Pounder Custom</span>
                          <div className="text-[10px] text-green-400">✓ Best Choice</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors border border-red-900/30">
                        <input 
                          type="checkbox" 
                          checked={formData.nightclubStorage?.hasMule || false} 
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            nightclubStorage: {
                              ...prev.nightclubStorage,
                              hasMule: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-600 checked:bg-red-500"
                        />
                        <div>
                          <span className="text-sm text-slate-300">Mule Custom</span>
                          <div className="text-[10px] text-red-400">⚠️ Trap</div>
                        </div>
                      </label>
                    </div>
                    {formData.nightclubStorage?.hasMule && !formData.nightclubStorage?.hasPounder && (
                      <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
                        ⚠️ <strong>Warning:</strong> The Mule is slow and buggy. You still need the Pounder for 90+ crate sales. Consider buying Pounder instead.
                      </div>
                    )}
                  </div>

                  {/* Technicians & Logistics */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <NightclubLogistics formData={formData} setFormData={setFormData} />
                    
                    {/* Validation Error Display */}
                    {errors.nightclubTechs && (
                      <div className="flex items-center gap-1 mt-2 text-red-400 text-xs">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span>Please select your technicians</span>
                      </div>
                    )}
                  </div>
                </div>
              </AssetCard>

              {/* SALVAGE YARD */}
              <AssetCard 
                label="Salvage Yard" 
                emoji="🏗️" 
                cost="$1.6M"
                isOwned={formData.hasSalvageYard} 
                onToggle={() => setFormData(p => ({ ...p, hasSalvageYard: !p.hasSalvageYard }))}
              >
                 <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <input 
                    type="checkbox" 
                    name="hasTowTruck"
                    checked={formData.hasTowTruck} 
                    onChange={handleInputChange} 
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-orange-500 focus:ring-orange-500"
                    aria-label="Tow Truck Upgrade"
                  />
                  <div className="flex-1">
                    <div className="text-slate-200 font-medium">Tow Truck Upgrade</div>
                    <div className="text-xs text-slate-500">Cost: $1.1M • Required for passive income</div>
                  </div>
                </label>
              </AssetCard>

              {/* BUNKER */}
              <AssetCard 
                label="Bunker" 
                emoji="🔫" 
                cost="$1.2M+"
                isOwned={formData.hasBunker} 
                onToggle={() => setFormData(p => ({ ...p, hasBunker: !p.hasBunker }))}
              >
                <div className="space-y-3">
                  {/* Equipment Upgrade - CRITICAL */}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="bunkerEquipmentUpgrade"
                      checked={formData.bunkerEquipmentUpgrade || formData.bunkerUpgraded} 
                      onChange={handleInputChange} 
                      className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-green-500 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium">Equipment Upgrade</div>
                      <div className="text-xs text-green-400">+300% Income • $1.15M • Essential</div>
                    </div>
                  </label>
                  
                  {/* Staff Upgrade - CRITICAL */}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="bunkerStaffUpgrade"
                      checked={formData.bunkerStaffUpgrade || formData.bunkerUpgraded} 
                      onChange={handleInputChange} 
                      className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-green-500 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium">Staff Upgrade</div>
                      <div className="text-xs text-green-400">Faster Production • $600k • Essential</div>
                    </div>
                  </label>
                  
                  {/* Security Upgrade - OPTIONAL */}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition-colors opacity-70">
                    <input 
                      type="checkbox" 
                      name="bunkerSecurityUpgrade"
                      checked={formData.bunkerSecurityUpgrade} 
                      onChange={handleInputChange} 
                      className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-slate-500 focus:ring-slate-500"
                    />
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium">Security Upgrade</div>
                      <div className="text-xs text-slate-500">Reduces Raids • $351k • Optional</div>
                    </div>
                  </label>
                  
                  {/* Income Warning */}
                  {formData.hasBunker && !formData.bunkerEquipmentUpgrade && !formData.bunkerUpgraded && (
                    <div className="p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
                      🚨 <strong>PASSIVE INCOME LEAK:</strong> Your bunker is unupgraded. You're earning $20k/hr instead of $60k/hr. Equipment + Staff upgrades pay for themselves in 45 hours.
                    </div>
                  )}
                </div>
              </AssetCard>

              {/* AUTO SHOP */}
              <AssetCard
                label="Auto Shop"
                emoji="🔧"
                cost="$1.8M"
                isOwned={formData.hasAutoShop}
                onToggle={() => setFormData(p => ({ ...p, hasAutoShop: !p.hasAutoShop }))}
              >
                <div className="text-xs text-slate-500">
                  Solo-friendly contracts during Cayo cooldown. ~$200K/hr potential.
                </div>
              </AssetCard>

              {/* ENDGAME TOYS */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <AssetCard 
                   label="F-160 Raiju" 
                   emoji="✈️" 
                   cost="$6.8M" 
                   isOwned={formData.hasRaiju} 
                   onToggle={() => setFormData(p => ({...p, hasRaiju: !p.hasRaiju}))} 
                 />
                 <AssetCard
                   label="Safehouse"
                   emoji="🏋️"
                   cost="$3M+"
                   isOwned={formData.hasSafehouse}
                   onToggle={() => setFormData(p => ({...p, hasSafehouse: !p.hasSafehouse}))}
                 />
                 <AssetCard
                   label="Mansion"
                   emoji="🏛️"
                   cost="$11.5M-$12.8M"
                   isOwned={formData.hasMansion}
                   onToggle={() => setFormData(p => ({...p, hasMansion: !p.hasMansion, mansionType: p.hasMansion ? '' : p.mansionType}))}
                 >
                   {formData.hasMansion && (
                     <div className="p-2">
                       <label className="block text-xs text-slate-400 mb-1">Mansion Location:</label>
                       <select
                         value={formData.mansionType || ''}
                         onChange={(e) => setFormData(p => ({...p, mansionType: e.target.value}))}
                         className="w-full text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200"
                       >
                         <option value="">Select location...</option>
                         <option value="tongva">Tongva Estate ($11.5M)</option>
                         <option value="vinewood">Vinewood Residence ($12.2M)</option>
                         <option value="richman">Richman Villa ($12.8M)</option>
                       </select>
                     </div>
                   )}
                 </AssetCard>
              </div>

              {/* VEHICLES */}
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                 <AssetCard 
                   label="Oppressor Mk II" 
                   emoji="🏍️" 
                   cost="$8M" 
                   isOwned={formData.hasOppressor} 
                   onToggle={() => setFormData(p => ({...p, hasOppressor: !p.hasOppressor}))} 
                 />
                 <AssetCard 
                   label="Armored Kuruma" 
                   emoji="🚗" 
                   cost="$698k" 
                   isOwned={formData.hasArmoredKuruma} 
                   onToggle={() => setFormData(p => ({...p, hasArmoredKuruma: !p.hasArmoredKuruma}))} 
                 />
              </div>

            </div>
          </section>

          {/* Play Mode */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">Play Mode</h2>
            <div className="grid grid-cols-3 gap-3">
              {['invite', 'public', 'solo'].map(mode => (
                <label
                  key={mode}
                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.playMode === mode
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="playMode"
                    value={mode}
                    checked={formData.playMode === mode}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium capitalize">{mode === 'invite' ? 'Invite-Only' : mode}</span>
                </label>
              ))}
            </div>
          </section>

          {/* --- LIMITED TIME OFFERS SECTION --- */}
          <section className="space-y-4">
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/30">
              <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
                <span>🎁</span> Active Bonuses & Claims
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. FREE CAR WASH (Weekly Event) */}
                <label className={`flex items-center space-x-3 p-3 rounded cursor-pointer transition ${
                  formData.hasCarWash 
                    ? 'bg-slate-800 opacity-60' 
                    : 'bg-slate-800 hover:bg-slate-700 ring-2 ring-green-500/50'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.hasCarWash}
                    onChange={(e) => setFormData({ ...formData, hasCarWash: e.target.checked })}
                    className="form-checkbox h-5 w-5 text-green-500 rounded border-slate-600 bg-slate-700 focus:ring-offset-slate-900"
                  />
                  <div className="flex-1">
                    <span className={`font-medium ${formData.hasCarWash ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {formData.hasCarWash ? 'Claimed:' : 'Available:'} Hands-On Car Wash
                    </span>
                    <CarWashExpiryBadge claimed={formData.hasCarWash} />
                  </div>
                </label>

                {/* 2. FREE CAR (GTA+ Only) */}
                {formData.hasGTAPlus && (
                  <label className={`flex items-center space-x-3 p-3 rounded cursor-pointer transition ${
                    formData.claimedFreeCar
                      ? 'bg-slate-800 opacity-60'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.claimedFreeCar}
                      onChange={(e) => setFormData({ ...formData, claimedFreeCar: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-purple-500 rounded border-slate-600 bg-slate-700 focus:ring-offset-slate-900"
                    />
                    <div className="flex-1">
                      <span className={`font-medium ${formData.claimedFreeCar ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {formData.claimedFreeCar ? 'Claimed:' : 'Unclaimed:'} {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}
                      </span>
                      <div className="text-xs text-purple-400">GTA+ Monthly Benefit (Save ${((WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1850000) / 1000000).toFixed(1)}M)</div>
                    </div>
                  </label>
                )}

                {/* 3. CASINO WHEEL SPIN (GTA+ Only) */}
                {formData.hasGTAPlus && (
                  <label className={`flex items-center space-x-3 p-3 rounded cursor-pointer transition ${
                    formData.claimedWheelSpin
                      ? 'bg-slate-800 opacity-60'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={formData.claimedWheelSpin}
                      onChange={(e) => setFormData({ ...formData, claimedWheelSpin: e.target.checked })}
                      className="form-checkbox h-5 w-5 text-yellow-500 rounded border-slate-600 bg-slate-700 focus:ring-offset-slate-900"
                    />
                    <div className="flex-1">
                      <span className={`font-medium ${formData.claimedWheelSpin ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {formData.claimedWheelSpin ? 'Opted Out:' : 'Available:'} Casino Wheel Spin (2X Daily)
                      </span>
                      <div className="text-xs text-yellow-400">GTA+ Benefit - Check to hide recommendation</div>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </section>

          {errors.general && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Real-Time Trap Warnings */}
          {cascadeTraps.length > 0 && (
            <div className="space-y-3">
              {cascadeTraps.map(trap => (
                <TrapBlockingWarning key={trap.id} trap={trap} />
              ))}
            </div>
          )}
          
          {hasCriticalTrap && !cascadeTraps.length && (
            <div className="p-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-red-300 mb-1">
                    ⚠️ {criticalTraps.length} Critical Issue{criticalTraps.length !== 1 ? 's' : ''} Detected
                  </h4>
                  <p className="text-sm text-red-200 mb-2">
                    Your current setup has issues costing you money. Run the assessment to see detailed fixes.
                  </p>
                  <ul className="text-sm text-red-300 space-y-1">
                    {criticalTraps.map(trap => (
                      <li key={trap.id}>• {trap.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <button 
            type="button"
            onClick={runAssessment}
            disabled={isCalculating}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98]"
          >
            {isCalculating ? 'Calculating...' : 'Run Assessment'}
          </button>

        </div>
      </div>
    </div>
  );
}
