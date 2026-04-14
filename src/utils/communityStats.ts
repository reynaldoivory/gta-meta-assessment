// src/utils/communityStats.js
import type { AssessmentFormData, AssessmentResult } from '../types/domain.types';

const COMMUNITY_STATS_KEY = 'gta_community_stats_pool';
const TRAP_STATS_KEY = 'gta_community_trap_stats';
const STATS_VERSION = 'v1';

// Anonymize and aggregate data
export const submitAnonymousStats = (formData: AssessmentFormData, assessmentResults: AssessmentResult) => {
  // Get existing pool
  let pool: any[];
  try {
    pool = JSON.parse(localStorage.getItem(COMMUNITY_STATS_KEY) || '[]');
  } catch {
    pool = [];
  }

  // Create anonymized snapshot
  const anonymousData = {
    version: STATS_VERSION,
    timestamp: Date.now(),
    // Only track aggregatable metrics
    rank: Number(formData.rank) || 0,
    timePlayed: Number(formData.timePlayed) || 0,
    score: assessmentResults.score,
    tier: assessmentResults.tier,
    incomePerHour: assessmentResults.incomePerHour,
    hasGTAPlus: !!formData.hasGTAPlus,
    
    // Asset ownership (boolean flags)
    assets: {
      kosatka: !!formData.hasKosatka,
      sparrow: !!formData.hasSparrow,
      agency: !!formData.hasAgency,
      acidLab: !!formData.hasAcidLab,
      nightclub: !!formData.hasNightclub,
      bunker: !!formData.hasBunker,
      autoShop: !!formData.hasAutoShop,
    },
    
    // Stat averages
    avgStat: (
      (formData.strength +
        formData.flying +
        formData.shooting +
        formData.stealth +
        formData.stamina +
        formData.driving +
        (formData.lungCapacity || 0)) /
      7
    ).toFixed(1),
    
    cayoCompletions: Number(formData.cayoCompletions) || 0,
    heistReadyPercent: assessmentResults.heistReadyPercent,
  };

  // Add to pool
  pool.push(anonymousData);

  // Keep last 1000 entries (community cap)
  if (pool.length > 1000) {
    pool.shift();
  }

  localStorage.setItem(COMMUNITY_STATS_KEY, JSON.stringify(pool));
  return anonymousData;
};

// Calculate community averages
export const getCommunityAverages = () => {
  let pool: any[];
  try {
    pool = JSON.parse(localStorage.getItem(COMMUNITY_STATS_KEY) || '[]');
  } catch {
    return null;
  }

  if (pool.length === 0) {
    return null;
  }

  // Filter last 30 days only
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = pool.filter(entry => entry.timestamp > thirtyDaysAgo);

  if (recent.length === 0) {
    return null;
  }

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr) => arr.length ? sum(arr) / arr.length : 0;

  return {
    sampleSize: recent.length,
    averageRank: avg(recent.map(e => e.rank)).toFixed(0),
    averageScore: avg(recent.map(e => e.score)).toFixed(1),
    averageIncome: avg(recent.map(e => e.incomePerHour)).toFixed(0),
    averageTimePlayed: avg(recent.map(e => e.timePlayed)).toFixed(0),
    averageHeistReady: avg(recent.map(e => e.heistReadyPercent)).toFixed(1),
    
    // Asset ownership percentages
    assetOwnership: {
      kosatka: (sum(recent.map(e => e.assets?.kosatka ? 1 : 0)) / recent.length * 100).toFixed(0),
      sparrow: (sum(recent.map(e => e.assets?.sparrow ? 1 : 0)) / recent.length * 100).toFixed(0),
      agency: (sum(recent.map(e => e.assets?.agency ? 1 : 0)) / recent.length * 100).toFixed(0),
      acidLab: (sum(recent.map(e => e.assets?.acidLab ? 1 : 0)) / recent.length * 100).toFixed(0),
      nightclub: (sum(recent.map(e => e.assets?.nightclub ? 1 : 0)) / recent.length * 100).toFixed(0),
    },
    
    // GTA+ adoption rate
    gtaPlusRate: (sum(recent.map(e => e.hasGTAPlus ? 1 : 0)) / recent.length * 100).toFixed(0),
    
    // Tier distribution
    tierDistribution: {
      S: (recent.filter(e => e.tier === 'S').length / recent.length * 100).toFixed(0),
      'A+': (recent.filter(e => e.tier === 'A+').length / recent.length * 100).toFixed(0),
      A: (recent.filter(e => e.tier === 'A').length / recent.length * 100).toFixed(0),
      B: (recent.filter(e => e.tier === 'B').length / recent.length * 100).toFixed(0),
      C: (recent.filter(e => e.tier === 'C').length / recent.length * 100).toFixed(0),
      D: (recent.filter(e => e.tier === 'D').length / recent.length * 100).toFixed(0),
    },
  };
};

