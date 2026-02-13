// src/utils/recommendationEngine.ts
// Generate prioritized recommendations combining opportunities, efficiency, and ROI

import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';
import { detectCriticalOpportunities } from './priorityDetector.js';
import { calculateCompoundEfficiency } from './actionPlanBuilder.ts';
import { calculateTaskMetrics } from './taskMetrics.js';
import { validateStat } from './assessmentHelpers.js';
import { TASK_REQUIREMENTS } from '../config/gatekeeperSchema.js';
import { MODEL_CONFIG } from './modelConfig.js';
import { getNightclubTechnicianCost } from './infrastructureAdvisor.js';
import type { FormData, GameState, Task, User, UserStats, WeeklyEvents } from './actionPlanBuilder.ts';

// ======================================================================
// Types
// ======================================================================

type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

type TrainingRecommendation = 'SKIP' | 'DO IMMEDIATELY' | 'HIGH PRIORITY' | 'MEDIUM PRIORITY';

interface TrainingROI {
  skill: string;
  currentBars: number;
  targetBars: number;
  currentPercent: number;
  targetPercent: number;
  gap: number;
  trainingTime: number;
  weeklyValueGain: number;
  paybackTime: number;
  recommendation: TrainingRecommendation;
}

interface TaskDefinition extends Task {
  id: string;
  name: string;
  basePayout: number;
  baseDuration: number;
  category: string;
  eventId?: string;
  tags?: string[];
  description?: string;
  dynamicPayout?: boolean;
  nightclubGoodsValue?: number;
  firstWinBonus?: boolean;
  requiresGtaPlus?: boolean;
}

interface TaskMetrics {
  payoutPerHour?: number;
  effectiveDuration?: number;
  adjustedPayout?: number;
}

interface TaskWithMetrics extends TaskDefinition {
  score: number;
  reasoning: string[] | string;
  warnings: string[];
  metrics: TaskMetrics;
  gatekeeperResult?: { status?: string };
  multiplier?: number;
  timeRemaining?: number | null;
  urgency?: string;
}

interface CriticalOpportunity {
  type: string;
  task: {
    id?: string;
    name?: string;
    activity?: string;
    reward?: number;
    duration?: number;
    timeLeft?: number;
    multiplier?: number;
    savings?: number;
    vehicle?: string;
  };
  priority?: string;
  reasoning?: string;
  urgency?: string;
  [key: string]: any;
}

interface RecommendationTask {
  id?: string;
  name?: string;
  activity?: string;
  reward?: number;
  duration?: number;
  timeLeft?: number | null;
  multiplier?: number;
  savings?: number;
  vehicle?: string;
  urgency?: string;
}

interface Recommendation {
  type: string;
  priority: RecommendationPriority | string;
  task: RecommendationTask;
  reasoning?: string;
  urgency?: string;
  effectiveValue?: number;
  timeInvestment?: number;
  score?: number;
  metrics?: TaskMetrics;
  warnings?: string[];
  cost?: number;
  hourlyRate?: number;
}

interface SynergyBoost {
  activity: string;
  bonus: number;
  reason: string;
  compoundValue: number;
}

// ======================================================================
// Constants
// ======================================================================

const TRAINING_TIME_MAP: Record<string, number> = {
  flying: 30,
  stealth: 45,
  strength: 60,
  shooting: 40,
  driving: 30,
  stamina: 45,
};

