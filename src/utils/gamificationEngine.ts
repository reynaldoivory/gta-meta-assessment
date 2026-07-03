// src/utils/gamificationEngine.ts
// Centralized gamification engine: XP, levels, quests, achievements, and special ops

import { getUnlockedAchievements } from './achievements.js';
import { WEEKLY_EVENTS, isEventActive } from '../config/weeklyEvents.js';
import type { AssessmentFormData, AssessmentResult } from '../types/domain.types';

// ── Type Definitions ──────────────────────────────────────────────────────────

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface QuestContext {
  formData: AssessmentFormData;
  results: AssessmentResult;
  history?: HistoryEntry[];
  streak?: number;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  tag?: string;
  condition: (ctx: QuestContext) => boolean;
}

export interface QuestState {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  tag?: string;
  completed: boolean;
  completedAt: string | null;
}

export interface DailyBucket {
  date: string;
  items: QuestState[];
}

export interface WeeklyBucket {
  weekKey: string;
  items: QuestState[];
}

export interface SpecialOpsBucket {
  weekKey: string;
  items: QuestState[];
}

export interface QuestBuckets {
  daily: DailyBucket;
  weekly: WeeklyBucket;
  specialOps: SpecialOpsBucket;
}

export interface XpBreakdown {
  baseXp: number;
  scoreXp: number;
  incomeXp: number;
  readinessXp: number;
  diversificationXp: number;
}

export interface LastAward {
  xpGained: number;
  breakdown: XpBreakdown;
  streakMultiplier: number;
  newAchievements: string[];
  completedQuests: string[];
  levelBefore: number;
  levelAfter: number;
}

export interface GamificationState {
  xp: number;
  unlockedAchievements: string[];
  lastAssessmentAt: string | null;
  quests: QuestBuckets;
  lastAward: LastAward | null;
}

export interface LevelInfo {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
  totalForLevel: number;
}

export interface XpResult {
  rawXp: number;
  multiplier: number;
  totalXp: number;
  breakdown: XpBreakdown;
}

export interface QuestCompletionResult {
  updated: QuestState[];
  xpAwarded: number;
  completed: string[];
}

export interface HistoryEntry {
  timestamp: string;
  score: number;
  incomePerHour: number;
}

export interface UnlockedAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: AchievementTier;
  unlockedAt: string;
}

export interface ApplyAssessmentParams {
  formData: AssessmentFormData;
  results: AssessmentResult;
  history?: HistoryEntry[];
  streak?: number;
}

export interface GamificationResult {
  state: GamificationState;
  summary: LastAward;
}

// ── Milestone label map type ──────────────────────────────────────────────────

type MilestoneLabelMap = Record<number, string>;

// ── Weekly event bonus shape (from the untyped WEEKLY_EVENTS config) ──────────