// Compare individual player to community
export const compareToCommunity = (formData: AssessmentFormData, assessmentResults: AssessmentResult) => {
  const communityAvg = getCommunityAverages();
  
  if (!communityAvg) {
    return null;
  }

  return {
    rankDelta: Number(formData.rank) - Number(communityAvg.averageRank),
    scoreDelta: assessmentResults.score - Number(communityAvg.averageScore),
    incomeDelta: assessmentResults.incomePerHour - Number(communityAvg.averageIncome),
    heistReadyDelta: assessmentResults.heistReadyPercent - Number(communityAvg.averageHeistReady),
    
    percentile: calculatePercentile(assessmentResults.score, communityAvg),
  };
};

const calculatePercentile = (score, _communityAvg) => {
  let pool: any[];
  try {
    pool = JSON.parse(localStorage.getItem(COMMUNITY_STATS_KEY) || '[]');
  } catch {
    return 50;
  }
  const recent = pool.filter(e => e.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  if (recent.length === 0) return 50;
  
  const lowerCount = recent.filter(e => e.score < score).length;
  return ((lowerCount / recent.length) * 100).toFixed(0);
};

// Export community stats as CSV
export const exportCommunityStatsCSV = () => {
  let pool: any[];
  try {
    pool = JSON.parse(localStorage.getItem(COMMUNITY_STATS_KEY) || '[]');
  } catch {
    return null;
  }
  
  if (pool.length === 0) {
    return null;
  }

  // CSV headers
  const headers = [
    'Timestamp',
    'Date',
    'Rank',
    'Time Played (hours)',
    'Score',
    'Tier',
    'Income Per Hour',
    'GTA+',
    'Kosatka',
    'Sparrow',
    'Agency',
    'Acid Lab',
    'Nightclub',
    'Bunker',
    'Auto Shop',
    'Avg Stat',
    'Cayo Completions',
    'Heist Ready %',
  ];

  // Convert data to CSV rows
  const rows = pool.map(entry => {
    const date = new Date(entry.timestamp).toISOString();
    return [
      entry.timestamp,
      date,
      entry.rank,
      entry.timePlayed,
      entry.score,
      entry.tier,
      entry.incomePerHour,
      entry.hasGTAPlus ? 'Yes' : 'No',
      entry.assets?.kosatka ? 'Yes' : 'No',
      entry.assets?.sparrow ? 'Yes' : 'No',
      entry.assets?.agency ? 'Yes' : 'No',
      entry.assets?.acidLab ? 'Yes' : 'No',
      entry.assets?.nightclub ? 'Yes' : 'No',
      entry.assets?.bunker ? 'Yes' : 'No',
      entry.assets?.autoShop ? 'Yes' : 'No',
      entry.avgStat,
      entry.cayoCompletions,
      entry.heistReadyPercent,
    ];
  });

  // Escape CSV cells to prevent formula injection in spreadsheet apps
  const escapeCsvCell = (val: unknown): string => {
    const s = String(val ?? '');
    const sanitized = /^[=+\-@]/.test(s) ? `'${s}` : s;
    return `"${sanitized.replace(/"/g, '""')}"`;
  };

  // Combine headers and rows
  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(',')),
  ].join('\n');

  return csvContent;
};

// Get progress over time data for charts
export const getProgressOverTime = () => {
  let pool: any[];
  try {
    pool = JSON.parse(localStorage.getItem(COMMUNITY_STATS_KEY) || '[]');
  } catch {
    return null;
  }
  
  if (pool.length === 0) {
    return null;
  }

  // Sort by timestamp
  const sorted = [...pool].sort((a, b) => a.timestamp - b.timestamp);

  return {
    timestamps: sorted.map(e => e.timestamp),
    dates: sorted.map(e => new Date(e.timestamp).toLocaleDateString()),
    scores: sorted.map(e => e.score),
    incomePerHour: sorted.map(e => e.incomePerHour),
    rank: sorted.map(e => e.rank),
    heistReadyPercent: sorted.map(e => e.heistReadyPercent),
  };
};

// ============================================
// TRAP STATISTICS - Community Trap Tracking
// ============================================

/**
 * Submit trap statistics to community pool
 * @param {Object} trapSummary - Summary from getTrapSummary()
 * @param {Object} formData - Player form data
 */
