// src/utils/priorityDetector.js
// Detect critical time-sensitive opportunities from weekly events

import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';

/**
 * Property cost estimates for discount calculations
 */
const PROPERTY_COSTS = {
  nightclubProperties: 1000000,      // Base Nightclub cost
  nightclubUpgrades: 1500000,         // Total upgrade cost estimate
  bunkerProperties: 1200000,          // Base Bunker cost
  bunkerUpgrades: 1000000,            // Total upgrade cost estimate
  autoShop: 1700000,                 // Base Auto Shop cost
  agency: 2010000,                   // Base Agency cost
  kosatka: 2200000,                  // Base Kosatka cost
  acidLab: 750000,                   // Base Acid Lab cost
};

/**
 * Check if user needs a specific property/item based on optimization path
 * @param {string} category - Discount category (e.g., 'nightclub_properties')
 * @param {Object} user - User object with formData structure
 * @param {Object} gameState - Game state object (optional)
 * @returns {Object|null} Object with needsIt flag and estimatedCost, or null
 */
const shouldUserBuy = (category, user, _gameState = {}) => {
  const formData = user.formData || user; // Support both formats
  
  // Map category to property flags and upgrade checks
  const optimizationPath = {
    'nightclub_properties': {
      needsIt: !formData.hasNightclub,
      estimatedCost: PROPERTY_COSTS.nightclubProperties,
      property: 'Nightclub',
    },
    'nightclub_upgrades': {
      needsIt: formData.hasNightclub && 
               (Number(formData.nightclubTechs) < 5 || 
                (formData.nightclubSources 
                  ? Object.values(formData.nightclubSources).filter(Boolean).length < 5
                  : Number(formData.nightclubFeeders) < 5)),
      estimatedCost: PROPERTY_COSTS.nightclubUpgrades,
      property: 'Nightclub Upgrades',
    },
    'bunker_properties': {
      needsIt: !formData.hasBunker,
      estimatedCost: PROPERTY_COSTS.bunkerProperties,
      property: 'Bunker',
    },
    'bunker_upgrades': {
      needsIt: formData.hasBunker && !formData.bunkerUpgraded,
      estimatedCost: PROPERTY_COSTS.bunkerUpgrades,
      property: 'Bunker Upgrades',
    },
    'auto_shop': {
      needsIt: !formData.hasAutoShop,
      estimatedCost: PROPERTY_COSTS.autoShop,
      property: 'Auto Shop',
    },
    'agency': {
      needsIt: !formData.hasAgency,
      estimatedCost: PROPERTY_COSTS.agency,
      property: 'Agency',
    },
    'kosatka': {
      needsIt: !formData.hasKosatka,
      estimatedCost: PROPERTY_COSTS.kosatka,
      property: 'Kosatka',
    },
    'acid_lab': {
      needsIt: !formData.hasAcidLab,
      estimatedCost: PROPERTY_COSTS.acidLab,
      property: 'Acid Lab',
    },
  };
  
  const path = optimizationPath[category];
  if (!path) return null;
  
  return path.needsIt ? {
    needsIt: true,
    estimatedCost: path.estimatedCost,
    property: path.property,
  } : null;
};

/**
 * Detect critical time-sensitive opportunities from weekly events
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object (optional, defaults to imported)
 * @param {Object} user - User object with formData structure
 * @param {Object} gameState - Game state object with claimedBonuses, etc. (optional)
 * @returns {Array} Sorted array of opportunities (highest priority first)
 */