const TASKS_DATABASE: TaskDefinition[] = [
  {
    id: 'cayo_perico',
    name: 'Cayo Perico Heist',
    basePayout: 700000,
    baseDuration: 60,
    category: 'heist',
    eventId: 'cayo_perico',
  },
  {
    id: 'auto_shop_contract',
    name: 'Auto Shop Robbery Contract',
    basePayout: 300000,
    baseDuration: 25,
    category: 'mission',
    eventId: 'auto_shop',
    tags: ['auto_shop', 'robbery contract'],
  },
  {
    id: 'business_battle',
    name: 'Business Battle (Freemode)',
    basePayout: 30000,
    baseDuration: 12,
    category: 'freemode',
    eventId: 'business_battles',
    tags: ['business_battles', 'freemode', 'repeatable', 'pvp'],
    description: 'Compete for special cargo in freemode',
    nightclubGoodsValue: 10000,
  },
  {
    id: 'nightclub_sell',
    name: 'Nightclub Goods Sale',
    basePayout: 500000,
    baseDuration: 10,
    category: 'passive',
    eventId: 'nightclub_sell',
    tags: ['nightclub_goods'],
    dynamicPayout: true,
  },
  {
    id: 'payphone_hit',
    name: 'Payphone Hit',
    basePayout: 85000,
    baseDuration: 5,
    category: 'mission',
    eventId: 'payphone_hit',
  },
  {
    id: 'paper_trail',
    name: 'Operation Paper Trail',
    basePayout: 40000,
    baseDuration: 15,
    category: 'mission',
    eventId: 'paper_trail',
    tags: ['paper_trail'],
  },
  {
    id: 'mansion_raid',
    name: 'Mansion Raid',
    basePayout: 50000,
    baseDuration: 20,
    category: 'pvp',
    eventId: 'mansion_raid',
    tags: ['mansion_raid', 'pvp', 'new_mode'],
    description: 'New PvP mode with first-win bonus',
    firstWinBonus: true,
  },
  {
    id: 'auto_shop_union_depository',
    name: 'Auto Shop: Union Depository Contract',
    basePayout: 300000,
    baseDuration: 25,
    category: 'heist',
    eventId: 'auto_shop_finales',
    tags: ['auto_shop_finales', 'solo_friendly', 'gta_plus'],
    description: 'Highest paying Auto Shop finale',
    requiresGtaPlus: true,
  },
];

// ======================================================================
// Weekly Events
// ======================================================================

export const getWeeklyEvents = (): WeeklyEvents => WEEKLY_EVENTS as WeeklyEvents;

// ======================================================================
// Skill Training ROI
// ======================================================================

const determineTrainingRecommendation = (paybackTime: number): TrainingRecommendation => {
  if (paybackTime < 1) return 'DO IMMEDIATELY';
  if (paybackTime < 2) return 'HIGH PRIORITY';
  if (paybackTime < 4) return 'MEDIUM PRIORITY';
  return 'SKIP';
};

export const calculateTrainingROI = (
  skill: string,
  currentBars: number,
  targetBars: number,
  _user: User
): TrainingROI | null => {
  if (currentBars >= targetBars) return null;

  const currentPercent = validateStat(currentBars);
  const targetPercent = validateStat(targetBars);
  const gap = targetPercent - currentPercent;

  const trainingTime = TRAINING_TIME_MAP[skill] ?? 45;

  let weeklyValueGain = 0;

  Object.entries(TASK_REQUIREMENTS).forEach(([_taskId, requirements]) => {
    const relevantGate = requirements.soft_gates?.find(g => g.stat === skill);
    if (!relevantGate) return;

    const currentGap = Math.max(0, relevantGate.min - currentPercent);
    const targetGap = Math.max(0, relevantGate.min - targetPercent);

    if (currentGap <= 0 || targetGap >= currentGap) return;

    const failureReduction = (currentGap - targetGap) / 20;
    const penaltyMap: Record<string, number> = { critical: 0.2, high: 0.15, medium: 0.1 };
    const penaltyPerBar = penaltyMap[relevantGate.penalty] ?? 0.05;

    const avgTaskValue = 500000;
    const efficiencyGain = failureReduction * penaltyPerBar;
    weeklyValueGain += avgTaskValue * efficiencyGain * 0.1;
  });

  const paybackTime = trainingTime > 0 && weeklyValueGain > 0
    ? (trainingTime / 60) / (weeklyValueGain / 1000000)
    : Infinity;

  return {
    skill,
    currentBars,
    targetBars,
    currentPercent,
    targetPercent,
    gap,
    trainingTime,
    weeklyValueGain,
    paybackTime,
    recommendation: determineTrainingRecommendation(paybackTime),
  };
};

// ======================================================================
// Opportunity Detection
// ======================================================================

