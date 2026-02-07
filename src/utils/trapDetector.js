// src/utils/trapDetector.js
// Prevents expensive mistakes by detecting common "noob traps"
// Run automatically during assessment to warn players before they waste money

import { calculateNightclubIncome, calculateCayoIncome } from './incomeCalculators.js';
import { MODEL_CONFIG } from './modelConfig.js';
import { getNightclubTechnicianCost, INFRASTRUCTURE_COSTS } from './infrastructureAdvisor.js';

/**
 * Trap severity levels
 */
export const TRAP_SEVERITY = {
  CRITICAL: 'critical',  // Costing significant money RIGHT NOW
  HIGH: 'high',          // Major inefficiency, should fix soon
  MEDIUM: 'medium',      // Optimization opportunity
  LOW: 'low',            // Nice to fix, not urgent
};

// ============================================
// TRAP HISTORY PERSISTENCE SYSTEM
// ============================================

const TRAP_HISTORY_KEY = 'gta_trap_history';
const TRAP_FIXES_KEY = 'gta_trap_fixes';

/**
 * Get trap history from localStorage
 * @returns {Array} Array of historical trap records
 */
export const getTrapHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(TRAP_HISTORY_KEY) || '[]');
  } catch (e) {
    console.error('Failed to parse trap history:', e);
    return [];
  }
};

/**
 * Save trap history to localStorage
 * @param {Array} history - Array of trap records
 */
