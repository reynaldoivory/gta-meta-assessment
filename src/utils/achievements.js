// src/utils/achievements.js
// Achievement/badge system for gamification

/**
 * Achievement definitions
 * Each achievement has:
 * - id: Unique identifier
 * - title: Display name
 * - description: What the user did
 * - icon: Emoji or icon identifier
 * - condition: Function that checks if achievement is unlocked
 * - tier: 'bronze', 'silver', 'gold', 'platinum'
 */
export const ACHIEVEMENTS = {
  FIRST_ASSESSMENT: {
    id: 'first_assessment',
    title: 'First Steps',
    description: 'Completed your first assessment',
    icon: '🎯',
    tier: 'bronze',
    condition: (history) => history.length >= 1,
  },
  WEEK_STREAK: {
    id: 'week_streak',
    title: 'Week Warrior',
    description: '7 day assessment streak',
    icon: '🔥',
    tier: 'silver',
    condition: (streak) => streak >= 7,
  },
  MONTH_STREAK: {
    id: 'month_streak',
    title: 'Monthly Master',
    description: '30 day assessment streak',
    icon: '🔥🔥🔥',
    tier: 'gold',
    condition: (streak) => streak >= 30,
  },
  TIER_S: {
    id: 'tier_s',
    title: 'Elite Grinder',
    description: 'Achieved S-tier (90+ score)',
    icon: '👑',
    tier: 'platinum',
    condition: (results) => results?.score >= 90,
  },
  TIER_A_PLUS: {
    id: 'tier_a_plus',
    title: 'Top Performer',
    description: 'Achieved A+ tier (80+ score)',
    icon: '⭐',
    tier: 'gold',
    condition: (results) => results?.score >= 80,
  },
  MILLION_PER_HOUR: {
    id: 'million_per_hour',
    title: 'Millionaire Maker',
    description: 'Reached $1M+/hr income',
    icon: '💰',
    tier: 'gold',
    condition: (results) => results?.incomePerHour >= 1000000,
  },
  HEIST_READY: {
    id: 'heist_ready',
    title: 'Heist Leader',
    description: '100% heist leadership readiness',
    icon: '🎭',
    tier: 'silver',
    condition: (results) => results?.heistReadyPercent >= 100,
  },
  CAYO_MASTER: {
    id: 'cayo_master',
    title: 'Cayo Perico Master',
    description: 'Completed 50+ Cayo runs',
    icon: '🏝️',
    tier: 'gold',
    condition: (formData) => Number(formData?.cayoCompletions || 0) >= 50,
  },
  PASSIVE_KING: {
    id: 'passive_king',
    title: 'Passive Income King',
    description: '$200k+/hr passive income',
    icon: '💎',
    tier: 'silver',
    condition: (results) => results?.passiveIncome >= 200000,
  },
  RANK_100: {
    id: 'rank_100',
    title: 'Century Club',
    description: 'Reached Rank 100',
    icon: '💯',
    tier: 'bronze',
    condition: (formData) => Number(formData?.rank || 0) >= 100,
  },
  RANK_500: {
    id: 'rank_500',
    title: 'Veteran Player',
    description: 'Reached Rank 500',
    icon: '🏆',
    tier: 'silver',
    condition: (formData) => Number(formData?.rank || 0) >= 500,
  },
  ALL_ASSETS: {
    id: 'all_assets',
    title: 'Asset Collector',
    description: 'Own all major assets',
    icon: '🏢',
    tier: 'gold',
    condition: (formData) => {
      return (
        formData?.hasKosatka &&
        formData?.hasSparrow &&
        formData?.hasAgency &&
        formData?.hasAcidLab &&
        formData?.hasNightclub &&
        formData?.hasBunker
      );
    },
  },
  PERFECT_STATS: {
    id: 'perfect_stats',
    title: 'Stat Master',
    description: 'All stats maxed (5/5 bars)',
    icon: '💪',
    tier: 'silver',
    condition: (formData) => {
      return (
        formData?.strength === 5 &&
        formData?.flying === 5 &&
        formData?.shooting === 5 &&
        formData?.stealth === 5 &&
        formData?.stamina === 5 &&
        formData?.driving === 5
      );
    },
  },
};

/**
 * Get all unlocked achievements
 * @param {Object} state - Current formData and results
 * @param {Array} history - Progress history
 * @param {number} streak - Current streak count
 * @returns {Array} Array of unlocked achievement objects
 */
export const getUnlockedAchievements = (state, history = [], streak = 0) => {
  const { formData, results } = state;
  const unlocked = [];

  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    let isUnlocked = false;

    if (achievement.id === 'first_assessment') {
      isUnlocked = achievement.condition(history);
    } else if (achievement.id === 'week_streak' || achievement.id === 'month_streak') {
      isUnlocked = achievement.condition(streak);
    } else if (achievement.condition.length === 1) {
      // Condition takes formData or results
      if (achievement.id.includes('rank') || achievement.id.includes('cayo') || achievement.id.includes('all_assets') || achievement.id.includes('perfect_stats')) {
        isUnlocked = achievement.condition(formData);
      } else {
        isUnlocked = achievement.condition(results);
      }
    }

    if (isUnlocked) {
      unlocked.push({
        ...achievement,
        unlockedAt: new Date().toISOString(),
      });
    }
  });

  return unlocked;
};

/**
 * Get achievement progress for display
 * @param {Object} state - Current formData and results
 * @param {Array} history - Progress history
 * @param {number} streak - Current streak count
 * @returns {Object} Progress stats
 */
export const getAchievementProgress = (state, history = [], streak = 0) => {
  const total = Object.keys(ACHIEVEMENTS).length;
  const unlocked = getUnlockedAchievements(state, history, streak);
  const unlockedCount = unlocked.length;

  return {
    total,
    unlocked: unlockedCount,
    progress: total > 0 ? (unlockedCount / total) * 100 : 0,
    byTier: {
      bronze: unlocked.filter(a => a.tier === 'bronze').length,
      silver: unlocked.filter(a => a.tier === 'silver').length,
      gold: unlocked.filter(a => a.tier === 'gold').length,
      platinum: unlocked.filter(a => a.tier === 'platinum').length,
    },
  };
};

/**
 * Check if a specific achievement is unlocked
 * @param {string} achievementId - Achievement ID
 * @param {Object} state - Current formData and results
 * @param {Array} history - Progress history
 * @param {number} streak - Current streak count
 * @returns {boolean}
 */
export const isAchievementUnlocked = (achievementId, state, history = [], streak = 0) => {
  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return false;

  const unlocked = getUnlockedAchievements(state, history, streak);
  return unlocked.some(a => a.id === achievementId);
};