export const detectCriticalOpportunities = (weeklyEvents = WEEKLY_EVENTS, user = {}, gameState = {}) => {
  const opportunities = [];
  const now = Date.now();
  
  // ONE-TIME BONUSES (highest priority)
  if (weeklyEvents.oneTimeBonuses && Array.isArray(weeklyEvents.oneTimeBonuses)) {
    weeklyEvents.oneTimeBonuses.forEach(bonus => {
      const expiryDate = new Date(bonus.expires);
      const timeLeft = expiryDate.getTime() - now;
      const hoursLeft = timeLeft / (1000 * 60 * 60);
      
      // Check if user already claimed it
      const claimedBonuses = gameState.claimedBonuses || [];
      const alreadyClaimed = claimedBonuses.includes(bonus.id);
      
      if (!alreadyClaimed && timeLeft > 0) {
        opportunities.push({
          type: 'one_time_bonus',
          priority: hoursLeft < 48 ? 'critical' : 'high',
          task: {
            id: bonus.id,
            name: bonus.description,
            reward: bonus.reward,
            timeLeft: hoursLeft,
            category: 'instant_cash',
            expires: bonus.expires,
            deliveryTime: bonus.deliveryTime,
          },
          reasoning: `Free $${bonus.reward.toLocaleString()} expires in ${Math.round(hoursLeft)} hours`,
          urgency: hoursLeft < 24 ? 'DO THIS TODAY' : hoursLeft < 72 ? 'DO THIS WEEK' : 'Limited Time',
        });
      }
    });
  }
  
  // EXPIRING HIGH-MULTIPLIER EVENTS
  // Handle both array format (activeBoosts) and object format (bonuses)
  const activeBoosts = [];
  
  // Check array format
  if (Array.isArray(weeklyEvents.activeBoosts)) {
    activeBoosts.push(...weeklyEvents.activeBoosts);
  }
  
  // Check object format (bonuses)
  if (weeklyEvents.bonuses && typeof weeklyEvents.bonuses === 'object') {
    Object.entries(weeklyEvents.bonuses).forEach(([key, bonus]) => {
      if (bonus.isActive && bonus.multiplier >= 3) {
        activeBoosts.push({
          activity: key,
          multiplier: bonus.multiplier,
          expires: bonus.validUntil,
          category: bonus.category || 'general',
        });
      }
    });
  }
  
  activeBoosts.forEach(boost => {
    const expiryDate = new Date(boost.expires);
    const timeLeft = expiryDate.getTime() - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (hoursLeft > 0 && hoursLeft < 72) {
      opportunities.push({
        type: 'expiring_event',
        priority: hoursLeft < 24 ? 'critical' : 'high',
        task: {
          activity: boost.activity,
          multiplier: boost.multiplier,
          timeLeft: hoursLeft,
          expires: boost.expires,
          category: boost.category,
        },
        reasoning: `${boost.multiplier}x ${boost.activity} expires in ${Math.round(hoursLeft)} hours`,
        urgency: 'TIME SENSITIVE',
      });
    }
  });
  
  // DISCOUNTS ON ITEMS USER SHOULD BUY
  // Handle both array format and object format
  const discounts = [];
  
  // Check object format (current structure)
  if (weeklyEvents.discounts && typeof weeklyEvents.discounts === 'object') {
    Object.entries(weeklyEvents.discounts).forEach(([category, discount]) => {
      discounts.push({
        category,
        discount: discount.percent / 100, // Convert percent to decimal
        expires: discount.validUntil,
        requiresGTAPlus: discount.requiresGTAPlus || false,
      });
    });
  }
  
  // Check array format (for JSON compatibility)
  if (Array.isArray(weeklyEvents.discounts)) {
    discounts.push(...weeklyEvents.discounts.map(d => ({
      category: d.category,
      discount: typeof d.discount === 'number' ? d.discount : d.percent / 100,
      expires: d.expires || d.validUntil,
      requiresGTAPlus: d.requiresGTAPlus || false,
    })));
  }
  
  discounts.forEach(discount => {
    const expiryDate = new Date(discount.expires);
    const timeLeft = expiryDate.getTime() - now;
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    // Check GTA+ requirement
    const formData = user.formData || user;
    if (discount.requiresGTAPlus && !formData.hasGTAPlus) {
      return; // Skip if requires GTA+ but user doesn't have it
    }
    
    // Check if user needs this item
    const needsItem = shouldUserBuy(discount.category, user, gameState);
    
    if (needsItem && discount.discount >= 0.30 && timeLeft > 0) { // 30%+ discount
      const estimatedSavings = needsItem.estimatedCost * discount.discount;
      
      opportunities.push({
        type: 'limited_discount',
        priority: estimatedSavings > 500000 ? 'high' : 'medium',
        task: {
          item: discount.category,
          property: needsItem.property,
          discount: discount.discount,
          savings: estimatedSavings,
          originalCost: needsItem.estimatedCost,
          timeLeft: hoursLeft,
          expires: discount.expires,
        },
        reasoning: `Save $${Math.round(estimatedSavings / 1000)}k on ${needsItem.property}`,
        urgency: hoursLeft < 48 ? 'EXPIRES SOON' : 'Limited Time',
      });
    }
  });
  
  // GTA+ FREE VEHICLE (if user has GTA+)
  const formData = user.formData || user;
  if (formData.hasGTAPlus && weeklyEvents.gtaPlus?.freeCar) {
    const claimedFreeCar = formData.claimedFreeCar || false;
    
    if (!claimedFreeCar) {
      opportunities.push({
        type: 'gta_plus_free_vehicle',
        priority: 'high',
        task: {
          vehicle: weeklyEvents.gtaPlus.freeCar,
          location: weeklyEvents.gtaPlus.freeCarLocation || 'The Vinewood Car Club',
        },
        reasoning: `Free ${weeklyEvents.gtaPlus.freeCar} available at ${weeklyEvents.gtaPlus.freeCarLocation || 'The Vinewood Car Club'}`,
        urgency: 'CLAIM NOW',
      });
    }
  }
  
  // Sort by priority (critical first, then high, medium, low)
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return opportunities.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by time left (less time = higher priority)
    const timeA = a.task.timeLeft || Infinity;
    const timeB = b.task.timeLeft || Infinity;
    return timeA - timeB;
  });
};

/**
 * Get the most urgent opportunity (highest priority, least time remaining)
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object (optional)
 * @param {Object} user - User object
 * @param {Object} gameState - Game state object (optional)
 * @returns {Object|null} Most urgent opportunity or null
 */
export const getMostUrgentOpportunity = (weeklyEvents = WEEKLY_EVENTS, user = {}, gameState = {}) => {
  const opportunities = detectCriticalOpportunities(weeklyEvents, user, gameState);
  return opportunities.length > 0 ? opportunities[0] : null;
};

/**
 * Filter opportunities by type
 * @param {Array} opportunities - Array of opportunities
 * @param {string} type - Type to filter by ('one_time_bonus', 'expiring_event', 'limited_discount', etc.)
 * @returns {Array} Filtered opportunities
 */
export const filterOpportunitiesByType = (opportunities, type) => {
  return opportunities.filter(opp => opp.type === type);
};

/**
 * Get opportunities expiring within specified hours
 * @param {Array} opportunities - Array of opportunities
 * @param {number} hours - Hours threshold
 * @returns {Array} Opportunities expiring within threshold
 */
export const getExpiringOpportunities = (opportunities, hours = 24) => {
  return opportunities.filter(opp => {
    const timeLeft = opp.task?.timeLeft || Infinity;
    return timeLeft <= hours && timeLeft > 0;
  });
};