interface WeeklyBonus {
  isActive?: boolean;
  soloFriendly?: boolean;
  estimatedHourlyRate?: number;
  label?: string;
  multiplier?: number;
  category?: string;
  highValue?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const GAMIFICATION_STORAGE_KEY = 'gtaAssessmentGamification_v1';
export const SOUND_PREF_KEY = 'gtaSoundEnabled';

// ── Sound preference helpers ──────────────────────────────────────────────────
export const isSoundEnabled = (): boolean => {
  try {
    const val = localStorage.getItem(SOUND_PREF_KEY);
    return val === null ? true : val === 'true';
  } catch { return true; }
};

export const setSoundEnabled = (enabled: boolean): void => {
  try { localStorage.setItem(SOUND_PREF_KEY, String(enabled)); } catch { /* noop */ }
};

// ── Milestone definitions (fire extra celebrations at these levels) ───────────
export const MILESTONE_LEVELS = [5, 10, 15, 25, 50, 75, 100] as const;

export const getMilestoneLabel = (level: number): string | null => {
  const labels: MilestoneLabelMap = {
    5: 'Street Hustler',
    10: 'Block Captain',
    15: 'Made Man',
    25: 'Shot Caller',
    50: 'Kingpin',
    75: 'Cartel Boss',
    100: 'Legend',
  };
  return labels[level] || null;
};

const ACHIEVEMENT_XP = {
  bronze: 50,
  silver: 100,
  gold: 200,
  platinum: 400,
} as const satisfies Record<AchievementTier, number>;

// ── Core Daily Quests ─────────────────────────────────────────────────────────
const DAILY_QUESTS: readonly QuestDefinition[] = [
  {
    id: 'daily_check_in',
    title: 'Daily Check-in',
    description: 'Complete today\'s assessment.',
    rewardXp: 50,
    condition: ({ results }: QuestContext): boolean => Boolean(results),
  },
  {
    id: 'daily_income_push',
    title: '$500k/hr Sprint',
    description: 'Hit $500k/hr income.',
    rewardXp: 75,
    condition: ({ results }: QuestContext): boolean => (results?.incomePerHour || 0) >= 500000,
  },
  {
    id: 'daily_ready_room',
    title: 'Ready Room',
    description: 'Reach 70% heist readiness.',
    rewardXp: 80,
    condition: ({ results }: QuestContext): boolean => (results?.heistReadyPercent || 0) >= 70,
  },
  {
    id: 'daily_five_assets',
    title: 'Asset Hauler',
    description: 'Own at least 5 major assets.',
    rewardXp: 60,
    condition: ({ formData }: QuestContext): boolean => {
      const keys: ReadonlyArray<keyof AssessmentFormData> = ['hasKosatka', 'hasSparrow', 'hasAgency', 'hasAcidLab', 'hasNightclub', 'hasBunker', 'hasAutoShop', 'hasSalvageYard', 'hasCarWash'];
      return keys.filter((k) => formData?.[k]).length >= 5;
    },
  },
  {
    id: 'daily_bronze_tier',
    title: 'Bronze Baseline',
    description: 'Reach at least Bronze diversified income.',
    rewardXp: 40,
    condition: ({ results }: QuestContext): boolean => {
      const tier = results?.heistReady?.diversifiedIncomeTier;
      return tier !== undefined && tier !== null && tier !== 'Paper';
    },
  },
];

// ── Core Weekly Quests ────────────────────────────────────────────────────────
const WEEKLY_QUESTS: readonly QuestDefinition[] = [
  {
    id: 'weekly_million_loop',
    title: 'Millionaire Loop',
    description: 'Hit $1M/hr income in any assessment.',
    rewardXp: 200,
    condition: ({ results }: QuestContext): boolean => (results?.incomePerHour || 0) >= 1000000,
  },
  {
    id: 'weekly_a_tier',
    title: 'A-Tier Climb',
    description: 'Score 80+ in an assessment.',
    rewardXp: 200,
    condition: ({ results }: QuestContext): boolean => (results?.score || 0) >= 80,
  },
  {
    id: 'weekly_gold_portfolio',
    title: 'Gold Portfolio',
    description: 'Reach Gold or Platinum diversified income tier.',
    rewardXp: 250,
    condition: ({ results }: QuestContext): boolean => {
      const tier = results?.heistReady?.diversifiedIncomeTier;
      return tier === 'Gold' || tier === 'Platinum';
    },
  },
  {
    id: 'weekly_streak_warrior',
    title: 'Streak Warrior',
    description: 'Maintain a 7-day assessment streak.',
    rewardXp: 180,
    condition: ({ streak }: QuestContext): boolean => (streak || 0) >= 7,
  },
  {
    id: 'weekly_passive_hustle',
    title: 'Passive Hustle',
    description: 'Earn $150k+ passive income/hr.',
    rewardXp: 160,
    condition: ({ results }: QuestContext): boolean => (results?.passiveIncome || 0) >= 150000,
  },
];

// ── Special Ops (rotate based on live weekly events) ──────────────────────────
const buildSpecialOps = (): QuestDefinition[] => {
  if (!isEventActive()) return [];

  const ops: QuestDefinition[] = [];
  const bonuses = ((WEEKLY_EVENTS as Record<string, unknown>).bonuses || {}) as Record<string, WeeklyBonus>;

  // Generate ops from active high-value bonuses
  Object.entries(bonuses).forEach(([key, bonus]: [string, WeeklyBonus]) => {
    if (!bonus.isActive) return;

    if (bonus.soloFriendly && bonus.estimatedHourlyRate && bonus.estimatedHourlyRate >= 500000) {
      ops.push({
        id: `special_${key}`,
        title: `${bonus.label} Op`,
        description: `Leverage the ${bonus.label} event — earn big this week.`,
        rewardXp: 150 + (bonus.multiplier || 1) * 30,
        tag: 'special_op',
        // Special ops always complete if you just run an assessment while the event is active
        condition: ({ results }: QuestContext): boolean => Boolean(results),
      });
    }

    if (bonus.category === 'heist' && bonus.highValue) {
      ops.push({
        id: `special_heist_${key}`,
        title: 'Heist Season',
        description: `Take advantage of ${bonus.label} while it lasts.`,
        rewardXp: 200,
        tag: 'special_op',
        condition: ({ formData }: QuestContext): boolean => Boolean(formData?.hasKosatka),
      });
    }
  });

  // Cap at 2 special ops per rotation
  return ops.slice(0, 2);
};

export { buildSpecialOps };

const getTodayKey = (): string => new Date().toISOString().slice(0, 10);

const getWeekKey = (): string => {
  const date = new Date();
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // Monday as week start
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
};

const QUEST_DEFINITIONS: Record<string, QuestDefinition> = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...buildSpecialOps()].reduce<Record<string, QuestDefinition>>((map, quest) => {
  map[quest.id] = quest;
  return map;
}, {});

