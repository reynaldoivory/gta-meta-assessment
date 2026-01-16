// src/utils/actionPlanBuilder.js
// Time-Sensitive Meta Logic - Prioritizes time-limited opportunities over generic grind advice
// ENFORCED: Always returns 3-5 actions minimum

import { WEEKLY_EVENTS, getDaysRemaining } from '../config/weeklyEvents.js';
import { validateStat } from './assessmentHelpers.js';
import { isExpiringSoon, isExpiringCritical } from './eventHelpers.js';
import { checkGatekeeper } from './gatekeeperEngine.js';
import { generateInfrastructureRecommendations } from './infrastructureAdvisor.js';

/**
 * Map activity names from weekly events to task identifiers
 * This allows matching tasks by eventId, tags, or title keywords
 */
const ACTIVITY_MAPPING = {
  'business_battles': ['business_battle', 'business battle', 'freemode'],
  'nightclub_goods': ['nightclub', 'nc_sell', 'nightclub goods'],
  'nightclub_safe': ['nightclub_safe', 'nightclub safe', 'nc_safe'],
  'mansion_raid': ['mansion_raid', 'mansion raid'],
  'auto_shop_finales': ['auto_shop', 'auto shop', 'robbery contract'],
  'paper_trail': ['paper_trail', 'paper trail', 'operation paper trail'],
};

/**
 * Check if a task matches a weekly boost activity
 * @param {Object} task - Task object with eventId, tags, or title
 * @param {string} activity - Activity name from weekly events
 * @returns {boolean} True if task matches the activity
 */
const taskMatchesActivity = (task, activity) => {
  const mapping = ACTIVITY_MAPPING[activity] || [activity];
  const taskId = (task.eventId || '').toLowerCase();
  const taskTitle = (task.title || '').toLowerCase();
  const taskTags = (task.tags || []).map(t => t.toLowerCase());
  
  return mapping.some(keyword => 
    taskId.includes(keyword.toLowerCase()) ||
    taskTitle.includes(keyword.toLowerCase()) ||
    taskTags.some(tag => tag.includes(keyword.toLowerCase()))
  );
};

/**
 * Apply weekly boosts to a task
 * Supports both object format (WEEKLY_EVENTS.bonuses) and array format (activeBoosts)
 * @param {Object} task - Task object with eventId, tags, or title
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object (or compatible structure)
 * @param {Object} user - User object with gtaPlus flag
 * @returns {Object} { multiplier, timeRemaining }
 */
export const applyWeeklyBoosts = (task, weeklyEvents, user) => {
  let multiplier = 1;
  let timeRemaining = null;
  
  if (!weeklyEvents) {
    return { multiplier, timeRemaining };
  }
  
  const now = Date.now();
  
  // Handle array format (activeBoosts) - for JSON compatibility
  if (Array.isArray(weeklyEvents.activeBoosts)) {
    weeklyEvents.activeBoosts.forEach(boost => {
      if (taskMatchesActivity(task, boost.activity)) {
        const expiryDate = new Date(boost.expires);
        if (now < expiryDate.getTime()) {
          const taskMultiplier = boost.multiplier || 1;
          if (taskMultiplier > multiplier) {
            multiplier = taskMultiplier;
            timeRemaining = expiryDate.getTime() - now;
          }
        }
      }
    });
  }
  
  // Handle object format (WEEKLY_EVENTS.bonuses) - current structure
  if (weeklyEvents.bonuses && typeof weeklyEvents.bonuses === 'object') {
    Object.entries(weeklyEvents.bonuses).forEach(([key, bonus]) => {
      if (!bonus.isActive) return;
      
      // Skip GTA+ only bonuses if user doesn't have GTA+
      if (bonus.gtaPlusOnly && !user?.gtaPlus) return;
      
      // Check if task matches this bonus activity
      const activityKey = key === 'autoShop' ? 'auto_shop_finales' :
                         key === 'paperTrail' ? 'paper_trail' :
                         key === 'businessBattles' ? 'business_battles' :
                         key === 'nightclubGoods' ? 'nightclub_goods' :
                         key === 'nightclubSafe' ? 'nightclub_safe' :
                         key === 'mansionRaid' ? 'mansion_raid' : key;
      
      if (taskMatchesActivity(task, activityKey)) {
        // Check expiry
        const expiryDate = user?.gtaPlus && bonus.gtaPlusValidUntil 
          ? new Date(bonus.gtaPlusValidUntil)
          : new Date(bonus.validUntil);
        
        if (now < expiryDate.getTime()) {
          const taskMultiplier = typeof bonus.multiplier === 'number' 
            ? bonus.multiplier 
            : (user?.gtaPlus && bonus.gtaPlusMultiplier 
                ? bonus.gtaPlusMultiplier 
                : bonus.baseMultiplier || 1);
          
          // Use the highest multiplier found
          if (taskMultiplier > multiplier) {
            multiplier = taskMultiplier;
            timeRemaining = expiryDate.getTime() - now;
          }
        }
      }
    });
  }
  
  // Check GTA+ monthly bonuses if user is subscriber
  if (user?.gtaPlus && weeklyEvents.gtaPlus?.monthlyBonuses) {
    weeklyEvents.gtaPlus.monthlyBonuses.forEach(monthlyBonus => {
      if (taskMatchesActivity(task, monthlyBonus.activity)) {
        const expiryDate = new Date(monthlyBonus.expires);
        if (now < expiryDate.getTime()) {
          const taskMultiplier = monthlyBonus.multiplier || 1;
          if (taskMultiplier > multiplier) {
            multiplier = taskMultiplier;
            timeRemaining = expiryDate.getTime() - now;
          }
        }
      }
    });
  }
  
  return { multiplier, timeRemaining };
};

/**
 * Calculate compound efficiency score with gatekeeper logic and weekly boosts
 * @param {Object} task - Task object with eventId, tags, title, basePayout
 * @param {Object} user - User object with stats, assets, gtaPlus flag
 * @param {Object} gameState - Game state object (optional)
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object
 * @returns {Object} { score, reasoning, warnings, gatekeeperResult }
 */