export const submitTrapStats = (trapSummary: any, formData: AssessmentFormData) => {
  if (!trapSummary || trapSummary.count === 0) return;
  
  try {
    const _rawTrap = JSON.parse(localStorage.getItem(TRAP_STATS_KEY) || '[]');
    const trapPool: any[] = Array.isArray(_rawTrap) ? _rawTrap : [];

    const trapSnapshot = {
      version: STATS_VERSION,
      timestamp: Date.now(),
      rank: Number(formData.rank) || 0,
      totalTraps: trapSummary.count,
      criticalCount: trapSummary.criticalCount,
      highCount: trapSummary.highCount,
      mediumCount: trapSummary.mediumCount,
      lowCount: trapSummary.lowCount,
      totalLostPerHour: trapSummary.totalLostPerHour || 0,
      // Track which assets the player has for occurrence rate calculation
      assets: {
        nightclub: !!formData.hasNightclub,
        bunker: !!formData.hasBunker,
        kosatka: !!formData.hasKosatka,
        acidLab: !!formData.hasAcidLab,
        agency: !!formData.hasAgency,
      },
    };
    
    trapPool.push(trapSnapshot);
    
    // Keep last 1000 trap reports
    if (trapPool.length > 1000) {
      trapPool.shift();
    }
    
    localStorage.setItem(TRAP_STATS_KEY, JSON.stringify(trapPool));
  } catch (e) {
    console.error('Failed to submit trap stats:', e);
  }
};

/**
 * Calculate trap occurrence rates across community
 * Returns percentage of players who fell for each trap type
 * @returns {Object|null} Trap occurrence statistics
 */
export const getTrapOccurrenceRates = () => {
  try {
    const _rawTrapOcc = JSON.parse(localStorage.getItem(TRAP_STATS_KEY) || '[]');
    const _rawCommunityOcc = JSON.parse(localStorage.getItem(COMMUNITY_STATS_KEY) || '[]');
    const trapPool: any[] = Array.isArray(_rawTrapOcc) ? _rawTrapOcc : [];
    const communityPool: any[] = Array.isArray(_rawCommunityOcc) ? _rawCommunityOcc : [];
    
    if (trapPool.length === 0 || communityPool.length === 0) {
      // Return default rates based on known GTA Online player behavior
      return {
        sampleSize: 0,
        nightclubTrap: '67', // Known high trap rate
        cascadeTrap: '23',   // Subset of nightclub trap
        unupgradedBunker: '45',
        unusedKosatka: '15',
        unupgradedAcidLab: '38',
        cayoBurnout: '52',
        averageTrapsPerPlayer: '1.8',
        averageLostIncome: '35000',
        isEstimated: true, // Flag that these are estimated values
      };
    }
    
    // Filter last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentTraps = trapPool.filter(entry => entry.timestamp > thirtyDaysAgo);
    const recentPlayers = communityPool.filter(entry => entry.timestamp > thirtyDaysAgo);
    
    if (recentTraps.length === 0) {
      return null;
    }
    
    // Count players who own each asset type
    const nightclubOwners = recentPlayers.filter(p => p.assets?.nightclub).length;
    const bunkerOwners = recentPlayers.filter(p => p.assets?.bunker).length;
    const kosatkaOwners = recentPlayers.filter(p => p.assets?.kosatka).length;
    const acidLabOwners = recentPlayers.filter(p => p.assets?.acidLab).length;
    
    // Count trap occurrences (critical/high only for significance)
    const nightclubTraps = recentTraps.filter(t => t.criticalCount > 0 && t.assets?.nightclub).length;
    const bunkerTraps = recentTraps.filter(t => t.highCount > 0 && t.assets?.bunker).length;
    const kosatkaTraps = recentTraps.filter(t => t.assets?.kosatka && t.totalTraps > 0).length;
    const acidLabTraps = recentTraps.filter(t => t.assets?.acidLab && t.mediumCount > 0).length;
    
    return {
      sampleSize: recentTraps.length,
      nightclubTrap: nightclubOwners > 0 
        ? (nightclubTraps / nightclubOwners * 100).toFixed(0)
        : '67', // Default estimate
      unupgradedBunker: bunkerOwners > 0
        ? (bunkerTraps / bunkerOwners * 100).toFixed(0)
        : '45',
      unusedKosatka: kosatkaOwners > 0
        ? ((kosatkaTraps * 0.3) / kosatkaOwners * 100).toFixed(0) // 30% of kosatka trap rate
        : '15',
      unupgradedAcidLab: acidLabOwners > 0
        ? (acidLabTraps / acidLabOwners * 100).toFixed(0)
        : '38',
      cayoBurnout: kosatkaOwners > 0
        ? ((recentTraps.filter(t => t.lowCount > 0).length / kosatkaOwners) * 100).toFixed(0)
        : '52',
      averageTrapsPerPlayer: (recentTraps.reduce((sum, t) => sum + t.totalTraps, 0) / recentTraps.length).toFixed(1),
      averageLostIncome: (recentTraps.reduce((sum, t) => sum + (t.totalLostPerHour || 0), 0) / recentTraps.length).toFixed(0),
      isEstimated: false,
    };
  } catch (e) {
    console.error('Failed to get trap occurrence rates:', e);
    return null;
  }
};

