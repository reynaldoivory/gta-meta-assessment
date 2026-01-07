import React, { useState, useMemo, useCallback } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Info, Zap } from 'lucide-react';

// Constants for validation and calculations
const MAX_GTA_MONEY = 2147483647; // Max 32-bit signed integer
const MAX_RANK = 8000;
const MAX_STAT = 100;
const MIN_STAT = 0;

// GTA Online 2026 Meta Constants
const CAYO_COOLDOWN_SOLO = 144; // 2.5 hours in minutes
const CAYO_COOLDOWN_CREW = 48; // 48 minutes
const CAYO_SOLO_AVG_PAYOUT = 1100000; // Post-nerf average
const CAYO_CREW_AVG_PAYOUT = 1700000;
const ACID_LAB_UPGRADED_PAYOUT = 335000;
const ACID_LAB_UNGRADED_PAYOUT = 300000;
const ACID_LAB_UPGRADED_TIME = 210; // 3.5 hours
const ACID_LAB_UNGRADED_TIME = 300; // 5 hours
const NIGHTCLUB_FULL_PAYOUT = 1500000;
const NIGHTCLUB_FULL_TIME = 1200; // 20 hours
const BUNKER_UPGRADED_PAYOUT = 210000;
const BUNKER_PRODUCTION_TIME = 150; // 2.5 hours
const AGENCY_SAFE_PAYOUT = 20000;
const AGENCY_SAFE_CYCLE = 48; // minutes
const PAYPHONE_HIT_PAYOUT = 85000;
const PAYPHONE_HIT_TIME = 5;
const PAYPHONE_COOLDOWN = 48;

/**
 * Validates and sanitizes numeric input
 * @param {string|number} value - Input value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Validated number or 0
 */
const validateNumericInput = (value, min = 0, max = MAX_GTA_MONEY) => {
  if (value === '' || value === null || value === undefined) return 0;
  const num = Number.parseFloat(String(value), 10);
  if (Number.isNaN(num)) return 0;
  if (num < min) return min;
  if (num > max) return max;
  return Math.floor(num);
};

/**
 * Validates stat input (0-100)
 * @param {string|number} value - Input value
 * @returns {number} - Validated stat value
 */
const validateStat = (value) => validateNumericInput(value, MIN_STAT, MAX_STAT);

/**
 * Validates money input
 * @param {string|number} value - Input value
 * @returns {number} - Validated money value
 */
const validateMoney = (value) => validateNumericInput(value, 0, MAX_GTA_MONEY);

/**
 * Calculate hourly income based on payout, activity time, and cooldown
 * @param {number} payout - Payout amount
 * @param {number} activityTimeMinutes - Time to complete activity
 * @param {number} cooldownMinutes - Cooldown period
 * @returns {number} - Hourly income rate
 */
const calculateHourlyIncome = (payout, activityTimeMinutes, cooldownMinutes = 0) => {
  const totalCycleTime = activityTimeMinutes + cooldownMinutes;
  if (totalCycleTime <= 0 || payout <= 0) return 0;
  return (payout / totalCycleTime) * 60;
};

