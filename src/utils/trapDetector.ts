// src/utils/trapDetector.ts
// Prevents expensive mistakes by detecting common "noob traps"
// Run automatically during assessment to warn players before they waste money

import { calculateNightclubIncome } from './incomeCalculators.ts';
import { MODEL_CONFIG } from './modelConfig.ts';
import { getNightclubTechnicianCost, INFRASTRUCTURE_COSTS } from './infrastructureAdvisor.ts';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Trap severity levels
 */
export const TRAP_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export type TrapSeverity = typeof TRAP_SEVERITY[keyof typeof TRAP_SEVERITY];

/** A single step in a trap fix instructions */
interface TrapRequiredStepObject {
  step: string;
  reason: string;
}

type TrapRequiredStep = string | TrapRequiredStepObject;

/** Recovery calculation for cascade traps */
interface RecoveryCalculation {
  currentIncome: number;
  potentialIncome: number;
  hoursToRecoverWaste: number;
}

/** Shape returned by all trap detector functions */
export interface DetectedTrap {
  id: string;
  severity: TrapSeverity;
  title: string;
  icon: string;
  problem: string;
  cost: string;
  lostPerHour: number;
  solution: string;
  reasoning: string;
  timeToFix: string;
  requiredSteps: TrapRequiredStep[];
  fixCost: number;
  // Optional fields used by specific trap types
  isCascadeTrap?: boolean;
  wastedInvestment?: number;
  totalInvestment?: number;
  urgency?: string;
  recoveryCalculation?: RecoveryCalculation;
  missedPayout?: number;
}

/** A record persisted to localStorage for trap history tracking */
interface TrapHistoryRecord {
  trapId: string;
  title: string;
  severity: TrapSeverity;
  detectedAt: number;
  fixedAt: number | null;
  playerRank: number;
  playerScore: number | null;
  lostPerHour: number;
  fixCost: number;
  scoreAfterFix?: number | null;
  incomeAfterFix?: number | null;
}

/** A record persisted to localStorage for fixed-trap celebration */
interface TrapFixRecord {
  trapId: string;
  trapTitle: string;
  fixedAt: number;
  scoreBefore: number | null;
  scoreAfter: number | null;
  incomeGained: number;
}

/** Form data shape consumed by trap detection (loose, mirrors existing usage) */
interface TrapFormData {
  rank?: number | string;
  liquidCash?: number | string;
  hasNightclub?: boolean;
  nightclubFloors?: number | string;
  nightclubStorage?: { hasPounder?: boolean; hasMule?: boolean };
  hasMuleCustom?: boolean;
  hasPounderCustom?: boolean;
  nightclubSources?: Record<string, boolean>;
  nightclubTechs?: number | string;
  nightclubFeeders?: number | string;
  hasBunker?: boolean;
  bunkerEquipmentUpgrade?: boolean;
  bunkerStaffUpgrade?: boolean;
  hasAcidLab?: boolean;
  acidLabUpgraded?: boolean;
  hasKosatka?: boolean;
  hasSparrow?: boolean;
  hasAgency?: boolean;
  dreContractDone?: boolean;
  [key: string]: unknown;
}

/** Assessment results optionally passed to detectTraps */
interface TrapAssessment {
  score?: number;
  netWorth?: number;
  incomePerHour?: number;
  [key: string]: unknown;
}

/** Summary of detected traps */
export interface TrapSummary {
  count: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalLostPerHour: number;
  hasTraps: boolean;
}

// ============================================
// TRAP HISTORY PERSISTENCE SYSTEM
// ============================================

const TRAP_HISTORY_KEY = 'gta_trap_history';
const TRAP_FIXES_KEY = 'gta_trap_fixes';

/**
 * Type guard for validating a single trap history record from localStorage
 */
const isTrapHistoryRecord = (item: unknown): item is TrapHistoryRecord => {
  if (typeof item !== 'object' || item === null) return false;
  const record = item as Record<string, unknown>;
  return (
    typeof record.trapId === 'string' &&
    typeof record.title === 'string' &&
    typeof record.severity === 'string' &&
    typeof record.detectedAt === 'number'
  );
};

/**
 * Type guard for validating a single trap fix record from localStorage
 */
