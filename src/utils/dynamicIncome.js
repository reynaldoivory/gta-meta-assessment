// src/utils/dynamicIncome.js
// Dynamic income calculation with weekly event multipliers

import { WEEKLY_EVENTS, getWeeklyBonuses, formatExpiry } from '../config/weeklyEvents';
import { MODEL_CONFIG } from './modelConfig';

/**
 * Extract numeric multiplier from string (e.g., "2X" -> 2, "1.5X" -> 1.5)
 */
const parseMultiplier = (multiplierStr) => {
  if (!multiplierStr) return 1;
  const match = multiplierStr.match(/([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : 1;
};

/**
 * Calculate dynamic income with event multipliers
 * @param {Object} formData - Form data
 * @returns {Object} Dynamic income breakdown
 */
export const calculateDynamicIncome = (formData) => {
  // Safety check for WEEKLY_EVENTS
  if (!WEEKLY_EVENTS || !WEEKLY_EVENTS.meta) {
    console.warn('WEEKLY_EVENTS not loaded, using default values');
    return {
      autoShopIncome: 0,
      cayoIncome: 0,
      agencyIncome: 0,
      bestSource: 'None',
      bestIncome: 0,
      isEventBoosted: false,
      activeEvents: [],
      daysUntilExpiry: 0,
      liquidCash: Number(formData.liquidCash) || 0,
    };
  }
  
  // Use getWeeklyBonuses() for backward compatibility (returns array format)
  const events = getWeeklyBonuses();
  const liquidCash = Number(formData.liquidCash) || 0;
  
  // Check if events are still valid (handle timezone correctly)
  // Event ends Thursday 4AM ET / 9AM UTC
  const now = Date.now();
  const eventEnd = new Date(WEEKLY_EVENTS.meta.validUntil).getTime();
  const isEventActive = now < eventEnd;
  
  // --- Auto Shop Income ---
  let autoShopIncome = 0;
  let autoShopMultiplier = 1;
  let autoShopEvent = null;
  
  // Check for Auto Shop event (use new structure or fallback to array)
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const autoShopEventMatch = events.find(e => 
    e.activity.toLowerCase().includes('auto shop') || 
    e.activity.toLowerCase().includes('robbery contract')
  );
  
  // GTA+ members get boosted rates on monthly benefits
  if (formData.hasGTAPlus) {
    // Find the Auto Shop monthly bonus from config, or use the first monthly bonus expiry
    const monthlyBonuses = WEEKLY_EVENTS.gtaPlus?.monthlyBonuses || [];
    const autoShopMonthly = monthlyBonuses.find(b => b.activity.includes('auto_shop'));
    const monthlyBenefitEnd = autoShopMonthly
      ? new Date(autoShopMonthly.expires).getTime()
      : monthlyBonuses.length > 0
        ? new Date(monthlyBonuses[0].expires).getTime()
        : 0;
    const monthlyBenefitExpiry = autoShopMonthly
      ? formatExpiry(autoShopMonthly.expires)
      : monthlyBonuses.length > 0
        ? formatExpiry(monthlyBonuses[0].expires)
        : '';

    if (monthlyBenefitEnd && now < monthlyBenefitEnd) {
      autoShopMultiplier = autoShopBonus?.multiplier || 2.0; // Use from config or default to 2.0
      autoShopEvent = {
        activity: 'Auto Shop Robbery Contracts (GTA+)',
        multiplier: `${autoShopMultiplier}X`,
        note: autoShopBonus?.expiresLabel || `Through ${monthlyBenefitExpiry} (Monthly Benefit)`,
        isGTAPlus: true,
      };
    }
  } else if (autoShopBonus?.isActive && isEventActive) {
    // Weekly event for non-GTA+ members (use new structure)
    autoShopMultiplier = autoShopBonus.multiplier || 2;
    autoShopEvent = {
      activity: 'Auto Shop Robbery Contracts',
      multiplier: `${autoShopMultiplier}X`,
      note: autoShopBonus.label || '2X GTA$ Auto Shop Contracts',
      isGTAPlus: false,
    };
  } else if (autoShopEventMatch && isEventActive) {
    // Fallback to array format for backward compatibility
    autoShopEvent = autoShopEventMatch;
    autoShopMultiplier = parseMultiplier(autoShopEventMatch.multiplier);
  }
  
  if (formData.hasAutoShop) {
    // Base Auto Shop income: ~$300k per contract, ~25 minutes per contract
    const baseContractPayout = 300000;
    const contractsPerHour = 60 / 25; // ~2.4 contracts/hour
    autoShopIncome = (baseContractPayout * contractsPerHour * autoShopMultiplier);
  }
  
  // --- Cayo Perico Income ---
  let cayoIncome = 0;
  let cayoMultiplier = 1;
  let cayoEvent = null;
  
  if (formData.hasKosatka) {
    const cayoEventMatch = events.find(e => 
      e.activity.toLowerCase().includes('cayo') || 
      e.activity.toLowerCase().includes('perico')
    );
    
    if (cayoEventMatch && isEventActive) {
      cayoEvent = cayoEventMatch;
      cayoMultiplier = parseMultiplier(cayoEventMatch.multiplier);
    }
    
    const config = MODEL_CONFIG.income?.cayo || {};
    const basePayout = config.basePayout ?? 700000;
    const cayoAvgTime = Number(formData.cayoAvgTime) || 90;
    const cayoCompletions = Number(formData.cayoCompletions) || 0;
    const masteryRuns = config.masteryThreshold ?? 10;
    const masteryBonus = config.masteryBonus ?? 1.1;
    
    const runsPerHour = 60 / cayoAvgTime;
    const mastered = cayoCompletions >= masteryRuns;
    const multiplier = mastered ? masteryBonus : 1;
    
    cayoIncome = basePayout * runsPerHour * multiplier * cayoMultiplier;
  }
  
  // --- Agency/Payphone Income ---
  let agencyIncome = 0;
  let agencyMultiplier = 1;
  let agencyEvent = null;
  
  if (formData.hasAgency) {
    // Check for Paper Trail event
    const paperTrailBonus = WEEKLY_EVENTS.bonuses?.paperTrail;
    const isPaperTrailActive = paperTrailBonus?.isActive && isEventActive;
    
    if (isPaperTrailActive) {
      // GTA+ stacking: Base 2X + GTA+ bonus = 4X total
      const paperTrailMultiplier = formData.hasGTAPlus 
        ? paperTrailBonus.gtaPlusMultiplier 
        : paperTrailBonus.baseMultiplier;
      
      // Paper Trail: ~$40k base per mission, ~3 runs/hr
      // GTA+ (4X): $40k * 4 * 3 = $480k/hr (Still lower than Auto Shop 2X, but good RP)
      const paperTrailIncome = 40000 * 3 * paperTrailMultiplier;
      
      // Payphone Hits: $85k per hit, ~3 hits/hr (only if Dre done)
      const payphoneIncome = formData.payphoneUnlocked ? 85000 * 3 : 0;
      
      // Use whichever pays more THIS WEEK
      if (paperTrailIncome > payphoneIncome) {
        agencyIncome = paperTrailIncome;
        agencyMultiplier = paperTrailMultiplier;
        const paperTrailExpiry = formatExpiry(paperTrailBonus.validUntil || WEEKLY_EVENTS.meta.validUntil);
        agencyEvent = {
          activity: 'Operation Paper Trail',
          multiplier: `${paperTrailMultiplier}X`,
          note: formData.hasGTAPlus 
            ? `${paperTrailMultiplier}X GTA+ Super Boost (Expires ${paperTrailExpiry})` 
            : `${paperTrailMultiplier}X Weekly Event (Expires ${paperTrailExpiry})`,
          isGTAPlus: formData.hasGTAPlus,
        };
      } else {
        agencyIncome = payphoneIncome;
      }
    } else if (formData.payphoneUnlocked) {
      // No event: Standard Payphone Hits
      agencyIncome = 85000 * 3;
    }
  }
  
  // --- Legal Money Fronts (3X this week) ---
  // Note: This is passive income from businesses like Hands-On Car Wash
  // Recommend for SURVIVAL phase players (<$50k) as free claim
  
  // Determine best income source THIS WEEK
  const incomeSources = [
    { name: 'Auto Shop', income: autoShopIncome, multiplier: autoShopMultiplier, event: autoShopEvent, owned: formData.hasAutoShop },
    { name: 'Cayo Perico', income: cayoIncome, multiplier: cayoMultiplier, event: cayoEvent, owned: formData.hasKosatka },
    { name: 'Agency', income: agencyIncome, multiplier: agencyMultiplier, event: agencyEvent, owned: formData.hasAgency },
  ];
  
  const bestSource = incomeSources.reduce((best, current) => 
    current.income > best.income ? current : best
  , incomeSources[0]);
  
  // Calculate days until event expires
  // For GTA+ monthly benefits, use the longest monthly bonus expiry from config
  const monthlyBonuses = WEEKLY_EVENTS.gtaPlus?.monthlyBonuses || [];
  const latestMonthlyExpiry = monthlyBonuses.reduce((latest, b) => {
    const t = new Date(b.expires).getTime();
    return t > latest ? t : latest;
  }, 0);
  const weeklyEventEnd = new Date(WEEKLY_EVENTS.meta.validUntil).getTime();
  
  // Auto Shop / monthly benefits use the monthly expiry; others are weekly
  const autoShopDaysLeft = formData.hasGTAPlus && autoShopMultiplier > 1 && latestMonthlyExpiry
    ? Math.ceil((latestMonthlyExpiry - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const daysUntilExpiry = isEventActive 
    ? Math.max(
        Math.ceil((weeklyEventEnd - Date.now()) / (1000 * 60 * 60 * 24)),
        autoShopDaysLeft
      )
    : 0;
  
  return {
    autoShopIncome: Math.round(autoShopIncome),
    cayoIncome: Math.round(cayoIncome),
    agencyIncome: Math.round(agencyIncome),
    bestSource: bestSource.name,
    bestIncome: Math.round(bestSource.income),
    isEventBoosted: autoShopMultiplier > 1 || cayoMultiplier > 1 || agencyMultiplier > 1,
    activeEvents: [
      autoShopEvent && autoShopMultiplier > 1 ? { ...autoShopEvent, source: 'Auto Shop' } : null,
      cayoEvent && cayoMultiplier > 1 ? { ...cayoEvent, source: 'Cayo Perico' } : null,
      agencyEvent && agencyMultiplier > 1 ? { ...agencyEvent, source: 'Agency' } : null,
    ].filter(Boolean),
    daysUntilExpiry,
    liquidCash,
  };
};

/**
 * Determine player phase based on capital
 * @param {number} liquidCash - Current cash
 * @returns {string} Phase: 'SURVIVAL' | 'GROWTH' | 'OPTIMIZATION'
 */
export const getPlayerPhase = (liquidCash) => {
  if (liquidCash < 500000) return 'SURVIVAL'; // Need income NOW
  if (liquidCash < 2000000) return 'GROWTH'; // Build assets
  return 'OPTIMIZATION'; // Buy meta
};

/**
 * Get stat requirements for activities
 * @param {string} activity - Activity name
 * @returns {Object} Required stats
 */
export const getActivityRequirements = (activity) => {
  const requirements = {
    'Auto Shop Contracts': { strength: 60, flying: 40, shooting: 50 },
    'Agency Contracts': { strength: 60, shooting: 60 },
    'Bunker Sales': { driving: 60 },
    'Cayo Perico': { strength: 50, flying: 50 },
    'Payphone Hits': { strength: 60, shooting: 60 },
  };
  
  // Match partial activity names
  for (const [key, value] of Object.entries(requirements)) {
    if (activity.toLowerCase().includes(key.toLowerCase().split(' ')[0])) {
      return value;
    }
  }
  
  return null;
};

/**
 * Check if player meets stat requirements
 * @param {Object} formData - Form data
 * @param {Object} requirements - Required stats
 * @returns {Object} { meets: boolean, missing: Array<string> }
 */
export const checkStatRequirements = (formData, requirements) => {
  if (!requirements) return { meets: true, missing: [] };
  
  const missing = [];
  const statMap = {
    strength: formData.strength * 20, // Convert bars to percentage
    flying: formData.flying * 20,
    shooting: formData.shooting * 20,
    driving: formData.driving * 20,
    stealth: formData.stealth * 20,
    stamina: formData.stamina * 20,
  };
  
  for (const [stat, required] of Object.entries(requirements)) {
    if (statMap[stat] < required) {
      missing.push(`${stat.charAt(0).toUpperCase() + stat.slice(1)} ${required}%`);
    }
  }
  
  return {
    meets: missing.length === 0,
    missing,
  };
};
