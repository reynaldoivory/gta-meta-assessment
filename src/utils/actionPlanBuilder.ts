// src/utils/actionPlanBuilder.ts
// Time-Sensitive Meta Logic - Prioritizes time-limited opportunities over generic grind advice
// ENFORCED: Always returns 3-5 actions minimum

import { WEEKLY_EVENTS as _rawWEEKLY_EVENTS, getDaysRemaining, formatExpiry, getExpiryLabel } from '../config/weeklyEvents.js';
import { validateStat } from './assessmentHelpers.js';
import { isExpiringSoon, isExpiringCritical } from './eventHelpers.js';
import { checkGatekeeper } from './gatekeeperEngine.js';
import { generateInfrastructureRecommendations, getNightclubTechnicianCost } from './infrastructureAdvisor.js';

// Type assertions for .js modules (until converted to TypeScript)
const _checkGatekeeper = checkGatekeeper as (action: any, user: any, now: number) => any;
const _WEEKLY_EVENTS = _rawWEEKLY_EVENTS as any;
const WEEKLY_EVENTS = _rawWEEKLY_EVENTS as any;
const _generateInfrastructureRecommendations = generateInfrastructureRecommendations as (formData: any) => any[];
const _getNightclubTechnicianCost = getNightclubTechnicianCost as (level: number) => number;
const _validateStat = validateStat as any;
const _isExpiringSoon = isExpiringSoon as (expiry: number, now: number) => boolean;
const _isExpiringCritical = isExpiringCritical as (expiry: number, now: number) => boolean;

// ======================================================================
// Types & Interfaces
// ======================================================================

export interface Task {
  eventId?: string;
  id?: string;
  title?: string;
  tags?: string[];
  basePayout?: number;
  baseDuration?: number;
  dynamicPayout?: boolean;
  [key: string]: any;
}

export interface UserStats {
  flying: number;
  strength: number;
  shooting: number;
  stealth: number;
  stamina: number;
  driving: number;
  hacking?: number;
}

export interface FormData {
  strength?: number;
  flying?: number;
  shooting?: number;
  stealth?: number;
  stamina?: number;
  driving?: number;
  hacking?: number;
  hasKosatka?: boolean;
  hasAgency?: boolean;
  hasAcidLab?: boolean;
  acidLabUpgraded?: boolean;
  hasNightclub?: boolean;
  hasBunker?: boolean;
  bunkerUpgraded?: boolean;
  hasAutoShop?: boolean;
  hasSparrow?: boolean;
  hasOppressor?: boolean;
  hasRaiju?: boolean;
  hasMansion?: boolean;
  hasArcade?: boolean;
  hasBrickade6x6?: boolean;
  hasCarWash?: boolean;
  rank?: number;
  liquidCash?: number;
  hasGTAPlus?: boolean;
  gtaPlus?: boolean;
  dreContractDone?: boolean;
  nightclubTechs?: number | string;
  nightclubFeeders?: number | string;
  nightclubSources?: Record<string, boolean>;
  dailyStashHouse?: boolean;
  dailyGsCache?: boolean;
  dailySafeCollect?: boolean;
  payphoneUnlocked?: boolean;
  securityContracts?: string | number;
  [key: string]: any;
}

export interface User {
  gtaPlus?: boolean;
  formData?: FormData;
  assets?: string[];
  stats?: UserStats;
  [key: string]: any;
}

export interface GameState {
  businesses?: {
    nightclub?: {
      accumulatedValue?: number;
    };
  };
  [key: string]: any;
}

export interface WeeklyBonus {
  isActive: boolean;
  gtaPlusOnly?: boolean;
  gtaPlusMultiplier?: number;
  baseMultiplier?: number;
  multiplier?: number;
  validUntil?: string;
  gtaPlusValidUntil?: string;
  [key: string]: any;
}

export interface WeeklyEvents {
  bonuses?: {
    autoShop?: WeeklyBonus;
    businessBattles?: WeeklyBonus;
    nightclubGoods?: WeeklyBonus;
    nightclubSafe?: WeeklyBonus;
    mansionRaid?: WeeklyBonus;
    paperTrail?: WeeklyBonus;
    [key: string]: WeeklyBonus | undefined;
  };
  discounts?: {
    autoShop?: { priceEstimate: number; isActive: boolean; [key: string]: any };
    nightclubUpgrades?: { validUntil?: string; [key: string]: any };
    [key: string]: any;
  };
  gtaPlus?: {
    monthlyBonuses?: Array<{
      activity: string;
      multiplier?: number;
      expires: string;
    }>;
  };
  meta?: {
    displayDate?: string;
    validUntil?: string;
    [key: string]: any;
  };
  activeBoosts?: Array<{
    activity: string;
    expires: string;
    multiplier?: number;
  }>;
  [key: string]: any;
}

export interface GatekeeperResult {
  status: 'LOCKED' | 'WARNING' | 'PASS';
  reason?: string;
  score_penalty?: number;
  [key: string]: any;
}

export interface Bottleneck {
  id?: string;
  label: string;
  detail: string;
  solution: string;
  actionType?: string;
  impact?: 'CRITICAL' | 'high' | 'medium' | 'low';
  urgent?: boolean;
  critical?: boolean;
  expiresAt?: number;
  timeHours?: number;
  savingsPerHour?: number;
  [key: string]: any;
}

export interface Action {
  priority: number;
  urgency: string;
  type: string;
  title: string;
  why: string;
  solution?: string;
  timeToComplete?: string;
  estimatedMinutes?: number | null;
  cost?: number;
  timeRemaining?: string | null;
  expiresAt?: number | null;
  savingsPerHour?: number;
  impact?: string;
  bottleneckId?: string;
  launchesPassiveTimer?: boolean;
  unlockVelocity?: number;
  blockedBy?: string[];
  compoundScore?: number;
  _priorityScore?: number;
  _compoundMeta?: {
    passiveReady: number;
    passiveTotal: number;
    passiveAllMaxed: boolean;
    annotatedAt: number;
  };
  [key: string]: any;
}

export interface Results {
  bottlenecks?: Bottleneck[];
  [key: string]: any;
}

// ======================================================================
// Constants
// ======================================================================

const ACTIVITY_MAPPING: Record<string, string[]> = {
  business_battles: ['business_battle', 'business battle', 'freemode'],
  nightclub_goods: ['nightclub', 'nc_sell', 'nightclub goods'],
  nightclub_safe: ['nightclub_safe', 'nightclub safe', 'nc_safe'],
  mansion_raid: ['mansion_raid', 'mansion raid'],
  auto_shop_finales: ['auto_shop', 'auto shop', 'robbery contract'],
  paper_trail: ['paper_trail', 'paper trail', 'operation paper trail'],
};

const KEY_TO_ACTIVITY: Record<string, string> = {
  autoShop: 'auto_shop_finales',
  paperTrail: 'paper_trail',
  businessBattles: 'business_battles',
  nightclubGoods: 'nightclub_goods',
  nightclubSafe: 'nightclub_safe',
  mansionRaid: 'mansion_raid',
};

const META_BENCHMARKS = {
  cayoTime: 45,
  flyingSkill: 80,
  strengthMin: 60,
  statsMax: 100,
};

// ======================================================================
// Utility Helpers
// ======================================================================