export const calculateCompoundEfficiency = (task, user, gameState, weeklyEvents) => {
  const reasoning = [];
  const warnings = [];
  
  // --- Gatekeeper Logic ---
  const taskId = task.eventId || task.id || '';
  // Support both flat user structure and nested formData structure
  const userData = user?.formData || user || {};
  
  // Build assets array from form data fields (hasKosatka, hasAgency, etc.)
  // This matches the logic in buildSmartActionPlan
  const builtAssets = [
    userData?.hasKosatka && 'kosatka',
    userData?.hasAgency && 'agency',
    userData?.hasAcidLab && 'acid_lab',
    userData?.hasNightclub && 'nightclub',
    userData?.hasBunker && 'bunker',
    userData?.hasAutoShop && 'auto_shop',
    userData?.hasSparrow && 'sparrow',
    userData?.hasOppressor && 'oppressor_mk2',
    userData?.hasRaiju && 'raiju',
  ].filter(Boolean);
  
  const userProfile = {
    stats: {
      flying: validateStat(userData?.flying || 0),
      strength: validateStat(userData?.strength || 0),
      shooting: validateStat(userData?.shooting || 0),
      stealth: validateStat(userData?.stealth || 0),
      stamina: validateStat(userData?.stamina || 0),
      driving: validateStat(userData?.driving || 0),
    },
    assets: user?.assets || builtAssets,
  };
  
  const gatekeeperResult = checkGatekeeper(taskId, userProfile);
  const viabilityMultiplier = gatekeeperResult.score_penalty || 1.0;
  
  if (gatekeeperResult.status === 'LOCKED') {
    reasoning.push(`🔒 ${gatekeeperResult.reason}`);
    warnings.push(`Cannot complete: ${gatekeeperResult.reason}`);
    return {
      score: 0,
      reasoning,
      warnings,
      gatekeeperResult,
      multiplier: 0,
    };
  }
  
  if (gatekeeperResult.status === 'WARNING') {
    reasoning.push(`⚠️ ${gatekeeperResult.reason} (${(viabilityMultiplier * 100).toFixed(0)}% efficiency)`);
    warnings.push(gatekeeperResult.reason);
  }
  
  // --- Base Score Calculation ---
  let score = (task.basePayout || 0) * viabilityMultiplier;
  
  // Special handling for dynamic payout tasks (e.g., nightclub sale)
  if (task.dynamicPayout && gameState?.businesses?.nightclub?.accumulatedValue) {
    score = gameState.businesses.nightclub.accumulatedValue * viabilityMultiplier;
    reasoning.push(`Sell accumulated goods: $${score.toLocaleString()}`);
  }
  
  // Normalize user object for gtaPlus check (support both flat and formData structures)
  const hasGtaPlus = user?.gtaPlus || user?.hasGTAPlus || 
                     user?.formData?.gtaPlus || user?.formData?.hasGTAPlus || false;
  const userForBoosts = { ...user, gtaPlus: hasGtaPlus };
  
  // --- Apply Weekly Boosts ---
  const boost = applyWeeklyBoosts(task, weeklyEvents, userForBoosts);
  if (boost.multiplier > 1) {
    const originalScore = score;
    score *= boost.multiplier;
    
    reasoning.push(
      `🎉 ${boost.multiplier}x Event: $${originalScore.toLocaleString()} → $${Math.round(score).toLocaleString()}`
    );
    
    // Urgency warning if expiring soon
    if (boost.timeRemaining && boost.timeRemaining < 48 * 60 * 60 * 1000) {
      const hoursLeft = Math.round(boost.timeRemaining / (1000 * 60 * 60));
      warnings.push(`⏰ This ${boost.multiplier}x bonus expires in ${hoursLeft} hours!`);
    }
  } else if (reasoning.length === 0) {
    // Add default reasoning for tasks without boosts
    if (task.basePayout > 0) {
      const hourlyRate = Math.round((task.basePayout / (task.baseDuration || 60)) * 60);
      reasoning.push(`Base payout: $${task.basePayout.toLocaleString()} ($${hourlyRate.toLocaleString()}/hr)`);
    }
  }
  
  return {
    score: Math.round(score),
    reasoning,
    warnings,
    gatekeeperResult,
    multiplier: boost.multiplier,
    timeRemaining: boost.timeRemaining,
  };
};

/**
 * Compound Efficiency middleware helpers
 * Philosophy: don't spend time on linear grind while passive systems are unbuilt/unfed,
 * unless that grind is directly funding an unlock/upgrade.
 */
const parseMinutes = (timeToComplete) => {
  if (!timeToComplete || typeof timeToComplete !== 'string') return null;
  const str = timeToComplete.toLowerCase();
  const hrMatch = str.match(/(\d+(\.\d+)?)\s*h/);
  const minMatch = str.match(/(\d+(\.\d+)?)\s*m/);
  if (hrMatch) return Math.round(parseFloat(hrMatch[1]) * 60);
  if (minMatch) return Math.round(parseFloat(minMatch[1]));
  const anyNumber = str.match(/(\d+(\.\d+)?)/);
  return anyNumber ? Math.round(parseFloat(anyNumber[1])) : null;
};

const getPassiveProgress = (formData) => {
  const acid = !!formData.hasAcidLab;
  const acidUp = acid && !!formData.acidLabUpgraded;
  const bunker = !!formData.hasBunker;
  const bunkerUp = bunker && !!formData.bunkerUpgraded;
  const nightclub = !!formData.hasNightclub;
  const nightclubOptimized = nightclub && Number(formData.nightclubTechs) >= 5 && Number(formData.nightclubFeeders) >= 5;
  // Agency isn't purely passive, but payphone hits + contracts are "parallel filler" during cooldowns.
  const agency = !!formData.hasAgency;
  const agencyUnlocked = agency && (!!formData.payphoneUnlocked || Number(formData.securityContracts) >= 3);

  const items = [
    { key: 'acid', ready: acidUp, owned: acid },
    { key: 'bunker', ready: bunkerUp, owned: bunker },
    { key: 'nightclub', ready: nightclubOptimized, owned: nightclub },
    { key: 'agency', ready: agencyUnlocked, owned: agency },
  ];
  const readyCount = items.filter(i => i.ready).length;
  return {
    items,
    readyCount,
    total: items.length,
    allMaxed: readyCount === items.length,
  };
};

const generateSessionTaxActions = (formData) => {
  const actions = [];
  // Keep these intentionally short: "start the passive clock"
  if (formData.hasAcidLab) {
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'TAX',
      title: 'Resupply Acid Lab',
      why: 'Start your passive clock immediately. Empty supplies = money left on the table.',
      solution: 'Call Mutt → Buy Supplies (or steal if cash is tight).',
      timeToComplete: '3-5 mins',
      estimatedMinutes: 5,
      launchesPassiveTimer: true,
      futureValue: 3,
    });
  }
  if (formData.hasBunker) {
    actions.push({
      priority: 0,
      urgency: 'URGENT',
      type: 'TAX',
      title: 'Resupply Bunker',
      why: 'Supplies running = passive production running. Do this before any grind.',
      solution: 'Bunker computer → Buy Supplies (best if upgraded).',
      timeToComplete: '3-5 mins',
      estimatedMinutes: 5,
      launchesPassiveTimer: true,
      futureValue: 3,
    });
  }
  if (actions.length === 0) {
    actions.push({
      priority: 1,
      urgency: 'MEDIUM',
      type: 'TAX',
      title: 'Quick Daily “Tax” Loop',
      why: 'If you don’t have passive businesses yet, take 5 minutes to grab easy daily value.',
      solution: 'Do Daily Objectives + any quick bonus claims (casino spin, free items).',
      timeToComplete: '5 mins',
      estimatedMinutes: 5,
      launchesPassiveTimer: false,
      futureValue: 1,
    });
  }
  return actions;
};

