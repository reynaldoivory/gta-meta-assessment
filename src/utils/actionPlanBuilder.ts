// src/utils/actionPlanBuilder.ts
// Time-Sensitive Meta Logic - Prioritizes time-limited opportunities over generic grind advice
// ENFORCED: Always returns 3-5 actions minimum
/* eslint-disable @typescript-eslint/no-explicit-any, complexity, max-lines */

import { WEEKLY_EVENTS as _rawWEEKLY_EVENTS, getDaysRemaining, getExpiryLabel } from '../config/weeklyEvents.js';
import { validateStat } from './assessmentHelpers.js';
import { isExpiringSoon, isExpiringCritical } from './eventHelpers.js';
import { getNightclubTechnicianCost, generateInfrastructureRecommendations } from './infrastructureAdvisor.js';
import { checkGatekeeper } from './gatekeeperEngine.js';


// Use direct imports, remove redundant type assertions (TypeScript will infer types)
const WEEKLY_EVENTS = _rawWEEKLY_EVENTS;

// ======================================================================
// Types & Interfaces
// ======================================================================

interface UserStats {
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

interface User {
  gtaPlus?: boolean;
  formData?: FormData;
  assets?: string[];
  stats?: UserStats;
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

interface Results {
  bottlenecks?: Bottleneck[];
  [key: string]: any;
}

// ======================================================================
// Constants
// ======================================================================

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
  if (hrMatch) return Math.round(Number.parseFloat(hrMatch[1]) * 60);
  const minMatch = /^(\d+(\.\d+)?)\s*m/.exec(str);
  if (minMatch) return Math.round(Number.parseFloat(minMatch[1]));
  const anyNumber = /^(\d+(\.\d+)?)/.exec(str);
  return anyNumber ? Math.round(Number.parseFloat(anyNumber[1])) : null;
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

const calculatePriorityScore = (action: Action, now: number): number => {
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

const buildAutoShopActions = (formData: FormData, now: number): Action[] => { // NOSONAR
  const actions: Action[] = [];
  const daysLeft = getDaysRemaining();
  const cash = Number(formData.liquidCash) || 0;
  const strengthPct = validateStat(formData.strength);
  const hasGTAPlus = !!formData.hasGTAPlus;
  const playerRank = Number(formData.rank) || 0;

  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop as any;
  const isAutoShopEventAvailable =
    daysLeft > 0 &&
    autoShopBonus?.isActive &&
    (!autoShopBonus.gtaPlusOnly || hasGTAPlus);

  if (!isAutoShopEventAvailable) return actions;

  const shopCost = (WEEKLY_EVENTS.discounts?.autoShop?.priceEstimate ?? 835000) as number;

  if (!formData.hasAutoShop && cash >= shopCost) {
    const expiry = autoShopBonus?.gtaPlusValidUntil ?? autoShopBonus?.validUntil;
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'PURCHASE',
      title: `âš¡ BUY AUTO SHOP NOW (Ends ${WEEKLY_EVENTS.meta?.displayDate ?? 'this week'})`,
      why: `You have $${(cash / 1_000_000).toFixed(1)}M. Buying this unlocks $1.3Mâ€‘$1.5M/hr income (2X Bonus - GTA+ Exclusive). Union Depository Contract pays ~$675k in 25 mins. Beats Cayo Perico.`,
      cost: shopCost,
      earnings: '$1.3Mâ€‘$1.5M/hr',
      timeRemaining: `${daysLeft} days`,
      timeToComplete: '15 minutes (purchase + setup)',
      potentialEarnings: `$4â€‘5M in ${daysLeft} days`,
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
        title: 'ðŸ”¥ Grind Auto Shop Robbery Contracts (2X Event)',
        why: `Zero prep, ~$540â€‘600k per 20â€‘25 min finale (realistic at Rank ${playerRank}). Expect ~$1.0â€‘1.5M/hr once practiced. One of the best active income sources in 2026 meta. ${getExpiryLabel(autoShopBonus?.gtaPlusValidUntil ?? WEEKLY_EVENTS.meta?.validUntil ?? '')}.`,
        solution:
          'Rotation: Union Depository finale â†’ Client vehicle delivery (also 2X) while staff preps â†’ Repeat. Eliminates downtime.',
        timeToComplete: '20â€‘25 min per finale, ~$540â€‘600k payout',
        earnings: '$1.0â€‘1.5M/hr (realistic)',
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
          ? '20â€‘30 mins'
          : '60â€‘75 mins';
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
          title: `ðŸš¨ FIX STRENGTH (${strengthPct}% â†’ 60%+)`,
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
          title: `âš¡ FARM UNION DEPOSITORY CONTRACT (${daysLeftAutoShop} days left)`,
          why: 'This is the highest paying activity in the game right now. Union Depository Contract pays ~$540â€‘600k (with 2X bonus) in ~20â€‘25 mins. No cooldown â€“ repeat endlessly. Beats Cayo Perico this week.',
          earnings: '$1.3Mâ€‘$1.5M/hr',
          timeRemaining: `${daysLeftAutoShop} days`,
          timeToComplete: '25 mins per contract (repeatable)',
          method:
            'Select "Union Depository Contract" from Auto Shop board. If not available, do a short contract to refresh the board.',
          potentialEarnings: `$4â€‘5M by event end`,
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
    const autoShopExpiry = (WEEKLY_EVENTS.bonuses?.autoShop as any)?.gtaPlusValidUntil
      ? new Date((WEEKLY_EVENTS.bonuses.autoShop as any).gtaPlusValidUntil).getTime()
      : null;

    actions.push({
      priority: 0,
      urgency: 'GRIND NOW',
      type: 'GRIND',
      title: `âš¡ GRIND FOR AUTO SHOP (${daysLeft} days left)`,
      why: `Auto Shop 2X event ends in ${daysLeft} days. You need $${(needed / 1000).toFixed(0)}k more (${hoursNeeded.toFixed(1)} hours of grinding). Buy it before the event ends!`,
      cost: needed,
      timeToComplete: `${hoursNeeded.toFixed(1)} hours`,
      potentialEarnings: `$4â€‘5M after purchase`,
      expiresAt: autoShopExpiry,
    });
  }

  return actions;
};

const buildBusinessBattlesActions = (formData: FormData, now: number): Action[] => {
  const actions: Action[] = [];
  const bbExpiry = (WEEKLY_EVENTS.bonuses?.businessBattles as any)?.validUntil
    ? new Date((WEEKLY_EVENTS.bonuses.businessBattles as any).validUntil).getTime()
    : null;
  const bbActive = !!(WEEKLY_EVENTS.bonuses?.businessBattles as any)?.isActive && bbExpiry != null && bbExpiry > now;

  if (!bbActive) return actions;

  const hoursLeft = Math.ceil((bbExpiry - now) / (1000 * 60 * 60));
  const daysLeftBB = Math.ceil(hoursLeft / 24);
  const urgencyText = hoursLeft < 48 ? `${hoursLeft} hours left` : `${daysLeftBB} days left`;
  const expiryLabel = getExpiryLabel(bbExpiry ? new Date(bbExpiry).toISOString() : WEEKLY_EVENTS.meta?.validUntil ?? '');
  const whyText = formData.hasNightclub
    ? `4X Business Battles + 4X Nightclub Goods ${expiryLabel} (${urgencyText}). Your Nightclub profits massively from won battles. Stack between Auto Shop cooldowns.`
    : `4X Business Battles ${expiryLabel} (${urgencyText}). Even without Nightclub, battles pay 4X goods. Consider buying Nightclub at discount this week!`;

  actions.push({
    priority: 1,
    urgency: hoursLeft < 24 ? 'URGENT' : 'HIGH',
    type: 'FREEMODE',
    title: 'âš¡ Contest Business Battles (4X This Week!)',
    why: whyText,
    solution: 'Join Business Battles in Freemode (every ~15 mins). Goods go to your Nightclub at 4X value. Best stacking activity.',
    timeToComplete: '5â€‘10 min per battle',
    earnings: '$200â€‘400k per battle + 4X Nightclub goods',
    timeRemaining: urgencyText,
    expiresAt: bbExpiry,
    category: 'freemode',
  });

  return actions;
};

const buildNightclubDiscountActions = (formData: FormData, now: number): Action[] => {
  const actions: Action[] = [];
  const ncDiscountExpiry = (WEEKLY_EVENTS.discounts?.nightclubUpgrades as any)?.validUntil
    ? new Date((WEEKLY_EVENTS.discounts.nightclubUpgrades as any).validUntil).getTime()
    : null;
  const ncDiscountActive =
    !!(WEEKLY_EVENTS.discounts?.nightclubUpgrades as any) &&
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
    title: 'ðŸ’° Buy Nightclub Upgrades (40% OFF!)',
    why: `Your Nightclub isn't optimized. 40% off upgrades ${getExpiryLabel(ncDiscountExpiry ? new Date(ncDiscountExpiry).toISOString() : WEEKLY_EVENTS.meta?.validUntil ?? '')} (${urgencyText}). Save ~$600k on Equipment + Staff upgrades.`,
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
  const strengthPct = validateStat(formData.strength);
  const hasGTAPlus = !!formData.hasGTAPlus;
  const autoShop2XActive =
    formData.hasAutoShop &&
    hasGTAPlus &&
    (WEEKLY_EVENTS.bonuses?.autoShop as any)?.isActive;

  if (!autoShop2XActive || playerRank >= 100 || strengthPct >= 100) return actions;

  const maxHealthPercent = Math.floor(50 + playerRank / 2);

  if (strengthPct < 60) {
    actions.push({
      priority: 2,
      urgency: 'HIGH',
      type: 'PREPARATION',
      title: 'ðŸ’ª Max Strength Before Auto Shop Finales',
      why: `Rank ${playerRank} = ~${maxHealthPercent}% max health. Strength is ${strengthPct}% (low). You take extra damage. Max strength first.`,
      solution: '1. Max Strength (30 min via Pier Pressure or Mansion Gym). 2. Then stock 10+ Snacks + 10 Super Heavy Armor.',
      timeToComplete: '30â€‘40 min oneâ€‘time investment',
      impact: 'Prevents wasted time on failed missions',
      note: 'Do this before grinding Auto Shop.',
    });
  } else if (playerRank < 80) {
    actions.push({
      priority: 2,
      urgency: 'MEDIUM',
      type: 'PREPARATION',
      title: 'ðŸ›¡ï¸ Stock Snacks & Armor for Auto Shop',
      why: `Rank ${playerRank} = ~${maxHealthPercent}% max health. Strength is good (${strengthPct}%), but stock up on supplies.`,
      solution: 'Stock 10+ Snacks + 10 Super Heavy Armor. Visit Agency armory for free snacks if owned.',
      timeToComplete: '10â€‘15 min oneâ€‘time investment',
      impact: 'Prevents wasted time on failed missions',
    });
  }

  return actions;
};

const buildInfrastructureActions = (formData: FormData, cash: number): Action[] => {
  const actions: Action[] = [];
  const infraRecommendations = generateInfrastructureRecommendations(formData) || [];
  const criticalInfra = infraRecommendations.filter(
    (r: any) => r.urgency === 'CRITICAL' || r.urgency === 'URGENT' || r.type === 'CRITICAL'
  );

  criticalInfra.slice(0, 2).forEach((rec: any, index: number) => {
    if (rec.cost && cash < rec.cost) return;

    let emoji = 'ðŸ­';
    if (rec.isTrap) emoji = 'âš ï¸';
    else if (rec.isDiscounted) emoji = 'ðŸ’°';
    else if (rec.category === 'nightclub') emoji = 'ðŸŽ­';
    else if (rec.category === 'bunker') emoji = 'ðŸ”«';

    const priorityBoost = rec.isDiscounted ? 1 : 2;

    actions.push({
      priority: priorityBoost + index,
      urgency: rec.urgency,
      type: 'INFRASTRUCTURE',
      title: `${emoji} ${rec.title}`,
      why: rec.why,
      solution: rec.benefit,
      timeToComplete: '5â€‘10 minutes',
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
      title: `San Andreas Flight School (${flyingPct}% â†’ 80%+)`,
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
    : '60â€‘75 mins';
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

  const weekEndLabel = WEEKLY_EVENTS.meta?.validUntil ?? '';
  const dreGatekeeper = checkGatekeeper('dre_contract', userProfile) as any;

  let title = `Dr. Dre Contract (After ${weekEndLabel})`;
  let why = `Oneâ€‘time $1M payout. Do after current events end ${weekEndLabel}.`;
  const note = dreGatekeeper.status === 'LOCKED' ? dreGatekeeper.reason : `Lower priority than timeâ€‘limited events. Do after ${weekEndLabel}.`;
  let priority = 4;

  if (dreGatekeeper.status === 'LOCKED') {
    title = `ðŸ”’ ${title}`;
    why = `${dreGatekeeper.reason}. ${why}`;
  } else if (dreGatekeeper.status === 'WARNING') {
    title = `âš ï¸ ${title}`;
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
      timeToComplete: '2â€‘3 hours',
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
      why: 'Unlimited sprint is useful for heist setups. Use the rubberâ€‘band method while AFK. Required for Mansion Yoga buff (+15% run speed).',
      impact: 'LOW - Quality of life improvement',
      cost: 0,
      timeToComplete: '30 mins (AFK)',
      method: 'Rubberâ€‘band controller while AFK',
    },
  ];
};

// ======================================================================
// Smart Action Plan Orchestrator (complexity < 15)
// ======================================================================

const buildSmartActionPlan = (formData: FormData, _results?: Results | null): Action[] => {
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

const getMissingDailyTasks = (formData: FormData, hasAnySafe: boolean): string[] => {
  const missingDaily: string[] = [];
  if (!formData.dailyStashHouse) missingDaily.push('Stash House');
  if (!formData.dailyGsCache) missingDaily.push("G's Cache");
  if (hasAnySafe && !formData.dailySafeCollect) missingDaily.push('Collect safes');
  return missingDaily;
};

const getPassiveEmpireSteps = (formData: FormData): string[] => {
  const passiveSteps: string[] = [];
  if (formData.hasNightclub) passiveSteps.push('Collect Nightclub safe');
  if (formData.hasAcidLab) passiveSteps.push('Check Acid Lab stock / resupply');
  if (formData.hasBunker) passiveSteps.push('Resupply Bunker');
  if (formData.hasCarWash) passiveSteps.push('Collect Car Wash safe');
  return passiveSteps;
};

const generateSessionTaxActions = (formData: FormData): Action[] => {
  const actions: Action[] = [];
  const hasPassiveEmpire = formData.hasAcidLab || formData.hasBunker || formData.hasNightclub;
  const hasAnySafe = formData.hasNightclub || formData.hasAgency || formData.hasCarWash;
  const missingDaily = getMissingDailyTasks(formData, hasAnySafe);

  if (missingDaily.length > 0) {
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'DAILY',
      title: 'ðŸ’° Daily Cash Loop',
      why: 'These are fast, guaranteed-value dailies. Leaving them unchecked is free money left behind.',
      solution: `Complete: ${missingDaily.join(' â†’ ')}. Resets daily at 07:00 UTC.`,
      timeToComplete: '5-10 mins',
      estimatedMinutes: 8,
      launchesPassiveTimer: false,
      futureValue: 2,
    });
  }

  const passiveSteps = getPassiveEmpireSteps(formData);
  if (hasPassiveEmpire) {
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'TAX',
      title: 'ðŸ­ Passive Empire Maintenance',
      why: `Start all passive clocks immediately. ${passiveSteps.length} businesses need attention. Empty supplies = money left on the table every hour.`,
      solution: passiveSteps.join(' â†’ ') + '. Do this FIRST every session (~5-10 min).',
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
      solution: 'Call Mutt â†’ Sell Product. Brickade 6x6 sell is solo-friendly in private sessions.',
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

const addStatMaintenanceActions = (actions: Action[], formData: FormData) => {
  const stats = {
    strength: validateStat(formData.strength),
    flying: validateStat(formData.flying),
    shooting: validateStat(formData.shooting),
    stealth: validateStat(formData.stealth),
    stamina: validateStat(formData.stamina),
    driving: validateStat(formData.driving),
  };

  Object.entries(stats)
    .filter(([, statPct]) => statPct < 100)
    .forEach(([statName, statPct]) => {
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
    });
};

const addFallbackMaintenanceActions = (actions: Action[]) => {
  const fallbackActions: Action[] = [
    {
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Review Your Business Setup',
      why: "Periodically review your businesses to ensure they're optimized for maximum income.",
      solution: 'Check all business computers and ensure upgrades are purchased, technicians assigned, etc.',
      timeToComplete: '15-20 minutes',
    },
    {
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Complete Contact Missions',
      why: 'Contact missions provide steady income and RP. Good filler activity between heists.',
      solution: 'Open phone â†’ Quick Job â†’ Contact Mission',
      timeToComplete: '10-15 minutes per mission',
      earnings: '$20-40k per mission',
    },
    {
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Explore New Content',
      why: 'GTA Online regularly adds new content. Check the Rockstar Newswire for latest updates.',
      solution: 'Visit rockstargames.com/newswire or check in-game notifications',
      timeToComplete: '5 minutes',
    },
  ];

  for (const action of fallbackActions) {
    if (actions.length >= 3) break;
    actions.push(action);
  }
};

const generateMaintenanceActions = (formData: FormData, _results?: Results | null): Action[] => {
  const actions: Action[] = [
    {
      priority: 6,
      urgency: 'LOW',
      type: 'DAILY',
      title: 'Complete Daily Objectives',
      why: 'Daily objectives provide steady income and RP. Check phone for daily tasks.',
      solution: 'Check phone â†’ Daily Objectives â†’ Complete tasks',
      timeToComplete: '10-15 minutes',
      earnings: '$30-50k + RP',
    },
  ];

  addStatMaintenanceActions(actions, formData);

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

  addFallbackMaintenanceActions(actions);
  return actions;
};

const getUniqueBottleneckActions = (bottlenecks: Bottleneck[], now: number): Action[] => {
  const seenBottleneckIds = new Set<string>();
  const actions: Action[] = [];

  for (const bottleneck of bottlenecks) {
    if (bottleneck.id && seenBottleneckIds.has(bottleneck.id)) continue;
    if (bottleneck.id) seenBottleneckIds.add(bottleneck.id);
    actions.push(bottleneckToAction(bottleneck, now));
  }

  return actions;
};

const dedupeActionsByPriority = (
  actions: Action[],
  matcher: (action: Action) => boolean,
  now: number
): Action[] => {
  const matching = actions.filter(matcher);
  if (matching.length <= 1) return actions;

  matching.sort((a, b) => calculatePriorityScore(b, now) - calculatePriorityScore(a, now));
  const keepTitle = matching[0].title;
  return actions.filter((action) => !matcher(action) || action.title === keepTitle);
};

const ensureMinimumActions = (
  actions: Action[],
  formData: FormData,
  results: Results | null | undefined,
  minCount: number
) => {
  if (actions.length >= minCount) return;
  const maintenance = generateMaintenanceActions(formData, results);
  actions.push(...maintenance.slice(0, 5 - actions.length));
};

const appendUniqueMaintenanceActions = (
  actions: Action[],
  formData: FormData,
  results: Results | null | undefined,
  minCount: number
) => {
  if (actions.length >= minCount) return;

  const additional = generateMaintenanceActions(formData, results);
  for (const action of additional) {
    if (actions.length >= minCount) break;
    if (!actions.some((existing) => existing.title === action.title)) {
      actions.push(action);
    }
  }
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
  const actions = getUniqueBottleneckActions(prioritizedBottlenecks, now);
  const smartActions = buildSmartActionPlan(formData, results);
  let allActions = [...actions, ...smartActions];

  allActions = dedupeActionsByPriority(
    allActions,
    (action) => action.type === 'MISSION' && Boolean(action.title) && /paper\s*trail/i.test(action.title),
    now
  );

  const autoShopKeywords = ['auto shop', 'union depository', 'robbery contract'];
  allActions = dedupeActionsByPriority(
    allActions,
    (action) =>
      Boolean(action.title) && autoShopKeywords.some((keyword) => action.title.toLowerCase().includes(keyword)),
    now
  );

  ensureMinimumActions(allActions, formData, results, 3);

  allActions.forEach(action => {
    action._priorityScore = calculatePriorityScore(action, now);
  });

  const annotated = allActions.map(a => annotateForCompoundEfficiency(a, formData, results ?? null, now));

  annotated.sort((a, b) => (b.compoundScore ?? 0) - (a.compoundScore ?? 0));
  const sorted = annotated.slice(0, 5).map(({ _priorityScore: _, _compoundMeta: __, ...action }) => action);

  appendUniqueMaintenanceActions(sorted, formData, results, 3);

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