const parseMinutes = (timeToComplete?: string): number | null => {
  if (!timeToComplete) return null;
  const str = timeToComplete.toLowerCase();
  const hrMatch = /^(\d+(\.\d+)?)\s*h/.exec(str);
  if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60);
  const minMatch = /^(\d+(\.\d+)?)\s*m/.exec(str);
  if (minMatch) return Math.round(parseFloat(minMatch[1]));
  const anyNumber = /^(\d+(\.\d+)?)/.exec(str);
  return anyNumber ? Math.round(parseFloat(anyNumber[1])) : null;
};

const taskMatchesActivity = (task: Task, activity: string): boolean => {
  const mapping = ACTIVITY_MAPPING[activity] ?? [activity];
  const taskId = (task.eventId ?? '').toLowerCase();
  const taskTitle = (task.title ?? '').toLowerCase();
  const taskTags = (task.tags ?? []).map(t => t.toLowerCase());

  return mapping.some(keyword =>
    taskId.includes(keyword.toLowerCase()) ||
    taskTitle.includes(keyword.toLowerCase()) ||
    taskTags.some(tag => tag.includes(keyword.toLowerCase()))
  );
};

// ======================================================================
// Weekly Boost Helpers (complexity < 15)
// ======================================================================

const applyArrayBoosts = (
  task: Task,
  boosts: Array<{ activity: string; expires: string; multiplier?: number }>,
  now: number
): { multiplier: number; timeRemaining: number | null } => {
  let multiplier = 1;
  let timeRemaining: number | null = null;

  for (const boost of boosts) {
    if (!taskMatchesActivity(task, boost.activity)) continue;
    const expiryDate = new Date(boost.expires).getTime();
    if (now >= expiryDate) continue;
    const boostMultiplier = boost.multiplier ?? 1;
    if (boostMultiplier > multiplier) {
      multiplier = boostMultiplier;
      timeRemaining = expiryDate - now;
    }
  }
  return { multiplier, timeRemaining };
};

const applyObjectBoosts = (
  task: Task,
  bonuses: Record<string, WeeklyBonus | undefined>,
  user: User,
  now: number
): { multiplier: number; timeRemaining: number | null } => {
  let multiplier = 1;
  let timeRemaining: number | null = null;

  for (const [key, bonus] of Object.entries(bonuses)) {
    if (!bonus) continue;
    if (!bonus.isActive) continue;
    if (bonus.gtaPlusOnly && !user?.gtaPlus) continue;

    const activityKey = KEY_TO_ACTIVITY[key] ?? key;
    if (!taskMatchesActivity(task, activityKey)) continue;

    const expiryDate = user?.gtaPlus && bonus.gtaPlusValidUntil
      ? new Date(bonus.gtaPlusValidUntil).getTime()
      : new Date(bonus.validUntil!).getTime();
    if (now >= expiryDate) continue;

    let taskMultiplier: number;
    if (typeof bonus.multiplier === 'number') {
      taskMultiplier = bonus.multiplier;
    } else if (user?.gtaPlus && bonus.gtaPlusMultiplier) {
      taskMultiplier = bonus.gtaPlusMultiplier;
    } else {
      taskMultiplier = bonus.baseMultiplier ?? 1;
    }

    if (taskMultiplier > multiplier) {
      multiplier = taskMultiplier;
      timeRemaining = expiryDate - now;
    }
  }
  return { multiplier, timeRemaining };
};

const applyMonthlyBoosts = (
  task: Task,
  monthlyBonuses: Array<{ activity: string; multiplier?: number; expires: string }>,
  now: number
): { multiplier: number; timeRemaining: number | null } => {
  let multiplier = 1;
  let timeRemaining: number | null = null;

  for (const bonus of monthlyBonuses) {
    if (!taskMatchesActivity(task, bonus.activity)) continue;
    const expiryDate = new Date(bonus.expires).getTime();
    if (now >= expiryDate) continue;
    const bonusMultiplier = bonus.multiplier ?? 1;
    if (bonusMultiplier > multiplier) {
      multiplier = bonusMultiplier;
      timeRemaining = expiryDate - now;
    }
  }
  return { multiplier, timeRemaining };
};

export const applyWeeklyBoosts = (
  task: Task,
  weeklyEvents: WeeklyEvents | null | undefined,
  user: User
): { multiplier: number; timeRemaining: number | null } => {
  if (!weeklyEvents) return { multiplier: 1, timeRemaining: null };
  const now = Date.now();

  let best = { multiplier: 1, timeRemaining: null as number | null };

  if (Array.isArray(weeklyEvents.activeBoosts)) {
    const arr = applyArrayBoosts(task, weeklyEvents.activeBoosts, now);
    if (arr.multiplier > best.multiplier) best = arr;
  }

  if (weeklyEvents.bonuses && typeof weeklyEvents.bonuses === 'object') {
    const obj = applyObjectBoosts(task, _WEEKLY_EVENTS.bonuses as any, user, now);
    if (obj.multiplier > best.multiplier) best = obj;
  }

  if (user?.gtaPlus && weeklyEvents.gtaPlus?.monthlyBonuses) {
    const monthly = applyMonthlyBoosts(task, weeklyEvents.gtaPlus.monthlyBonuses, now);
    if (monthly.multiplier > best.multiplier) best = monthly;
  }

  return best;
};

// ======================================================================
// Compound Efficiency Helpers (complexity < 15 each)
// ======================================================================

const buildUserProfile = (user: User): { stats: UserStats; assets: string[] } => {
  const userData = user.formData ?? user;
  const assets = [
    userData?.hasKosatka && 'kosatka',
    userData?.hasAgency && 'agency',
    userData?.hasAcidLab && 'acid_lab',
    userData?.hasNightclub && 'nightclub',
    userData?.hasBunker && 'bunker',
    userData?.hasAutoShop && 'auto_shop',
    userData?.hasSparrow && 'sparrow',
    userData?.hasOppressor && 'oppressor_mk2',
    userData?.hasRaiju && 'raiju',
  ].filter(Boolean) as string[];

  const stats = {
    flying: validateStat(userData?.flying ?? 0),
    strength: validateStat(userData?.strength ?? 0),
    shooting: validateStat(userData?.shooting ?? 0),
    stealth: validateStat(userData?.stealth ?? 0),
    stamina: validateStat(userData?.stamina ?? 0),
    driving: validateStat(userData?.driving ?? 0),
  };

  return { stats, assets };
};

const calculateBaseScore = (task: Task, gameState?: GameState): number => {
  if (task.dynamicPayout && gameState?.businesses?.nightclub?.accumulatedValue) {
    return gameState.businesses.nightclub.accumulatedValue;
  }
  return task.basePayout ?? 0;
};

