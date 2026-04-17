// src/utils/progressTracker.js
// Tracks assessment history for progress charts

const PROGRESS_STORAGE_KEY = 'gtaAssessmentProgress_v1';
const MAX_HISTORY_ENTRIES = 50; // Keep last 50 assessments

/**
 * Save a progress snapshot
 * @param {Object} formData - Current form data
 * @param {Object} results - Assessment results
 */
export const saveProgressSnapshot = (formData, results) => {
  try {
    const history = getProgressHistory();
    const snapshot = {
      timestamp: new Date().toISOString(),
      score: results.score,
      tier: results.tier,
      incomePerHour: results.incomePerHour,
      activeIncome: results.activeIncome,
      passiveIncome: results.passiveIncome,
      rank: Number(formData.rank) || 0,
      liquidCash: Number(formData.liquidCash) || 0,
      heistReadyPercent: results.heistReadyPercent,
    };

    // Add to history
    history.push(snapshot);

    // Keep only last N entries
    const trimmedHistory = history.slice(-MAX_HISTORY_ENTRIES);

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(trimmedHistory));
    return true;
  } catch (error) {
    console.error('Failed to save progress snapshot:', import.meta.env.DEV ? error : (error instanceof Error ? error.message : 'unknown error'));
    return false;
  }
};

/**
 * Get progress history
 * @returns {Array} Array of progress snapshots
 */
export const getProgressHistory = () => {
  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    
    // Validate and filter out invalid entries
    return history.filter(entry => 
      entry?.timestamp &&
      typeof entry.score === 'number' &&
      typeof entry.incomePerHour === 'number'
    );
  } catch (error) {
    console.error('Failed to load progress history:', import.meta.env.DEV ? error : (error instanceof Error ? error.message : 'unknown error'));
    return [];
  }
};

/**
 * Get progress over time for charts
 * @returns {Object | null} Chart data or null if insufficient data
 */
export const getProgressOverTime = () => {
  const history = getProgressHistory();
  
  if (history.length < 2) {
    return null;
  }

  // Sort by timestamp
  const sorted = [...history].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  return {
    timestamps: sorted.map(h => h.timestamp),
    scores: sorted.map(h => h.score),
    incomePerHour: sorted.map(h => h.incomePerHour),
    ranks: sorted.map(h => h.rank),
    heistReadyPercent: sorted.map(h => h.heistReadyPercent),
  };
};

/**
 * Clear progress history
 */
export const clearProgressHistory = () => {
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear progress history:', import.meta.env.DEV ? error : (error instanceof Error ? error.message : 'unknown error'));
    return false;
  }
};

/**
 * Get latest assessment snapshot
 * @returns {Object | null} Latest snapshot or null
 */
export const getLatestSnapshot = () => {
  const history = getProgressHistory();
  if (history.length === 0) return null;

  // Sort by timestamp and get most recent
  const sorted = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return sorted[0];
};

/**
 * Compare current results to previous assessment
 * @param {Object} currentResults - Current assessment results
 * @returns {Object | null} Comparison data or null
 */
export const compareToPrevious = (currentResults) => {
  const history = getProgressHistory();
  if (history.length < 2) return null;

  const sorted = [...history].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const previous = sorted[1]; // Second most recent (current is about to be added)

  return {
    scoreDelta: currentResults.score - previous.score,
    incomeDelta: currentResults.incomePerHour - previous.incomePerHour,
    rankDelta: (currentResults.rank || 0) - (previous.rank || 0),
    heistReadyDelta: currentResults.heistReadyPercent - previous.heistReadyPercent,
    previousSnapshot: previous,
  };
};