/**
 * Get trap avoidance comparison for individual player
 * Shows which common traps they avoided vs fell for
 * @param {Object} formData - Player form data
 * @param {Array} currentTraps - Currently detected traps
 * @returns {Object|null} Trap avoidance statistics
 */
export const getTrapAvoidanceStats = (formData: AssessmentFormData, currentTraps: any) => {
  const occurrenceRates = getTrapOccurrenceRates();
  
  if (!occurrenceRates) {
    return null;
  }
  
  const avoided = [];
  const fellFor = [];
  
  // Check which common traps player AVOIDED
  // Calculate feeders from nightclubSources (new format) or use legacy number
  const nightclubFeeders = formData.nightclubSources 
    ? Object.values(formData.nightclubSources).filter(Boolean).length 
    : Number(formData.nightclubFeeders) || 0;
  if (formData.hasNightclub && nightclubFeeders >= 3) {
    avoided.push({
      trap: 'Nightclub Trap',
      communityRate: occurrenceRates.nightclubTrap,
      potentialLoss: 50000, // Hourly loss they avoided
    });
  }
  
  if (formData.hasBunker && formData.bunkerUpgraded) {
    avoided.push({
      trap: 'Unupgraded Bunker',
      communityRate: occurrenceRates.unupgradedBunker,
      potentialLoss: 48000,
    });
  }
  
  if (formData.hasKosatka && Number(formData.cayoCompletions) > 0) {
    avoided.push({
      trap: 'Unused Kosatka',
      communityRate: occurrenceRates.unusedKosatka,
      potentialLoss: 700000, // Lost opportunity per run
    });
  }
  
  if (formData.hasAcidLab && formData.acidLabUpgraded) {
    avoided.push({
      trap: 'Unupgraded Acid Lab',
      communityRate: occurrenceRates.unupgradedAcidLab,
      potentialLoss: 30000,
    });
  }
  
  // Check which traps they FELL FOR
  currentTraps.forEach(trap => {
    if (trap.severity === 'CRITICAL' || trap.severity === 'critical') {
      fellFor.push({
        trapId: trap.id,
        trap: trap.title,
        lostPerHour: trap.lostPerHour || 0,
        severity: 'CRITICAL',
      });
    } else if (trap.severity === 'HIGH' || trap.severity === 'high') {
      fellFor.push({
        trapId: trap.id,
        trap: trap.title,
        lostPerHour: trap.lostPerHour || 0,
        severity: 'HIGH',
      });
    }
  });
  
  const totalSavings = avoided.reduce((sum, a) => sum + a.potentialLoss, 0);
  const totalLosses = fellFor.reduce((sum, f) => sum + f.lostPerHour, 0);
  const avgCommunityRate = avoided.length > 0
    ? (avoided.reduce((sum, a) => sum + parseFloat(a.communityRate), 0) / avoided.length).toFixed(0)
    : '0';
  
  // Generate comparison message
  let comparisonMessage;
  if (fellFor.length === 0 && avoided.length > 0) {
    comparisonMessage = `🏆 You're smarter than ${avgCommunityRate}% of players - you avoided all common traps!`;
  } else if (fellFor.length > avoided.length) {
    comparisonMessage = `⚠️ ${fellFor.length} trap${fellFor.length !== 1 ? 's' : ''} detected. Join the ${100 - parseInt(avgCommunityRate)}% who avoid these mistakes.`;
  } else if (fellFor.length > 0) {
    comparisonMessage = `📊 Mixed results: ${avoided.length} traps avoided, ${fellFor.length} to fix.`;
  } else {
    comparisonMessage = `📈 Good start! Keep building smart to stay trap-free.`;
  }
  
  return {
    avoided,
    fellFor,
    totalSavings,
    totalLosses,
    avoidedCount: avoided.length,
    fellCount: fellFor.length,
    avgCommunityRate,
    comparisonMessage,
    isOutperforming: avoided.length > fellFor.length,
  };
};