export default function GTAMetaAssessment() {
  const [formData, setFormData] = useState({
    rank: '',
    strengthStat: '',
    stealthStat: '',
    shootingStat: '',
    drivingStat: '',
    flyingStat: '',
    hasKosatka: false,
    hasSparrow: false,
    hasOppressor: false,
    hasAcidLab: false,
    hasNightclub: false,
    hasBunker: false,
    hasAgency: false,
    hasAutoShop: false,
    nightclubTechs: 0,
    nightclubFeederBusinesses: 0,
    bunkerUpgraded: false,
    agencyHasDre: false,
    agencyPayphoneUnlocked: false,
    securityContractsDone: 0,
    cayoAvgTime: '',
    cayoCompletions: 0,
    cayoAvgPayout: '',
    playMode: 'solo',
    weeklyBonusActive: false,
    acidLabUpgraded: false
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * Handles input changes with validation
   * @param {string} field - Field name
   * @param {string|boolean|number} value - New value
   */
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Validate numeric fields
      if (field === 'rank') {
        newData[field] = validateNumericInput(value, 1, MAX_RANK);
      } else if (field.endsWith('Stat')) {
        newData[field] = validateStat(value);
      } else if (field === 'cayoAvgPayout' || field === 'cayoAvgTime') {
        newData[field] = validateMoney(value);
      } else if (field === 'cayoCompletions' || field === 'securityContractsDone') {
        newData[field] = validateNumericInput(value, 0, 10000);
      } else if (field === 'nightclubTechs' || field === 'nightclubFeederBusinesses') {
        newData[field] = validateNumericInput(value, 0, 5);
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Calculates the assessment with error handling
   */
  const calculateAssessment = useCallback(() => {
    try {
      setIsCalculating(true);
      setErrors({});
      
      let score = 0;
      let passiveIncome = 0;
      let activeIncome = 0;
      const bottlenecks = [];
      const actionPlan = [];
      const incomeBreakdown = [];

      // Stats scoring (25 points max)
      const stats = [
        { name: 'Strength', value: validateStat(formData.strengthStat), weight: 5 },
        { name: 'Stealth', value: validateStat(formData.stealthStat), weight: 5 },
        { name: 'Shooting', value: validateStat(formData.shootingStat), weight: 5 },
        { name: 'Driving', value: validateStat(formData.drivingStat), weight: 5 },
        { name: 'Flying', value: validateStat(formData.flyingStat), weight: 5 }
      ];

      stats.forEach(stat => {
        const statScore = (stat.value / 100) * stat.weight;
        score += statScore;
        if (stat.value < 80) {
          bottlenecks.push(`${stat.name} at ${stat.value}/100 (affects performance)`);
        }
      });

      // Kosatka + Cayo scoring (20 points max)
      if (formData.hasKosatka) {
        score += 5;
        const cayoTime = validateMoney(formData.cayoAvgTime);
        const cayoCount = validateNumericInput(formData.cayoCompletions, 0, 10000);
        const cayoPayout = validateMoney(formData.cayoAvgPayout);
        const cooldown = formData.playMode === 'solo' ? CAYO_COOLDOWN_SOLO : CAYO_COOLDOWN_CREW;

        if (cayoCount >= 10) {
          let cayoPayoutValue = cayoPayout;
          // If no payout entered, estimate based on 2026 nerfed values
          if (cayoPayoutValue === 0) {
            cayoPayoutValue = formData.playMode === 'solo' ? CAYO_SOLO_AVG_PAYOUT : CAYO_CREW_AVG_PAYOUT;
          }

          if (cayoTime > 0 && cayoTime < 50) {
            score += 10;
            const hourlyIncome = calculateHourlyIncome(cayoPayoutValue, cayoTime, cooldown);
            activeIncome += hourlyIncome;
            incomeBreakdown.push({
              source: 'Cayo Perico Heist',
              hourly: hourlyIncome,
              payout: cayoPayoutValue,
              cycleTime: cayoTime + cooldown
            });
          } else if (cayoTime >= 50 && cayoTime < 70) {
            score += 7;
            const hourlyIncome = calculateHourlyIncome(cayoPayoutValue, cayoTime, cooldown);
            activeIncome += hourlyIncome;
            incomeBreakdown.push({
              source: 'Cayo Perico Heist',
              hourly: hourlyIncome,
              payout: cayoPayoutValue,
              cycleTime: cayoTime + cooldown
            });
          } else if (cayoTime >= 70) {
            score += 3;
            bottlenecks.push(`Cayo Perico run time ${cayoTime} min (aim for <50 min)`);
            const hourlyIncome = calculateHourlyIncome(cayoPayoutValue, cayoTime, cooldown);
            activeIncome += hourlyIncome;
          }
        } else {
          bottlenecks.push(`Only ${cayoCount} Cayo completions (need 10+ for optimal scoring)`);
          if (cayoCount > 0) {
            score += 2; // Partial credit
          }
        }

        if (formData.hasSparrow) {
          score += 5;
        } else {
          bottlenecks.push("No Sparrow (adds 10-15 min to preps)");
          actionPlan.push("Buy Sparrow ($1.8M) - saves significant prep time");
        }
      } else {
        bottlenecks.push("No Kosatka (cannot run Cayo Perico - best solo income)");
        actionPlan.push("Priority 1: Save $2.2M for Kosatka submarine (enables $1M+/hr)");
      }

      // Nightclub scoring (15 points max)
      if (formData.hasNightclub) {
        const techs = validateNumericInput(formData.nightclubTechs, 0, 5);
        const feeders = validateNumericInput(formData.nightclubFeederBusinesses, 0, 5);
        const techScore = (techs / 5) * 8;
        score += techScore;
        
        if (techs === 5 && feeders >= 5) {
          score += 7;
          // Nightclub: ~$1.5M per sale, takes ~20 hours to fill, ~$75K/hr passive
          const hourly = calculateHourlyIncome(NIGHTCLUB_FULL_PAYOUT, 0, NIGHTCLUB_FULL_TIME);
          passiveIncome += hourly;
          incomeBreakdown.push({
            source: 'Nightclub (Passive)',
            hourly: hourly,
            payout: NIGHTCLUB_FULL_PAYOUT,
            cycleTime: NIGHTCLUB_FULL_TIME
          });
        } else {
          if (techs < 5) {
            bottlenecks.push(`Nightclub: only ${techs}/5 techs assigned (losing income)`);
          }
          if (feeders < 5) {
            bottlenecks.push(`Nightclub: only ${feeders}/5 feeder businesses (need: Coke, Meth, Cash, Weed, Documents)`);
          }
          // Partial income for incomplete setup
          if (techs >= 3) {
            passiveIncome += 30000;
          }
        }
      } else {
        bottlenecks.push("No Nightclub (missing best passive income ~$75K/hr)");
        actionPlan.push("Priority 2: Buy Nightclub ($1.5M base) + 5 techs + feeder businesses");
      }

      // Agency scoring (12 points max)
      if (formData.hasAgency) {
        if (formData.agencyHasDre) {
          score += 5;
          // Dre Contract: ~$1M, takes ~2 hours
          const dreHourly = calculateHourlyIncome(1000000, 120, 0);
          activeIncome += dreHourly;
          incomeBreakdown.push({
            source: 'Dre Contract',
            hourly: dreHourly,
            payout: 1000000,
            cycleTime: 120
          });
        }
        if (formData.agencyPayphoneUnlocked) {
          score += 4;
          // Payphone hits: $85K, ~5 min, 48 min cooldown
          const payphoneHourly = calculateHourlyIncome(PAYPHONE_HIT_PAYOUT, PAYPHONE_HIT_TIME, PAYPHONE_COOLDOWN);
          activeIncome += payphoneHourly;
          incomeBreakdown.push({
            source: 'Payphone Hits',
            hourly: payphoneHourly,
            payout: PAYPHONE_HIT_PAYOUT,
            cycleTime: PAYPHONE_HIT_TIME + PAYPHONE_COOLDOWN
          });
        }
        
        const securityContracts = validateNumericInput(formData.securityContractsDone, 0, 10000);
        if (securityContracts >= 200) {
          score += 3;
          // Passive income from safe: $20K per 48 min = $25K/hr
          const safeHourly = calculateHourlyIncome(AGENCY_SAFE_PAYOUT, 0, AGENCY_SAFE_CYCLE);
          passiveIncome += safeHourly;
          incomeBreakdown.push({
            source: 'Agency Safe (Passive)',
            hourly: safeHourly,
            payout: AGENCY_SAFE_PAYOUT,
            cycleTime: AGENCY_SAFE_CYCLE
          });
        } else if (securityContracts >= 50) {
          score += 1;
          passiveIncome += 10000;
        }
      } else {
        bottlenecks.push("No Agency (missing high-value contracts & passive safe)");
        actionPlan.push("Priority 3: Buy Agency ($2.1M) - unlocks payphone hits & contracts");
      }

      // Acid Lab scoring (10 points max)
      if (formData.hasAcidLab) {
        if (formData.acidLabUpgraded) {
          score += 7;
          // Upgraded: $335K per sale, ~3.5 hours production + 10 min sale = ~$95K/hr
          const acidLabHourly = calculateHourlyIncome(ACID_LAB_UPGRADED_PAYOUT, 10, ACID_LAB_UPGRADED_TIME);
          activeIncome += acidLabHourly;
          passiveIncome += 5000; // Small passive component
          incomeBreakdown.push({
            source: 'Acid Lab (Upgraded)',
            hourly: acidLabHourly,
            payout: ACID_LAB_UPGRADED_PAYOUT,
            cycleTime: 10 + ACID_LAB_UPGRADED_TIME
          });
        } else {
          score += 3;
          // Unupgraded: $300K per sale, ~5 hours production = ~$60K/hr
          const acidLabHourly = calculateHourlyIncome(ACID_LAB_UNGRADED_PAYOUT, 10, ACID_LAB_UNGRADED_TIME);
          activeIncome += acidLabHourly;
          bottlenecks.push("Acid Lab not upgraded (losing $35K per sale)");
          actionPlan.push("Upgrade Acid Lab equipment ($750K) - increases production speed");
        }
      } else {
        bottlenecks.push("No Acid Lab (quick $300K+ active income)");
        actionPlan.push("Priority 4: Complete First Dose missions (free) + upgrade ($750K)");
      }

      // Auto Shop scoring (8 points max)
      if (formData.hasAutoShop) {
        score += 8;
        // Auto Shop contracts: ~$200K per 20 min = ~$200K/hr (realistic average)
        const autoShopHourly = calculateHourlyIncome(200000, 20, 0);
        activeIncome += autoShopHourly;
        incomeBreakdown.push({
          source: 'Auto Shop Contracts',
          hourly: autoShopHourly,
          payout: 200000,
          cycleTime: 20
        });
      } else {
        bottlenecks.push("No Auto Shop (good solo contracts during Cayo cooldown)");
      }

      // Oppressor Mk2 scoring (8 points max)
      if (formData.hasOppressor) {
        score += 8;
      } else {
        bottlenecks.push("No Oppressor Mk II (best grinding vehicle, but not essential)");
        if (!formData.hasKosatka || !formData.hasSparrow) {
          actionPlan.push("Priority 5: Unlock & buy Oppressor Mk II ($8M) - best grinding vehicle");
        }
      }

      // Bunker scoring (5 points max)
      if (formData.hasBunker) {
        if (formData.bunkerUpgraded) {
          score += 5;
          // Upgraded: $210K per sale, ~2.5 hours production + 15 min sale = ~$80K/hr
          const bunkerHourly = calculateHourlyIncome(BUNKER_UPGRADED_PAYOUT, 15, BUNKER_PRODUCTION_TIME);
          activeIncome += bunkerHourly;
          incomeBreakdown.push({
            source: 'Bunker (Upgraded)',
            hourly: bunkerHourly,
            payout: BUNKER_UPGRADED_PAYOUT,
            cycleTime: 15 + BUNKER_PRODUCTION_TIME
          });
        } else {
          score += 2;
          passiveIncome += 5000;
          bottlenecks.push("Bunker exists but not fully upgraded (losing significant income)");
          actionPlan.push("Upgrade Bunker equipment & staff ($1.7M) - doubles production");
        }
      }

      // Weekly bonus (3 points max)
      if (formData.weeklyBonusActive) {
        score += 3;
      }

      const totalIncome = passiveIncome + activeIncome;
      
      // Updated tier thresholds for 2026 meta
      let tier = 'F';
      let tierColor = 'text-red-500';
      if (totalIncome >= 1500000) {
        tier = 'S';
        tierColor = 'text-purple-500';
      } else if (totalIncome >= 1000000) {
        tier = 'A';
        tierColor = 'text-blue-500';
      } else if (totalIncome >= 600000) {
        tier = 'B';
        tierColor = 'text-green-500';
      } else if (totalIncome >= 300000) {
        tier = 'C';
        tierColor = 'text-yellow-500';
      } else if (totalIncome >= 100000) {
        tier = 'D';
        tierColor = 'text-orange-500';
      }

      const grindLoop = generateGrindLoop(formData);

      setResults({
        score: Math.min(100, Math.max(0, score)), // Clamp score to 0-100
        passiveIncome,
        activeIncome,
        totalIncome,
        tier,
        tierColor,
        bottlenecks,
        actionPlan,
        grindLoop,
        incomeBreakdown
      });
    } catch (error) {
      console.error('Calculation error:', error);
      setErrors({ calculation: 'An error occurred during calculation. Please check your inputs.' });
    } finally {
      setIsCalculating(false);
    }
  }, [formData]);

  /**
   * Generates optimized grind loop based on owned assets
   * @param {Object} data - Form data object
   * @returns {string[]} - Array of grind loop steps
   */
  const generateGrindLoop = useCallback((data) => {
    const loop = [];
    const hasCayo = data.hasKosatka && validateMoney(data.cayoAvgTime) > 0;
    const hasPayphone = data.hasAgency && data.agencyPayphoneUnlocked;
    const hasAcidLab = data.hasAcidLab;
    const hasAutoShop = data.hasAutoShop;
    const hasNightclub = data.hasNightclub && validateNumericInput(data.nightclubTechs, 0, 5) >= 3;
    const hasBunker = data.hasBunker && data.bunkerUpgraded;

    if (hasCayo) {
      const cayoTime = validateMoney(data.cayoAvgTime) || 60;
      loop.push(`1. Cayo Perico Heist (~${cayoTime} min, then ${data.playMode === 'solo' ? '2.5hr' : '48min'} cooldown)`);
      
      if (hasPayphone) {
        loop.push("2. Payphone Hit during Cayo cooldown ($85K, 5 min, 48min cooldown)");
      }
      
      if (hasAutoShop) {
        loop.push("3. Auto Shop Contract during cooldown ($170K-300K, 15-20 min)");
      }
    } else {
      if (hasPayphone) loop.push("1. Payphone Hits (best solo income without Cayo)");
      if (hasAutoShop) loop.push("2. Auto Shop Contracts");
      if (hasAcidLab) loop.push("3. Acid Lab sales");
    }

    if (hasAcidLab && !hasCayo) {
      loop.push("4. Acid Lab sale ($335K upgraded, ~3.5hr production)");
    }

    if (hasNightclub) {
      loop.push("5. Nightclub sale when full ($1.5M, ~20hr to fill)");
    }

    if (hasBunker) {
      loop.push("6. Bunker sale when ready ($210K upgraded, ~2.5hr production)");
    }

    // Add passive income reminder
    if (hasNightclub || (data.hasAgency && validateNumericInput(data.securityContractsDone, 0, 10000) >= 200)) {
      loop.push("7. Collect passive income (Nightclub safe, Agency safe)");
    }

    return loop.length > 0 ? loop : ["No optimized loop available - follow action plan to unlock income sources"];
  }, []);

  // Memoize checkbox items to prevent re-renders
  const checkboxItems = useMemo(() => [
    { key: 'hasKosatka', label: 'Kosatka', tooltip: 'Submarine for Cayo Perico' },
    { key: 'hasSparrow', label: 'Sparrow', tooltip: 'Helicopter for fast preps' },
    { key: 'hasOppressor', label: 'Oppressor Mk II', tooltip: 'Best grinding vehicle' },
    { key: 'hasAcidLab', label: 'Acid Lab', tooltip: 'DLC business' },
    { key: 'acidLabUpgraded', label: 'Acid Lab Upgraded', tooltip: 'Faster production' },
    { key: 'hasNightclub', label: 'Nightclub', tooltip: 'Best passive income' },
    { key: 'hasBunker', label: 'Bunker', tooltip: 'Weapon production' },
    { key: 'bunkerUpgraded', label: 'Bunker Upgraded', tooltip: 'Doubles production' },
    { key: 'hasAgency', label: 'Agency', tooltip: 'Contracts & safe' },
    { key: 'agencyHasDre', label: 'Dre Contract Done', tooltip: '$1M contract' },
    { key: 'agencyPayphoneUnlocked', label: 'Payphone Unlocked', tooltip: '$85K hits' },
    { key: 'hasAutoShop', label: 'Auto Shop', tooltip: 'Solo contracts' },
    { key: 'weeklyBonusActive', label: 'Weekly Bonus Active', tooltip: '2X/3X events' }
  ], []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      calculateAssessment();
    }
  }, [calculateAssessment]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-2xl border border-purple-500/20">
          <div className="flex items-center gap-4 mb-8">
            <Target className="w-10 h-10 md:w-12 md:h-12 text-purple-400" aria-hidden="true" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">GTA Online 2026 Meta Assessment</h1>
              <p className="text-gray-400 text-sm md:text-base">Efficiency Scoring & Income Optimization (Updated Jan 2026)</p>
            </div>
          </div>

          {/* Error Display */}
          {errors.calculation && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300" role="alert">
              {errors.calculation}
            </div>
          )}

          {/* Form inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div>
              <label htmlFor="rank" className="block text-white mb-2 text-sm font-medium">
                Rank
                <span className="text-gray-500 text-xs ml-1">(1-{MAX_RANK})</span>
              </label>
              <input
                id="rank"
                type="number"
                value={formData.rank}
                onChange={(e) => handleInputChange('rank', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="1-8000"
                min="1"
                max={MAX_RANK}
                aria-describedby="rank-desc"
              />
              <span id="rank-desc" className="sr-only">Enter your GTA Online rank between 1 and {MAX_RANK}</span>
            </div>

            <div>
              <label htmlFor="playMode" className="block text-white mb-2 text-sm font-medium">Play Mode</label>
              <select
                id="playMode"
                value={formData.playMode}
                onChange={(e) => handleInputChange('playMode', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                aria-label="Select play mode"
              >
                <option value="solo">Solo</option>
                <option value="crew">Crew</option>
              </select>
            </div>

            {/* Stats */}
            {['strength', 'stealth', 'shooting', 'driving', 'flying'].map(stat => (
              <div key={stat}>
                <label htmlFor={`${stat}Stat`} className="block text-white mb-2 text-sm font-medium capitalize">
                  {stat} Stat
                  <span className="text-gray-500 text-xs ml-1">(0-{MAX_STAT})</span>
                </label>
                <input
                  id={`${stat}Stat`}
                  type="number"
                  value={formData[`${stat}Stat`]}
                  onChange={(e) => handleInputChange(`${stat}Stat`, e.target.value)}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="0-100"
                  min={MIN_STAT}
                  max={MAX_STAT}
                  aria-describedby={`${stat}-desc`}
                />
                <span id={`${stat}-desc`} className="sr-only">Enter your {stat} stat between 0 and 100</span>
              </div>
            ))}

            {/* Cayo Perico */}
            <div>
              <label htmlFor="cayoAvgTime" className="block text-white mb-2 text-sm font-medium">
                Cayo Avg Time (min)
                <span className="text-gray-500 text-xs ml-1">(0-300)</span>
              </label>
              <input
                id="cayoAvgTime"
                type="number"
                value={formData.cayoAvgTime}
                onChange={(e) => handleInputChange('cayoAvgTime', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="45-90"
                min="0"
                max="300"
                aria-describedby="cayo-time-desc"
              />
              <span id="cayo-time-desc" className="sr-only">Average time to complete Cayo Perico heist in minutes</span>
            </div>

            <div>
              <label htmlFor="cayoAvgPayout" className="block text-white mb-2 text-sm font-medium">
                Cayo Avg Payout ($)
                <span className="text-gray-500 text-xs ml-1">(0-{MAX_GTA_MONEY.toLocaleString()})</span>
              </label>
              <input
                id="cayoAvgPayout"
                type="number"
                value={formData.cayoAvgPayout}
                onChange={(e) => handleInputChange('cayoAvgPayout', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="Auto-estimate if blank"
                min="0"
                max={MAX_GTA_MONEY}
                aria-describedby="cayo-payout-desc"
              />
              <span id="cayo-payout-desc" className="sr-only">Average payout from Cayo Perico heist in dollars</span>
            </div>

            <div>
              <label htmlFor="cayoCompletions" className="block text-white mb-2 text-sm font-medium">Cayo Completions</label>
              <input
                id="cayoCompletions"
                type="number"
                value={formData.cayoCompletions}
                onChange={(e) => handleInputChange('cayoCompletions', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="0"
                min="0"
                max="10000"
              />
            </div>

            <div>
              <label htmlFor="nightclubTechs" className="block text-white mb-2 text-sm font-medium">
                Nightclub Techs
                <span className="text-gray-500 text-xs ml-1">(0-5)</span>
              </label>
              <input
                id="nightclubTechs"
                type="number"
                value={formData.nightclubTechs}
                onChange={(e) => handleInputChange('nightclubTechs', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="0-5"
                min="0"
                max="5"
              />
            </div>

            <div>
              <label htmlFor="nightclubFeederBusinesses" className="block text-white mb-2 text-sm font-medium">
                Nightclub Feeders
                <span className="text-gray-500 text-xs ml-1">(0-5)</span>
              </label>
              <input
                id="nightclubFeederBusinesses"
                type="number"
                value={formData.nightclubFeederBusinesses}
                onChange={(e) => handleInputChange('nightclubFeederBusinesses', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="0-5"
                min="0"
                max="5"
              />
            </div>

            <div>
              <label htmlFor="securityContractsDone" className="block text-white mb-2 text-sm font-medium">Security Contracts Done</label>
              <input
                id="securityContractsDone"
                type="number"
                value={formData.securityContractsDone}
                onChange={(e) => handleInputChange('securityContractsDone', e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="0"
                min="0"
                max="10000"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {checkboxItems.map(item => (
              <label 
                key={item.key} 
                className="flex items-center gap-2 text-white cursor-pointer hover:text-purple-300 transition-colors text-sm"
                htmlFor={`checkbox-${item.key}`}
              >
                <input
                  id={`checkbox-${item.key}`}
                  type="checkbox"
                  checked={formData[item.key]}
                  onChange={(e) => handleInputChange(item.key, e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-purple-600 focus:ring-purple-500"
                  aria-label={item.label}
                />
                <span className="flex items-center gap-1">
                  {item.label}
                  {item.tooltip && (
                    <span className="text-gray-400 text-xs" title={item.tooltip} aria-label={item.tooltip}>
                      <Info className="w-3 h-3" aria-hidden="true" />
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={calculateAssessment}
            disabled={isCalculating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
            aria-label="Calculate assessment"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true"></div>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" aria-hidden="true" />
                <span>Calculate Assessment</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4" aria-live="polite">
            Press <kbd className="px-2 py-1 bg-slate-800 rounded text-xs">Ctrl/Cmd + Enter</kbd> to quick calculate
          </p>

          {/* Results */}
          {results && (
            <div className="mt-8 space-y-6" role="region" aria-label="Assessment Results">
              <div className="bg-slate-700/50 rounded-lg p-6 border border-purple-500/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl text-white font-bold">Score: {results.score.toFixed(1)}/100</h2>
                    <p className={`text-5xl font-bold ${results.tierColor} mt-2`} aria-label={`${results.tier} tier`}>
                      {results.tier}-Tier
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-gray-400 text-sm">Total Income/Hour</p>
                    <p className="text-3xl text-green-400 font-bold" aria-label={`${results.totalIncome.toLocaleString()} dollars per hour`}>
                      ${results.totalIncome.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Passive: ${results.passiveIncome.toLocaleString()} | Active: ${results.activeIncome.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Income Breakdown */}
              {results.incomeBreakdown && results.incomeBreakdown.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl text-green-400 font-bold mb-4 flex items-center gap-2">
                    <DollarSign className="w-6 h-6" aria-hidden="true" />
                    Income Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.incomeBreakdown.map((item) => (
                      <div key={item.source} className="bg-slate-800/50 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium">{item.source}</p>
                            <p className="text-gray-400 text-sm">${item.payout.toLocaleString()} per cycle</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-bold">${Math.round(item.hourly).toLocaleString()}/hr</p>
                            <p className="text-gray-500 text-xs">{item.cycleTime} min cycle</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.bottlenecks.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6" role="alert">
                  <h3 className="text-xl text-red-400 font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" aria-hidden="true" />
                    Bottlenecks Detected
                  </h3>
                  <ul className="space-y-2">
                    {results.bottlenecks.map((b) => (
                      <li key={b} className="text-red-300 flex items-start gap-2">
                        <span className="text-red-500" aria-hidden="true">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.actionPlan.length > 0 && (
                <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6">
                  <h3 className="text-xl text-blue-400 font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                    Action Plan
                  </h3>
                  <ul className="space-y-2">
                    {results.actionPlan.map((action) => (
                      <li key={action} className="text-blue-300 flex items-start gap-2">
                        <span className="text-blue-500" aria-hidden="true">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
                <h3 className="text-xl text-green-400 font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" aria-hidden="true" />
                  Optimized Grind Loop
                </h3>
                <ol className="space-y-2">
                  {results.grindLoop.map((step) => (
                    <li key={step} className="text-green-300 flex items-start gap-2">
                      <span className="text-green-500 font-bold" aria-hidden="true">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

