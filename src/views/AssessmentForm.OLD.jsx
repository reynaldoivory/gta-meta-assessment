// src/views/AssessmentForm.jsx
import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAssessment } from '../context/AssessmentContext';
import { Activity, Zap, Briefcase, CheckCircle, Cloud, Save, Trash2, AlertCircle } from 'lucide-react';
import StatBar from '../components/shared/StatBar';
import AssetCard from '../components/shared/AssetCard';
import WeeklyBonusBanner from '../components/shared/WeeklyBonusBanner';
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

// Helper: clear a single field error
const clearFieldError = (name, errors, setErrors) => {
  if (errors[name]) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};

// Helper: handle checkbox change for property toggles (has* fields) with purchase date tracking
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

// Helper: render the save status indicator
const renderSaveStatus = (localStorageAvailable, isSaving, lastSaved) => {
  if (!localStorageAvailable) return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <span className="text-xs">⚠️ Private Mode</span>
    </div>
  );
  if (isSaving) return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <Cloud className="w-4 h-4 animate-pulse" />
      <span className="text-xs">Saving...</span>
    </div>
  );
  if (lastSaved) return (
    <div className="flex items-center gap-2 text-green-400 text-sm">
      <CheckCircle className="w-4 h-4" />
      <span className="text-xs">Saved {formatLastSaved(lastSaved)}</span>
    </div>
  );
  return null;
};

// Helper: get error-aware border class
const errorBorder = (errors, field) => 
  errors[field] ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-700';

// Helper: get simple error-aware border class (no ring)
const errorBorderSimple = (errors, field) => 
  errors[field] ? 'border-red-500' : 'border-slate-700';

// Helper: time played conversions
const hasAnyTimeParts = (formData) => (
  [formData.timePlayedDays, formData.timePlayedHours]
    .some(value => value !== '' && value !== undefined && value !== null)
);

const clampTimePart = (value, max) => {
  if (value === '') return '';
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return '';
  const clamped = Math.min(Math.max(Math.floor(parsed), 0), max ?? Number.MAX_SAFE_INTEGER);
  return String(clamped);
};

const calculateTotalHours = (days, hours, minutes = 0) => {
  const total = days * 24 + hours + minutes / 60;
  return Math.round(total);
};