export const calculateCompoundEfficiency = (
  task: Task,
  user: User,
  gameState?: GameState,
  weeklyEvents?: WeeklyEvents
): {
  score: number;
  reasoning: string[];
  warnings: string[];
  gatekeeperResult: GatekeeperResult;
  multiplier: number;
  timeRemaining: number | null;
} => {
  const reasoning: string[] = [];
  const warnings: string[] = [];

  const taskId = task.eventId ?? task.id ?? '';
  const userProfile = buildUserProfile(user);
  const gatekeeperResult = _checkGatekeeper(taskId, userProfile, Date.now()) as any;
  const viabilityMultiplier = gatekeeperResult.score_penalty ?? 1;

  if (gatekeeperResult.status === 'LOCKED') {
    reasoning.push(`🔒 ${gatekeeperResult.reason}`);
    warnings.push(`Cannot complete: ${gatekeeperResult.reason}`);
    return {
      score: 0,
      reasoning,
      warnings,
      gatekeeperResult,
      multiplier: 0,
      timeRemaining: null,
    };
  }

  if (gatekeeperResult.status === 'WARNING') {
    reasoning.push(`⚠️ ${gatekeeperResult.reason} (${(viabilityMultiplier * 100).toFixed(0)}% efficiency)`);
    warnings.push(gatekeeperResult.reason);
  }

  let score = calculateBaseScore(task, gameState) * viabilityMultiplier;
  if (task.dynamicPayout) {
    reasoning.push(`Sell accumulated goods: $${score.toLocaleString()}`);
  }

  const hasGtaPlus = !!(user?.gtaPlus || user?.formData?.gtaPlus || user?.hasGTAPlus);
  const boost = applyWeeklyBoosts(task, weeklyEvents, { ...user, gtaPlus: hasGtaPlus });

  if (boost.multiplier > 1) {
    const original = score;
    score *= boost.multiplier;
    reasoning.push(
      `🎉 ${boost.multiplier}x Event: $${original.toLocaleString()} → $${Math.round(score).toLocaleString()}`
    );
    if (boost.timeRemaining && boost.timeRemaining < 48 * 60 * 60 * 1000) {
      const hoursLeft = Math.round(boost.timeRemaining / (1000 * 60 * 60));
      warnings.push(`⏰ This ${boost.multiplier}x bonus expires in ${hoursLeft} hours!`);
    }
  } else if (reasoning.length === 0 && task.basePayout && task.basePayout > 0) {
    const hourlyRate = Math.round((task.basePayout / (task.baseDuration ?? 60)) * 60);
    reasoning.push(`Base payout: $${task.basePayout.toLocaleString()} ($${hourlyRate.toLocaleString()}/hr)`);
  }

  return {
    score: Math.round(score),
    reasoning,
    warnings,
    gatekeeperResult,
    multiplier: boost.multiplier,
    timeRemaining: boost.timeRemaining,
  };
};

// ======================================================================
// Passive Progress Helpers (complexity < 15)
// ======================================================================

const getPassiveProgress = (formData: FormData): {
  items: Array<{ key: string; ready: boolean; owned: boolean }>;
  readyCount: number;
  total: number;
  allMaxed: boolean;
} => {
  const acid = !!formData.hasAcidLab;
  const acidUp = acid && !!formData.acidLabUpgraded;
  const bunker = !!formData.hasBunker;
  const bunkerUp = bunker && !!formData.bunkerUpgraded;
  const nightclub = !!formData.hasNightclub;
  const nightclubOptimized = nightclub && Number(formData.nightclubTechs) >= 5 && Number(formData.nightclubFeeders) >= 5;
  const agency = !!formData.hasAgency;
  const agencyUnlocked = agency && (!!formData.payphoneUnlocked || Number(formData.securityContracts) >= 3);

  const items = [
    { key: 'acid', ready: acidUp, owned: acid },
    { key: 'bunker', ready: bunkerUp, owned: bunker },
    { key: 'nightclub', ready: nightclubOptimized, owned: nightclub },
    { key: 'agency', ready: agencyUnlocked, owned: agency },
  ];
  const readyCount = items.filter(i => i.ready).length;
  return {
    items,
    readyCount,
    total: items.length,
    allMaxed: readyCount === items.length,
  };
};

// ======================================================================
// Action Annotation Helpers (complexity < 15 each)
// ======================================================================

const checkBlockedBy = (action: Action, formData: FormData): string[] => {
  const blocked: string[] = [];
  const estimatedMinutes = action.estimatedMinutes ?? parseMinutes(action.timeToComplete);
  if (estimatedMinutes !== null && estimatedMinutes >= 120 && action.urgency !== 'URGENT') {
    blocked.push('Too long for most sessions (2h+)');
  }

  const title = (action.title ?? '').toLowerCase();
  if (title.includes('cayo') && !formData.hasKosatka) blocked.push('Requires Kosatka');
  if (title.includes('auto shop') && !formData.hasAutoShop) blocked.push('Requires Auto Shop');
  const flyingPct = validateStat(formData.flying);
  if (title.includes('cayo') && flyingPct < 60) blocked.push('Flying too low (aim 60%+)');
  const strengthPct = validateStat(formData.strength);
  if (
    (title.includes('finale') || title.includes('contract') || title.includes('raid')) &&
    strengthPct < 60
  ) {
    blocked.push('Strength too low for consistent combat (aim 60%+)');
  }
  return blocked;
};

const determineLaunchesPassiveTimer = (action: Action): boolean => {
  return (
    !!action.launchesPassiveTimer ||
    action.type === 'TAX' ||
    action.bottleneckId === 'acid_upgrade' ||
    action.bottleneckId === 'bunker_upgrade' ||
    action.bottleneckId === 'nightclub_partial'
  );
};

const computeUnlockVelocity = (action: Action): number => {
  const title = (action.title ?? '').toLowerCase();
  return (
    action.futureValue ??
    (action.type === 'STAT' ? 2 : 0) +
    (action.type === 'PURCHASE' ? 3 : 0) +
    (title.includes('flight school') ? 3 : 0) +
    (title.includes('first dose') || title.includes('acid') ? 3 : 0)
  );
};

const computeCompoundScore = (
  action: Action,
  launchesPassiveTimer: boolean,
  unlockVelocity: number,
  blockedBy: string[],
  passive: ReturnType<typeof getPassiveProgress>
): number => {
  const IMPACT_SCORE: Record<string, number> = { CRITICAL: 6000, high: 3000, medium: 1500 };
  let score = action._priorityScore ?? 0;

  if (!score) {
    score =
      (action.savingsPerHour ? 4000 + Math.min(action.savingsPerHour / 1000, 5000) : 0) +
      (IMPACT_SCORE[action.impact ?? ''] ?? 0) +
      (action.urgency === 'URGENT' || action.urgency === 'GRIND NOW' ? 5000 : 0);
  }

  score += unlockVelocity * 900;
  if (launchesPassiveTimer) score *= 3;
  if (!passive.allMaxed && action.type === 'GRIND') score *= 0.6;
  if (blockedBy.length > 0) score -= 10000;

  return score;
};

const annotateForCompoundEfficiency = (
  action: Action,
  formData: FormData,
  results: Results | null,
  now: number
): Action => {
  const passive = getPassiveProgress(formData);
  const estimatedMinutes = action.estimatedMinutes ?? parseMinutes(action.timeToComplete) ?? null;
  const launchesPassiveTimer = determineLaunchesPassiveTimer(action);
  const unlockVelocity = computeUnlockVelocity(action);
  const blockedBy = checkBlockedBy(action, formData);
  const compoundScore = computeCompoundScore(action, launchesPassiveTimer, unlockVelocity, blockedBy, passive);

  return {
    ...action,
    estimatedMinutes,
    launchesPassiveTimer,
    unlockVelocity,
    blockedBy: action.blockedBy ?? blockedBy,
    compoundScore,
    _compoundMeta: {
      passiveReady: passive.readyCount,
      passiveTotal: passive.total,
      passiveAllMaxed: passive.allMaxed,
      annotatedAt: now,
    },
  };
};