const detectMissingUpgrades = (user: User, _gameState: GameState = {}): Array<{
  id: string;
  name: string;
  cost: number;
  hourlyLoss: number;
  roiHours: number;
}> => {
  const formData = user.formData || (user as FormData);
  const upgrades: Array<{ id: string; name: string; cost: number; hourlyLoss: number; roiHours: number }> = [];

  if (formData.hasBunker && !formData.bunkerUpgraded) {
    const bunkerBase = MODEL_CONFIG.income.bunker.unupgraded.perHour;
    const bunkerMax = MODEL_CONFIG.income.bunker.upgraded.perHour;
    const bunkerUpgradeCost = MODEL_CONFIG.income.passive.bunkerUpgradeCost;
    const bunkerHourlyLoss = bunkerMax - bunkerBase;
    upgrades.push({
      id: 'bunker_upgrades',
      name: 'Bunker Equipment + Staff Upgrades',
      cost: bunkerUpgradeCost,
      hourlyLoss: bunkerHourlyLoss,
      roiHours: Math.ceil(bunkerUpgradeCost / bunkerHourlyLoss),
    });
  }

  if (formData.hasAcidLab && !formData.acidLabUpgraded) {
    const acidBase = MODEL_CONFIG.income.passive.acidLabBase;
    const acidUpgradeMult = MODEL_CONFIG.income.passive.acidLabUpgrade;
    const acidUpgradeCost = MODEL_CONFIG.income.passive.acidLabUpgradeCost;
    const acidHourlyLoss = Math.round(acidBase * acidUpgradeMult - acidBase);
    upgrades.push({
      id: 'acid_lab_upgrades',
      name: 'Acid Lab Equipment Upgrade',
      cost: acidUpgradeCost,
      hourlyLoss: acidHourlyLoss,
      roiHours: Math.ceil(acidUpgradeCost / acidHourlyLoss),
    });
  }

  const nightclubTechs = Number(formData.nightclubTechs) || 0;
  if (formData.hasNightclub && nightclubTechs < 5) {
    const missingTechs = 5 - nightclubTechs;
    upgrades.push({
      id: 'nightclub_technicians',
      name: `Hire ${missingTechs} More Nightclub Technician${missingTechs > 1 ? 's' : ''}`,
      cost: getNightclubTechnicianCost(nightclubTechs, 5),
      hourlyLoss: missingTechs * 10000,
      roiHours: 15,
    });
  }

  return upgrades;
};

const detectAssetSynergies = (
  user: User,
  weeklyEvents: WeeklyEvents,
  _tasks: TaskDefinition[]
): SynergyBoost[] => {
  const formData = user.formData || (user as FormData);
  const synergies: SynergyBoost[] = [];

  if (formData.hasNightclub) {
    const bbBoost = weeklyEvents.bonuses?.businessBattles
      || weeklyEvents.activeBoosts?.find(b => b.activity === 'business_battles');

    if (bbBoost && ((bbBoost as any).multiplier >= 4 || (bbBoost as any).isActive)) {
      synergies.push({
        activity: 'business_battles',
        bonus: 5000,
        reason: '🏪 You own Nightclub - 4x goods value stacks!',
        compoundValue: 40000,
      });
    }

    const ncBoost = weeklyEvents.bonuses?.nightclubGoods
      || weeklyEvents.activeBoosts?.find(b => b.activity === 'nightclub_goods');

    if (ncBoost && ((ncBoost as any).multiplier >= 4 || (ncBoost as any).isActive)) {
      synergies.push({
        activity: 'nightclub_goods',
        bonus: 8000,
        reason: '🏪 Your Nightclub goods are worth 4x this week!',
        compoundValue: 0,
      });
    }
  }

  if (formData.hasAutoShop && formData.hasGTAPlus) {
    const asBoost = weeklyEvents.gtaPlus?.monthlyBonuses?.find(b => b.activity === 'auto_shop_finales');
    if (asBoost) {
      synergies.push({
        activity: 'auto_shop_finales',
        bonus: 6000,
        reason: '⭐ GTA+ 2x bonus on Auto Shop = $600k per finale!',
        compoundValue: 300000,
      });
    }
  }

  return synergies;
};

// ======================================================================
// Recommendation Builders
// ======================================================================

const buildUserForDetector = (user: User): User => ({
  formData: {
    ...(user.formData || user),
    hasGTAPlus: user.gtaPlus || user.formData?.hasGTAPlus || user.formData?.gtaPlus || false,
    claimedFreeCar: user.formData?.claimedFreeCar || false,
  },
});

const buildUserStats = (formData: FormData, stats: Partial<UserStats>): UserStats => ({
  flying: stats.flying ?? formData.flying ?? 0,
  strength: stats.strength ?? formData.strength ?? 0,
  shooting: stats.shooting ?? formData.shooting ?? (stats as any).combat ?? 0,
  stealth: stats.stealth ?? formData.stealth ?? 0,
  stamina: stats.stamina ?? formData.stamina ?? 0,
  driving: stats.driving ?? formData.driving ?? 0,
});

