// src/utils/streakTracker.js
// Tracks daily assessment completion streaks

const STREAK_STORAGE_KEY = 'gtaAssessmentStreak_v1';
const LAST_ASSESSMENT_KEY = 'gtaAssessmentLastDate_v1';

/**
 * Get today's date as YYYY-MM-DD string
 */
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Check current streak status
 * @returns {Object} { streak: number, lastDate: string, isNewDay: boolean, bonus: number | null }
 */
export const checkStreak = () => {
  try {
    const today = getTodayString();
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    const lastDate = localStorage.getItem(LAST_ASSESSMENT_KEY);

    // First time user
    if (!stored || !lastDate) {
      return {
        streak: 0,
        lastDate: null,
        isNewDay: false,
        bonus: null,
      };
    }

    const streak = parseInt(stored, 10) || 0;
    const isNewDay = lastDate !== today;

    // If it's a new day and they completed an assessment today
    if (isNewDay) {
      // Check if yesterday (consecutive day)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayString) {
        // Consecutive day - increment streak
        const newStreak = streak + 1;
        localStorage.setItem(STREAK_STORAGE_KEY, newStreak.toString());
        localStorage.setItem(LAST_ASSESSMENT_KEY, today);

        // Calculate bonus based on streak milestones
        const bonus = calculateStreakBonus(newStreak);

        return {
          streak: newStreak,
          lastDate: today,
          isNewDay: true,
          bonus,
        };
      } else if (lastDate < yesterdayString) {
        // Streak broken - reset
        localStorage.setItem(STREAK_STORAGE_KEY, '1');
        localStorage.setItem(LAST_ASSESSMENT_KEY, today);

        return {
          streak: 1,
          lastDate: today,
          isNewDay: true,
          bonus: null,
        };
      }
    }

    return {
      streak,
      lastDate,
      isNewDay: false,
      bonus: null,
    };
  } catch (error) {
    console.error('Streak check failed:', error);
    return {
      streak: 0,
      lastDate: null,
      isNewDay: false,
      bonus: null,
    };
  }
};

/**
 * Record that an assessment was completed today
 */
export const recordAssessment = () => {
  try {
    const today = getTodayString();
    const stored = localStorage.getItem(STREAK_STORAGE_KEY);
    const lastDate = localStorage.getItem(LAST_ASSESSMENT_KEY);

    if (!stored || !lastDate) {
      // First assessment
      localStorage.setItem(STREAK_STORAGE_KEY, '1');
      localStorage.setItem(LAST_ASSESSMENT_KEY, today);
      return { streak: 1, isNewStreak: true };
    }

    const currentStreak = Number.parseInt(stored, 10) || 0;

    if (lastDate === today) {
      // Already completed today - no change
      return { streak: currentStreak, isNewStreak: false };
    }

    // Check if consecutive day
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    let newStreak;
    if (lastDate === yesterdayString) {
      // Consecutive - increment
      newStreak = currentStreak + 1;
    } else {
      // Broken streak - reset to 1
      newStreak = 1;
    }

    localStorage.setItem(STREAK_STORAGE_KEY, newStreak.toString());
    localStorage.setItem(LAST_ASSESSMENT_KEY, today);

    return { streak: newStreak, isNewStreak: newStreak > currentStreak };
  } catch (error) {
    console.error('Failed to record assessment:', error);
    return { streak: 0, isNewStreak: false };
  }
};

/**
 * Calculate streak bonus (if any)
 * @param {number} streak - Current streak count
 * @returns {number | null} Bonus amount or null
 */
const calculateStreakBonus = (streak) => {
  // Milestone bonuses (in GTA$ equivalent for display purposes)
  const milestones = {
    7: 50000,   // 7 days
    14: 100000, // 14 days
    30: 250000, // 30 days
    60: 500000, // 60 days
    100: 1000000, // 100 days
  };

  return milestones[streak] || null;
};

/**
 * Get streak milestones for display
 * @param {number} currentStreak - Current streak count
 * @returns {Array} Array of milestone objects
 */
export const getStreakMilestones = (currentStreak = 0) => {
  const milestones = [
    { days: 7, title: 'Week Warrior', reward: '🔥 7 Days', unlocked: currentStreak >= 7 },
    { days: 14, title: 'Fortnight Fighter', reward: '🔥🔥 14 Days', unlocked: currentStreak >= 14 },
    { days: 30, title: 'Monthly Master', reward: '🔥🔥🔥 30 Days', unlocked: currentStreak >= 30 },
    { days: 60, title: 'Dedicated Grinder', reward: '🔥🔥🔥🔥 60 Days', unlocked: currentStreak >= 60 },
    { days: 100, title: 'Century Champion', reward: '🔥🔥🔥🔥🔥 100 Days', unlocked: currentStreak >= 100 },
  ];

  return milestones;
};

/**
 * Reset streak (for testing or user request)
 */
export const resetStreak = () => {
  try {
    localStorage.removeItem(STREAK_STORAGE_KEY);
    localStorage.removeItem(LAST_ASSESSMENT_KEY);
    return true;
  } catch (error) {
    console.error('Failed to reset streak:', error);
    return false;
  }
};