// ======================================================================
// Bottleneck Conversion (complexity < 15)
// ======================================================================

const determinePriorityUrgencyImpact = (
  bottleneck: Bottleneck,
  now: number
): { priority: number; urgency: string; impact: string } => {
  const expiresAt = bottleneck.expiresAt;

  if (expiresAt && isExpiringCritical(expiresAt, now)) {
    return { priority: 0, urgency: 'URGENT', impact: 'CRITICAL' };
  }
  if (expiresAt && isExpiringSoon(expiresAt, now)) {
    return { priority: 0, urgency: 'URGENT', impact: bottleneck.impact ?? 'high' };
  }
  if (bottleneck.critical) {
    return { priority: 0, urgency: 'URGENT', impact: 'CRITICAL' };
  }
  if (bottleneck.urgent) {
    return { priority: 0, urgency: 'URGENT', impact: bottleneck.impact ?? 'high' };
  }
  if (bottleneck.impact === 'high') {
    return { priority: 2, urgency: 'HIGH', impact: 'high' };
  }
  if (bottleneck.impact === 'medium') {
    return { priority: 3, urgency: 'MEDIUM', impact: 'medium' };
  }
  return { priority: 5, urgency: 'MEDIUM', impact: bottleneck.impact ?? 'medium' };
};

const bottleneckToAction = (bottleneck: Bottleneck, now: number): Action => {
  const { priority, urgency, impact } = determinePriorityUrgencyImpact(bottleneck, now);

  const timeRemaining = bottleneck.expiresAt
    ? `${Math.ceil((bottleneck.expiresAt - now) / (1000 * 60 * 60))}hrs`
    : null;

  const timeToComplete = bottleneck.timeHours
    ? `${Math.ceil(bottleneck.timeHours * 60)} minutes`
    : 'Varies';

  return {
    priority,
    urgency,
    type: bottleneck.actionType?.toUpperCase() ?? 'ACTION',
    title: bottleneck.label,
    why: bottleneck.detail,
    solution: bottleneck.solution,
    timeToComplete,
    estimatedMinutes: bottleneck.timeHours ? Math.ceil(bottleneck.timeHours * 60) : null,
    cost: 0,
    timeRemaining,
    expiresAt: bottleneck.expiresAt ?? null,
    savingsPerHour: bottleneck.savingsPerHour ?? 0,
    impact,
    bottleneckId: bottleneck.id,
  };
};

// ======================================================================
// Priority Score Calculation (flattened, complexity < 15)
// ======================================================================

export const calculatePriorityScore = (action: Action, now: number): number => {
  let score = 0;

  if (action.expiresAt && isExpiringCritical(action.expiresAt, now)) score += 15000;
  else if (action.expiresAt && isExpiringSoon(action.expiresAt, now)) score += 10000;
  else if (action.urgency === 'URGENT' || action.urgency === 'GRIND NOW') score += 9000;

  if (action.impact === 'CRITICAL' || action.type === 'BLOCKER') score += 8000;
  else if (action.urgency === 'HIGH' || action.urgency === 'BLOCKER') score += 7000;

  if (action.savingsPerHour && action.savingsPerHour > 0) {
    score += 6000 + Math.min(action.savingsPerHour / 1000, 5000);
  } else if (action.type === 'SKILL' || action.type === 'STAT') {
    score += 5000;
  }

  if (action.type === 'OPTIMIZE' || action.urgency === 'LOW') score += 1000;

  score += (10 - (action.priority ?? 5)) * 100;

  return score;
};

// ======================================================================
// Smart Action Plan Builders (complexity < 15 each)
// ======================================================================

const buildAutoShopActions = (formData: FormData, now: number): Action[] => {
  const actions: Action[] = [];
  const daysLeft = getDaysRemaining();
  const cash = Number(formData.liquidCash) || 0;
  const strengthPct = validateStat(formData.strength);
  const hasGTAPlus = !!formData.hasGTAPlus;
  const playerRank = Number(formData.rank) || 0;

  const autoShopBonus = _WEEKLY_EVENTS.bonuses?.autoShop as any;
  const isAutoShopEventAvailable =
    daysLeft > 0 &&
    autoShopBonus?.isActive &&
    (!autoShopBonus.gtaPlusOnly || hasGTAPlus);

  if (!isAutoShopEventAvailable) return actions;

  const shopCost = (_WEEKLY_EVENTS.discounts?.autoShop?.priceEstimate ?? 835000) as number;0;

  if (!formData.hasAutoShop && cash >= shopCost) {
    const expiry = autoShopBonus?.gtaPlusValidUntil ?? autoShopBonus?.validUntil;
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'PURCHASE',
      title: `⚡ BUY AUTO SHOP NOW (Ends ${WEEKLY_EVENTS.meta?.displayDate ?? 'this week'})`,
      why: `You have $${(cash / 1_000_000).toFixed(1)}M. Buying this unlocks $1.3M‑$1.5M/hr income (2X Bonus - GTA+ Exclusive). Union Depository Contract pays ~$675k in 25 mins. Beats Cayo Perico.`,
      cost: shopCost,
      earnings: '$1.3M‑$1.5M/hr',
      timeRemaining: `${daysLeft} days`,
      timeToComplete: '15 minutes (purchase + setup)',
      potentialEarnings: `$4‑5M in ${daysLeft} days`,
      expiresAt: expiry ? new Date(expiry).getTime() : null,
    });
    return actions;
  }

  if (formData.hasAutoShop && hasGTAPlus) {
    const autoShopExpiry = autoShopBonus?.gtaPlusValidUntil
      ? new Date(autoShopBonus.gtaPlusValidUntil).getTime()
      : null;
    const daysLeftAutoShop = autoShopExpiry
      ? Math.ceil((autoShopExpiry - now) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysLeftAutoShop > 0) {
      const expiryText =
        daysLeftAutoShop < 3
          ? `${Math.ceil(daysLeftAutoShop * 24)} hours`
          : `${daysLeftAutoShop} days`;

      actions.push({
        priority: 0,
        urgency: 'URGENT',
        type: 'MISSION',
        title: '🔥 Grind Auto Shop Robbery Contracts (2X Event)',
        why: `Zero prep, ~$540‑600k per 20‑25 min finale (realistic at Rank ${playerRank}). Expect ~$1.0‑1.5M/hr once practiced. One of the best active income sources in 2026 meta. ${getExpiryLabel(autoShopBonus?.gtaPlusValidUntil ?? WEEKLY_EVENTS.meta?.validUntil ?? '')}.`,
        solution:
          'Rotation: Union Depository finale → Client vehicle delivery (also 2X) while staff preps → Repeat. Eliminates downtime.',
        timeToComplete: '20‑25 min per finale, ~$540‑600k payout',
        earnings: '$1.0‑1.5M/hr (realistic)',
        timeRemaining: expiryText,
        potentialEarnings: `$${(daysLeftAutoShop * 10 * 1.8).toFixed(1)}M potential over next ${daysLeftAutoShop} days`,
        strategy: 'Eliminates downtime between contracts. Highest $/hr in game right now.',
        expiresAt: autoShopExpiry,
        savingsPerHour: 1_800_000,
      });

      if (strengthPct < 60) {
        const impactsNeeded = Math.ceil((60 - strengthPct) * 20);
        const method = formData.hasMansion
          ? 'Mansion Gym (Private)'
          : 'Pier Pressure (Beach)';
        const timeToComplete = formData.hasMansion
          ? '20‑30 mins'
          : '60‑75 mins';
        const methodDetails = formData.hasMansion
          ? 'Use the punching bag minigame in your gym. This is the only fast, legit method.'
          : `Launch "Pier Pressure" alone. Go to the boardwalk. Punch pedestrians. Math: You need ${impactsNeeded} punches to reach 60%. (~30 punches/min).`;
        const avoidMethod = formData.hasMansion
          ? 'Avoid: Golf and Beach Punching (Waste of time compared to gym).'
          : 'Avoid: Golf (unless using "Infinite Putt" exploit). Normal golf takes 6+ hours.';

        actions.push({
          priority: 0,
          urgency: 'BLOCKER',
          type: 'STAT',
          title: `🚨 FIX STRENGTH (${strengthPct}% → 60%+)`,
          why: `You will fail the Auto Shop finale with low strength. You take too much damage.`,
          impact: 'CRITICAL',
          cost: 0,
          timeToComplete,
          method,
          methodDetails,
          avoidMethod,
          blocksAction: 'Auto Shop grinding',
          currentStat: `${strengthPct}%`,
          targetStat: '60%',
          impactsNeeded,
        });
      } else {
        actions.push({
          priority: 0,
          urgency: 'URGENT',
          type: 'GRIND',
          title: `⚡ FARM UNION DEPOSITORY CONTRACT (${daysLeftAutoShop} days left)`,
          why: 'This is the highest paying activity in the game right now. Union Depository Contract pays ~$540‑600k (with 2X bonus) in ~20‑25 mins. No cooldown – repeat endlessly. Beats Cayo Perico this week.',
          earnings: '$1.3M‑$1.5M/hr',
          timeRemaining: `${daysLeftAutoShop} days`,
          timeToComplete: '25 mins per contract (repeatable)',
          method:
            'Select "Union Depository Contract" from Auto Shop board. If not available, do a short contract to refresh the board.',
          potentialEarnings: `$4‑5M by event end`,
          expiresAt: autoShopExpiry,
        });
      }
    }
    return actions;
  }

  if (!formData.hasAutoShop && cash < shopCost && daysLeft > 0) {
    const needed = shopCost - cash;
    const bestGrindIncome = 466_000;
    const hoursNeeded = needed / bestGrindIncome;
    const autoShopExpiry = (_WEEKLY_EVENTS.bonuses?.autoShop as any)?.gtaPlusValidUntil
      ? new Date((_WEEKLY_EVENTS.bonuses.autoShop as any).gtaPlusValidUntil).getTime()
      : null;

    actions.push({
      priority: 0,
      urgency: 'GRIND NOW',
      type: 'GRIND',
      title: `⚡ GRIND FOR AUTO SHOP (${daysLeft} days left)`,
      why: `Auto Shop 2X event ends in ${daysLeft} days. You need $${(needed / 1000).toFixed(0)}k more (${hoursNeeded.toFixed(1)} hours of grinding). Buy it before the event ends!`,
      cost: needed,
      timeToComplete: `${hoursNeeded.toFixed(1)} hours`,
      potentialEarnings: `$4‑5M after purchase`,
      expiresAt: autoShopExpiry,
    });
  }

  return actions;
};