const annotateForCompoundEfficiency = (action, formData, results, now) => {
  const passive = getPassiveProgress(formData);
  const strengthPct = validateStat(formData.strength);
  const flyingPct = validateStat(formData.flying);

  const estimatedMinutes =
    action.estimatedMinutes ??
    (typeof action.timeHours === 'number' ? Math.round(action.timeHours * 60) : null) ??
    parseMinutes(action.timeToComplete);

  // --- Gatekeeper: "Can I do it?" ---
  const blockedBy = [];

  // Time gate: if action has an estimate and is clearly long, flag it (UI can decide how to use).
  if (estimatedMinutes !== null && estimatedMinutes >= 120 && action.urgency !== 'URGENT') {
    blockedBy.push('Too long for most sessions (2h+)');
  }

  // Content gates (heuristic until each action has explicit requirements metadata)
  const title = (action.title || '').toLowerCase();
  if (title.includes('cayo') && !formData.hasKosatka) blockedBy.push('Requires Kosatka');
  if (title.includes('auto shop') && !formData.hasAutoShop) blockedBy.push('Requires Auto Shop');
  if (title.includes('cayo') && flyingPct < 60) blockedBy.push('Flying too low (aim 60%+)');
  if ((title.includes('finale') || title.includes('contract') || title.includes('raid')) && strengthPct < 60) {
    blockedBy.push('Strength too low for consistent combat (aim 60%+)');
  }

  // --- Parallel Multiplier: "Is it working while I sleep?" ---
  const launchesPassiveTimer =
    !!action.launchesPassiveTimer ||
    action.type === 'TAX' ||
    action.bottleneckId === 'acid_upgrade' ||
    action.bottleneckId === 'bunker_upgrade' ||
    action.bottleneckId === 'nightclub_partial';

  // --- Unlock Velocity: "Does this change my future?" ---
  const unlockVelocity =
    action.futureValue ??
    (action.type === 'STAT' ? 2 : 0) +
    (action.type === 'PURCHASE' ? 3 : 0) +
    (title.includes('flight school') ? 3 : 0) +
    (title.includes('first dose') || title.includes('acid') ? 3 : 0);

  // --- Compound Efficiency: prefer passive unlocks until maxed ---
  const isLinearGrind =
    action.type === 'GRIND' ||
    (action.type === 'MISSION' && (title.includes('grind') || title.includes('farm') || title.includes('repeat')));

  // Base score starts from the existing priority score if present.
  // If not present, compute a lightweight approximation.
  let compoundScore = action._priorityScore ?? 0;
  if (!compoundScore) {
    compoundScore =
      (action.savingsPerHour ? 4000 + Math.min(action.savingsPerHour / 1000, 5000) : 0) +
      (action.impact === 'CRITICAL' ? 6000 : action.impact === 'high' ? 3000 : action.impact === 'medium' ? 1500 : 0) +
      (action.urgency === 'URGENT' || action.urgency === 'GRIND NOW' ? 5000 : 0);
  }

  // Add unlock velocity directly
  compoundScore += unlockVelocity * 900;

  // Apply parallel multiplier
  if (launchesPassiveTimer) compoundScore *= 3;

  // Penalize linear grind if passive systems aren’t maxed yet (unless it's funding an unlock)
  if (!passive.allMaxed && isLinearGrind) {
    compoundScore *= 0.6;
  }

  // If hard-blocked, push to bottom (but don’t delete, so UI can still show as “blocked”)
  if (blockedBy.length > 0) compoundScore -= 10000;

  return {
    ...action,
    estimatedMinutes,
    launchesPassiveTimer,
    unlockVelocity,
    blockedBy: action.blockedBy || blockedBy,
    compoundScore,
    _compoundMeta: {
      passiveReady: passive.readyCount,
      passiveTotal: passive.total,
      passiveAllMaxed: passive.allMaxed,
      annotatedAt: now,
    },
  };
};

/**
 * Meta efficiency benchmarks
 */
const META_BENCHMARKS = {
  cayoTime: 45, // Flag if > 45 min (sub-45 target per 2026 meta)
  flyingSkill: 80, // Flag if < 80% (4/5 bars)
  strengthMin: 60, // Minimum for combat content
  statsMax: 100, // Target for all stats
};

/**
 * Convert a bottleneck object to an action object
 * Handles priority, urgency, and expiry status consistently
 * @param {Object} bottleneck - Bottleneck object from computeAssessment
 * @param {number} now - Current timestamp (cached)
 * @returns {Object} Action object ready for the action plan
 */
const bottleneckToAction = (bottleneck, now) => {
  // Determine priority based on bottleneck properties
  let priority = 5; // Default medium priority
  let urgency = 'MEDIUM';
  let impact = bottleneck.impact || 'medium';
  
  // Check if expires within 24 hours (CRITICAL) - highest priority
  const expiresCritical = bottleneck.expiresAt && isExpiringCritical(bottleneck.expiresAt, now);
  if (expiresCritical || bottleneck.critical) {
    priority = 0;
    urgency = 'URGENT';
    // Mark as CRITICAL impact for scoring
    if (expiresCritical) {
      impact = 'CRITICAL';
    }
  } else if (bottleneck.urgent) {
    priority = 0;
    urgency = 'URGENT';
  } else if (bottleneck.impact === 'high') {
    priority = 2;
    urgency = 'HIGH';
  } else if (bottleneck.impact === 'medium') {
    priority = 3;
    urgency = 'MEDIUM';
  }
  
  // Check if expires soon (< 48 hours but > 24 hours)
  const expiresSoon = bottleneck.expiresAt && isExpiringSoon(bottleneck.expiresAt, now) && !expiresCritical;
  if (expiresSoon) {
    priority = Math.min(priority, 1); // High priority but not critical
    urgency = 'URGENT';
  }
  
  // Calculate time remaining string
  const timeRemaining = bottleneck.expiresAt 
    ? `${Math.ceil((bottleneck.expiresAt - now) / (1000 * 60 * 60))}hrs`
    : null;
  
  // Calculate time to complete string
  const timeToComplete = bottleneck.timeHours 
    ? `${Math.ceil(bottleneck.timeHours * 60)} minutes` 
    : 'Varies';
  
  return {
    priority,
    urgency,
    type: bottleneck.actionType?.toUpperCase() || 'ACTION',
    title: bottleneck.label,
    why: bottleneck.detail,
    solution: bottleneck.solution,
    timeToComplete,
    estimatedMinutes: bottleneck.timeHours ? Math.ceil(bottleneck.timeHours * 60) : null,
    cost: 0,
    timeRemaining,
    expiresAt: bottleneck.expiresAt,
    savingsPerHour: bottleneck.savingsPerHour || 0,
    impact,
    bottleneckId: bottleneck.id, // Store ID for reference
  };
};

/**
 * Calculate priority score for sorting
 * Order: timeUrgency > criticalImpact > efficiencyGap > longTermOptimization
 * @param {Object} action - Action object with priority metadata
 * @param {number} now - Current timestamp (cached)
 */
const calculatePriorityScore = (action, now) => {
  let score = 0;
  
  // a) timeUrgency (expires < 24hrs) → CRITICAL, (expires < 48hrs) → URGENT
  if (action.expiresAt && isExpiringCritical(action.expiresAt, now)) {
    score += 15000; // CRITICAL priority - do it NOW
  } else if (action.expiresAt && isExpiringSoon(action.expiresAt, now)) {
    score += 10000; // High priority - expires soon
  } else if (action.urgency === 'URGENT' || action.urgency === 'GRIND NOW') {
    score += 9000;
  }
  
  // b) criticalImpact (blocks content/income) → high priority
  if (action.impact === 'CRITICAL' || action.type === 'BLOCKER') {
    score += 8000;
  } else if (action.urgency === 'HIGH' || action.urgency === 'BLOCKER') {
    score += 7000;
  }
  
  // c) efficiencyGap (actual vs meta benchmark) → medium priority
  if (action.savingsPerHour && action.savingsPerHour > 0) {
    score += 6000 + Math.min(action.savingsPerHour / 1000, 5000); // Scale by savings
  } else if (action.type === 'SKILL' || action.type === 'STAT') {
    score += 5000;
  }
  
  // d) longTermOptimization (passive income, stat completion) → low priority
  if (action.type === 'OPTIMIZE' || action.urgency === 'LOW') {
    score += 1000;
  }
  
  // Lower priority number = higher priority (inverted)
  score += (10 - (action.priority || 5)) * 100;
  
  return score;
};

/**
 * Build smart action plan prioritizing time-sensitive meta opportunities
 * GUARANTEES: Always returns 3-5 actions minimum
 * @param {Array} bottlenecks - Prioritized bottlenecks from computeAssessment
 * @param {Object} heistReady - Legacy param (unused, kept for compatibility)
 * @param {Object} formData - Form data with player stats and assets
 * @param {Object} results - Assessment results
 * @returns {Array} Prioritized action plan (minimum 3 actions)
 */
