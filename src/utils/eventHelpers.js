// src/utils/eventHelpers.js
// Event detection logic extracted from computeAssessment.js and actionPlanBuilder.js

/**
 * Check if event expires within 48 hours
 * @param {number} expiresAt - Expiry timestamp
 * @param {number} now - Current timestamp (cached)
 */
export const isExpiringSoon = (expiresAt, now) => {
  if (!expiresAt) return false;
  const hoursLeft = (expiresAt - now) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft < 48;
};

/**
 * Check if event expires within 24 hours (CRITICAL urgency)
 * @param {number} expiresAt - Expiry timestamp
 * @param {number} now - Current timestamp (cached)
 */
export const isExpiringCritical = (expiresAt, now) => {
  if (!expiresAt) return false;
  const hoursLeft = (expiresAt - now) / (1000 * 60 * 60);
  return hoursLeft > 0 && hoursLeft < 24;
};

/**
 * Event-Aware Priority System: Detects time-limited bonuses and prioritizes them
 * @param {Object} playerData - Player form data
 * @param {Date|number} currentDate - Current date (defaults to now)
 * @returns {Array} Active events with priority metadata
 */
export const getActiveEvents = (playerData, currentDate = new Date()) => {
  const events = [];
  const date = new Date(currentDate);
  
  // ============================================
  // WEEKLY EVENTS (Jan 15-21, 2026)
  // ============================================
  
  // 4X Business Battles (Jan 15-21) - ALL PLAYERS
  const bbStart = new Date('2026-01-15T10:00:00Z');
  const bbEnd = new Date('2026-01-21T10:00:00Z');
  
  if (date >= bbStart && date <= bbEnd) {
    const hoursLeft = Math.ceil((bbEnd - date) / (1000 * 60 * 60));
    const daysLeft = Math.ceil(hoursLeft / 24);
    const isCritical = hoursLeft < 24;
    
    events.push({
      name: 'businessBattles4X',
      expiry: '2026-01-21',
      expiryTimestamp: bbEnd.getTime(),
      hoursLeft: hoursLeft,
      daysLeft: daysLeft,
      multiplier: 4,
      earningsRate: '$200-400k per battle',
      tier: 1,
      urgent: true,
      critical: isCritical,
      hourlyRate: 300000,
      category: 'freemode',
    });
  }
  
  // 4X Nightclub Goods from Business Battles (Jan 15-21) - Requires Nightclub
  if (playerData.hasNightclub && date >= bbStart && date <= bbEnd) {
    const hoursLeft = Math.ceil((bbEnd - date) / (1000 * 60 * 60));
    const daysLeft = Math.ceil(hoursLeft / 24);
    const isCritical = hoursLeft < 24;
    
    events.push({
      name: 'nightclubGoods4X',
      expiry: '2026-01-21',
      expiryTimestamp: bbEnd.getTime(),
      hoursLeft: hoursLeft,
      daysLeft: daysLeft,
      multiplier: 4,
      earningsRate: 'Massive passive boost',
      tier: 1,
      urgent: true,
      critical: isCritical,
      hourlyRate: 0, // Passive income, hard to quantify per hour
      category: 'passive',
    });
  }
  
  // 2X Nightclub Safe Income (Jan 15-21) - Requires Nightclub
  if (playerData.hasNightclub && date >= bbStart && date <= bbEnd) {
    const hoursLeft = Math.ceil((bbEnd - date) / (1000 * 60 * 60));
    const daysLeft = Math.ceil(hoursLeft / 24);
    
    events.push({
      name: 'nightclubSafe2X',
      expiry: '2026-01-21',
      expiryTimestamp: bbEnd.getTime(),
      hoursLeft: hoursLeft,
      daysLeft: daysLeft,
      multiplier: 2,
      earningsRate: '2X safe accumulation',
      tier: 2,
      urgent: false,
      critical: false,
      hourlyRate: 50000, // Rough estimate
      category: 'passive',
    });
  }
  
  // 40% Off Nightclub Properties & Upgrades (Jan 15-21)
  if (date >= bbStart && date <= bbEnd) {
    const hoursLeft = Math.ceil((bbEnd - date) / (1000 * 60 * 60));
    const daysLeft = Math.ceil(hoursLeft / 24);
    
    events.push({
      name: 'nightclubDiscount40',
      expiry: '2026-01-21',
      expiryTimestamp: bbEnd.getTime(),
      hoursLeft: hoursLeft,
      daysLeft: daysLeft,
      discount: 0.40,
      tier: 2,
      urgent: hoursLeft < 48,
      critical: hoursLeft < 24,
      category: 'discount',
    });
  }
  
  // ============================================
  // GTA+ MONTHLY EVENTS (Through Feb 4, 2026)
  // ============================================
  
  // Auto Shop 2X (GTA+ only, Jan 8 - Feb 4, 2026)
  if (playerData.hasGTAPlus && playerData.hasAutoShop) {
    const startDate = new Date('2026-01-08T09:00:00Z');
    const endDate = new Date('2026-02-04T10:00:00Z'); // Matches config/weeklyEvents.js gtaPlusValidUntil
    
    if (date >= startDate && date <= endDate) {
      const daysLeft = Math.ceil((endDate - date) / (1000 * 60 * 60 * 24));
      events.push({
        name: 'autoShop2X',
        expiry: '2026-02-04',
        expiryTimestamp: endDate.getTime(),
        daysLeft: daysLeft,
        multiplier: 2,
        earningsRate: '1.0-1.5M/hr',
        tier: 1,
        critical: true,
        urgent: true,
        hourlyRate: 1250000,
        category: 'gtaplus',
      });
    }
  }
  
  // Paper Trail 4X (Jan 8-15), then 2X (Jan 16 - Feb 4)
  // NOTE: Dates synchronized with config/weeklyEvents.js gtaPlusValidUntil
  if (playerData.hasGTAPlus && playerData.hasAgency) {
    const fourXStart = new Date('2026-01-08T09:00:00Z');
    const fourXEnd = new Date('2026-01-15T09:00:00Z');
    const twoXEnd = new Date('2026-02-04T10:00:00Z'); // Matches weeklyEvents.js
    
    if (date >= fourXStart && date <= fourXEnd) {
      // 4X window (this week only)
      const hoursLeft = Math.ceil((fourXEnd - date) / (1000 * 60 * 60));
      const isCritical = hoursLeft < 24;
      events.push({
        name: 'paperTrail4X',
        expiry: '2026-01-15',
        expiryTimestamp: fourXEnd.getTime(),
        hoursLeft: hoursLeft,
        daysLeft: Math.ceil(hoursLeft / 24),
        multiplier: 4,
        earningsRate: '400k/hr + massive RP',
        tier: 1,
        urgent: true,
        critical: isCritical,
        hourlyRate: 400000,
        category: 'gtaplus',
      });
    } else if (date > fourXEnd && date <= twoXEnd) {
      // 2X window (Jan 16 - Feb 4)
      const daysLeft = Math.ceil((twoXEnd - date) / (1000 * 60 * 60 * 24));
      events.push({
        name: 'paperTrail2X',
        expiry: '2026-02-04',
        expiryTimestamp: twoXEnd.getTime(),
        daysLeft: daysLeft,
        multiplier: 2,
        earningsRate: '200k/hr + good RP',
        tier: 1,
        urgent: false,
        critical: false,
        hourlyRate: 200000,
        category: 'gtaplus',
      });
    }
  }
  
  return events;
};