const buildBusinessBattlesActions = (formData: FormData, now: number): Action[] => {
  const actions: Action[] = [];
  const bbExpiry = (_WEEKLY_EVENTS.bonuses?.businessBattles as any)?.validUntil
    ? new Date((_WEEKLY_EVENTS.bonuses.businessBattles as any).validUntil).getTime()
    : null;
  const bbActive = !!(_WEEKLY_EVENTS.bonuses?.businessBattles as any)?.isActive && bbExpiry != null && bbExpiry > now;

  if (!bbActive) return actions;

  const hoursLeft = Math.ceil((bbExpiry - now) / (1000 * 60 * 60));
  const daysLeftBB = Math.ceil(hoursLeft / 24);
  const urgencyText = hoursLeft < 48 ? `${hoursLeft} hours left` : `${daysLeftBB} days left`;

  actions.push({
    priority: 1,
    urgency: hoursLeft < 24 ? 'URGENT' : 'HIGH',
    type: 'FREEMODE',
    title: '⚡ Contest Business Battles (4X This Week!)',
    why: formData.hasNightclub
      ? `4X Business Battles + 4X Nightclub Goods ${getExpiryLabel(bbExpiry ? new Date(bbExpiry).toISOString() : _WEEKLY_EVENTS.meta?.validUntil ?? '')} (${urgencyText}). Your Nightclub profits massively from won battles. Stack between Auto Shop cooldowns.`
      : `4X Business Battles ${getExpiryLabel(bbExpiry ? new Date(bbExpiry).toISOString() : _WEEKLY_EVENTS.meta?.validUntil ?? '')} (${urgencyText}). Even without Nightclub, battles pay 4X goods. Consider buying Nightclub at discount this week!`,
    solution: 'Join Business Battles in Freemode (every ~15 mins). Goods go to your Nightclub at 4X value. Best stacking activity.',
    timeToComplete: '5‑10 min per battle',
    earnings: '$200‑400k per battle + 4X Nightclub goods',
    timeRemaining: urgencyText,
    expiresAt: bbExpiry,
    category: 'freemode',
  });

  return actions;
};

const buildNightclubDiscountActions = (formData: FormData, now: number): Action[] => {
  const actions: Action[] = [];
  const ncDiscountExpiry = (_WEEKLY_EVENTS.discounts?.nightclubUpgrades as any)?.validUntil
    ? new Date((_WEEKLY_EVENTS.discounts.nightclubUpgrades as any).validUntil).getTime()
    : null;
  const ncDiscountActive =
    !!(_WEEKLY_EVENTS.discounts?.nightclubUpgrades as any) &&
    ncDiscountExpiry != null &&
    ncDiscountExpiry > now;

  if (!ncDiscountActive || !formData.hasNightclub) return actions;

  const nightclubFeedersCount = formData.nightclubSources
    ? Object.values(formData.nightclubSources).filter(Boolean).length
    : Number(formData.nightclubFeeders) || 0;
  const ncTechsCount = Number(formData.nightclubTechs) || 0;

  if (ncTechsCount >= 5 && nightclubFeedersCount >= 5) return actions;

  const hoursLeft = Math.ceil((ncDiscountExpiry - now) / (1000 * 60 * 60));
  const urgencyText = hoursLeft < 48 ? `${hoursLeft} hours left` : `${Math.ceil(hoursLeft / 24)} days left`;

  actions.push({
    priority: 1,
    urgency: hoursLeft < 24 ? 'URGENT' : 'HIGH',
    type: 'PURCHASE',
    title: '💰 Buy Nightclub Upgrades (40% OFF!)',
    why: `Your Nightclub isn't optimized. 40% off upgrades ${getExpiryLabel(ncDiscountExpiry ? new Date(ncDiscountExpiry).toISOString() : _WEEKLY_EVENTS.meta?.validUntil ?? '')} (${urgencyText}). Save ~$600k on Equipment + Staff upgrades.`,
    solution: 'Buy Equipment Upgrade + Staff Upgrade from Nightclub computer. They boost production speed significantly.',
    timeToComplete: '5 minutes',
    savings: '~$600k savings',
    timeRemaining: urgencyText,
    expiresAt: ncDiscountExpiry,
  });

  return actions;
};