export const buildCompactActionPlan = (bottlenecks, heistReady, formData, results = null) => {
  // Cache Date.now() once at the start
  const now = Date.now();
  
  const prioritizedBottlenecks = bottlenecks || [];
  const actions = [];
  
  // Convert ALL bottlenecks to action plan format (not just urgent/critical)
  // Track bottleneck IDs to prevent duplicates
  const seenBottleneckIds = new Set();
  
  prioritizedBottlenecks.forEach(bottleneck => {
    // Skip if we've already processed this bottleneck ID
    if (bottleneck.id && seenBottleneckIds.has(bottleneck.id)) {
      return;
    }
    if (bottleneck.id) {
      seenBottleneckIds.add(bottleneck.id);
    }
    
    // Convert bottleneck to action using shared function
    actions.push(bottleneckToAction(bottleneck, now));
  });
  
  // Then add the smart action plan (which handles Auto Shop, etc.)
  const smartActions = buildSmartActionPlan(formData, results);
  
  // Merge: bottlenecks first, then smart actions
  const allActions = [...actions, ...smartActions];
  
  // Deduplicate: Remove duplicate Paper Trail-specific actions (not rank actions that mention it)
  // Only deduplicate actions that are specifically about Paper Trail (MISSION type with Paper Trail in title)
  const paperTrailActions = allActions.filter(a => 
    a.type === 'MISSION' && a.title && (a.title.includes('Paper Trail') || a.title.includes('paper trail'))
  );
  if (paperTrailActions.length > 1) {
    // Keep only the highest priority Paper Trail action
    paperTrailActions.sort((a, b) => {
      const scoreA = calculatePriorityScore(a, now);
      const scoreB = calculatePriorityScore(b, now);
      return scoreB - scoreA; // Higher score = higher priority
    });
    // Remove all Paper Trail MISSION actions except the first (highest priority)
    const keepTitle = paperTrailActions[0].title;
    const filteredActions = allActions.filter(a => 
      !(a.type === 'MISSION' && a.title && (a.title.includes('Paper Trail') || a.title.includes('paper trail'))) || a.title === keepTitle
    );
    allActions.length = 0;
    allActions.push(...filteredActions);
  }
  
  // Deduplicate: Remove duplicate Auto Shop actions (grind, event, union depository)
  const autoShopKeywords = ['auto shop', 'union depository', 'robbery contract'];
  const autoShopActions = allActions.filter(a => 
    a.title && autoShopKeywords.some(kw => a.title.toLowerCase().includes(kw))
  );
  if (autoShopActions.length > 1) {
    // Keep only the highest priority Auto Shop action
    autoShopActions.sort((a, b) => {
      const scoreA = calculatePriorityScore(a, now);
      const scoreB = calculatePriorityScore(b, now);
      return scoreB - scoreA; // Higher score = higher priority
    });
    const keepAutoShopTitle = autoShopActions[0].title;
    const filteredAutoShop = allActions.filter(a => 
      !(a.title && autoShopKeywords.some(kw => a.title.toLowerCase().includes(kw))) || 
      a.title === keepAutoShopTitle
    );
    allActions.length = 0;
    allActions.push(...filteredAutoShop);
  }
  
  // ENFORCE MINIMUM 3-5 ACTIONS
  if (allActions.length < 3) {
    const maintenanceActions = generateMaintenanceActions(formData, results);
    allActions.push(...maintenanceActions.slice(0, 5 - allActions.length));
  }
  
  // Pre-calculate priority scores (avoid recalculating in sort loop)
  allActions.forEach(action => {
    action._priorityScore = calculatePriorityScore(action, now);
  });
  
  // Apply Compound Efficiency middleware (Gatekeeper + Parallel Multiplier + Unlock Velocity)
  const annotatedActions = allActions.map(a => annotateForCompoundEfficiency(a, formData, results, now));

  // Sort by compound score (highest first)
  const sortedActions = annotatedActions
    .sort((a, b) => (b.compoundScore || 0) - (a.compoundScore || 0))
    .slice(0, 5) // Limit to top 5
    .map(({ _priorityScore, ...action }) => action); // Remove cached score before returning
  
  // GUARANTEE: Always return at least 3 actions
  if (sortedActions.length < 3) {
    const additionalMaintenance = generateMaintenanceActions(formData, results);
    // Add more maintenance actions until we have at least 3
    for (const action of additionalMaintenance) {
      if (sortedActions.length >= 3) break;
      // Check if this action is already in the list
      if (!sortedActions.some(a => a.title === action.title)) {
        sortedActions.push(action);
      }
    }
  }
  return sortedActions;
};

/**
 * Session Consultant: builds a 3-part plan for a given session length.
 * - Tax: start passive timers (first ~5 minutes)
 * - Bridge: best “do now” activity you can actually execute
 * - Investment: improve future capability/unlocks (stats/upgrades)
 */
export const buildSessionPlan = ({ formData, results, sessionMinutes = 60 }) => {
  const now = Date.now();
  const taxCandidates = generateSessionTaxActions(formData);
  const tax = taxCandidates[0];

  const remainingAfterTax = Math.max(0, sessionMinutes - (tax.estimatedMinutes || 5));

  // Build candidate pool from the same sources as the action plan.
  const bottlenecks = (results?.bottlenecks || []).map(b => bottleneckToAction(b, now));
  const smart = buildSmartActionPlan(formData, results);
  const candidates = [...bottlenecks, ...smart]
    .map(a => annotateForCompoundEfficiency(a, formData, results, now))
    // Don’t reuse the tax action verbatim
    .filter(a => a.title !== tax.title);

  // Investment: pick something with high unlock velocity that fits ~last 15 min (or less if short session)
  const investBudget = Math.min(15, Math.max(5, Math.floor(remainingAfterTax * 0.25)));
  const investment = candidates
    .filter(a => (a.unlockVelocity || 0) >= 3)
    .filter(a => a.estimatedMinutes == null || a.estimatedMinutes <= investBudget)
    .sort((a, b) => (b.compoundScore || 0) - (a.compoundScore || 0))[0] || null;

  const remainingAfterInvestment = Math.max(
    0,
    remainingAfterTax - (investment?.estimatedMinutes || 0)
  );

  // Bridge: pick the best executable action that fits the remaining time and isn’t hard-blocked
  const bridge = candidates
    .filter(a => !a.blockedBy || a.blockedBy.length === 0)
    .filter(a => a.estimatedMinutes == null || a.estimatedMinutes <= remainingAfterInvestment)
    // Prefer non-tax, non-investment
    .filter(a => !investment || a.title !== investment.title)
    .sort((a, b) => (b.compoundScore || 0) - (a.compoundScore || 0))[0] || null;

  return {
    sessionMinutes,
    tax,
    bridge,
    investment,
    meta: {
      remainingAfterTax,
      remainingAfterInvestment,
      passiveProgress: getPassiveProgress(formData),
    },
  };
};

/**
 * Generate maintenance actions when no critical tasks exist
 * @param {Object} formData - Form data
 * @param {Object} results - Assessment results
 * @returns {Array} Maintenance actions
 */