const buildUserWithFormData = (
  user: User,
  formData: FormData,
  stats: Partial<UserStats>,
  userStats: UserStats
): User => ({
  formData: {
    ...formData,
    ...stats,
    flying: userStats.flying,
    strength: userStats.strength,
    shooting: userStats.shooting,
    stealth: userStats.stealth,
    stamina: userStats.stamina,
    driving: userStats.driving,
    hasGTAPlus: user.gtaPlus || formData.hasGTAPlus || formData.gtaPlus || false,
    hasKosatka: (user as any).owns?.kosatka || formData.hasKosatka || false,
    hasAgency: (user as any).owns?.agency || formData.hasAgency || false,
    hasAcidLab: (user as any).owns?.acidLab || formData.hasAcidLab || false,
    acidLabUpgraded: formData.acidLabUpgraded || false,
    hasNightclub: (user as any).owns?.nightclub || formData.hasNightclub || false,
    nightclubTechs: formData.nightclubTechs || (user as any).nightclubTechs || 0,
    hasAutoShop: (user as any).owns?.autoShop || formData.hasAutoShop || false,
    hasBunker: (user as any).owns?.bunker || formData.hasBunker || false,
    bunkerUpgraded: formData.bunkerUpgraded || (user as any).bunkerUpgraded || false,
    claimedFreeCar: formData.claimedFreeCar || false,
  },
});

const applyDynamicPayout = (task: TaskDefinition, gameState: GameState): TaskDefinition => {
  if (!task.dynamicPayout) return task;
  const payout = gameState?.businesses?.nightclub?.accumulatedValue;
  if (!payout) return task;
  return { ...task, basePayout: payout };
};

const buildTaskEntry = (
  task: TaskDefinition,
  userWithFormData: User,
  gameState: GameState,
  weeklyEvents: WeeklyEvents,
  userStats: UserStats
): TaskWithMetrics => {
  try {
    const taskWithDynamicPayout = applyDynamicPayout(task, gameState);
    const efficiency = calculateCompoundEfficiency(taskWithDynamicPayout, userWithFormData, gameState, weeklyEvents);
    const metrics = calculateTaskMetrics(taskWithDynamicPayout, userStats, weeklyEvents, userWithFormData);

    return {
      ...taskWithDynamicPayout,
      ...efficiency,
      metrics,
      category: efficiency.gatekeeperResult?.status === 'LOCKED' ? 'blocked' : task.category,
    };
  } catch (error) {
    console.warn(`Error calculating efficiency for task ${task.id}:`, error);
    return {
      ...task,
      score: 0,
      reasoning: ['Error calculating efficiency'],
      warnings: [],
      metrics: { payoutPerHour: 0, effectiveDuration: 0 },
      category: 'blocked',
    };
  }
};

const isCriticalSkill = (roi: TrainingROI): boolean =>
  (roi.skill === 'flying' && roi.currentBars < 3) || (roi.skill === 'stealth' && roi.currentBars < 3);

const shouldIncludeSkillROI = (roi: TrainingROI): boolean => {
  if (isCriticalSkill(roi)) return true;
  return roi.paybackTime < 4;
};

const formatSkillTrainingName = (skill: string): string => {
  if (skill === 'flying') return 'San Andreas Flight School';
  return `${skill.charAt(0).toUpperCase() + skill.slice(1)} Training`;
};

const buildSkillTrainingRecommendation = (roi: TrainingROI): Recommendation => {
  const critical = isCriticalSkill(roi);
  const weeklyGain = roi.weeklyValueGain > 0
    ? roi.weeklyValueGain
    : roi.skill === 'flying' ? 250000 : 100000;

  const priority: RecommendationPriority = critical
    ? 'critical'
    : roi.recommendation === 'DO IMMEDIATELY' ? 'high' : 'medium';

  const score = critical
    ? 25000
    : roi.recommendation === 'DO IMMEDIATELY' ? 8000 : 4000;

  const reasoning = critical
    ? `[!] LOW ${roi.skill.toUpperCase()} (${roi.currentBars}/5) - Hurting Cayo/heist efficiency. Pays $250k + saves 20+ mins/run`
    : `+$${Math.round(weeklyGain / 1000)}k/week forever (${roi.paybackTime.toFixed(1)} week payback)`;

  return {
    type: 'skill_training',
    priority,
    task: {
      id: `train_${roi.skill}`,
      name: formatSkillTrainingName(roi.skill),
      timeLeft: null,
      duration: roi.trainingTime,
    },
    reasoning,
    effectiveValue: weeklyGain * 4,
    timeInvestment: roi.trainingTime,
    score,
    metrics: {
      payoutPerHour: (weeklyGain * 4) / (roi.trainingTime / 60),
      effectiveDuration: roi.trainingTime,
    },
  };
};