const buildCombatPrepActions = (formData: FormData): Action[] => {
  const actions: Action[] = [];
  const playerRank = Number(formData.rank) || 0;
  const strengthPct = _validateStat(formData.strength);
  const hasGTAPlus = !!formData.hasGTAPlus;
  const autoShop2XActive =
    formData.hasAutoShop &&
    hasGTAPlus &&
    (_WEEKLY_EVENTS.bonuses?.autoShop as any)?.isActive;

  if (!autoShop2XActive || playerRank >= 100 || strengthPct >= 100) return actions;

  const maxHealthPercent = Math.floor(50 + playerRank / 2);

  if (strengthPct < 60) {
    actions.push({
      priority: 2,
      urgency: 'HIGH',
      type: 'PREPARATION',
      title: '💪 Max Strength Before Auto Shop Finales',
      why: `Rank ${playerRank} = ~${maxHealthPercent}% max health. Strength is ${strengthPct}% (low). You take extra damage. Max strength first.`,
      solution: '1. Max Strength (30 min via Pier Pressure or Mansion Gym). 2. Then stock 10+ Snacks + 10 Super Heavy Armor.',
      timeToComplete: '30‑40 min one‑time investment',
      impact: 'Prevents wasted time on failed missions',
      note: 'Do this before grinding Auto Shop.',
    });
  } else if (playerRank < 80) {
    actions.push({
      priority: 2,
      urgency: 'MEDIUM',
      type: 'PREPARATION',
      title: '🛡️ Stock Snacks & Armor for Auto Shop',
      why: `Rank ${playerRank} = ~${maxHealthPercent}% max health. Strength is good (${strengthPct}%), but stock up on supplies.`,
      solution: 'Stock 10+ Snacks + 10 Super Heavy Armor. Visit Agency armory for free snacks if owned.',
      timeToComplete: '10‑15 min one‑time investment',
      impact: 'Prevents wasted time on failed missions',
    });
  }

  return actions;
};

const buildInfrastructureActions = (formData: FormData, cash: number): Action[] => {
  const actions: Action[] = [];
  const infraRecommendations = _generateInfrastructureRecommendations(formData) || [];
  const criticalInfra = infraRecommendations.filter(
    (r: any) => r.urgency === 'CRITICAL' || r.urgency === 'URGENT' || r.type === 'CRITICAL'
  );

  criticalInfra.slice(0, 2).forEach((rec: any, index: number) => {
    if (rec.cost && cash < rec.cost) return;

    let emoji = '🏭';
    if (rec.isTrap) emoji = '⚠️';
    else if (rec.isDiscounted) emoji = '💰';
    else if (rec.category === 'nightclub') emoji = '🎭';
    else if (rec.category === 'bunker') emoji = '🔫';

    const priorityBoost = rec.isDiscounted ? 1 : 2;

    actions.push({
      priority: priorityBoost + index,
      urgency: rec.urgency,
      type: 'INFRASTRUCTURE',
      title: `${emoji} ${rec.title}`,
      why: rec.why,
      solution: rec.benefit,
      timeToComplete: '5‑10 minutes',
      cost: rec.cost,
      savings: rec.isDiscounted ? rec.originalCost - rec.cost : 0,
      roiHours: rec.roiHours ?? null,
      expiresAt: rec.expiresAt ?? null,
      isDiscounted: rec.isDiscounted,
      discountPercent: rec.discountPercent,
      category: 'infrastructure',
    });
  });

  return actions;
};

const buildFlyingSkillActions = (flyingPct: number): Action[] => {
  if (flyingPct >= META_BENCHMARKS.flyingSkill) return [];

  const efficiencyGap = META_BENCHMARKS.flyingSkill - flyingPct;
  return [
    {
      priority: 3,
      urgency: 'MEDIUM',
      type: 'STAT',
      title: `San Andreas Flight School (${flyingPct}% → 80%+)`,
      why: `Your Flying is ${flyingPct}% (${Math.ceil(flyingPct / 20)}/5 bars). ${efficiencyGap}% below meta benchmark for heist leadership. Your Sparrow is unstable. Flight School fixes this AND pays ~$250k.`,
      timeToComplete: '45 mins',
      earnings: '+$250k',
      cost: 0,
      currentStat: `${flyingPct}%`,
      targetStat: '80%',
      efficiencyGap,
    },
  ];
};

const buildStrengthBlockerActions = (strengthPct: number, formData: FormData): Action[] => {
  if (strengthPct >= 40) return [];

  const impactsNeeded = Math.ceil((40 - strengthPct) * 20);
  const method = formData.hasMansion ? 'Mansion Gym (Private)' : 'Pier Pressure (Beach)';
  const timeToComplete = formData.hasMansion
    ? `${Math.ceil((40 - strengthPct) * 0.3)} mins`
    : '60‑75 mins';
  const methodDetails = formData.hasMansion
    ? 'Use the punching bag minigame in your gym. This is the only fast, legit method.'
    : `Launch "Pier Pressure" alone. Go to the boardwalk. Punch pedestrians. Math: You need ${impactsNeeded} punches to reach 40%. (~30 punches/min).`;
  const avoidMethod = formData.hasMansion
    ? 'Avoid: Golf and Beach Punching (Waste of time compared to gym).'
    : 'Avoid: Golf (unless using "Infinite Putt" exploit). Normal golf takes 6+ hours.';

  return [
    {
      priority: 3,
      urgency: 'BLOCKER',
      type: 'STAT',
      title: 'Fix Critical Strength Liability',
      why: `Your Strength is ${strengthPct}% (${Math.ceil(strengthPct / 20)}/5 bars). You take max damage. You cannot lead Heists safely.`,
      impact: 'CRITICAL',
      method,
      methodDetails,
      avoidMethod,
      timeToComplete,
      cost: 0,
      currentStat: `${strengthPct}%`,
      targetStat: '40%',
      impactsNeeded,
    },
  ];
};

const buildDreContractActions = (formData: FormData, userProfile: any): Action[] => {
  if (!formData.hasAgency || formData.dreContractDone) return [];

  const weekEndLabel = _WEEKLY_EVENTS.meta?.validUntil ?? '';
  const dreGatekeeper = _checkGatekeeper('dre_contract', userProfile, Date.now()) as any;

  let title = `Dr. Dre Contract (After ${weekEndLabel})`;
  let why = `One‑time $1M payout. Do after current events end ${weekEndLabel}.`;
  const note = dreGatekeeper.status === 'LOCKED' ? dreGatekeeper.reason : `Lower priority than time‑limited events. Do after ${weekEndLabel}.`;
  let priority = 4;

  if (dreGatekeeper.status === 'LOCKED') {
    title = `🔒 ${title}`;
    why = `${dreGatekeeper.reason}. ${why}`;
  } else if (dreGatekeeper.status === 'WARNING') {
    title = `⚠️ ${title}`;
    why = `${dreGatekeeper.reason} ${why}`;
  }

  return [
    {
      priority,
      urgency: 'LOW',
      type: 'CONTRACT',
      title,
      why,
      solution: 'Complete Dr. Dre Contract from Agency computer',
      timeToComplete: '2‑3 hours',
      note,
      gatekeeperStatus: dreGatekeeper.status,
      gatekeeperPenalty: dreGatekeeper.score_penalty,
    },
  ];
};

