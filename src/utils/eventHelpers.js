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
  
  // Auto Shop 2X (GTA+ only, Jan 8 - Feb 4, 2026)
  if (playerData.hasGTAPlus && playerData.hasAutoShop) {
    const startDate = new Date('2026-01-08T09:00:00Z');
    const endDate = new Date('2026-02-05T09:00:00Z'); // Feb 4 4AM ET = Feb 5 9AM UTC
    
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
        hourlyRate: 1250000, // $1.25M/hr realistic estimate (best-case is higher, but plan conservatively)
      });
    }
  }
  
  // Paper Trail 4X (Jan 8-15), then 2X (Jan 16 - Feb 4)
  if (playerData.hasGTAPlus && playerData.hasAgency) {
    const fourXStart = new Date('2026-01-08T09:00:00Z');
    const fourXEnd = new Date('2026-01-15T09:00:00Z');
    const twoXEnd = new Date('2026-02-05T09:00:00Z');
    
    if (date >= fourXStart && date <= fourXEnd) {
      // 4X window (this week only)
      const hoursLeft = Math.ceil((fourXEnd - date) / (1000 * 60 * 60));
      // CRITICAL when < 24 hours remain (expires Jan 15)
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
        critical: isCritical, // CRITICAL when < 24 hours remain
        hourlyRate: 400000, // $400k/hr at 4X
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
        hourlyRate: 200000, // $200k/hr at 2X
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
  return `${playerData.hasGTAPlus || false}_${playerData.hasAutoShop || false}_${playerData.hasAgency || false}`;
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