const buildOneTimeBonusRecommendations = (criticalOpportunities: CriticalOpportunity[]): Recommendation[] =>
  criticalOpportunities
    .filter(opp => opp.type === 'one_time_bonus')
    .map(opp => {
      const timeLeft = opp.task.timeLeft;
      const bonusScore = timeLeft && timeLeft < 48
        ? 60000
        : timeLeft && timeLeft < 72
          ? 55000
          : timeLeft && timeLeft < 120
            ? 45000
            : 20000;

      return {
        ...opp,
        effectiveValue: opp.task.reward || 0,
        timeInvestment: opp.task.duration || 20,
        score: bonusScore,
        priority: timeLeft && timeLeft < 120 ? 'critical' : 'high',
      } as Recommendation;
    });

const buildExpiringEventRecommendations = (
  criticalOpportunities: CriticalOpportunity[],
  synergyBoosts: SynergyBoost[]
): Recommendation[] =>
  criticalOpportunities
    .filter(opp => opp.type === 'expiring_event')
    .map(opp => {
      const synergy = synergyBoosts.find(s => s.activity === opp.task.activity);
      const synergyBoost = synergy ? synergy.bonus : 0;

      const eventScore = opp.task.multiplier && opp.task.multiplier >= 4
        ? 12000 + synergyBoost
        : opp.task.multiplier && opp.task.multiplier >= 3
          ? 9000 + synergyBoost
          : 6000;

      return {
        ...opp,
        effectiveValue: (opp.task.multiplier || 1) * 30000 + synergyBoost,
        timeInvestment: opp.task.duration || 15,
        score: eventScore,
        reasoning: synergy ? `${opp.reasoning} + ${synergy.reason}` : opp.reasoning,
      } as Recommendation;
    });

const buildUpgradeRecommendations = (upgradeOpportunities: Array<{
  id: string;
  name: string;
  cost: number;
  hourlyLoss: number;
  roiHours: number;
}>): Recommendation[] =>
  upgradeOpportunities.map(upgrade => {
    const upgradeScore = upgrade.hourlyLoss >= 40000
      ? 15000
      : upgrade.hourlyLoss >= 20000
        ? 10000
        : 5000;

    return {
      type: 'upgrade_needed',
      priority: upgrade.hourlyLoss >= 40000 ? 'high' : 'medium',
      task: {
        id: upgrade.id,
        name: upgrade.name,
        duration: 5,
      },
      reasoning: `⚠️ Losing $${Math.round(upgrade.hourlyLoss / 1000)}k/hour = $${Math.round(upgrade.hourlyLoss * 24 / 1000)}k/day without upgrades. ROI: ${upgrade.roiHours} hours`,
      effectiveValue: upgrade.hourlyLoss * 24,
      timeInvestment: 5,
      score: upgradeScore,
      cost: upgrade.cost,
    };
  });