const isTrapFixRecord = (item: unknown): item is TrapFixRecord => {
  if (typeof item !== 'object' || item === null) return false;
  const record = item as Record<string, unknown>;
  return (
    typeof record.trapId === 'string' &&
    typeof record.trapTitle === 'string' &&
    typeof record.fixedAt === 'number'
  );
};

/**
 * Get trap history from localStorage
 */
const getTrapHistory = (): TrapHistoryRecord[] => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(TRAP_HISTORY_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(isTrapHistoryRecord);
  } catch (e) {
    console.error('Failed to parse trap history:', e);
    return [];
  }
};

/**
 * Save trap history to localStorage
 */
const saveTrapHistory = (history: TrapHistoryRecord[]): void => {
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
 */
const recordTrapDetection = (trap: DetectedTrap, formData: TrapFormData): void => {
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
 */
const recordTrapFix = (
  trapId: string,
  _formData: TrapFormData,
  assessment: TrapAssessment | null = null,
): TrapHistoryRecord | null => {
  const history = getTrapHistory();
  const trapIndex = history.findIndex(h =>
    h.trapId === trapId && !h.fixedAt
  );

  if (trapIndex !== -1) {
    history[trapIndex].fixedAt = Date.now();
    history[trapIndex].scoreAfterFix = assessment?.score ?? null;
    history[trapIndex].incomeAfterFix = assessment?.incomePerHour ?? null;
    saveTrapHistory(history);

    // Also save to fixes log for celebration display
    const fixes = getTrapFixes();
    fixes.push({
      trapId,
      trapTitle: history[trapIndex].title,
      fixedAt: Date.now(),
      scoreBefore: history[trapIndex].playerScore,
      scoreAfter: assessment?.score ?? null,
      incomeGained: (assessment?.incomePerHour || 0) - (history[trapIndex].lostPerHour || 0),
    });
    saveTrapFixes(fixes);

    return history[trapIndex];
  }
  return null;
};

/**
 * Get list of fixed traps for celebration display
 */
const getTrapFixes = (): TrapFixRecord[] => {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(TRAP_FIXES_KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(isTrapFixRecord);
  } catch (e) {
    console.warn('Failed to parse trap fixes from localStorage:', e);
    return [];
  }
};

/**
 * Save trap fixes to localStorage
 */
const saveTrapFixes = (fixes: TrapFixRecord[]): void => {
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
 */
export const getRecentlyFixedTraps = (): TrapFixRecord[] => {
  const fixes = getTrapFixes();
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return fixes.filter(f => f.fixedAt > sevenDaysAgo);
};

/**
 * Check if any previously detected traps have been fixed
 */
export const checkForFixedTraps = (
  currentTraps: DetectedTrap[],
  formData: TrapFormData,
  assessment: TrapAssessment | null,
): TrapHistoryRecord[] => {
  const history = getTrapHistory();
  const currentTrapIds = new Set(currentTraps.map(t => t.id));
  const newlyFixed: TrapHistoryRecord[] = [];

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

// ============================================
// INDIVIDUAL TRAP DETECTORS
// ============================================

/**
 * Helper: Detect Mule without Pounder trap (Scenario A)
 */
const detectMuleWithoutPounderTrap = (
  _formData: TrapFormData,
  floors: number,
  hasMule: boolean | undefined,
  hasPounder: boolean | undefined,
): DetectedTrap | null => {
  if (!hasMule || hasPounder) return null;

  const isCurrentlyAffected = floors > 1; // 2+ floors can exceed 90 crates
  return {
    id: 'nc_mule_missing_pounder',
    severity: isCurrentlyAffected ? TRAP_SEVERITY.CRITICAL : TRAP_SEVERITY.MEDIUM,
    title: '\u{1F6AB} Delivery Vehicle Trap (Mule)',
    icon: '\u{1F69B}',
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
const detectMuleWithPounderTrap = (
  _formData: TrapFormData,
  floors: number,
  hasMule: boolean | undefined,
  hasPounder: boolean | undefined,
): DetectedTrap | null => {
  if (floors < 2 || !hasMule || !hasPounder) return null;

  return {
    id: 'nc_mule_avoidance',
    severity: TRAP_SEVERITY.MEDIUM,
    title: '\u26A0\uFE0F Avoid the Mule Custom',
    icon: '\u{1F69B}',
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
const detectLowValueAssignmentTrap = (formData: TrapFormData): DetectedTrap | null => {
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
    title: '\u{1F4C9} Low-Value Nightclub Assignment',
    icon: '\u{1F4C9}',
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
const detectNightclubTraps = (formData: TrapFormData): DetectedTrap[] => {
  if (!formData.hasNightclub) return [];

  const floors = Number(formData.nightclubFloors) || 1;
  const storage = formData.nightclubStorage || {};
  const hasMule = storage.hasMule || formData.hasMuleCustom;
  const hasPounder = storage.hasPounder || formData.hasPounderCustom;

  return [
    detectMuleWithoutPounderTrap(formData, floors, hasMule, hasPounder),
    detectMuleWithPounderTrap(formData, floors, hasMule, hasPounder),
    detectLowValueAssignmentTrap(formData),
  ].filter((trap): trap is DetectedTrap => trap !== null);
};

/**
 * Detect all active traps in player's setup
 */
export const detectTraps = (formData: TrapFormData, assessment: TrapAssessment | null = null): DetectedTrap[] => {
  const traps: DetectedTrap[] = [];

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

  // Sort by severity (critical first)
  return sortTrapsBySeverity(traps);
};

/**
 * Helper: Detect cascade trap (techs but NO feeders = double waste)
 */
const detectCascadeTrap = (
  _formData: TrapFormData,
  techs: number,
  feeders: number,
  maxIncome: number,
): DetectedTrap | null => {
  if (feeders !== 0 || techs <= 0) return null;

  const nightclubBaseCost = 1500000;
  const wastedOnTechs = getNightclubTechnicianCost(0, techs);
  const totalWaste = nightclubBaseCost + wastedOnTechs;

  return {
    id: 'nightclub_cascade_trap',
    severity: TRAP_SEVERITY.CRITICAL,
    title: '\u{1F6A8} DOUBLE Nightclub Trap',
    icon: '\u{1F3E2}',
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
const detectNoFeedersTrap = (
  _formData: TrapFormData,
  feeders: number,
  maxIncome: number,
): DetectedTrap | null => {
  if (feeders !== 0) return null;

  return {
    id: 'nightclub_no_feeders',
    severity: TRAP_SEVERITY.CRITICAL,
    title: '\u{1F6A8} Nightclub Trap: Zero Income',
    icon: '\u{1F3E2}',
    problem: 'Your Nightclub earns $0/hr because you have no feeder businesses connected',
    cost: `Losing $${maxIncome.toLocaleString()}/hr in potential income`,
    lostPerHour: maxIncome,
    solution: 'Buy MC businesses FIRST: Cocaine ($975k) \u2192 Meth ($910k) \u2192 Cash ($845k). Then assign technicians.',
    reasoning: 'Nightclub technicians produce goods from linked businesses. No businesses = no production = no income.',
    timeToFix: '3-4 hours (business setup + Nightclub assignment)',
    requiredSteps: [
      { step: 'Buy Cocaine Lockup ($975k)', reason: 'Cocaine is highest-earning nightclub product ($10k/hr)' },
      { step: 'Buy Meth Lab ($910k)', reason: 'Meth is second-highest earner ($8.5k/hr)' },
      { step: 'Buy Counterfeit Cash Factory ($845k)', reason: 'Solid third feeder for balanced production' },
      { step: 'Return to Nightclub \u2192 Assign technicians', reason: 'Each tech works one business passively' },
    ],
    fixCost: 975000 + 910000 + 845000, // ~$2.7M for 3 MC businesses
  };
};

/**
 * Helper: Detect low feeders trap (has some feeders but not enough)
 */
const detectLowFeedersTrap = (
  _formData: TrapFormData,
  _techs: number,
  feeders: number,
  currentIncome: number,
  efficiency: number,
  lostIncome: number,
): DetectedTrap | null => {
  if (feeders >= 3) return null;

  return {
    id: 'nightclub_low_feeders',
    severity: TRAP_SEVERITY.HIGH,
    title: '\u26A0\uFE0F Nightclub Under-Optimized',
    icon: '\u{1F3E2}',
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
const detectLowTechsTrap = (
  _formData: TrapFormData,
  techs: number,
  feeders: number,
  lostIncome: number,
  techCost: number,
): DetectedTrap | null => {
  if (techs >= 3 || feeders < 3) return null;

  return {
    id: 'nightclub_low_techs',
    severity: TRAP_SEVERITY.HIGH,
    title: '\u26A0\uFE0F Nightclub Missing Technicians',
    icon: '\u{1F3E2}',
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
const detectNightclubTrap = (formData: TrapFormData): DetectedTrap | null => {
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
const detectUnupgradedBunkerTrap = (formData: TrapFormData): DetectedTrap | null => {
  // Check if bunker has both equipment AND staff upgrades
  const hasUpgrades = formData.bunkerEquipmentUpgrade && formData.bunkerStaffUpgrade;
  if (!formData.hasBunker || hasUpgrades) return null;

  const baseIncome = MODEL_CONFIG.income.bunker.unupgraded.perHour;
  const upgradedIncome = MODEL_CONFIG.income.bunker.upgraded.perHour;
  const lostIncome = upgradedIncome - baseIncome;
  const upgradeCost = MODEL_CONFIG.income.passive.bunkerUpgradeCost;
  const hoursToPayoff = Math.ceil(upgradeCost / lostIncome);

  return {
    id: 'bunker_unupgraded',
    severity: TRAP_SEVERITY.HIGH,
    title: '\u26A0\uFE0F Unupgraded Bunker',
    icon: '\u{1F3ED}',
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
const detectUnupgradedAcidLabTrap = (formData: TrapFormData): DetectedTrap | null => {
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
    title: '\u{1F48A} Unupgraded Acid Lab',
    icon: '\u{1F9EA}',
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
 * Wasting time without fast travel helicopter
 */
const detectMissingSparrowTrap = (formData: TrapFormData, totalWealth: number): DetectedTrap | null => {
  if (!formData.hasKosatka || formData.hasSparrow) return null;

  // Only flag if they have enough money or wealth to afford it
  const sparrowCost = 1815000;
  if (totalWealth < sparrowCost) return null;

  return {
    id: 'missing_sparrow',
    severity: TRAP_SEVERITY.HIGH,
    title: '\u{1F681} Missing Sparrow Helicopter',
    icon: '\u{1F681}',
    problem: 'You own Kosatka but no Sparrow - wasting ~15+ minutes per heist prep run',
    cost: 'Losing significant time on heist preps and freeroam travel',
    lostPerHour: 200000, // Estimated opportunity cost
    solution: 'Buy Sparrow from Kosatka interaction menu ($1.8M)',
    reasoning: 'Sparrow spawns inside Kosatka and has missiles. Cuts prep time dramatically and is useful for many activities.',
    timeToFix: '5 minutes (purchase only)',
    requiredSteps: [
      'Enter Kosatka submarine',
      'Access interaction menu (M on PC)',
      'Navigate to Kosatka \u2192 Moon Pool \u2192 Sparrow',
      'Purchase Sparrow ($1,815,000)',
    ],
    fixCost: sparrowCost,
  };
};

/**
 * TRAP 5: Agency without Dr. Dre contract completed
 * Missing $1M payout and safe income boost
 */
const detectIncompleteAgencyTrap = (formData: TrapFormData): DetectedTrap | null => {
  if (!formData.hasAgency || formData.dreContractDone) return null;

  return {
    id: 'agency_incomplete',
    severity: TRAP_SEVERITY.MEDIUM,
    title: '\u{1F4BC} Agency Contract Incomplete',
    icon: '\u{1F4BC}',
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
 * Sort traps by severity (critical first)
 */
const sortTrapsBySeverity = (traps: DetectedTrap[]): DetectedTrap[] => {
  const severityOrder: Record<TrapSeverity, number> = {
    [TRAP_SEVERITY.CRITICAL]: 0,
    [TRAP_SEVERITY.HIGH]: 1,
    [TRAP_SEVERITY.MEDIUM]: 2,
    [TRAP_SEVERITY.LOW]: 3,
  };

  return traps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
};

/**
 * Get trap summary for quick display
 */
export const getTrapSummary = (traps: DetectedTrap[] | null | undefined): TrapSummary => {
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