const buildStaminaActions = (staminaPct: number): Action[] => {
  if (staminaPct >= 100) return [];

  return [
    {
      priority: 7,
      urgency: 'LOW',
      type: 'STAT',
      title: 'Maximize Stamina (AFK Method)',
      why: 'Unlimited sprint is useful for heist setups. Use the rubber‑band method while AFK. Required for Mansion Yoga buff (+15% run speed).',
      impact: 'LOW - Quality of life improvement',
      cost: 0,
      timeToComplete: '30 mins (AFK)',
      method: 'Rubber‑band controller while AFK',
    },
  ];
};

// ======================================================================
// Smart Action Plan Orchestrator (complexity < 15)
// ======================================================================

export const buildSmartActionPlan = (formData: FormData, _results?: Results | null): Action[] => {
  const now = Date.now();
  const cash = Number(formData.liquidCash) || 0;
  const strengthPct = validateStat(formData.strength);
  const flyingPct = validateStat(formData.flying);
  const staminaPct = validateStat(formData.stamina);
  const hasGTAPlus = !!formData.hasGTAPlus;
  const userProfile = buildUserProfile({ formData, gtaPlus: hasGTAPlus });

  const actions: Action[] = [
    ...buildAutoShopActions(formData, now),
    ...buildBusinessBattlesActions(formData, now),
    ...buildNightclubDiscountActions(formData, now),
    ...buildCombatPrepActions(formData),
    ...buildInfrastructureActions(formData, cash),
    ...buildFlyingSkillActions(flyingPct),
    ...buildStrengthBlockerActions(strengthPct, formData),
    ...buildDreContractActions(formData, userProfile),
    ...buildStaminaActions(staminaPct),
  ];

  return actions.sort((a, b) => a.priority - b.priority);
};

// ======================================================================
// Session & Maintenance Actions
// ======================================================================

export const generateSessionTaxActions = (formData: FormData): Action[] => {
  const actions: Action[] = [];
  const hasPassiveEmpire = formData.hasAcidLab || formData.hasBunker || formData.hasNightclub;
  const hasAnySafe = formData.hasNightclub || formData.hasAgency || formData.hasCarWash;
  const missingDaily = [];

  if (!formData.dailyStashHouse) missingDaily.push('Stash House');
  if (!formData.dailyGsCache) missingDaily.push("G's Cache");
  if (hasAnySafe && !formData.dailySafeCollect) missingDaily.push('Collect safes');

  if (missingDaily.length > 0) {
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'DAILY',
      title: '💰 Daily Cash Loop',
      why: 'These are fast, guaranteed-value dailies. Leaving them unchecked is free money left behind.',
      solution: `Complete: ${missingDaily.join(' → ')}. Resets daily at 07:00 UTC.`,
      timeToComplete: '5-10 mins',
      estimatedMinutes: 8,
      launchesPassiveTimer: false,
      futureValue: 2,
    });
  }

  if (hasPassiveEmpire) {
    const passiveSteps = [];
    if (formData.hasNightclub) passiveSteps.push('Collect Nightclub safe');
    if (formData.hasAcidLab) passiveSteps.push('Check Acid Lab stock / resupply');
    if (formData.hasBunker) passiveSteps.push('Resupply Bunker');
    if (formData.hasCarWash) passiveSteps.push('Collect Car Wash safe');

    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'TAX',
      title: '🏭 Passive Empire Maintenance',
      why: `Start all passive clocks immediately. ${passiveSteps.length} businesses need attention. Empty supplies = money left on the table every hour.`,
      solution: passiveSteps.join(' → ') + '. Do this FIRST every session (~5-10 min).',
      timeToComplete: '5-10 mins',
      estimatedMinutes: 10,
      launchesPassiveTimer: true,
      futureValue: 5,
    });
  }

  if (formData.hasAcidLab) {
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'TAX',
      title: 'Sell Acid Lab Product (Private Session)',
      why: 'Acid Lab sell missions work in Invite Only. Sell when stock is full for max value.',
      solution: 'Call Mutt → Sell Product. Brickade 6x6 sell is solo-friendly in private sessions.',
      timeToComplete: '5-10 mins',
      estimatedMinutes: 8,
      launchesPassiveTimer: false,
      futureValue: 2,
    });
  }

  if (!hasPassiveEmpire) {
    actions.push({
      priority: 1,
      urgency: 'MEDIUM',
      type: 'TAX',
      title: 'Quick Daily "Tax" Loop',
      why: `If you don't have passive businesses yet, take 5 minutes to grab easy daily value.`,
      solution: 'Do Daily Objectives + any quick bonus claims (casino spin, free items).',
      timeToComplete: '5 mins',
      estimatedMinutes: 5,
      launchesPassiveTimer: false,
      futureValue: 1,
    });
  }

  return actions;
};

export const generateMaintenanceActions = (formData: FormData, _results?: Results | null): Action[] => {
  const actions: Action[] = [];

  actions.push({
    priority: 6,
    urgency: 'LOW',
    type: 'DAILY',
    title: 'Complete Daily Objectives',
    why: 'Daily objectives provide steady income and RP. Check phone for daily tasks.',
    solution: 'Check phone → Daily Objectives → Complete tasks',
    timeToComplete: '10-15 minutes',
    earnings: '$30-50k + RP',
  });

  const stats = {
    strength: validateStat(formData.strength),
    flying: validateStat(formData.flying),
    shooting: validateStat(formData.shooting),
    stealth: validateStat(formData.stealth),
    stamina: validateStat(formData.stamina),
    driving: validateStat(formData.driving),
  };

  for (const [statName, statPct] of Object.entries(stats)) {
    if (statPct < 100) {
      actions.push({
        priority: 7,
        urgency: 'LOW',
        type: 'STAT',
        title: `Maximize ${statName.charAt(0).toUpperCase() + statName.slice(1)}`,
        why: `${statPct}% is below maximum. Maxing stats improves performance in all activities.`,
        solution: `Use appropriate training method for ${statName}`,
        timeToComplete: 'Varies by stat',
        currentStat: `${statPct}%`,
        targetStat: '100%',
      });
    }
  }

  const nightclubTechsCount = Number(formData.nightclubTechs) || 0;
  if (formData.hasNightclub && nightclubTechsCount < 5) {
    actions.push({
      priority: 6,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Optimize Nightclub (Add Technicians)',
      why: `You have ${nightclubTechsCount}/5 technicians. Adding more increases passive income.`,
      solution: 'Buy technicians from Nightclub computer',
      timeToComplete: '5 minutes',
      cost: getNightclubTechnicianCost(nightclubTechsCount, 5),
    });
  }

  const cash = Number(formData.liquidCash) || 0;
  if (!formData.hasKosatka && cash >= 2_000_000) {
    actions.push({
      priority: 5,
      urgency: 'MEDIUM',
      type: 'PURCHASE',
      title: 'Purchase Kosatka Submarine',
      why: 'Unlocks Cayo Perico heist, the best solo income source.',
      solution: 'Buy from Warstock Cache & Carry',
      timeToComplete: 'Purchase + setup: 30 minutes',
      cost: 2_200_000,
    });
  }

  if (actions.length < 3) {
    actions.push({
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Review Your Business Setup',
      why: "Periodically review your businesses to ensure they're optimized for maximum income.",
      solution: 'Check all business computers and ensure upgrades are purchased, technicians assigned, etc.',
      timeToComplete: '15-20 minutes',
    });
  }
  if (actions.length < 3) {
    actions.push({
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Complete Contact Missions',
      why: 'Contact missions provide steady income and RP. Good filler activity between heists.',
      solution: 'Open phone → Quick Job → Contact Mission',
      timeToComplete: '10-15 minutes per mission',
      earnings: '$20-40k per mission',
    });
  }
  if (actions.length < 3) {
    actions.push({
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Explore New Content',
      why: 'GTA Online regularly adds new content. Check the Rockstar Newswire for latest updates.',
      solution: 'Visit rockstargames.com/newswire or check in-game notifications',
      timeToComplete: '5 minutes',
    });
  }

  return actions;
};