const buildMoneyGrindRecommendations = (tasks: TaskWithMetrics[]): Recommendation[] =>
  tasks
    .filter(task => task.category !== 'blocked' && task.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(task => {
      const hasEventBoost = !!(task.multiplier && task.multiplier > 1);
      const grindPriority: RecommendationPriority = hasEventBoost
        ? 'high'
        : task.category === 'passive' && task.urgency === 'URGENT'
          ? 'critical'
          : 'medium';

      const reasoningText = Array.isArray(task.reasoning) ? task.reasoning.join('; ') : (task.reasoning || '');
      const formattedReasoning = hasEventBoost ? `${task.multiplier}x Event! ${reasoningText}` : reasoningText;

      return {
        type: 'money_grind',
        priority: grindPriority,
        task: {
          id: task.id,
          name: task.name,
          timeLeft: task.timeRemaining ? task.timeRemaining / (1000 * 60 * 60) : null,
          duration: task.metrics?.effectiveDuration || task.baseDuration || 60,
        },
        reasoning: formattedReasoning,
        effectiveValue: task.score || task.metrics?.adjustedPayout || 0,
        timeInvestment: task.metrics?.effectiveDuration || task.baseDuration || 60,
        score: hasEventBoost ? (task.score || 0) + 5000 : task.score || 0,
        hourlyRate: task.metrics?.payoutPerHour || 0,
        metrics: task.metrics,
        warnings: task.warnings || [],
      };
    });

const buildDiscountRecommendations = (criticalOpportunities: CriticalOpportunity[]): Recommendation[] =>
  criticalOpportunities
    .filter(opp => opp.type === 'limited_discount')
    .map(opp => ({
      ...opp,
      effectiveValue: opp.task.savings || 0,
      timeInvestment: 5,
      score: (opp.task.savings || 0) > 500000 ? 6000 : 3000,
    } as Recommendation));

const deduplicateRecommendations = (recommendations: Recommendation[]): Recommendation[] => {
  const seenIds = new Set<string>();
  const seenActivities = new Set<string>();

  recommendations
    .filter(rec => rec.type === 'one_time_bonus')
    .forEach(rec => {
      const activity = rec.task?.activity || rec.task?.id?.replace(/_first_win.*$/, '') || '';
      if (activity) seenActivities.add(activity);
    });

  return recommendations.filter(rec => {
    const id = rec.task?.id || rec.task?.name || JSON.stringify(rec.task);
    if (seenIds.has(id)) return false;

    if (rec.type === 'money_grind') {
      const taskActivity = rec.task?.id || '';
      if (seenActivities.has(taskActivity)) return false;
    }

    seenIds.add(id);
    return true;
  });
};

const sortRecommendations = (recommendations: Recommendation[]): Recommendation[] => {
  return recommendations.sort((a, b) => {
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;

    if (a.priority === b.priority) {
      if (a.type === 'one_time_bonus' && b.type !== 'one_time_bonus') return -1;
      if (b.type === 'one_time_bonus' && a.type !== 'one_time_bonus') return 1;

      if (a.type === 'one_time_bonus' && b.type === 'one_time_bonus') {
        if (a.task.timeLeft && b.task.timeLeft) return a.task.timeLeft - b.task.timeLeft;
      }

      if (a.type === 'skill_training' && b.type === 'money_grind') return -1;
      if (b.type === 'skill_training' && a.type === 'money_grind') return 1;

      if (a.task?.timeLeft && !b.task?.timeLeft) return -1;
      if (b.task?.timeLeft && !a.task?.timeLeft) return 1;

      if (a.task?.timeLeft && b.task?.timeLeft) return a.task.timeLeft - b.task.timeLeft;
    }

    if (a.priority === 'high' && b.priority !== 'high' && b.priority !== 'critical') return -1;
    if (b.priority === 'high' && a.priority !== 'high' && a.priority !== 'critical') return 1;

    if (a.score && b.score && a.score !== b.score) return b.score - a.score;

    const aValuePerMin = a.effectiveValue && a.timeInvestment ? a.effectiveValue / a.timeInvestment : 0;
    const bValuePerMin = b.effectiveValue && b.timeInvestment ? b.effectiveValue / b.timeInvestment : 0;

    return bValuePerMin - aValuePerMin;
  });
};

// ======================================================================
// Recommendations API
// ======================================================================

export const generateRecommendations = async (
  user: User = {},
  gameState: GameState = {}
): Promise<Recommendation[]> => {
  const weeklyEvents = getWeeklyEvents();
  const userForDetector = buildUserForDetector(user);
  const criticalOpportunities = detectCriticalOpportunities(
    weeklyEvents,
    userForDetector,
    gameState
  ) as CriticalOpportunity[];

  const formData = (user.formData || user) as FormData;
  const stats = ((user as any).stats || formData.stats || {}) as Partial<UserStats>;
  const userStats = buildUserStats(formData, stats);
  const userWithFormData = buildUserWithFormData(user, formData, stats, userStats);

  const allTasks = TASKS_DATABASE.map(task =>
    buildTaskEntry(task, userWithFormData, gameState, weeklyEvents, userStats)
  );

  const allSkillROIs = [
    calculateTrainingROI('flying', userStats.flying, 4, userWithFormData),
    calculateTrainingROI('stealth', userStats.stealth, 4, userWithFormData),
    calculateTrainingROI('strength', userStats.strength, 3, userWithFormData),
    calculateTrainingROI('shooting', userStats.shooting, 3, userWithFormData),
  ].filter((roi): roi is TrainingROI => roi !== null);

  const skillImprovements = allSkillROIs.filter(shouldIncludeSkillROI);
  const upgradeOpportunities = detectMissingUpgrades(userWithFormData, gameState);
  const synergyBoosts = detectAssetSynergies(userWithFormData, weeklyEvents, allTasks);

  const recommendations: Recommendation[] = [
    ...buildOneTimeBonusRecommendations(criticalOpportunities),
    ...skillImprovements.map(buildSkillTrainingRecommendation),
    ...buildExpiringEventRecommendations(criticalOpportunities, synergyBoosts),
    ...buildUpgradeRecommendations(upgradeOpportunities),
    ...buildMoneyGrindRecommendations(allTasks),
    ...buildDiscountRecommendations(criticalOpportunities),
  ];

  const deduplicated = deduplicateRecommendations(recommendations);
  const sorted = sortRecommendations(deduplicated);
  return sorted.slice(0, 5);
};

const formatRecommendation = (rec: Recommendation): Record<string, any> => {
  const base = {
    type: rec.type,
    priority: rec.priority,
    label: rec.task?.name || rec.task?.id || 'Unknown',
    title: rec.task?.name || rec.task?.id || 'Unknown',
    reasoning: rec.reasoning || '',
    urgency: rec.urgency || rec.task?.urgency || '',
  };

  if (rec.type === 'one_time_bonus') {
    return {
      ...base,
      icon: '🎁',
      value: `$${rec.task.reward?.toLocaleString() || 0}`,
      timeLeft: rec.task.timeLeft ? `${Math.round(rec.task.timeLeft)} hours` : null,
      action: 'Claim Bonus',
      description: rec.reasoning,
    };
  }

  if (rec.type === 'expiring_event') {
    return {
      ...base,
      icon: '⚡',
      value: `${rec.task.multiplier}x multiplier`,
      timeLeft: rec.task.timeLeft ? `${Math.round(rec.task.timeLeft)} hours` : null,
      action: 'Grind Now',
      description: rec.reasoning,
    };
  }

  if (rec.type === 'limited_discount') {
    return {
      ...base,
      icon: '💰',
      value: `Save $${Math.round((rec.task.savings || 0) / 1000)}k`,
      timeLeft: rec.task.timeLeft ? `${Math.round(rec.task.timeLeft)} hours` : null,
      action: 'Buy Now',
      description: rec.reasoning,
    };
  }

  if (rec.type === 'gta_plus_free_vehicle') {
    return {
      ...base,
      icon: '🚗',
      value: rec.task.vehicle,
      action: 'Claim Vehicle',
      description: rec.reasoning,
    };
  }

  if (rec.type === 'skill_training') {
    return {
      ...base,
      icon: '📚',
      value: rec.reasoning,
      timeInvestment: `${rec.timeInvestment} minutes`,
      action: 'Start Training',
      description: `Improve ${rec.task.id?.replace('train_', '')} skill`,
    };
  }

  if (rec.type === 'money_grind') {
    return {
      ...base,
      icon: '💵',
      value: rec.metrics?.payoutPerHour
        ? `$${Math.round(rec.metrics.payoutPerHour / 1000)}k/hr`
        : 'Unknown',
      timeInvestment: `${Math.round(rec.timeInvestment || 0)} minutes`,
      action: 'Start Grind',
      description: rec.reasoning,
      warnings: rec.warnings || [],
    };
  }

  if (rec.type === 'upgrade_needed') {
    return {
      ...base,
      icon: '🔧',
      value: `Losing $${Math.round((rec.effectiveValue || 0) / 1000)}k/day`,
      cost: rec.cost ? `Cost: $${(rec.cost / 1000000).toFixed(1)}M` : null,
      action: 'Buy Upgrade',
      description: rec.reasoning,
    };
  }

  return {
    ...base,
    icon: '📋',
    description: rec.reasoning,
  };
};

export const getFormattedRecommendations = async (
  user: User = {},
  gameState: GameState = {}
): Promise<Array<Record<string, any>>> => {
  const recommendations = await generateRecommendations(user, gameState);
  return recommendations.map(formatRecommendation);
};