const buildQuestState = (quest: QuestDefinition): QuestState => {
  const { condition: _condition, ...rest } = quest;
  return {
    ...rest,
    completed: false,
    completedAt: null,
  };
};

const buildDailyQuests = (): QuestState[] => DAILY_QUESTS.map(buildQuestState);

const buildWeeklyQuests = (): QuestState[] => WEEKLY_QUESTS.map(buildQuestState);

const buildSpecialOpsState = (): QuestState[] => buildSpecialOps().map(buildQuestState);

const getDefaultGamificationState = (): GamificationState => ({
  xp: 0,
  unlockedAchievements: [],
  lastAssessmentAt: null,
  quests: {
    daily: {
      date: getTodayKey(),
      items: buildDailyQuests(),
    },
    weekly: {
      weekKey: getWeekKey(),
      items: buildWeeklyQuests(),
    },
    specialOps: {
      weekKey: getWeekKey(),
      items: buildSpecialOpsState(),
    },
  },
  lastAward: null,
});

const isGamificationState = (value: unknown): value is Partial<GamificationState> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const loadGamificationState = (): GamificationState => {
  try {
    const stored = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (!stored) return getDefaultGamificationState();
    const parsed: unknown = JSON.parse(stored);
    if (!isGamificationState(parsed)) return getDefaultGamificationState();
    return {
      ...getDefaultGamificationState(),
      ...parsed,
    };
  } catch (error: unknown) {
    console.error('Failed to load gamification state:', error);
    return getDefaultGamificationState();
  }
};

const saveGamificationState = (state: GamificationState): void => {
  try {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
  } catch (error: unknown) {
    console.error('Failed to save gamification state:', error);
  }
};

const getStreakMultiplier = (streak = 0): number => {
  if (streak >= 60) return 1.25;
  if (streak >= 30) return 1.2;
  if (streak >= 14) return 1.15;
  if (streak >= 7) return 1.1;
  if (streak >= 3) return 1.05;
  return 1;
};

export const getLevelInfo = (xp = 0): LevelInfo => {
  let level = 1;
  let totalForLevel = 0;
  let nextLevelCost = 0;

  while (true) {
    nextLevelCost = Math.floor(200 * Math.pow(level, 1.35));
    if (xp < totalForLevel + nextLevelCost) {
      break;
    }
    totalForLevel += nextLevelCost;
    level += 1;
  }

  const currentLevelXp = xp - totalForLevel;
  const progress = nextLevelCost > 0 ? (currentLevelXp / nextLevelCost) * 100 : 0;

  return {
    level,
    currentLevelXp,
    nextLevelXp: nextLevelCost,
    progress,
    totalForLevel,
  };
};

const calculateXpFromAssessment = ({ results, streak }: { results: AssessmentResult; streak?: number }): XpResult => {
  const baseXp = 100;
  const scoreXp = Math.round((results?.score || 0) * 2);
  const incomeXp = Math.min(220, Math.round((results?.incomePerHour || 0) / 5000));
  const readinessXp = Math.round((results?.heistReadyPercent || 0));
  const diversificationXp = Math.round(results?.heistReady?.diversifiedIncomeScore || 0);
  const rawXp = baseXp + scoreXp + incomeXp + readinessXp + diversificationXp;
  const multiplier = getStreakMultiplier(streak);

  return {
    rawXp,
    multiplier,
    totalXp: Math.round(rawXp * multiplier),
    breakdown: {
      baseXp,
      scoreXp,
      incomeXp,
      readinessXp,
      diversificationXp,
    },
  };
};

