// src/utils/eventHelpers.js
// Event detection logic extracted from computeAssessment.js and actionPlanBuilder.js
// Now data-driven from config/weeklyEvents.js — no more hardcoded dates!

import { WEEKLY_EVENTS, formatExpiry } from '../config/weeklyEvents.js';

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
 * Helper: compute time metadata for an event end date
 */
const getTimeMeta = (endDate, date) => {
  const hoursLeft = Math.ceil((endDate - date) / (1000 * 60 * 60));
  const daysLeft = Math.ceil(hoursLeft / 24);
  const isCritical = hoursLeft > 0 && hoursLeft < 24;
  return { hoursLeft, daysLeft, isCritical };
};

/**
 * Event-Aware Priority System: Detects time-limited bonuses and prioritizes them.
 * Now reads ALL dates from WEEKLY_EVENTS config — update config/weeklyEvents.js
 * every Thursday and this function automatically picks up the new data.
 *
 * @param {Object} playerData - Player form data
 * @param {Date|number} currentDate - Current date (defaults to now)
 * @returns {Array} Active events with priority metadata
 */
export const getActiveEvents = (playerData, currentDate = new Date()) => {
  const events = [];
  const date = new Date(currentDate);

  // Read date boundaries from config
  const weekStart = new Date(WEEKLY_EVENTS.meta.validFrom);
  const weekEnd = new Date(WEEKLY_EVENTS.meta.validUntil);
  const isWithinWeek = date >= weekStart && date <= weekEnd;

  // ============================================
  // WEEKLY EVENTS (data-driven from WEEKLY_EVENTS.bonuses)
  // ============================================

  if (isWithinWeek) {
    const bonuses = WEEKLY_EVENTS.bonuses || {};

    // Iterate over every active bonus in the config
    for (const [key, bonus] of Object.entries(bonuses)) {
      if (!bonus.isActive) continue;

      const endDate = new Date(bonus.validUntil);
      if (date > endDate) continue;

      const { hoursLeft, daysLeft, isCritical } = getTimeMeta(endDate, date);
      const expiryStr = formatExpiry(bonus.validUntil);

      // Map config keys to event objects the rest of the codebase expects
      events.push({
        name: key,
        expiry: expiryStr,
        expiryTimestamp: endDate.getTime(),
        hoursLeft,
        daysLeft,
        multiplier: bonus.multiplier,
        label: bonus.label,
        tier: bonus.multiplier >= 3 ? 1 : 2,
        urgent: bonus.multiplier >= 3 || hoursLeft < 48,
        critical: isCritical,
        hourlyRate: 0, // Consumers override per-activity
        category: bonus.category,
      });
    }

    // Weekly discounts
    const discounts = WEEKLY_EVENTS.discounts || {};
    for (const [key, discount] of Object.entries(discounts)) {
      const endDate = new Date(discount.validUntil);
      if (date > endDate) continue;

      const { hoursLeft, daysLeft, isCritical } = getTimeMeta(endDate, date);

      events.push({
        name: `${key}Discount`,
        expiry: formatExpiry(discount.validUntil),
        expiryTimestamp: endDate.getTime(),
        hoursLeft,
        daysLeft,
        discount: discount.percent / 100,
        tier: 2,
        urgent: hoursLeft < 48,
        critical: isCritical,
        category: 'discount',
      });
    }
  }

  // ============================================
  // GTA+ MONTHLY EVENTS (data-driven from WEEKLY_EVENTS.gtaPlus)
  // ============================================

  if (playerData.hasGTAPlus && WEEKLY_EVENTS.gtaPlus?.monthlyBonuses) {
    for (const monthly of WEEKLY_EVENTS.gtaPlus.monthlyBonuses) {
      const endDate = new Date(monthly.expires);
      if (date > endDate) continue;

      const { hoursLeft, daysLeft, isCritical } = getTimeMeta(endDate, date);

      events.push({
        name: `${monthly.activity}_gtaplus`,
        expiry: formatExpiry(monthly.expires),
        expiryTimestamp: endDate.getTime(),
        hoursLeft,
        daysLeft,
        multiplier: monthly.multiplier,
        label: `${monthly.multiplier}X ${monthly.activity.replace(/_/g, ' ')} (GTA+)`,
        tier: 1,
        urgent: daysLeft < 7,
        critical: isCritical,
        hourlyRate: 0,
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