const generateMaintenanceActions = (formData, results) => {
  const actions = [];
  const rank = Number(formData.rank) || 0;
  const cash = Number(formData.liquidCash) || 0;
  
  // Daily objectives - ALWAYS include this as a fallback
  actions.push({
    priority: 6,
    urgency: 'LOW',
    type: 'DAILY',
    title: 'Complete Daily Objectives',
    why: 'Daily objectives provide steady income and RP. Check phone for daily tasks.',
    solution: 'Check phone → Daily Objectives → Complete tasks',
    timeToComplete: '10-15 minutes',
    earnings: '$30-50k + RP',
  });
  
  // Stat maxing (if any stat < 5/5)
  // Use validateStat helper instead of manual * 20 conversions
  const stats = {
    strength: validateStat(formData.strength),
    flying: validateStat(formData.flying),
    shooting: validateStat(formData.shooting),
    stealth: validateStat(formData.stealth),
    stamina: validateStat(formData.stamina),
    driving: validateStat(formData.driving),
  };
  
  Object.entries(stats).forEach(([statName, statPct]) => {
    if (statPct < 100) {
      actions.push({
        priority: 7,
        urgency: 'LOW',
        type: 'STAT',
        title: `Maximize ${statName.charAt(0).toUpperCase() + statName.slice(1)}`,
        why: `${statPct}% is below maximum. Maxing stats improves performance in all activities.`,
        solution: `Use appropriate training method for ${statName}`,
        timeToComplete: 'Varies by stat',
        currentStat: `${statPct}%`,
        targetStat: '100%',
      });
    }
  });
  
  // Passive income checks
  const nightclubTechsCount = Number(formData.nightclubTechs) || 0;
  if (formData.hasNightclub && nightclubTechsCount < 5) {
    actions.push({
      priority: 6,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Optimize Nightclub (Add Technicians)',
      why: `You have ${nightclubTechsCount}/5 technicians. Adding more increases passive income.`,
      solution: 'Buy technicians from Nightclub computer',
      timeToComplete: '5 minutes',
      cost: 141000, // Per technician
    });
  }
  
  // Property recommendations
  if (!formData.hasKosatka && cash >= 2000000) {
    actions.push({
      priority: 5,
      urgency: 'MEDIUM',
      type: 'PURCHASE',
      title: 'Purchase Kosatka Submarine',
      why: 'Unlocks Cayo Perico heist, the best solo income source.',
      solution: 'Buy from Warstock Cache & Carry',
      timeToComplete: 'Purchase + setup: 30 minutes',
      cost: 2200000,
    });
  }
  
  // GUARANTEE: Always return at least 3 generic actions if nothing else matches
  if (actions.length < 3) {
    // Add generic optimization actions
    actions.push({
      priority: 7,
      urgency: 'LOW',
      type: 'OPTIMIZE',
      title: 'Review Your Business Setup',
      why: 'Periodically review your businesses to ensure they\'re optimized for maximum income.',
      solution: 'Check all business computers and ensure upgrades are purchased, technicians assigned, etc.',
      timeToComplete: '15-20 minutes',
    });
    
    if (actions.length < 3) {
      actions.push({
        priority: 7,
        urgency: 'LOW',
        type: 'OPTIMIZE',
        title: 'Complete Contact Missions',
        why: 'Contact missions provide steady income and RP. Good filler activity between heists.',
        solution: 'Open phone → Quick Job → Contact Mission',
        timeToComplete: '10-15 minutes per mission',
        earnings: '$20-40k per mission',
      });
    }
    
    if (actions.length < 3) {
      actions.push({
        priority: 7,
        urgency: 'LOW',
        type: 'OPTIMIZE',
        title: 'Explore New Content',
        why: 'GTA Online regularly adds new content. Check the Rockstar Newswire for latest updates.',
        solution: 'Visit rockstargames.com/newswire or check in-game notifications',
        timeToComplete: '5 minutes',
      });
    }
  }
  
  return actions;
};

/**
 * Core logic: Build smart action plan with time-sensitive meta focus
 * @param {Object} formData - Form data with player stats and assets
 * @param {Object} results - Assessment results (optional)
 * @returns {Array} Prioritized action plan
 */