// ======================================================================
// Compact & Session Plan Builders (complexity < 15 each)
// ======================================================================

export const buildCompactActionPlan = (
  bottlenecks: Bottleneck[] | null,
  _heistReady?: any,
  formData?: FormData,
  results?: Results | null
): Action[] => {
  if (!formData) return [];

  const now = Date.now();
  const prioritizedBottlenecks = bottlenecks ?? [];
  const seenBottleneckIds = new Set<string>();
  const actions: Action[] = [];

  for (const bottleneck of prioritizedBottlenecks) {
    if (bottleneck.id && seenBottleneckIds.has(bottleneck.id)) continue;
    if (bottleneck.id) seenBottleneckIds.add(bottleneck.id);
    actions.push(bottleneckToAction(bottleneck, now));
  }

  const smartActions = buildSmartActionPlan(formData, results);
  const allActions = [...actions, ...smartActions];

  // Deduplicate Paper Trail
  const paperTrailActions = allActions.filter(
    a => a.type === 'MISSION' && a.title && /paper\s*trail/i.test(a.title)
  );
  if (paperTrailActions.length > 1) {
    paperTrailActions.sort((a, b) => calculatePriorityScore(b, now) - calculatePriorityScore(a, now));
    const keepTitle = paperTrailActions[0].title;
    const filtered = allActions.filter(
      a => !(a.type === 'MISSION' && a.title && /paper\s*trail/i.test(a.title)) || a.title === keepTitle
    );
    allActions.length = 0;
    allActions.push(...filtered);
  }

  // Deduplicate Auto Shop
  const autoShopKeywords = ['auto shop', 'union depository', 'robbery contract'];
  const autoShopActions = allActions.filter(
    a => a.title && autoShopKeywords.some(kw => a.title.toLowerCase().includes(kw))
  );
  if (autoShopActions.length > 1) {
    autoShopActions.sort((a, b) => calculatePriorityScore(b, now) - calculatePriorityScore(a, now));
    const keepTitle = autoShopActions[0].title;
    const filtered = allActions.filter(
      a => !(a.title && autoShopKeywords.some(kw => a.title.toLowerCase().includes(kw))) || a.title === keepTitle
    );
    allActions.length = 0;
    allActions.push(...filtered);
  }

  if (allActions.length < 3) {
    const maintenance = generateMaintenanceActions(formData, results);
    allActions.push(...maintenance.slice(0, 5 - allActions.length));
  }

  allActions.forEach(action => {
    action._priorityScore = calculatePriorityScore(action, now);
  });

  const annotated = allActions.map(a => annotateForCompoundEfficiency(a, formData, results ?? null, now));

  annotated.sort((a, b) => (b.compoundScore ?? 0) - (a.compoundScore ?? 0));
  const sorted = annotated.slice(0, 5).map(({ _priorityScore: _, _compoundMeta: __, ...action }) => action);

  if (sorted.length < 3) {
    const additional = generateMaintenanceActions(formData, results);
    for (const action of additional) {
      if (sorted.length >= 3) break;
      if (!sorted.some(a => a.title === action.title)) {
        sorted.push(action);
      }
    }
  }

  return sorted;
};

export const buildSessionPlan = ({
  formData,
  results,
  sessionMinutes = 60,
}: {
  formData: FormData;
  results: Results | null;
  sessionMinutes?: number;
}) => {
  const now = Date.now();
  const taxCandidates = generateSessionTaxActions(formData);
  const tax = taxCandidates[0];

  const remainingAfterTax = Math.max(0, sessionMinutes - (tax?.estimatedMinutes ?? 5));

  const bottlenecks = (results?.bottlenecks ?? []).map(b => bottleneckToAction(b, now));
  const smart = buildSmartActionPlan(formData, results);
  const candidates = [...bottlenecks, ...smart]
    .map(a => annotateForCompoundEfficiency(a, formData, results, now))
    .filter(a => a.title !== tax?.title);

  const investBudget = Math.min(15, Math.max(5, Math.floor(remainingAfterTax * 0.25)));
  const investment =
    candidates
      .filter(a => (a.unlockVelocity ?? 0) >= 3)
      .filter(a => a.estimatedMinutes == null || a.estimatedMinutes <= investBudget)
      .sort((a, b) => (b.compoundScore ?? 0) - (a.compoundScore ?? 0))[0] ?? null;

  const remainingAfterInvestment = Math.max(
    0,
    remainingAfterTax - (investment?.estimatedMinutes ?? 0)
  );

  const bridge =
    candidates
      .filter(a => !a.blockedBy || a.blockedBy.length === 0)
      .filter(a => a.estimatedMinutes == null || a.estimatedMinutes <= remainingAfterInvestment)
      .filter(a => !investment || a.title !== investment.title)
      .sort((a, b) => (b.compoundScore ?? 0) - (a.compoundScore ?? 0))[0] ?? null;

  return {
    sessionMinutes,
    tax,
    bridge,
    investment,
    meta: {
      remainingAfterTax,
      remainingAfterInvestment,
      passiveProgress: getPassiveProgress(formData),
    },
  };
};

export const getTopPriorityAction = (
  formData: FormData,
  results: Results | null
): {
  type: string;
  title: string;
  reason: string;
  icon: string;
  color: string;
  steps: string;
  time?: string | null;
} => {
  const actionPlan = buildSmartActionPlan(formData, results);
  if (actionPlan.length === 0) {
    return {
      type: 'OPTIMIZE',
      title: 'Continue Your Grind',
      reason: "You're doing great! Focus on maximizing your current setup.",
      icon: '🎯',
      color: 'from-blue-600 to-purple-600',
      steps: 'Keep running your optimized loop',
    };
  }

  const topAction = actionPlan[0];
  let actionType = 'PRIORITY';
  let icon = '🎯';
  let color = 'from-blue-600 to-purple-600';

  if (topAction.urgency === 'URGENT' || topAction.urgency === 'GRIND NOW') {
    actionType = 'CRITICAL';
    icon = '⚡';
    color = 'from-yellow-600 to-orange-600';
  } else if (topAction.urgency === 'BLOCKER') {
    actionType = 'BLOCKER';
    icon = '🚨';
    color = 'from-red-600 to-orange-600';
  }

  return {
    type: actionType,
    title: topAction.title,
    reason: topAction.why,
    icon,
    color,
    time: topAction.timeToComplete ?? null,
    steps: topAction.method ?? topAction.why,
  };
};