const saveTrapHistory = (history) => {
  try {
    // Keep only last 100 entries to prevent storage bloat
    const trimmed = history.slice(-100);
    localStorage.setItem(TRAP_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save trap history:', e);
  }
};

/**
 * Record when a trap was detected (for tracking purposes)
 * @param {Object} trap - The detected trap
 * @param {Object} formData - Player form data at time of detection
 */
export const recordTrapDetection = (trap, formData) => {
  const history = getTrapHistory();
  const existingIndex = history.findIndex(h => 
    h.trapId === trap.id && !h.fixedAt
  );
  
  // Don't duplicate if already tracking this trap
  if (existingIndex === -1) {
    history.push({
      trapId: trap.id,
      title: trap.title,
      severity: trap.severity,
      detectedAt: Date.now(),
      fixedAt: null,
      playerRank: Number(formData.rank) || 0,
      playerScore: null, // Will be filled in by assessment
      lostPerHour: trap.lostPerHour || 0,
      fixCost: trap.fixCost || 0,
    });
    saveTrapHistory(history);
  }
};

/**
 * Record when a trap has been fixed
 * @param {string} trapId - The trap ID that was fixed
 * @param {Object} formData - Current form data
 * @param {Object} assessment - Current assessment results
 */
export const recordTrapFix = (trapId, formData, assessment = null) => {
  const history = getTrapHistory();
  const trapIndex = history.findIndex(h => 
    h.trapId === trapId && !h.fixedAt
  );
  
  if (trapIndex !== -1) {
    history[trapIndex].fixedAt = Date.now();
    history[trapIndex].scoreAfterFix = assessment?.score || null;
    history[trapIndex].incomeAfterFix = assessment?.incomePerHour || null;
    saveTrapHistory(history);
    
    // Also save to fixes log for celebration display
    const fixes = getTrapFixes();
    fixes.push({
      trapId,
      trapTitle: history[trapIndex].title,
      fixedAt: Date.now(),
      scoreBefore: history[trapIndex].playerScore,
      scoreAfter: assessment?.score || null,
      incomeGained: (assessment?.incomePerHour || 0) - (history[trapIndex].lostPerHour || 0),
    });
    saveTrapFixes(fixes);
    
    return history[trapIndex];
  }
  return null;
};

/**
 * Get list of fixed traps for celebration display
 * @returns {Array} Array of fixed trap records
 */
export const getTrapFixes = () => {
  try {
    return JSON.parse(localStorage.getItem(TRAP_FIXES_KEY) || '[]');
  } catch (e) {
    console.warn('Failed to parse trap fixes from localStorage:', e);
    return [];
  }
};

/**
 * Save trap fixes to localStorage
 */
const saveTrapFixes = (fixes) => {
  try {
    // Keep only last 50 fixes
    const trimmed = fixes.slice(-50);
    localStorage.setItem(TRAP_FIXES_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save trap fixes:', e);
  }
};

/**
 * Get recently fixed traps (within last 7 days) for celebration
 * @returns {Array} Array of recently fixed traps
 */
export const getRecentlyFixedTraps = () => {
  const fixes = getTrapFixes();
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return fixes.filter(f => f.fixedAt > sevenDaysAgo);
};

/**
 * Check if any previously detected traps have been fixed
 * @param {Array} currentTraps - Currently detected traps
 * @param {Object} formData - Current form data
 * @param {Object} assessment - Current assessment
 * @returns {Array} Array of newly fixed traps
 */
export const checkForFixedTraps = (currentTraps, formData, assessment) => {
  const history = getTrapHistory();
  const currentTrapIds = new Set(currentTraps.map(t => t.id));
  const newlyFixed = [];
  
  // Find traps that were previously detected but are now gone
  history.forEach(h => {
    if (!h.fixedAt && !currentTrapIds.has(h.trapId)) {
      const fixedTrap = recordTrapFix(h.trapId, formData, assessment);
      if (fixedTrap) {
        newlyFixed.push(fixedTrap);
      }
    }
  });
  
  // Record currently detected traps
  currentTraps.forEach(trap => {
    recordTrapDetection(trap, formData);
  });
  
  return newlyFixed;
};

/**
 * Get trap statistics for community display
 * @returns {Object} Trap statistics
 */
export const getTrapStats = () => {
  const history = getTrapHistory();
  const fixes = getTrapFixes();
  
  // Count occurrences by trap type
  const trapCounts = {};
  history.forEach(h => {
    trapCounts[h.trapId] = (trapCounts[h.trapId] || 0) + 1;
  });
  
  // Most common traps
  const sortedTraps = Object.entries(trapCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return {
    totalTrapsDetected: history.length,
    totalTrapsFixed: fixes.length,
    fixRate: history.length > 0 ? Math.round((fixes.length / history.length) * 100) : 0,
    mostCommonTraps: sortedTraps,
    averageFixTime: calculateAverageFixTime(history),
  };
};

/**
 * Calculate average time to fix traps (in hours)
 */
const calculateAverageFixTime = (history) => {
  const fixedTraps = history.filter(h => h.fixedAt);
  if (fixedTraps.length === 0) return null;
  
  const totalHours = fixedTraps.reduce((sum, h) => {
    return sum + ((h.fixedAt - h.detectedAt) / (1000 * 60 * 60));
  }, 0);
  
  return Math.round(totalHours / fixedTraps.length);
};

/**
 * Helper: Detect Mule without Pounder trap (Scenario A)
 */
const detectMuleWithoutPounderTrap = (formData, floors, hasMule, hasPounder) => {
  if (!hasMule || hasPounder) return null;

  const isCurrentlyAffected = floors > 1; // 2+ floors can exceed 90 crates
  return {
    id: 'nc_mule_missing_pounder',
    severity: isCurrentlyAffected ? TRAP_SEVERITY.CRITICAL : TRAP_SEVERITY.MEDIUM,
    title: '🚫 Delivery Vehicle Trap (Mule)',
    icon: '🚛',
    problem: isCurrentlyAffected 
      ? 'You own the Mule Custom but NOT the Pounder Custom. The Mule is slow, buggy, and gets stuck easily.'
      : 'You own the Mule Custom but NOT the Pounder Custom. Currently safe with 1 floor (72 max crates), but if you expand floors, you\'ll be forced to use the slow Mule.',
    cost: isCurrentlyAffected 
      ? 'For any sale over 90 crates, you will struggle with deliveries'
      : 'Future floor expansion will force slow Mule deliveries (90-180 crates)',
    lostPerHour: 0,
    solution: 'Buy Pounder Custom ($1.9M) - handles large sales efficiently',
    reasoning: 'The Mule Custom is a trap vehicle. It\'s slow and prone to getting stuck. The Pounder handles everything >90 crates much better. Buy the Pounder before you ever need the Mule.',
    timeToFix: '5 minutes (purchase from Nightclub computer)',
    requiredSteps: [
      { step: 'Go to Nightclub computer', reason: 'Access vehicle purchases' },
      { step: 'Buy Pounder Custom ($1.9M)', reason: 'Handles large deliveries reliably' },
    ],
    fixCost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
  };
};

/**
 * Helper: Detect Mule with Pounder trap (Scenario B)
 */
const detectMuleWithPounderTrap = (formData, floors, hasMule, hasPounder) => {
  if (floors < 2 || !hasMule || !hasPounder) return null;

  return {
    id: 'nc_mule_avoidance',
    severity: TRAP_SEVERITY.MEDIUM,
    title: '⚠️ Avoid the Mule Custom',
    icon: '🚛',
    problem: 'You own the Mule Custom. The game will force you to use it for medium sales (90-180 crates).',
    cost: 'Slower deliveries when stock is between 90-180',
    lostPerHour: 0,
    solution: 'Only sell when stock exceeds 180 crates to force Pounder usage',
    reasoning: 'Since you can\'t sell the Mule, the workaround is to always sell above the Mule threshold. Wait for >180 crates.',
    timeToFix: 'Strategy adjustment (no cost)',
    requiredSteps: [
      { step: 'Monitor stock levels', reason: 'Know when you hit 180+ crates' },
      { step: 'Only sell when stock > 180', reason: 'Forces the game to use Pounder' },
    ],
    fixCost: 0,
  };
};

/**
 * Helper: Detect low-value nightclub assignment trap (Weed/Doc)
 */
const detectLowValueAssignmentTrap = (formData) => {
  if (!formData.nightclubSources || !formData.nightclubTechs) return null;

  const sources = formData.nightclubSources;
  const techs = Number(formData.nightclubTechs);
  
  // Check if they are running trash businesses
  const isRunningTrash = (sources.organic || sources.printing);
  
  // Check if they are MISSING top tier businesses (the top 5)
  const ownedCount = Object.values(sources).filter(Boolean).length;
  const missingTopTier = (!sources.imports || !sources.cargo || !sources.pharma || !sources.sporting || !sources.cash);
  
  // If running trash AND missing gold AND have techs = TRAP
  // Only flag if they have room for improvement (techs < owned high-value businesses)
  if (!isRunningTrash || !missingTopTier || techs <= 0 || ownedCount >= 5) return null;

  const trashValue = (sources.organic ? 4500 : 0) + (sources.printing ? 1500 : 0);
  const potentialGain = 8000 - (trashValue / (sources.organic && sources.printing ? 2 : 1)); // Avg high-tier vs trash
  
  return {
    id: 'nc_inefficient_assignment',
    severity: TRAP_SEVERITY.HIGH,
    title: '📉 Low-Value Nightclub Assignment',
    icon: '📉',
    problem: 'You have technicians assigned to Weed or Documents (Low Value) while missing High Value businesses.',
    cost: `Losing ~$${Math.round(potentialGain).toLocaleString()}/hr per low-value assignment`,
    lostPerHour: Math.round(potentialGain),
    solution: 'Buy Coke/Meth/Bunker/Cash businesses to replace low-value sources',
    reasoning: 'Weed produces $4.5k/hr, Docs produce $1.5k/hr. Cocaine produces $10k/hr. That\'s a 2-6x difference per technician.',
    timeToFix: '1-2 hours (purchase businesses)',
    requiredSteps: [
      { step: 'Check which top-tier you\'re missing', reason: 'Coke > Cargo > Meth > Bunker > Cash' },
      { step: 'Buy the missing business', reason: 'Replace low-value technician slot' },
      { step: 'Reassign tech in Nightclub', reason: 'Move tech from Weed/Docs to new business' },
    ],
    fixCost: 0, // Variable based on what they need
  };
};

/**
 * NIGHTCLUB-SPECIFIC TRAP DETECTORS
 * Detects delivery vehicle issues and inefficient technician assignments
 */
export const detectNightclubTraps = (formData) => {
  if (!formData.hasNightclub) return [];
  
  const floors = Number(formData.nightclubFloors) || 1;
  const storage = formData.nightclubStorage || {};
  const hasMule = storage.hasMule || formData.hasMuleCustom;     // Handle new & old state
  const hasPounder = storage.hasPounder || formData.hasPounderCustom;

  return [
    detectMuleWithoutPounderTrap(formData, floors, hasMule, hasPounder),
    detectMuleWithPounderTrap(formData, floors, hasMule, hasPounder),
    detectLowValueAssignmentTrap(formData),
  ].filter(Boolean);
};

/**
 * Detect all active traps in player's setup
 * @param {Object} formData - Player form data
 * @param {Object} assessment - Assessment results (optional)
 * @returns {Array} Array of trap objects sorted by severity
 */
export const detectTraps = (formData, assessment = null) => {
  const traps = [];
  
  // Calculate total wealth for context
  const liquidCash = Number(formData.liquidCash) || 0;
  const totalWealth = assessment?.netWorth || liquidCash;
  
  // Run all trap detectors
  const nightclubTrap = detectNightclubTrap(formData);
  if (nightclubTrap) traps.push(nightclubTrap);
  
  // Add Nightclub-specific traps (Mule, low-value assignments)
  const ncTraps = detectNightclubTraps(formData);
  traps.push(...ncTraps);
  
  const bunkerTrap = detectUnupgradedBunkerTrap(formData);
  if (bunkerTrap) traps.push(bunkerTrap);
  
  const acidLabTrap = detectUnupgradedAcidLabTrap(formData);
  if (acidLabTrap) traps.push(acidLabTrap);
  
  const sparrowTrap = detectMissingSparrowTrap(formData, totalWealth);
  if (sparrowTrap) traps.push(sparrowTrap);
  
  const agencyTrap = detectIncompleteAgencyTrap(formData);
  if (agencyTrap) traps.push(agencyTrap);
  
  const cayoBurnoutTrap = detectCayoBurnoutTrap(formData);
  if (cayoBurnoutTrap) traps.push(cayoBurnoutTrap);
  
  const kosatkaWithoutUseTrap = detectKosatkaWithoutUseTrap(formData);
  if (kosatkaWithoutUseTrap) traps.push(kosatkaWithoutUseTrap);
  
  // Sort by severity (critical first)
  return sortTrapsBySeverity(traps);
};

/**
 * Helper: Detect cascade trap (techs but NO feeders = double waste)
 */
const detectCascadeTrap = (formData, techs, feeders, maxIncome) => {
  if (feeders !== 0 || techs <= 0) return null;

  const nightclubBaseCost = 1500000;
  const wastedOnTechs = getNightclubTechnicianCost(0, techs);
  const totalWaste = nightclubBaseCost + wastedOnTechs;
  
  return {
    id: 'nightclub_cascade_trap',
    severity: TRAP_SEVERITY.CRITICAL,
    title: '🚨 DOUBLE Nightclub Trap',
    icon: '🏢',
    isCascadeTrap: true, // Flag for extra prominence in UI
    problem: `You spent $${totalWaste.toLocaleString()} on Nightclub + ${techs} technician${techs === 1 ? '' : 's'}, but have 0 feeder businesses`,
    cost: `Wasted $${wastedOnTechs.toLocaleString()} on technicians that CANNOT WORK`,
    lostPerHour: maxIncome,
    wastedInvestment: wastedOnTechs,
    totalInvestment: totalWaste,
    solution: 'Your technicians are idle. Buy feeder businesses NOW or your $1.9M+ investment earns $0.',
    reasoning: 'Technicians produce goods FROM linked businesses. Without feeders, they sit idle 24/7. This is a $1.9M+ mistake that needs immediate correction.',
    urgency: 'IMMEDIATE - Every hour you wait is $' + maxIncome.toLocaleString() + ' lost',
    timeToFix: '3-4 hours (business setup)',
    requiredSteps: [
      { step: 'Buy Cocaine Lockup ($975k)', reason: 'Cocaine is highest-earning nightclub product ($10k/hr)' },
      { step: 'Buy Meth Lab ($910k)', reason: 'Meth is second-highest earner ($8.5k/hr)' },
      { step: 'Buy Counterfeit Cash ($845k)', reason: 'Solid third feeder for balanced production' },
      { step: 'Assign technicians to each business', reason: 'Techs will finally start producing!' },
    ],
    fixCost: 975000 + 910000 + 845000,
    recoveryCalculation: {
      currentIncome: 0,
      potentialIncome: maxIncome,
      hoursToRecoverWaste: Math.ceil((totalWaste + 2730000) / maxIncome), // Total recovery time
    },
  };
};

/**
 * Helper: Detect no feeders trap (no techs either, slightly less severe)
 */
const detectNoFeedersTrap = (formData, feeders, maxIncome) => {
  if (feeders !== 0) return null;

  return {
    id: 'nightclub_no_feeders',
    severity: TRAP_SEVERITY.CRITICAL,
    title: '🚨 Nightclub Trap: Zero Income',
    icon: '🏢',
    problem: `Your Nightclub earns $0/hr because you have no feeder businesses connected`,
    cost: `Losing $${maxIncome.toLocaleString()}/hr in potential income`,
    lostPerHour: maxIncome,
    solution: 'Buy MC businesses FIRST: Cocaine ($975k) → Meth ($910k) → Cash ($845k). Then assign technicians.',
    reasoning: 'Nightclub technicians produce goods from linked businesses. No businesses = no production = no income.',
    timeToFix: '3-4 hours (business setup + Nightclub assignment)',
    requiredSteps: [
      { step: 'Buy Cocaine Lockup ($975k)', reason: 'Cocaine is highest-earning nightclub product ($10k/hr)' },
      { step: 'Buy Meth Lab ($910k)', reason: 'Meth is second-highest earner ($8.5k/hr)' },
      { step: 'Buy Counterfeit Cash Factory ($845k)', reason: 'Solid third feeder for balanced production' },
      { step: 'Return to Nightclub → Assign technicians', reason: 'Each tech works one business passively' },
    ],
    fixCost: 975000 + 910000 + 845000, // ~$2.7M for 3 MC businesses
  };
};

/**
 * Helper: Detect low feeders trap (has some feeders but not enough)
 */
const detectLowFeedersTrap = (formData, techs, feeders, currentIncome, efficiency, lostIncome) => {
  if (feeders >= 3) return null;

  return {
    id: 'nightclub_low_feeders',
    severity: TRAP_SEVERITY.HIGH,
    title: '⚠️ Nightclub Under-Optimized',
    icon: '🏢',
    problem: `Nightclub earning $${currentIncome.toLocaleString()}/hr (${efficiency.toFixed(0)}% efficiency) with only ${feeders} feeder business${feeders === 1 ? '' : 'es'}`,
    cost: `Losing $${lostIncome.toLocaleString()}/hr vs full setup`,
    lostPerHour: lostIncome,
    solution: `Buy ${3 - feeders} more MC business${3 - feeders === 1 ? '' : 'es'} to reach 60% efficiency`,
    reasoning: 'Each feeder business unlocks a technician slot. 3+ businesses reaches the efficiency sweet spot.',
    timeToFix: `${3 - feeders} hours (business setup)`,
    requiredSteps: feeders === 1
      ? [
          { step: 'Buy Cocaine Lockup ($975k)', reason: 'Highest passive income per tech hour' },
          { step: 'Buy Meth Lab ($910k)', reason: 'Second-best ROI for nightclub feeding' }
        ]
      : [
          { step: 'Buy Cocaine OR Meth Lab (~$900k)', reason: 'Either one will boost you to 60% efficiency' }
        ],
    fixCost: feeders === 1 ? 1885000 : 900000,
  };
};

/**
 * Helper: Detect low techs trap (has feeders but not enough techs)
 */
const detectLowTechsTrap = (formData, techs, feeders, lostIncome, techCost) => {
  if (techs >= 3 || feeders < 3) return null;

  return {
    id: 'nightclub_low_techs',
    severity: TRAP_SEVERITY.HIGH,
    title: '⚠️ Nightclub Missing Technicians',
    icon: '🏢',
    problem: `You have ${feeders} feeder businesses but only ${techs} technician${techs === 1 ? '' : 's'} hired`,
    cost: `Losing $${lostIncome.toLocaleString()}/hr - technicians aren't assigned!`,
    lostPerHour: lostIncome,
    solution: `Hire ${5 - techs} more technicians ($${techCost.toLocaleString()} total)`,
    reasoning: `Technician costs scale by tier (total $${INFRASTRUCTURE_COSTS.nightclub.technicianTotal.toLocaleString()} for all 5). ROI is typically under 10 hours.`,
    timeToFix: '5 minutes (menu purchase)',
    requiredSteps: [
      { step: 'Go to Nightclub computer', reason: 'Management terminal for all nightclub operations' },
      { step: 'Select "Staff" tab', reason: 'Where you hire and assign technicians' },
      { step: `Hire ${5 - techs} technicians (total $${techCost.toLocaleString()})`, reason: `Each tech adds ~$${Math.round(lostIncome / (5 - techs)).toLocaleString()}/hr` },
      { step: 'Assign each technician to a business', reason: 'Unassigned techs don\'t produce anything' },
    ],
    fixCost: techCost,
  };
};

/**
 * TRAP 1: Nightclub with insufficient feeders/techs
 * The classic "I bought a nightclub but it makes no money" trap
 */
const detectNightclubTrap = (formData) => {
  if (!formData.hasNightclub) return null;

  const techs = Number(formData.nightclubTechs) || 0;
  // Calculate feeders from nightclubSources (new format) or use legacy number
  const feeders = formData.nightclubSources 
    ? Object.values(formData.nightclubSources).filter(Boolean).length 
    : Number(formData.nightclubFeeders) || 0;
  const maxIncome = MODEL_CONFIG.income.passive.nightclubMax;
  const currentIncome = calculateNightclubIncome(techs, feeders);
  const efficiency = (currentIncome / maxIncome) * 100;
  
  // No trap if efficiency is 60%+ (3+ techs AND 3+ feeders)
  if (efficiency >= 60) return null;
  
  const lostIncome = maxIncome - currentIncome;
  const techCost = getNightclubTechnicianCost(techs, 5);
  
  return detectCascadeTrap(formData, techs, feeders, maxIncome)
    || detectNoFeedersTrap(formData, feeders, maxIncome)
    || detectLowFeedersTrap(formData, techs, feeders, currentIncome, efficiency, lostIncome)
    || detectLowTechsTrap(formData, techs, feeders, lostIncome, techCost)
    || null;
};

/**
 * TRAP 2: Unupgraded Bunker
 * Bunker without upgrades produces 64% less per hour
 */
const detectUnupgradedBunkerTrap = (formData) => {
  if (!formData.hasBunker || formData.bunkerUpgraded) return null;
  
  const baseIncome = MODEL_CONFIG.income.bunker.unupgraded.perHour;
  const upgradedIncome = MODEL_CONFIG.income.bunker.upgraded.perHour;
  const lostIncome = upgradedIncome - baseIncome;
  const upgradeCost = MODEL_CONFIG.income.passive.bunkerUpgradeCost;
  const hoursToPayoff = Math.ceil(upgradeCost / lostIncome);
  
  return {
    id: 'bunker_unupgraded',
    severity: TRAP_SEVERITY.HIGH,
    title: '⚠️ Unupgraded Bunker',
    icon: '🏭',
    problem: `Your bunker earns $${baseIncome.toLocaleString()}/hr. Upgraded bunker earns $${upgradedIncome.toLocaleString()}/hr`,
    cost: `Losing $${lostIncome.toLocaleString()}/hr by not upgrading`,
    lostPerHour: lostIncome,
    solution: `Buy Equipment + Staff upgrades from Bunker laptop ($${(upgradeCost / 1000000).toFixed(1)}M total)`,
    reasoning: `Upgrades give 2.5x income multiplier. Pays for itself in ${hoursToPayoff} hours of AFK time.`,
    timeToFix: '10 minutes (purchase only)',
    requiredSteps: [
      { step: 'Go to Bunker laptop', reason: 'Access upgrade purchases' },
      { step: 'Purchase Equipment Upgrade (~$1.16M)', reason: 'Biggest production boost' },
      { step: 'Purchase Staff Upgrade (~$600k)', reason: 'Unlocks full production capacity' },
    ],
    fixCost: upgradeCost,
  };
};

/**
 * TRAP 3: Unupgraded Acid Lab
 * Missing 40% income boost
 */
const detectUnupgradedAcidLabTrap = (formData) => {
  if (!formData.hasAcidLab || formData.acidLabUpgraded) return null;
  
  const baseIncome = MODEL_CONFIG.income.passive.acidLabBase;
  const upgradeMultiplier = MODEL_CONFIG.income.passive.acidLabUpgrade;
  const upgradedIncome = baseIncome * upgradeMultiplier;
  const lostIncome = upgradedIncome - baseIncome;
  const upgradeCost = MODEL_CONFIG.income.passive.acidLabUpgradeCost;
  const hoursToPayoff = Math.ceil(upgradeCost / lostIncome);
  
  return {
    id: 'acid_lab_unupgraded',
    severity: TRAP_SEVERITY.MEDIUM,
    title: '💊 Unupgraded Acid Lab',
    icon: '🧪',
    problem: `Your Acid Lab earns $${baseIncome.toLocaleString()}/hr. Upgraded earns $${Math.round(upgradedIncome).toLocaleString()}/hr`,
    cost: `Losing $${Math.round(lostIncome).toLocaleString()}/hr by not upgrading`,
    lostPerHour: Math.round(lostIncome),
    solution: `Buy Equipment Upgrade ($${upgradeCost.toLocaleString()}) from Acid Lab computer`,
    reasoning: `40% income boost. Pays for itself in ${hoursToPayoff} hours of deliveries.`,
    timeToFix: '5 minutes (purchase only)',
    requiredSteps: [
      'Go to Acid Lab computer',
      'Purchase Equipment Upgrade ($250k)',
    ],
    fixCost: upgradeCost,
  };
};

/**
 * TRAP 4: Has Kosatka but no Sparrow
 * Wasting 15+ minutes per Cayo run
 */
const detectMissingSparrowTrap = (formData, totalWealth) => {
  if (!formData.hasKosatka || formData.hasSparrow) return null;
  
  // Only flag if they have enough money or wealth to afford it
  const sparrowCost = 1815000;
  if (totalWealth < sparrowCost) return null;
  
  const cayoAvgTime = Number(formData.cayoAvgTime) || 90;
  const optimalTime = 45; // With Sparrow
  const timeSaved = Math.max(0, cayoAvgTime - optimalTime);
  
  // Calculate opportunity cost
  const cayoPayout = MODEL_CONFIG.income.cayo.basePayout;
  const currentRunsPerHour = 60 / cayoAvgTime;
  const optimalRunsPerHour = 60 / optimalTime;
  const lostIncomePerHour = Math.round((optimalRunsPerHour - currentRunsPerHour) * cayoPayout);
  
  return {
    id: 'missing_sparrow',
    severity: TRAP_SEVERITY.HIGH,
    title: '🚁 Missing Sparrow Helicopter',
    icon: '🚁',
    problem: `You own Kosatka but no Sparrow - wasting ~${timeSaved} minutes per Cayo run`,
    cost: `Losing ~$${lostIncomePerHour.toLocaleString()}/hr opportunity cost`,
    lostPerHour: lostIncomePerHour,
    solution: 'Buy Sparrow from Kosatka interaction menu ($1.8M)',
    reasoning: 'Sparrow spawns inside Kosatka and has missiles. Cuts prep time from 90min to 45min average.',
    timeToFix: '5 minutes (purchase only)',
    requiredSteps: [
      'Enter Kosatka submarine',
      'Access interaction menu (M on PC)',
      'Navigate to Kosatka → Moon Pool → Sparrow',
      'Purchase Sparrow ($1,815,000)',
    ],
    fixCost: sparrowCost,
  };
};

/**
 * TRAP 5: Agency without Dr. Dre contract completed
 * Missing $1M payout and safe income boost
 */
const detectIncompleteAgencyTrap = (formData) => {
  if (!formData.hasAgency || formData.dreContractDone) return null;
  
  return {
    id: 'agency_incomplete',
    severity: TRAP_SEVERITY.MEDIUM,
    title: '💼 Agency Contract Incomplete',
    icon: '💼',
    problem: 'You own an Agency but haven\'t completed The Contract (Dr. Dre)',
    cost: 'Missing $1M one-time payout + unlocks Payphone Hits ($255k/hr)',
    lostPerHour: 0, // One-time, not per hour
    missedPayout: 1000000,
    solution: 'Complete "The Contract" mission series from Agency computer',
    reasoning: 'Unlocks VIP Contract replay + Payphone Hits ($85k per hit, 3 per hour). Best Agency income.',
    timeToFix: '3-4 hours (mission completion)',
    requiredSteps: [
      'Go to Agency computer',
      'Accept "The Contract" mission',
      'Complete all story missions (6-8 missions)',
      'Collect $1M finale payout',
    ],
    fixCost: 0, // Free, just time
  };
};

/**
 * TRAP 6: Cayo burnout pattern with efficiency decay detection
 * Now tracks historical performance to detect declining efficiency
 */
const detectCayoBurnoutTrap = (formData) => {
  const completions = Number(formData.cayoCompletions) || 0;
  const avgTime = Number(formData.cayoAvgTime) || 60;
  
  // Get historical Cayo data if available
  const cayoHistory = formData.cayoHistory || [];
  const recentRuns = cayoHistory.slice(-10); // Last 10 runs
  
  // Calculate efficiency decay if we have historical data
  let efficiencyDecay = null;
  let decayPercentage = 0;
  
  if (recentRuns.length >= 5 && avgTime > 0) {
    // Compare recent average to overall average
    const recentAvg = recentRuns.reduce((sum, r) => sum + (r.time || avgTime), 0) / recentRuns.length;
    const oldAvg = avgTime; // Their reported overall average
    
    // Check for 20%+ slowdown (efficiency decay)
    if (recentAvg > oldAvg * 1.2) {
      decayPercentage = Math.round(((recentAvg - oldAvg) / oldAvg) * 100);
      efficiencyDecay = {
        detected: true,
        recentAvg: Math.round(recentAvg),
        historicalAvg: Math.round(oldAvg),
        decayPct: decayPercentage,
      };
    }
  }
  
  // Case 1: Efficiency decay detected (most actionable)
  if (efficiencyDecay?.detected) {
    const cayoPayout = MODEL_CONFIG.income.cayo.basePayout;
    const lostPerRun = Math.round(cayoPayout * (efficiencyDecay.decayPct / 100));
    const lostPerHour = Math.round((60 / efficiencyDecay.recentAvg) * lostPerRun);
    
    return {
      id: 'cayo_efficiency_decay',
      severity: TRAP_SEVERITY.HIGH,
      title: '📉 Cayo Efficiency Decay Detected',
      icon: '📉',
      isEfficiencyDecay: true,
      problem: `Your recent runs are ${efficiencyDecay.decayPct}% slower than your average (${efficiencyDecay.recentAvg}min vs ${efficiencyDecay.historicalAvg}min)`,
      cost: `Losing ~$${lostPerHour.toLocaleString()}/hr from declining performance`,
      lostPerHour: lostPerHour,
      solution: 'Take a break from Cayo. Your brain is on autopilot and making mistakes.',
      reasoning: 'Performance decay is a sign of mental fatigue. Continuing to grind will only make it worse. Switch activities for 2-3 days.',
      efficiencyData: efficiencyDecay,
      timeToFix: '2-3 days break from Cayo',
      requiredSteps: [
        { step: 'Stop running Cayo for 48+ hours', reason: 'Mental reset improves pattern recognition' },
        { step: 'Run Auto Shop contracts instead', reason: '2X event active - matches Cayo income without burnout' },
        { step: 'Mix in Payphone Hits ($85k/kill)', reason: 'Quick variety during cooldowns' },
        { step: 'Return to Cayo fresh in 2-3 days', reason: 'You\'ll likely hit sub-50min times again' },
      ],
      fixCost: 0,
    };
  }
  
  // Case 2: Classic burnout pattern (high volume + slow times)
  if (completions < 30 || avgTime < 65) return null;
  
  // Calculate what their income SHOULD be vs what it is
  const optimalTime = 45;
  const cayoPayout = MODEL_CONFIG.income.cayo.basePayout;
  const currentIncomePerHour = (60 / avgTime) * cayoPayout;
  const optimalIncomePerHour = (60 / optimalTime) * cayoPayout;
  const lostIncome = Math.round(optimalIncomePerHour - currentIncomePerHour);
  
  return {
    id: 'cayo_burnout',
    severity: completions > 75 ? TRAP_SEVERITY.MEDIUM : TRAP_SEVERITY.LOW,
    title: '🔥 Cayo Burnout Pattern Detected',
    icon: '🔥',
    problem: `You've run Cayo ${completions} times with ${avgTime}min average - this suggests grinding fatigue`,
    cost: completions > 75 
      ? `~$${lostIncome.toLocaleString()}/hr lost vs optimal ${optimalTime}min runs`
      : 'Diminishing returns from repetitive grinding',
    lostPerHour: Math.max(0, lostIncome),
    solution: 'Diversify: Mix in Payphone Hits, Salvage Yard, or Auto Shop contracts during cooldowns',
    reasoning: '2026 meta: Variety keeps you engaged. Agency payphone hits ($255k/hr) + Auto Shop (2X right now!) maintain income while reducing monotony. Fresh eyes = faster runs.',
    timeToFix: 'Strategy change (no cost)',
    requiredSteps: [
      { step: 'Do 2-3 Payphone Hits after each Cayo', reason: 'Fills 2.5hr cooldown productively' },
      { step: 'Run Auto Shop contracts during 2X events', reason: 'Currently beats Cayo income this week' },
      { step: 'Try Salvage Yard robberies for variety', reason: 'Different gameplay loop prevents autopilot' },
      { step: 'Track your next 5 run times', reason: 'Self-monitoring often improves performance' },
    ],
    recoveryTips: completions > 75 ? [
      'Consider taking a 1-week Cayo break',
      'Practice drainage tunnel approach on a fresh save',
      'Watch a 2026 speedrun guide - meta may have changed',
    ] : null,
    fixCost: 0,
  };
};

/**
 * TRAP 7: Owns Kosatka but hasn't used it
 * Bought the sub but never ran Cayo
 */
const detectKosatkaWithoutUseTrap = (formData) => {
  if (!formData.hasKosatka) return null;
  
  const completions = Number(formData.cayoCompletions) || 0;
  if (completions > 0) return null;
  
  return {
    id: 'kosatka_unused',
    severity: TRAP_SEVERITY.HIGH,
    title: '🚢 Kosatka Unused',
    icon: '🚢',
    problem: 'You own a Kosatka but have never completed Cayo Perico heist',
    cost: 'Missing out on best solo money maker in the game',
    lostPerHour: calculateCayoIncome(60, 0), // Potential income
    solution: 'Complete your first Cayo Perico heist - watch a beginner guide first',
    reasoning: 'Cayo Perico pays $700k-$1.2M per run. Solo-friendly. This is why you bought the Kosatka!',
    timeToFix: '2-3 hours (first run with preps)',
    requiredSteps: [
      'Watch a "Cayo Perico Solo Guide 2026" on YouTube (15 mins)',
      'Enter Kosatka → Planning Screen',
      'Complete Intel Mission (scope the island)',
      'Do Prep Missions (4-5 missions)',
      'Launch Heist Finale',
    ],
    fixCost: 0,
  };
};

/**
 * Sort traps by severity (critical first)
 */
const sortTrapsBySeverity = (traps) => {
  const severityOrder = {
    [TRAP_SEVERITY.CRITICAL]: 0,
    [TRAP_SEVERITY.HIGH]: 1,
    [TRAP_SEVERITY.MEDIUM]: 2,
    [TRAP_SEVERITY.LOW]: 3,
  };
  
  return traps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
};

/**
 * Get trap summary for quick display
 * @param {Array} traps - Array of detected traps
 * @returns {Object} Summary with counts and total lost income
 */
export const getTrapSummary = (traps) => {
  if (!traps || traps.length === 0) {
    return {
      count: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      totalLostPerHour: 0,
      hasTraps: false,
    };
  }
  
  const totalLostPerHour = traps.reduce((sum, trap) => sum + (trap.lostPerHour || 0), 0);
  
  return {
    count: traps.length,
    criticalCount: traps.filter(t => t.severity === TRAP_SEVERITY.CRITICAL).length,
    highCount: traps.filter(t => t.severity === TRAP_SEVERITY.HIGH).length,
    mediumCount: traps.filter(t => t.severity === TRAP_SEVERITY.MEDIUM).length,
    lowCount: traps.filter(t => t.severity === TRAP_SEVERITY.LOW).length,
    totalLostPerHour,
    hasTraps: true,
  };
};

/**
 * Get the single most critical trap to show prominently
 * @param {Array} traps - Array of detected traps
 * @returns {Object|null} The most critical trap or null
 */
export const getMostCriticalTrap = (traps) => {
  if (!traps || traps.length === 0) return null;
  return traps[0]; // Already sorted by severity
};
