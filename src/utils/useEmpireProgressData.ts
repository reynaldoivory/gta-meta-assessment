import { useMemo } from 'react';
import { ACHIEVEMENTS } from './achievements';
import { getLevelInfo, getMilestoneLabel, MILESTONE_LEVELS } from './gamificationEngine';

type QuestItem = {
  id?: string;
  title?: string;
  description?: string;
  rewardXp?: number;
  completed?: boolean;
  tag?: string;
};

type Achievement = {
  id: string;
  icon?: string;
  title?: string;
  description?: string;
  tier?: string;
};

type GamificationState = {
  xp?: number;
  unlockedAchievements?: string[];
  quests?: {
    daily?: { items?: QuestItem[] };
    weekly?: { items?: QuestItem[] };
    specialOps?: { items?: QuestItem[] };
  };
  lastAward?: Record<string, unknown>;
};

type QuestKind = 'daily' | 'weekly' | 'specialOps';

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

const findAchievementById = (id: string): Achievement | undefined =>
  (Object.values(ACHIEVEMENTS) as Achievement[]).find((achievement) => achievement.id === id);

const getRecentAchievements = (unlockedAchievements?: string[]): Achievement[] => {
  const unlocked = unlockedAchievements || [];
  return unlocked.slice(-3).map(findAchievementById).filter(isDefined);
};

const getQuestItems = (gamification: GamificationState | undefined, kind: QuestKind): QuestItem[] => {
  const items = gamification?.quests?.[kind]?.items;
  return items || [];
};

export const useEmpireProgressData = (gamification?: GamificationState) => {
  const xp = gamification?.xp || 0;

  const levelInfo = useMemo(() => getLevelInfo(xp), [xp]);
  const milestoneLabel = useMemo(() => getMilestoneLabel(levelInfo.level), [levelInfo.level]);
  const nextMilestone = useMemo(
    () => MILESTONE_LEVELS.find((milestone) => milestone > levelInfo.level) || null,
    [levelInfo.level]
  );
  const recentAchievements = useMemo(
    () => getRecentAchievements(gamification?.unlockedAchievements),
    [gamification?.unlockedAchievements]
  );
  const dailyQuests = getQuestItems(gamification, 'daily');
  const weeklyQuests = getQuestItems(gamification, 'weekly');
  const specialOps = getQuestItems(gamification, 'specialOps');

  return {
    hasGamification: Boolean(gamification),
    levelInfo,
    milestoneLabel,
    nextMilestone,
    recentAchievements,
    dailyQuests,
    weeklyQuests,
    specialOps,
    lastAward: gamification?.lastAward,
  };
};