// Cache for getCurrentEvents
let eventsCache = {
  timestamp: 0,
  playerDataHash: null,
  events: [],
};

/**
 * Generate a simple hash from player data for cache invalidation
 * @param {Object} playerData - Player form data
 * @returns {string} Hash string
 */
const hashPlayerData = (playerData) => {
  return `${playerData.hasGTAPlus || false}_${playerData.hasAutoShop || false}_${playerData.hasAgency || false}_${playerData.hasNightclub || false}`;
};

/**
 * Get current events with 60-second cache layer
 * @param {Object} playerData - Player form data
 * @param {number} now - Current timestamp (defaults to Date.now())
 * @returns {Array} Active events with priority metadata
 */
export const getCurrentEvents = (playerData, now = Date.now()) => {
  const playerHash = hashPlayerData(playerData);
  const cacheAge = now - eventsCache.timestamp;
  
  // Return cached events if within 60 seconds and player data hasn't changed
  if (cacheAge < 60000 && eventsCache.playerDataHash === playerHash) {
    return eventsCache.events;
  }
  
  // Fetch fresh events
  const events = getActiveEvents(playerData, now);
  
  // Update cache
  eventsCache = {
    timestamp: now,
    playerDataHash: playerHash,
    events: events,
  };
  
  return events;
};

/**
 * Clear the events cache (useful for testing)
 */
export const clearEventsCache = () => {
  eventsCache = {
    timestamp: 0,
    playerDataHash: null,
    events: [],
  };
};