const formatHours = (value) => {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

// Helper: format number with commas for display (like GTA UI)
const formatCurrency = (value) => {
  if (!value || value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('en-US');
};

// Sub-component: GTA+ Vehicle Reminder
const GTAPlusVehicleReminder = ({ formData }) => {
  const show = formData.hasGTAPlus && !formData.claimedFreeCar && !formData.hasRaiju && !formData.hasOppressor;
  if (!show) return null;
  return (
    <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center gap-4">
      <div className="text-3xl">🏎️</div>
      <div className="flex-1">
        <div className="font-bold text-white mb-1">Don&apos;t Forget: Free {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}</div>
        <div className="text-sm text-slate-300">
          Claim it at {WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'The Vinewood Car Club'}. Worth ${((WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1850000) / 1000000).toFixed(1)}M for free. Perfect for early-game transport.
        </div>
      </div>
    </div>
  );
};

// Sub-component: Bunker warning
const BunkerWarning = ({ formData }) => {
  const show = formData.hasBunker && (!formData.bunkerEquipmentUpgrade || !formData.bunkerStaffUpgrade);
  if (!show) return null;
  return (
    <div className="p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
      🚨 <strong>PASSIVE INCOME LEAK:</strong> Your bunker is unupgraded. You&apos;re earning $20k/hr instead of $60k/hr. Equipment + Staff upgrades pay for themselves in 45 hours.
    </div>
  );
};

// Sub-component: Mule warning
const MuleWarning = ({ formData }) => {
  const show = formData.nightclubStorage?.hasMule && !formData.nightclubStorage?.hasPounder;
  if (!show) return null;
  return (
    <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-300">
      ⚠️ <strong>Warning:</strong> The Mule is slow and buggy. You still need the Pounder for 90+ crate sales. Consider buying Pounder instead.
    </div>
  );
};



// Sub-component: Active Bonuses & Claims section
const BonusClaimsSection = ({ formData, setFormData }) => {
  if (!formData.hasGTAPlus) {
    return (
      <section className="space-y-4">
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/30">
          <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2">
            <span>🎁</span> GTA+ Exclusive Benefits
            <span className="ml-auto text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">LOCKED</span>
          </h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p className="font-medium">Subscribe to GTA+ to unlock:</p>
            <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
              <li><strong>Free Monthly Vehicle</strong> - A new premium car automatically delivered each month</li>
              <li><strong>Daily Casino Spin Bonus</strong> - 2X daily spins for extra cash and rewards</li>
              <li><strong>2X Security Contracts</strong> - Double pay on Agency contract missions</li>
              <li><strong>6X Lunar Stunt Race Bonuses</strong> - Triple multiplier on bonus race events</li>
              <li><strong>Plus $500k monthly GTA$ deposit</strong></li>
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-4 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/20">
        <h3 className="text-lg font-bold text-purple-200 mb-3 flex items-center gap-2">
          <span>🎁</span> GTA+ Exclusive Benefits
          <span className="ml-auto text-xs bg-purple-700 text-purple-100 px-2 py-1 rounded">ACTIVE</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. FREE CAR (GTA+ Only) */}
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
              aria-label="Claimed free GTA+ vehicle"
            />
            <div className="flex-1">
              <span className={`font-medium ${formData.claimedFreeCar ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                {formData.claimedFreeCar ? 'Claimed:' : 'Unclaimed:'} {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}
              </span>
              <div className="text-xs text-purple-400">Monthly Benefit (Save ${((WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1850000) / 1000000).toFixed(1)}M)</div>
            </div>
          </label>

          {/* 2. CASINO WHEEL SPIN (GTA+ Only) */}
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
              aria-label="Casino Wheel Spin opted out"
            />
            <div className="flex-1">
              <span className={`font-medium ${formData.claimedWheelSpin ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                {formData.claimedWheelSpin ? 'Opted Out:' : 'Available:'} Casino Wheel Spin (2X Daily)
              </span>
              <div className="text-xs text-yellow-400">Special Benefit - Check to hide recommendation</div>
            </div>
          </label>
        </div>
      </div>
    </section>
  );
};

// Sub-component: Form footer with errors, trap warnings, and submit button
const FormFooter = ({ errors, cascadeTraps, hasCriticalTrap, criticalTraps, runAssessment, isCalculating }) => (
  <>
    {errors.general && (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-sm">{errors.general}</p>
      </div>
    )}

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
              ⚠️ {criticalTraps.length} Critical Issue{criticalTraps.length === 1 ? '' : 's'} Detected
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
  </>
);

// PropTypes for sub-components
GTAPlusVehicleReminder.propTypes = { formData: PropTypes.object.isRequired };
BunkerWarning.propTypes = { formData: PropTypes.object.isRequired };
MuleWarning.propTypes = { formData: PropTypes.object.isRequired };

BonusClaimsSection.propTypes = { formData: PropTypes.object.isRequired, setFormData: PropTypes.func.isRequired };
FormFooter.propTypes = {
  errors: PropTypes.object.isRequired,
  cascadeTraps: PropTypes.array.isRequired,
  hasCriticalTrap: PropTypes.bool.isRequired,
  criticalTraps: PropTypes.array.isRequired,
  runAssessment: PropTypes.func.isRequired,
  isCalculating: PropTypes.bool.isRequired,
};

// Module-level constant: quick fill presets
const QUICK_FILL_PRESETS = {
  'New Player': {
    rank: '25',
    timePlayed: '10',
    timePlayedDays: '0',
    timePlayedHours: '10',
    timePlayedMode: 'parts',
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
    timePlayedDays: '4',
    timePlayedHours: '4',
    timePlayedMode: 'parts',
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
    hasCarWash: true,
    hasWeedFarm: false,
    hasHeliTours: false,
    sellsToStreetDealers: true,
    dreContractDone: true,
    payphoneUnlocked: true,
    securityContracts: '150',
    hasGTAPlus: false,
    playMode: 'invite'
  },
  'Endgame 2026': {
    rank: '150',
    timePlayed: '500',
    timePlayedDays: '20',
    timePlayedHours: '20',
    timePlayedMode: 'parts',
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
    hasCarWash: true,
    hasWeedFarm: true,
    hasHeliTours: true,
    sellsToStreetDealers: true,
    hasGTAPlus: true,
    playMode: 'invite'
  }
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

  const timePlayedHasParts = useMemo(
    () => hasAnyTimeParts(formData),
    [formData.timePlayedDays, formData.timePlayedHours]
  );
  const timePlayedMode = formData.timePlayedMode || 'parts';
  const timePlayedTotal = useMemo(() => {
    if (timePlayedHasParts) {
      const days = Number(formData.timePlayedDays) || 0;
      const hours = Number(formData.timePlayedHours) || 0;
      const minutes = Number(formData.timePlayedMinutes) || 0;
      return calculateTotalHours(days, hours, minutes);
    }
    const fallback = Number(formData.timePlayed);
    return Number.isFinite(fallback) ? Math.round(fallback) : 0;
  }, [
    timePlayedHasParts,
    formData.timePlayed,
    formData.timePlayedDays,
    formData.timePlayedHours,
    formData.timePlayedMinutes
  ]);

  // Input change handler with auto purchase date tracking
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Auto-track purchase dates when property checkboxes are toggled ON
    if (type === 'checkbox' && name.startsWith('has')) {
      handleCheckboxChange(name, checked, setFormData, errors, setErrors);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    clearFieldError(name, errors, setErrors);
  };

  const handleTimePlayedPartChange = (e) => {
    const { name, value } = e.target;
    const max = name === 'timePlayedHours' ? 23 : undefined;
    const normalized = clampTimePart(value, max);

    setFormData(prev => {
      const next = { ...prev, [name]: normalized, timePlayedMinutes: '', timePlayedMode: 'parts' };
      const hasParts = hasAnyTimeParts(next);
      if (!hasParts) {
        return { ...next, timePlayed: '' };
      }

      const days = Number(next.timePlayedDays) || 0;
      const hours = Number(next.timePlayedHours) || 0;
      const minutes = Number(next.timePlayedMinutes) || 0;
      const totalHours = calculateTotalHours(days, hours, minutes);
      return { ...next, timePlayed: String(totalHours) };
    });

    clearFieldError('timePlayed', errors, setErrors);
  };

  const handleTimePlayedTotalChange = (e) => {
    const { value } = e.target;
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        timePlayed: '',
        timePlayedDays: '',
        timePlayedHours: '',
        timePlayedMinutes: '',
        timePlayedMode: 'total'
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
      timePlayedMode: 'total'
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
      timePlayedMinutes: ''
    }));

    clearFieldError('timePlayed', errors, setErrors);
  };

  const handleTimePlayedModeFocus = (mode) => {
    setFormData(prev => {
      const hasParts = (prev.timePlayedDays !== undefined && prev.timePlayedDays !== '') || 
                       (prev.timePlayedHours !== undefined && prev.timePlayedHours !== '');
      const hasTotal = prev.timePlayed !== undefined && prev.timePlayed !== '';

      // Only switch modes if the other mode is empty; prevents accidental flips
      if (mode === 'parts' && hasTotal && !hasParts) {
        return { ...prev, timePlayedMode: mode };
      }
      if (mode === 'total' && hasParts && !hasTotal) {
        return { ...prev, timePlayedMode: mode };
      }
      
      return prev;
    });
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
    if (QUICK_FILL_PRESETS[preset]) {
      setFormData(prev => ({ ...prev, ...QUICK_FILL_PRESETS[preset] }));
    }
  };

  return (
    <div className="min-h-screen bg-gta-dark p-4 md:p-8 font-body text-slate-200">
      {/* HEIST PLANNING BOARD HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between border-b-2 border-gta-green pb-4">
          <div>
            <h1 className="text-5xl font-bold text-white font-heading tracking-wider">HEIST PLANNING BOARD</h1>
            <p className="text-gta-green text-sm mt-1">↳ Analyze your assets and vitals for operation success</p>
          </div>
          <div className="flex items-center gap-3">
            {renderSaveStatus(localStorageAvailable, isSaving, lastSaved)}
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6" ref={formContainerRef}>
        
        {/* ============================================
            SIDEBAR (COL-SPAN-4): VITALS PANEL
            ============================================ */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* VITALS HEADER */}
          <div className="bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-gta-green rounded-lg p-6 shadow-heist">
            <h2 className="text-xl font-bold text-gta-green font-heading uppercase mb-1">Operative Vitals</h2>
            <p className="text-xs text-gta-gray">Click bars to adjust stats</p>
          </div>

          {/* STATS PROGRESS BARS */}
          <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
            {['Strength', 'Flying', 'Shooting', 'Stealth', 'Driving', 'Stamina'].map(stat => {
              const statKey = stat.toLowerCase();
              return (
                <div key={stat}>
                  <StatBar 
                    label={stat} 
                    value={formData[statKey] || 0} 
                    onChange={(val) => handleStatChange(statKey, val)}
                  />
                  {errors[statKey] && (
                    <p className="text-xs text-gta-red mt-1 ml-1">{errors[statKey]}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* RANK & CASH SUMMARY */}
          <div className="bg-gta-panel border border-gta-green/30 rounded-lg p-6 space-y-4">
            <div>
              <label htmlFor="rank" className="text-xs text-gta-gray font-bold uppercase block mb-2">Rank</label>
              <input 
                id="rank"
                name="rank" 
                type="number" 
                placeholder="0"
                value={formData.rank} 
                onChange={handleInputChange} 
                className={`w-full bg-slate-800 border border-gta-green/50 rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors text-white ${errorBorder(errors, 'rank')}`}
                min="0"
                max="8000"
              />
            </div>
            
            <div>
              <label htmlFor="liquidCash" className="text-xs text-gta-gray font-bold uppercase block mb-2">Available Cash</label>
              <div className="relative">
                <input 
                  id="liquidCash"
                  name="liquidCash" 
                  type="number" 
                  placeholder="0"
                  value={formData.liquidCash} 
                  onChange={handleInputChange} 
                  className={`w-full bg-slate-800 border border-gta-green/50 rounded p-3 focus:border-gta-green focus:ring-2 focus:ring-gta-green/20 outline-none transition-colors ${formData.liquidCash && formData.liquidCash !== '0' && formData.liquidCash !== 0 ? 'text-transparent' : 'text-white'} ${errorBorder(errors, 'liquidCash')}`}
                />
                {formData.liquidCash && formData.liquidCash !== '0' && formData.liquidCash !== 0 && !errors.liquidCash && (
                  <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gta-green font-mono text-lg">$ {formatCurrency(formData.liquidCash)}</div>
                )}
              </div>
              {errors.liquidCash && (
                <div className="flex items-center gap-1 mt-1 text-gta-red text-xs">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.liquidCash}</span>
                </div>
              )}
            </div>
          </div>

          {/* GTA+ STATUS */}
          <div className={`border-2 rounded-lg p-4 ${formData.hasGTAPlus ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-purple-500/60' : 'bg-gta-panel border-gta-green/30'}`}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                name="hasGTAPlus"
                checked={formData.hasGTAPlus} 
                onChange={handleInputChange} 
                className="w-5 h-5 rounded bg-slate-700 border-gta-green checked:bg-purple-500 focus:ring-purple-500 cursor-pointer"
                aria-label="GTA+ Subscriber"
              />
              <div className="flex-1">
                <div className="text-white font-bold text-sm">GTA+ Subscriber</div>
                <div className="text-xs text-gta-gray">+$500k/month, 2X Lucky Wheel</div>
              </div>
            </label>
          </div>
        </aside>

        {/* ============================================
            MAIN AREA (COL-SPAN-8): ASSETS & BUSINESS STATUS
            ============================================ */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* ASSETS & BUSINESS HEADER */}
          <div className="bg-gradient-to-br from-gta-panel to-slate-900 border-2 border-gta-green rounded-lg p-6 shadow-heist">
            <h2 className="text-xl font-bold text-gta-green font-heading uppercase mb-1">Assets & Operations</h2>
            <p className="text-xs text-gta-gray">Toggle owned properties and upgrades</p>
          </div>

          {/* CRITICAL ALERTS */}
          {cascadeTraps.length > 0 && (
            <div className="space-y-3">
              {cascadeTraps.map(trap => (
                <TrapBlockingWarning key={trap.id} trap={trap} />
              ))}
            </div>
          )}

          {hasCriticalTrap && !cascadeTraps.length && (
            <div className="p-4 bg-gta-red/10 border-2 border-gta-red rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-gta-red flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gta-red mb-1">
                    ⚠️ {criticalTraps.length} Critical Issue{criticalTraps.length === 1 ? '' : 's'} Detected
                  </h4>
                  <p className="text-sm text-slate-300 mb-2">
                    Your current setup has issues costing you money. Run the assessment to see detailed fixes.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {criticalTraps.map(trap => (
                      <li key={trap.id}>• {trap.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ASSET CATEGORIES */}
          <AssetCategories formData={formData} handleInputChange={handleInputChange} errors={errors} />
            
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2">
              {renderSaveStatus(localStorageAvailable, isSaving, lastSaved)}
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
        <GTAPlusVehicleReminder formData={formData} />

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
                  className={`w-full bg-slate-900 border rounded p-3 focus:border-blue-500 outline-none ${errorBorderSimple(errors, 'rank')}`}
                />
                {errors.rank && (
                  <p className="text-xs text-red-400 mt-1">{errors.rank}</p>
                )}
              </div>
              <div>
                <label htmlFor="liquidCash" className="text-xs text-slate-500 font-bold uppercase block mb-1">Cash</label>
                <div className="relative">
                  <input 
                    id="liquidCash"
                    name="liquidCash" 
                    type="number" 
                    placeholder="e.g. 50,000,000"
                    value={formData.liquidCash} 
                    onChange={handleInputChange} 
                    className={`w-full bg-slate-900 border rounded p-3 focus:border-green-500 outline-none transition-colors ${formData.liquidCash && formData.liquidCash !== '0' && formData.liquidCash !== 0 ? 'text-transparent' : ''} ${errorBorder(errors, 'liquidCash')}`}
                  />
                  {formData.liquidCash && formData.liquidCash !== '0' && formData.liquidCash !== 0 && !errors.liquidCash && (
                    <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-green-400 font-mono text-lg">$ {formatCurrency(formData.liquidCash)}</div>
                  )}
                </div>
                {errors.liquidCash && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.liquidCash}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="totalRPCollected" className="text-xs text-slate-500 font-bold uppercase block mb-1">Total RP (lifetime)</label>
                <div className="relative">
                  <input 
                    id="totalRPCollected"
                    name="totalRPCollected" 
                    type="number" 
                    placeholder="e.g. 50,000,000"
                    value={formData.totalRPCollected} 
                    onChange={handleInputChange} 
                    className={`w-full bg-slate-900 border rounded p-3 focus:border-purple-500 outline-none transition-colors ${formData.totalRPCollected && formData.totalRPCollected !== '0' && formData.totalRPCollected !== 0 ? 'text-transparent' : ''} ${errorBorder(errors, 'totalRPCollected')}`}
                  />
                  {formData.totalRPCollected && formData.totalRPCollected !== '0' && formData.totalRPCollected !== 0 && !errors.totalRPCollected && (
                    <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-purple-400 font-mono text-lg">{formatCurrency(formData.totalRPCollected)} RP</div>
                  )}
                </div>
                {errors.totalRPCollected && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.totalRPCollected}</span>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="totalIncomeCollected" className="text-xs text-slate-500 font-bold uppercase block mb-1">Total Income (lifetime)</label>
                <div className="relative">
                  <input 
                    id="totalIncomeCollected"
                    name="totalIncomeCollected" 
                    type="number" 
                    placeholder="e.g. 500,000,000"
                    value={formData.totalIncomeCollected} 
                    onChange={handleInputChange} 
                    className={`w-full bg-slate-900 border rounded p-3 focus:border-green-500 outline-none transition-colors ${formData.totalIncomeCollected && formData.totalIncomeCollected !== '0' && formData.totalIncomeCollected !== 0 ? 'text-transparent' : ''} ${errorBorder(errors, 'totalIncomeCollected')}`}
                  />
                  {formData.totalIncomeCollected && formData.totalIncomeCollected !== '0' && formData.totalIncomeCollected !== 0 && !errors.totalIncomeCollected && (
                    <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-green-400 font-mono text-lg">$ {formatCurrency(formData.totalIncomeCollected)}</div>
                  )}
                </div>
                {errors.totalIncomeCollected && (
                  <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.totalIncomeCollected}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-600">
              <p>💡 Find these in Stats → Career Progress (Lifetime Stats). Helps compare your efficiency to community benchmarks.</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
              <input 
                type="checkbox" 
                name="hasGTAPlus"
                checked={formData.hasGTAPlus} 
                onChange={handleInputChange} 
                className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-blue-500 focus:ring-blue-500"
                aria-label="GTA+ Subscriber"
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
            <div>
              <label htmlFor="timePlayedDays" className="text-xs text-slate-500 font-bold uppercase block mb-1">
                Total Hours Played
                {' '}<span className="text-slate-600 font-normal">(cumulative, for efficiency calculation)</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleTimePlayedModeChange('parts')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${timePlayedMode === 'parts'
                    ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                >
                  Days + Hours
                </button>
                <button
                  type="button"
                  onClick={() => handleTimePlayedModeChange('total')}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${timePlayedMode === 'total'
                    ? 'bg-yellow-500/20 border-yellow-500/60 text-yellow-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                >
                  Total Hours
                </button>
              </div>
              {timePlayedMode === 'parts' ? (
                <div className="grid grid-cols-2 gap-3 transition-all duration-200 ease-in-out">
                  <div>
                    <label htmlFor="timePlayedDays" className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Days</label>
                    <input 
                      id="timePlayedDays"
                      name="timePlayedDays"
                      type="number" 
                      placeholder="0"
                      value={formData.timePlayedDays} 
                      onChange={handleTimePlayedPartChange} 
                      onFocus={() => handleTimePlayedModeFocus('parts')}
                      className={`w-full bg-slate-900 border rounded p-3 focus:border-yellow-500 outline-none ${errorBorderSimple(errors, 'timePlayed')}`}
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="timePlayedHours" className="text-[11px] text-slate-500 font-bold uppercase block mb-1">Hours</label>
                    <input 
                      id="timePlayedHours"
                      name="timePlayedHours"
                      type="number" 
                      placeholder="0"
                      value={formData.timePlayedHours} 
                      onChange={handleTimePlayedPartChange} 
                      onFocus={() => handleTimePlayedModeFocus('parts')}
                      className={`w-full bg-slate-900 border rounded p-3 focus:border-yellow-500 outline-none ${errorBorderSimple(errors, 'timePlayed')}`}
                      min="0"
                      max="23"
                    />
                  </div>
                </div>
              ) : (
                <div className="transition-all duration-200 ease-in-out">
                  <label htmlFor="timePlayed" className="text-[11px] text-slate-500 font-bold uppercase block mb-1">
                    Total Hours (rounded)
                  </label>
                  <input
                    id="timePlayed"
                    name="timePlayed"
                    type="number"
                    placeholder="e.g. 142"
                    value={formData.timePlayed}
                    onChange={handleTimePlayedTotalChange}
                    onFocus={() => handleTimePlayedModeFocus('total')}
                    className={`w-full bg-slate-900 border rounded p-3 focus:border-yellow-500 outline-none ${errorBorderSimple(errors, 'timePlayed')}`}
                    min="0"
                    step="0.1"
                  />
                </div>
              )}
              <div className="text-xs text-slate-600 mt-2">
                Total (rounded to nearest hour): <span className="text-slate-200">{
                  timePlayedHasParts || formData.timePlayed ? formatHours(timePlayedTotal) : '—'
                }</span> hours
              </div>
              {errors.timePlayed ? (
                <p className="text-xs text-red-400 mt-1">{errors.timePlayed}</p>
              ) : (
                <div className="text-xs text-slate-600 mt-1">
                  Use days + hours from the GTA stats screen, or enter total hours directly if you track playtime elsewhere.
                </div>
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
                <div className="text-xs text-slate-500 mt-1">
                  Unlocks Cayo Perico Heist (~$700k avg/run). One of many income sources.
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
                    className={`w-full bg-slate-800 border rounded p-2 text-sm focus:border-purple-500 outline-none transition-colors ${errorBorder(errors, 'securityContracts')}`}
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
                      {' '}<span className="text-yellow-400 font-normal">← Affects AFK Duration</span>
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
                        aria-label="Nightclub Equipment Upgrade"
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
                        aria-label="Nightclub Staff Upgrade"
                      />
                      <div>
                        <span className="text-sm text-slate-300">Staff</span>
                        <div className="text-[10px] text-slate-500">Popularity</div>
                      </div>
                    </label>
                  </div>

                  {/* Delivery Vehicles */}
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase mb-2 block">
                      Delivery Vehicles
                      {' '}<span className="text-red-400 font-normal">← Critical for Large Sales</span>
                    </div>
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
                          aria-label="Pounder Custom delivery vehicle"
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
                          aria-label="Mule Custom delivery vehicle"
                        />
                        <div>
                          <span className="text-sm text-slate-300">Mule Custom</span>
                          <div className="text-[10px] text-red-400">⚠️ Trap</div>
                        </div>
                      </label>
                    </div>
                    <MuleWarning formData={formData} />
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
                      aria-label="Bunker Equipment Upgrade"
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
                      aria-label="Bunker Staff Upgrade"
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
                      aria-label="Bunker Security Upgrade"
                    />
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium">Security Upgrade</div>
                      <div className="text-xs text-slate-500">Reduces Raids • $351k • Optional</div>
                    </div>
                  </label>
                  
                  {/* Income Warning */}
                  <BunkerWarning formData={formData} />
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
                  Solo-friendly robbery contracts. Union Depository pays ~$300k. ~$400-600K/hr potential.
                </div>
              </AssetCard>

              {/* CAR WASH */}
              <AssetCard
                label="Car Wash"
                emoji="🚿"
                cost="$1.5M"
                isOwned={formData.hasCarWash}
                onToggle={() => setFormData(p => ({ ...p, hasCarWash: !p.hasCarWash }))}
              >
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">Passive income. Add feeder businesses to boost earnings:</div>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="hasWeedFarm"
                      checked={formData.hasWeedFarm} 
                      onChange={handleInputChange} 
                      className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-green-500 focus:ring-green-500"
                      aria-label="Weed Farm feeder"
                    />
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium text-sm">🌿 Weed Farm</div>
                      <div className="text-xs text-slate-500">$715K • Adds ~$10K/hr passive to Car Wash</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      name="hasHeliTours"
                      checked={formData.hasHeliTours} 
                      onChange={handleInputChange} 
                      className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-blue-500 focus:ring-blue-500"
                      aria-label="Helicopter Tours feeder"
                    />
                    <div className="flex-1">
                      <div className="text-slate-200 font-medium text-sm">🚁 Helicopter Tours</div>
                      <div className="text-xs text-slate-500">$750K • Adds ~$8K/hr passive to Car Wash</div>
                    </div>
                  </label>
                </div>
              </AssetCard>

              {/* STREET DEALERS */}
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="sellsToStreetDealers"
                    checked={formData.sellsToStreetDealers} 
                    onChange={handleInputChange} 
                    className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-emerald-500 focus:ring-emerald-500"
                    aria-label="Sells to Street Dealers daily"
                  />
                  <div className="flex-1">
                    <div className="text-slate-200 font-bold flex items-center gap-2">
                      <span>💊</span> Street Dealers
                      <span className="text-xs bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded-full">Daily</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      3 dealers refresh daily at 07:00 UTC. Sell Cocaine, Meth, Weed & Acid.
                      ~$202K/day base, ~$250K/day avg w/ premium bonuses. Takes ~15 min.
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Requires: MC businesses (Coke, Meth, Weed) + Acid Lab stocked
                    </div>
                  </div>
                </label>
              </div>

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
                       <label htmlFor="mansionType" className="block text-xs text-slate-400 mb-1">Mansion Location:</label>
                       <select
                         id="mansionType"
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

          {/* Daily Cash Loop */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-emerald-400"/> Daily Cash Loop</h2>
            <div className="text-xs text-slate-500">
              Check these if you already did them today. If left unchecked, they are added to your guide.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  name="dailyStashHouse"
                  checked={formData.dailyStashHouse}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-emerald-500 focus:ring-emerald-500"
                  aria-label="Completed Stash House today"
                />
                <div>
                  <div className="font-medium text-slate-100">🏚️ Stash House</div>
                  <div className="text-xs text-slate-400">Daily raid for free supplies</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  name="dailyGsCache"
                  checked={formData.dailyGsCache}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-emerald-500 focus:ring-emerald-500"
                  aria-label="Completed G's Cache today"
                />
                <div>
                  <div className="font-medium text-slate-100">🗺️ G's Cache</div>
                  <div className="text-xs text-slate-400">Daily cash + ammo/snacks</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  name="dailySafeCollect"
                  checked={formData.dailySafeCollect}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 checked:bg-emerald-500 focus:ring-emerald-500"
                  aria-label="Collected safe income today"
                />
                <div>
                  <div className="font-medium text-slate-100">💰 Collect Safes</div>
                  <div className="text-xs text-slate-400">Nightclub/Agency safes</div>
                </div>
              </label>
            </div>
          </section>

          {/* GTA+ Exclusive Benefits & Claims */}
          <BonusClaimsSection formData={formData} setFormData={setFormData} />

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

          {/* Errors, Trap Warnings, Submit */}
          <FormFooter
            errors={errors}
            cascadeTraps={cascadeTraps}
            hasCriticalTrap={hasCriticalTrap}
            criticalTraps={criticalTraps}
            runAssessment={runAssessment}
            isCalculating={isCalculating}
          />

        </div>
      </div>
    </div>
  );
}