const refreshQuestBuckets = (state: GamificationState): GamificationState => {
  const today = getTodayKey();
  const weekKey = getWeekKey();
  const nextState = { ...state };

  if (nextState.quests?.daily?.date !== today) {
    nextState.quests = {
      ...nextState.quests,
      daily: { date: today, items: buildDailyQuests() },
    };
  }

  if (nextState.quests?.weekly?.weekKey !== weekKey) {
    nextState.quests = {
      ...nextState.quests,
      weekly: { weekKey, items: buildWeeklyQuests() },
    };
  }

  // Refresh special ops each week (or if they don't exist yet)
  if (nextState.quests?.specialOps?.weekKey !== weekKey) {
    nextState.quests = {
      ...nextState.quests,
      specialOps: { weekKey, items: buildSpecialOpsState() },
    };
  }

  return nextState;
};

const completeQuests = (quests: QuestState[], context: QuestContext): QuestCompletionResult => {
  let xpAwarded = 0;
  const completed: string[] = [];

  const updated = quests.map((quest) => {
    if (quest.completed) return quest;

    const definition = QUEST_DEFINITIONS[quest.id];
    if (definition?.condition?.(context)) {
      xpAwarded += quest.rewardXp;
      completed.push(quest.id);
      return { ...quest, completed: true, completedAt: new Date().toISOString() };
    }

    return quest;
  });

  return { updated, xpAwarded, completed };
};

export const applyAssessmentGamification = ({ formData, results, history, streak }: ApplyAssessmentParams): GamificationResult => {
  // Re-index quest definitions (special ops may change weekly)
  const allQuests: QuestDefinition[] = [...DAILY_QUESTS, ...WEEKLY_QUESTS, ...buildSpecialOps()];
  allQuests.forEach((q) => { QUEST_DEFINITIONS[q.id] = q; });

  const baseState = refreshQuestBuckets(loadGamificationState());
  const xpResult = calculateXpFromAssessment({ results, streak });

  const context: QuestContext = { formData, results, history, streak };
  const dailyResult = completeQuests(baseState.quests.daily.items, context);
  const weeklyResult = completeQuests(baseState.quests.weekly.items, context);
  const specialOpsResult = completeQuests(
    (baseState.quests.specialOps?.items || []),
    context
  );

  const historyWithCurrent: HistoryEntry[] = [
    ...(history || []),
    {
      timestamp: new Date().toISOString(),
      score: results?.score || 0,
      incomePerHour: results?.incomePerHour || 0,
    },
  ];

  const unlockedAchievements: UnlockedAchievement[] = getUnlockedAchievements(
    { formData, results },
    historyWithCurrent,
    streak
  );

  const existingAchievements = new Set(baseState.unlockedAchievements || []);
  const newlyUnlocked = unlockedAchievements.filter((a: UnlockedAchievement) => !existingAchievements.has(a.id));
  const achievementXp = newlyUnlocked.reduce((total: number, achievement: UnlockedAchievement) => {
    const reward = ACHIEVEMENT_XP[achievement.tier] || 0;
    return total + reward;
  }, 0);

  const totalXpGain = xpResult.totalXp + dailyResult.xpAwarded + weeklyResult.xpAwarded + specialOpsResult.xpAwarded + achievementXp;
  const xpBefore = baseState.xp || 0;
  const xpAfter = xpBefore + totalXpGain;
  const levelBefore = getLevelInfo(xpBefore).level;
  const levelAfter = getLevelInfo(xpAfter).level;

  const lastAward: LastAward = {
    xpGained: totalXpGain,
    breakdown: xpResult.breakdown,
    streakMultiplier: xpResult.multiplier,
    newAchievements: newlyUnlocked.map((achievement: UnlockedAchievement) => achievement.id),
    completedQuests: [...dailyResult.completed, ...weeklyResult.completed, ...specialOpsResult.completed],
    levelBefore,
    levelAfter,
  };

  const nextState: GamificationState = {
    ...baseState,
    xp: xpAfter,
    unlockedAchievements: Array.from(
      new Set([
        ...existingAchievements,
        ...newlyUnlocked.map((achievement: UnlockedAchievement) => achievement.id),
      ])
    ),
    lastAssessmentAt: new Date().toISOString(),
    quests: {
      daily: { ...baseState.quests.daily, items: dailyResult.updated },
      weekly: { ...baseState.quests.weekly, items: weeklyResult.updated },
      specialOps: { ...baseState.quests.specialOps, items: specialOpsResult.updated },
    },
    lastAward,
  };

  saveGamificationState(nextState);

  return {
    state: nextState,
    summary: lastAward,
  };
};