export const buildSmartActionPlan = (formData, results = null) => {
  // Cache Date.now() once at the start
  const now = Date.now();
  
  const actions = [];
  const daysLeft = getDaysRemaining();
  
  // Parse Data (Handle 0-5 Bar scale -> 0-100% conversion)
  // Use validateStat helper to convert once instead of manual * 20 conversions
  const cash = Number(formData.liquidCash) || 0;
  const strengthPct = validateStat(formData.strength); // Returns 0-100%
  const flyingPct = validateStat(formData.flying);
  const hasGTAPlus = formData.hasGTAPlus || false;
  const playerRank = Number(formData.rank) || 0;
  const cayoAvgTime = Number(formData.cayoAvgTime) || 90;
  
  // Build user profile for gatekeeper checks
  const userProfile = {
    stats: {
      flying: flyingPct,
      strength: strengthPct,
      shooting: validateStat(formData.shooting),
      hacking: validateStat(formData.hacking),
      stealth: validateStat(formData.stealth),
      stamina: validateStat(formData.stamina),
      driving: validateStat(formData.driving),
    },
    assets: [
      formData.hasKosatka && 'kosatka',
      formData.hasAgency && 'agency',
      formData.hasAcidLab && 'acid_lab',
      formData.hasNightclub && 'nightclub',
      formData.hasBunker && 'bunker',
      formData.hasAutoShop && 'auto_shop',
      formData.hasSparrow && 'sparrow',
      formData.hasOppressor && 'oppressor_mk2', // hasOppressor is the actual field name
      formData.hasRaiju && 'raiju',
      // NOTE: hasArcade and hasBrickade6x6 not tracked in form state yet
      // Add them to AssessmentContext if gatekeeper rules require them
    ].filter(Boolean), // Remove falsy values
  };
  
  // --- PRIORITY 0: TIME-LIMITED EVENTS (The Auto Shop Meta) ---
  // NOTE: 2X Auto Shop bonus is GTA+ ONLY - check gtaPlusOnly flag before showing
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const isAutoShopEventAvailable = daysLeft > 0 && 
    autoShopBonus?.isActive && 
    (!autoShopBonus?.gtaPlusOnly || hasGTAPlus); // Respect gtaPlusOnly flag
  
  if (isAutoShopEventAvailable) {
    const shopCost = WEEKLY_EVENTS.discounts?.autoShop?.priceEstimate || 835000;
    
    // Case A: Buy It Now (High Capital) - Only show if GTA+ or event is not GTA+ exclusive
    if (!formData.hasAutoShop && cash >= shopCost) {
      const autoShopExpiry = autoShopBonus?.gtaPlusValidUntil 
        ? new Date(autoShopBonus.gtaPlusValidUntil).getTime()
        : autoShopBonus?.validUntil
          ? new Date(autoShopBonus.validUntil).getTime()
          : null;
      const expiresSoon = autoShopExpiry && isExpiringSoon(autoShopExpiry, now);
      
      // Run gatekeeper check for auto shop (if we had a task ID for it)
      // For now, auto shop doesn't have gatekeeper rules, so this is a placeholder
      
      actions.push({
        priority: 0,
        urgency: expiresSoon ? 'URGENT' : 'URGENT',
        type: 'PURCHASE',
        title: `⚡ BUY AUTO SHOP NOW (Ends ${WEEKLY_EVENTS.meta?.displayDate || 'Jan 21'})`,
        why: `You have $${(cash/1000000).toFixed(1)}M. Buying this unlocks $1.3M-$1.5M/hr income (2X Bonus - GTA+ Exclusive). Union Depository Contract pays ~$675k in 25 mins. Beats Cayo Perico.`,
        cost: shopCost,
        earnings: '$1.3M-$1.5M/hr',
        timeRemaining: `${daysLeft} days`,
        timeToComplete: '15 minutes (purchase + setup)',
        potentialEarnings: `$4-5M in ${daysLeft} days`,
        expiresAt: autoShopExpiry,
      });
    }
    
    // Case B: Grind It (Owns it) - HIGHEST PRIORITY
    else if (formData.hasAutoShop && hasGTAPlus) {
      // Auto Shop 2X is active for GTA+ members through Feb 4
      const autoShopExpiry = autoShopBonus?.gtaPlusValidUntil 
        ? new Date(autoShopBonus.gtaPlusValidUntil).getTime()
        : null;
      const daysLeftAutoShop = autoShopExpiry 
        ? Math.ceil((autoShopExpiry - now) / (1000 * 60 * 60 * 24))
        : 0;
      const expiresSoon = autoShopExpiry && isExpiringSoon(autoShopExpiry, now);
      
      if (daysLeftAutoShop > 0) {
        const expiryText = daysLeftAutoShop < 3 
          ? `${Math.ceil(daysLeftAutoShop * 24)} hours`
          : `${daysLeftAutoShop} days`;
        
        actions.push({
          priority: 0,
          urgency: expiresSoon ? 'URGENT' : 'URGENT',
          type: 'MISSION',
          title: '🔥 Grind Auto Shop Robbery Contracts (2X Event)',
          why: `Zero prep, ~$540-600k per 20-25 min finale (realistic at Rank ${playerRank}). Expect ~$1.0-1.5M/hr once practiced. Beats your ${cayoAvgTime}-min Cayo runs. Expires Feb 4.`,
          solution: 'Rotation: Union Depository finale → Client vehicle delivery (also 2X) while staff preps → Repeat. Eliminates downtime.',
          timeToComplete: '20-25 min per finale, ~$540-600k payout',
          earnings: '$1.0-1.5M/hr (realistic)',
          timeRemaining: expiryText,
          potentialEarnings: `$${(daysLeftAutoShop * 10 * 1.8).toFixed(1)}M potential over next ${daysLeftAutoShop} days`,
          strategy: 'Eliminates downtime between contracts. Highest $/hr in game right now.',
          expiresAt: autoShopExpiry,
          savingsPerHour: 1800000,
        });
      }
      
      // Check for Stat Blocker first
      if (strengthPct < 60) {
        // Calculate exact impacts needed (20 impacts = 1% strength)
        const impactsNeeded = Math.ceil((60 - strengthPct) * 20);
        
        // Determine best method based on mansion ownership
        let method, timeToComplete, methodDetails, avoidMethod;
        
        if (formData.hasMansion) {
          // Priority 1: The "Whale" Method
          method = 'Mansion Gym (Private)';
          timeToComplete = '20-30 mins';
          methodDetails = 'Use the punching bag minigame in your gym. This is the only fast, legit method.';
          avoidMethod = 'Avoid: Golf and Beach Punching (Waste of time compared to gym).';
        } else {
          // Priority 2: The "Grinder" Method
          method = 'Pier Pressure (Beach)';
          timeToComplete = '60-75 mins';
          methodDetails = `Launch "Pier Pressure" alone. Go to the boardwalk. Punch pedestrians. 
Math: You need ${impactsNeeded} punches to reach 60%. (~30 punches/min).`;
          avoidMethod = 'Avoid: Golf (unless using "Infinite Putt" exploit). Normal golf takes 6+ hours.';
        }
        
        actions.push({
          priority: 0,
          urgency: 'BLOCKER',
          type: 'STAT',
          title: `🚨 FIX STRENGTH (${strengthPct}% → 60%+)`,
          why: `You will fail the Auto Shop finale with low strength. You take too much damage.`,
          impact: 'CRITICAL',
          cost: 0,
          timeToComplete: timeToComplete,
          method: method,
          methodDetails: methodDetails,
          avoidMethod: avoidMethod,
          blocksAction: 'Auto Shop grinding',
          currentStat: `${strengthPct}%`,
          targetStat: '60%',
          impactsNeeded: impactsNeeded,
        });
      } else {
        actions.push({
          priority: 0,
          urgency: 'URGENT',
          type: 'GRIND',
          title: `⚡ FARM UNION DEPOSITORY CONTRACT (${daysLeftAutoShop} days left)`,
          why: 'This is the highest paying activity in the game right now. Union Depository Contract pays ~$540-600k (with 2X bonus) in ~20-25 mins. No cooldown - repeat endlessly. Beats Cayo Perico this week.',
          earnings: '$1.3M-$1.5M/hr',
          timeRemaining: `${daysLeftAutoShop} days`,
          timeToComplete: '25 mins per contract (repeatable)',
          method: 'Select "Union Depository Contract" from Auto Shop board. If not available, do a short contract to refresh the board.',
          potentialEarnings: `$4-5M by event end`,
          expiresAt: autoShopExpiry,
        });
      }
    }
    
    // Case C: Grind to Afford (Low Capital)
    else if (!formData.hasAutoShop && cash < shopCost && daysLeft > 0) {
      const needed = shopCost - cash;
      const bestGrindIncome = 466000; // Cayo solo rate/hr
      const hoursNeeded = needed / bestGrindIncome;
      const autoShopExpiry = WEEKLY_EVENTS.bonuses?.autoShop?.gtaPlusValidUntil 
        ? new Date(WEEKLY_EVENTS.bonuses.autoShop.gtaPlusValidUntil).getTime()
        : null;
      
      actions.push({
        priority: 0,
        urgency: 'GRIND NOW',
        type: 'GRIND',
        title: `⚡ GRIND FOR AUTO SHOP (${daysLeft} days left)`,
        why: `Auto Shop 2X event ends in ${daysLeft} days. You need $${(needed/1000).toFixed(0)}k more (${hoursNeeded.toFixed(1)} hours of grinding). Buy it before the event ends!`,
        cost: needed,
        timeToComplete: `${hoursNeeded.toFixed(1)} hours`,
        potentialEarnings: `$4-5M after purchase`,
        expiresAt: autoShopExpiry,
      });
    }
  }

  // --- PRIORITY 1: WEEKLY EVENTS (Expires sooner than GTA+ monthly) ---
  // 4X Business Battles (Jan 15-21) - ALL PLAYERS
  const bbExpiry = WEEKLY_EVENTS.bonuses?.businessBattles?.validUntil 
    ? new Date(WEEKLY_EVENTS.bonuses.businessBattles.validUntil).getTime()
    : null;
  const bbActive = WEEKLY_EVENTS.bonuses?.businessBattles?.isActive && bbExpiry && bbExpiry > now;
  
  if (bbActive) {
    const hoursLeft = Math.ceil((bbExpiry - now) / (1000 * 60 * 60));
    const daysLeftBB = Math.ceil(hoursLeft / 24);
    const urgencyText = hoursLeft < 48 ? `${hoursLeft} hours left` : `${daysLeftBB} days left`;
    
    // Different messaging based on Nightclub ownership
    if (formData.hasNightclub) {
      actions.push({
        priority: 1,
        urgency: hoursLeft < 24 ? 'URGENT' : 'HIGH',
        type: 'FREEMODE',
        title: '⚡ Contest Business Battles (4X This Week!)',
        why: `4X Business Battles + 4X Nightclub Goods expires Jan 21 (${urgencyText}). Your Nightclub profits massively from won battles. Stack between Auto Shop cooldowns.`,
        solution: 'Join Business Battles in Freemode (every ~15 mins). Goods go to your Nightclub at 4X value. Best stacking activity.',
        timeToComplete: '5-10 min per battle',
        earnings: '$200-400k per battle + 4X Nightclub goods',
        timeRemaining: urgencyText,
        expiresAt: bbExpiry,
        category: 'freemode',
      });
    } else {
      actions.push({
        priority: 1,
        urgency: hoursLeft < 24 ? 'URGENT' : 'HIGH',
        type: 'FREEMODE',
        title: '⚡ Contest Business Battles (4X This Week!)',
        why: `4X Business Battles expires Jan 21 (${urgencyText}). Even without Nightclub, battles pay 4X goods. Consider buying Nightclub at 40% off this week!`,
        solution: 'Join Business Battles in Freemode (every ~15 mins). Good money even without Nightclub.',
        timeToComplete: '5-10 min per battle',
        earnings: '$200-400k per battle',
        timeRemaining: urgencyText,
        expiresAt: bbExpiry,
        category: 'freemode',
      });
    }
  }
  
  // 40% Off Nightclub Upgrades (Jan 15-21) - If Nightclub not optimized
  const ncDiscountExpiry = WEEKLY_EVENTS.discounts?.nightclubUpgrades?.validUntil
    ? new Date(WEEKLY_EVENTS.discounts.nightclubUpgrades.validUntil).getTime()
    : null;
  const ncDiscountActive = WEEKLY_EVENTS.discounts?.nightclubUpgrades && ncDiscountExpiry && ncDiscountExpiry > now;
  
  // Calculate feeders from nightclubSources (new format) or use legacy number
  const nightclubFeedersCount = formData.nightclubSources 
    ? Object.values(formData.nightclubSources).filter(Boolean).length 
    : Number(formData.nightclubFeeders) || 0;
  const ncTechsCount = Number(formData.nightclubTechs) || 0;
  
  if (ncDiscountActive && formData.hasNightclub && 
      (ncTechsCount < 5 || nightclubFeedersCount < 5)) {
    const hoursLeft = Math.ceil((ncDiscountExpiry - now) / (1000 * 60 * 60));
    const urgencyText = hoursLeft < 48 ? `${hoursLeft} hours left` : `${Math.ceil(hoursLeft / 24)} days left`;
    
    actions.push({
      priority: 1,
      urgency: hoursLeft < 24 ? 'URGENT' : 'HIGH',
      type: 'PURCHASE',
      title: '💰 Buy Nightclub Upgrades (40% OFF!)',
      why: `Your Nightclub isn't optimized. 40% off upgrades expires Jan 21 (${urgencyText}). Save ~$600k on Equipment + Staff upgrades.`,
      solution: 'Buy Equipment Upgrade + Staff Upgrade from Nightclub computer. They boost production speed significantly.',
      timeToComplete: '5 minutes',
      savings: '~$600k savings',
      timeRemaining: urgencyText,
      expiresAt: ncDiscountExpiry,
    });
  }

  // --- PRIORITY 2: COMBAT PREP (Prerequisite for Auto Shop) ---
  // Only show if Auto Shop 2X is active and player is Rank < 100 and strength NOT maxed
  const autoShop2XActive = formData.hasAutoShop && hasGTAPlus && 
    WEEKLY_EVENTS.bonuses?.autoShop?.isActive;
  
  // Only show combat prep if strength is NOT maxed (< 100)
  // Players with max strength (100%) have good damage resistance and don't need this warning
  if (autoShop2XActive && playerRank < 100 && strengthPct < 100) {
    const maxHealthPercent = Math.floor(50 + (playerRank / 2));
    
    if (strengthPct < 60) {
      // Strength is critically low - needs full prep
      actions.push({
        priority: 2,
        urgency: 'HIGH',
        type: 'PREPARATION',
        title: '💪 Max Strength Before Auto Shop Finales',
        why: `Rank ${playerRank} = ~${maxHealthPercent}% max health. Strength is ${strengthPct}% (low). You take extra damage. Max strength first.`,
        solution: '1. Max Strength (30 min via Pier Pressure or Mansion Gym). 2. Then stock 10+ Snacks + 10 Super Heavy Armor.',
        timeToComplete: '30-40 min one-time investment',
        impact: 'Prevents wasted time on failed missions',
        note: 'Do this before grinding Auto Shop.',
      });
    } else if (playerRank < 80) {
      // Strength is OK but rank is low - just need snacks/armor
      actions.push({
        priority: 2,
        urgency: 'MEDIUM',
        type: 'PREPARATION',
        title: '🛡️ Stock Snacks & Armor for Auto Shop',
        why: `Rank ${playerRank} = ~${maxHealthPercent}% max health. Strength is good (${strengthPct}%), but stock up on supplies.`,
        solution: 'Stock 10+ Snacks + 10 Super Heavy Armor. Visit Agency armory for free snacks if owned.',
        timeToComplete: '10-15 min one-time investment',
        impact: 'Prevents wasted time on failed missions',
      });
    }
    // Rank 80+ with strength >= 60 = no prep action needed
  }

  // --- PRIORITY 2.5: INFRASTRUCTURE INVESTMENTS (Smart Shopping) ---
  // Only show if player has cash and critical upgrades are missing
  const infraRecommendations = generateInfrastructureRecommendations(formData);
  const criticalInfra = infraRecommendations.filter(r => 
    r.urgency === 'CRITICAL' || r.urgency === 'URGENT' || r.type === 'CRITICAL'
  );
  
  // Add top infrastructure recommendations (limit to 2 to not overwhelm)
  criticalInfra.slice(0, 2).forEach((rec, index) => {
    // Skip if player can't afford it
    if (rec.cost && cash < rec.cost) return;
    
    // Determine emoji based on type
    let emoji = '🏭';
    if (rec.isTrap) emoji = '⚠️';
    else if (rec.isDiscounted) emoji = '💰';
    else if (rec.category === 'nightclub') emoji = '🎭';
    else if (rec.category === 'bunker') emoji = '🔫';
    
    const priorityBoost = rec.isDiscounted ? 1 : 2; // Discounted items get higher priority
    
    actions.push({
      priority: priorityBoost + index,
      urgency: rec.urgency,
      type: 'INFRASTRUCTURE',
      title: `${emoji} ${rec.title}`,
      why: rec.why,
      solution: rec.benefit,
      timeToComplete: '5-10 minutes',
      cost: rec.cost,
      savings: rec.isDiscounted ? rec.originalCost - rec.cost : 0,
      roiHours: rec.roiHours || null,
      expiresAt: rec.expiresAt || null,
      isDiscounted: rec.isDiscounted,
      discountPercent: rec.discountPercent,
      category: 'infrastructure',
    });
  });

  // --- PRIORITY 3: EFFICIENCY BENCHMARKING ---
  // Cayo Perico: Flag if > 45 min (meta benchmark - sub-45 target)
  if (formData.hasKosatka && cayoAvgTime > META_BENCHMARKS.cayoTime) {
    const efficiencyGap = cayoAvgTime - META_BENCHMARKS.cayoTime;
    
    // Run gatekeeper check for Cayo Perico
    const cayoGatekeeper = checkGatekeeper('cayo_perico', userProfile);
    
    let actionTitle = `Fix Cayo Route: Target Sub-45 Min (Currently ${cayoAvgTime} min)`;
    let actionWhy = `Your ${cayoAvgTime}-min runs are ${efficiencyGap} minutes slower than meta benchmark (${META_BENCHMARKS.cayoTime} min). Target sub-45 min after bonuses end Feb 4.`;
    
    // Apply gatekeeper verdict
    if (cayoGatekeeper.status === 'LOCKED') {
      // Should not happen since we check formData.hasKosatka, but handle it
      actionTitle = `🔒 ${actionTitle}`;
      actionWhy = `${cayoGatekeeper.reason}. ${actionWhy}`;
    } else if (cayoGatekeeper.status === 'WARNING') {
      actionTitle = `⚠️ ${actionTitle}`;
      actionWhy = `${cayoGatekeeper.reason} ${actionWhy}`;
    }
    
    actions.push({
      priority: 3,
      urgency: 'MEDIUM',
      type: 'SKILL',
      title: actionTitle,
      why: actionWhy,
      solution: 'Drainage tunnel, primary only, swim exit. Study 2026 speedrun guides.',
      timeToComplete: '2-3 hours practice',
      note: cayoGatekeeper.status === 'WARNING' ? cayoGatekeeper.reason : 'Do this after Auto Shop event ends Feb 4. Not urgent during event.',
      efficiencyGap: efficiencyGap,
      gatekeeperStatus: cayoGatekeeper.status,
      gatekeeperPenalty: cayoGatekeeper.score_penalty,
    });
  }
  
  // Flying skill: Flag if < 80% (4/5 bars) for heist leadership
  if (flyingPct < META_BENCHMARKS.flyingSkill) {
    const efficiencyGap = META_BENCHMARKS.flyingSkill - flyingPct;
    actions.push({
      priority: 3,
      urgency: 'MEDIUM',
      type: 'STAT',
      title: `San Andreas Flight School (${flyingPct}% → 80%+)`,
      why: `Your Flying is ${flyingPct}% (${Math.ceil(flyingPct/20)}/5 bars). ${efficiencyGap}% below meta benchmark for heist leadership. Your Sparrow is unstable. Flight School fixes this AND pays ~$250k.`,
      timeToComplete: '45 mins',
      earnings: '+$250k',
      cost: 0,
      currentStat: `${flyingPct}%`,
      targetStat: '80%',
      efficiencyGap: efficiencyGap,
    });
  }

  // --- PRIORITY 3: CRITICAL BLOCKERS (General) ---
  // Strength (If not already caught by Auto Shop logic)
  if (strengthPct < 40 && !actions.some(a => a.type === 'STAT' && a.title.includes('STRENGTH'))) {
    // Calculate exact impacts needed (20 impacts = 1% strength)
    const impactsNeeded = Math.ceil((40 - strengthPct) * 20);
    
    // Determine best method based on mansion ownership
    let method, timeToComplete, methodDetails, avoidMethod;
    
    if (formData.hasMansion) {
      // Priority 1: The "Whale" Method
      method = 'Mansion Gym (Private)';
      const minutesNeeded = Math.ceil((40 - strengthPct) * 0.3);
      timeToComplete = `${minutesNeeded} mins`;
      methodDetails = 'Use the punching bag minigame in your gym. This is the only fast, legit method.';
      avoidMethod = 'Avoid: Golf and Beach Punching (Waste of time compared to gym).';
    } else {
      // Priority 2: The "Grinder" Method
      method = 'Pier Pressure (Beach)';
      timeToComplete = '60-75 mins';
      methodDetails = `Launch "Pier Pressure" alone. Go to the boardwalk. Punch pedestrians. 
Math: You need ${impactsNeeded} punches to reach 40%. (~30 punches/min).`;
      avoidMethod = 'Avoid: Golf (unless using "Infinite Putt" exploit). Normal golf takes 6+ hours.';
    }
    
    actions.push({
      priority: 3,
      urgency: 'BLOCKER',
      type: 'STAT',
      title: 'Fix Critical Strength Liability',
      why: `Your Strength is ${strengthPct}% (${Math.ceil(strengthPct/20)}/5 bars). You take max damage. You cannot lead Heists safely.`,
      impact: 'CRITICAL',
      method: method,
      methodDetails: methodDetails,
      avoidMethod: avoidMethod,
      timeToComplete: timeToComplete,
      cost: 0,
      currentStat: `${strengthPct}%`,
      targetStat: '40%',
      impactsNeeded: impactsNeeded,
    });
  }

  // --- PRIORITY 4+: POST-EVENT OPTIMIZATION (After Feb 4) ---
  // Dr. Dre Contract (After Feb 4 when Auto Shop event ends)
  if (formData.hasAgency && !formData.dreContractDone) {
    // Run gatekeeper check for Dr. Dre Contract
    const dreGatekeeper = checkGatekeeper('dre_contract', userProfile);
    
    let actionTitle = 'Dr. Dre Contract (After Feb 4)';
    let actionWhy = 'One-time $1M payout. Do after Auto Shop event ends Feb 4.';
    let actionNote = 'Lower priority than time-limited events. Do after Feb 4.';
    let actionPriority = 4;
    
    // Apply gatekeeper verdict
    if (dreGatekeeper.status === 'LOCKED') {
      actionTitle = `🔒 ${actionTitle}`;
      actionWhy = `${dreGatekeeper.reason}. ${actionWhy}`;
      actionNote = dreGatekeeper.reason;
    } else if (dreGatekeeper.status === 'WARNING') {
      actionTitle = `⚠️ ${actionTitle}`;
      actionWhy = `${dreGatekeeper.reason} ${actionWhy}`;
      actionNote = `${dreGatekeeper.reason}. ${actionNote}`;
    }
    
    actions.push({
      priority: actionPriority,
      urgency: 'LOW',
      type: 'CONTRACT',
      title: actionTitle,
      why: actionWhy,
      solution: 'Complete Dr. Dre Contract from Agency computer',
      timeToComplete: '2-3 hours',
      note: actionNote,
      gatekeeperStatus: dreGatekeeper.status,
      gatekeeperPenalty: dreGatekeeper.score_penalty,
    });
  }

  // --- PRIORITY 7: QUALITY OF LIFE (Stamina) ---
  const staminaPct = validateStat(formData.stamina);
  if (staminaPct < 100) {
    actions.push({
      priority: 7,
      urgency: 'LOW',
      type: 'STAT',
      title: 'Maximize Stamina (AFK Method)',
      why: 'Unlimited sprint is useful for heist setups. Use the rubber-band method while AFK. Required for Mansion Yoga buff (+15% run speed).',
      impact: 'LOW - Quality of life improvement',
      cost: 0,
      timeToComplete: '30 mins (AFK)',
      method: 'Rubber-band controller while AFK',
    });
  }

  // Sort by priority (0 = highest)
  return actions.sort((a, b) => a.priority - b.priority);
};

/**
 * Legacy function for backward compatibility
 */
export const getTopPriorityAction = (formData, results) => {
  const actionPlan = buildSmartActionPlan(formData, results);
  if (actionPlan.length === 0) {
    return {
      type: 'OPTIMIZE',
      title: 'Continue Your Grind',
      reason: 'You\'re doing great! Focus on maximizing your current setup.',
      icon: '🎯',
      color: 'from-blue-600 to-purple-600',
      steps: 'Keep running your optimized loop',
    };
  }

  const topAction = actionPlan[0];
  
  // Determine type based on urgency
  let actionType = 'PRIORITY';
  if (topAction.urgency === 'URGENT' || topAction.urgency === 'GRIND NOW') {
    actionType = 'CRITICAL';
  } else if (topAction.urgency === 'BLOCKER') {
    actionType = 'BLOCKER';
  }
  
  // Determine icon based on urgency
  let icon = '🎯';
  if (topAction.urgency === 'URGENT' || topAction.urgency === 'GRIND NOW') {
    icon = '⚡';
  } else if (topAction.urgency === 'BLOCKER') {
    icon = '🚨';
  }
  
  // Determine color based on urgency
  let color = 'from-blue-600 to-purple-600';
  if (topAction.urgency === 'URGENT' || topAction.urgency === 'GRIND NOW') {
    color = 'from-yellow-600 to-orange-600';
  } else if (topAction.urgency === 'BLOCKER') {
    color = 'from-red-600 to-orange-600';
  }
  
  return {
    type: actionType,
    title: topAction.title,
    reason: topAction.why,
    icon: icon,
    color: color,
    time: topAction.timeToComplete || null,
    steps: topAction.method || topAction.why,
  };
};
