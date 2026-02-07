// src/utils/recommendationEngine.js
// Generate prioritized recommendations combining opportunities, efficiency, and ROI

import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';
import { CURRENT_WEEKLY_EVENTS } from '../data/weeklyEvents.js';
import { detectCriticalOpportunities } from './priorityDetector.js';
import { calculateCompoundEfficiency } from './actionPlanBuilder.js';
import { calculateTaskMetrics } from './taskMetrics.js';
import { validateStat } from './assessmentHelpers.js';
import { TASK_REQUIREMENTS } from '../config/gatekeeperSchema.js';
import { MODEL_CONFIG } from './modelConfig.js';
import { getNightclubTechnicianCost } from './infrastructureAdvisor.js';

/**
 * Get weekly events - uses current data from weeklyEvents.js
 * Falls back to config/weeklyEvents.js if needed
 * @returns {Promise<Object>} Weekly events object
 */
export const getWeeklyEvents = async () => {
  // Use the current weekly events data (updated every Thursday)
  // Falls back to config if data file has issues
  return CURRENT_WEEKLY_EVENTS || WEEKLY_EVENTS;
};

/**
 * Calculate ROI for skill training
 * @param {string} skill - Skill name (flying, stealth, strength, etc.)
 * @param {number} currentBars - Current skill level (1-5 bars)
 * @param {number} targetBars - Target skill level (1-5 bars)
 * @param {Object} user - User object with formData
 * @returns {Object|null} ROI calculation or null if not worth it
 */
export const calculateTrainingROI = (skill, currentBars, targetBars, user) => {
  if (currentBars >= targetBars) return null;
  
  const formData = user.formData || user;
  const currentPercent = validateStat(currentBars);
  const targetPercent = validateStat(targetBars);
  const gap = targetPercent - currentPercent;
  
  // Estimate training time (in minutes)
  const trainingTimeMap = {
    flying: 30,      // Flight School lessons
    stealth: 45,     // Stealth missions/practice
    strength: 60,    // Pier Pressure mission
    shooting: 40,    // Shooting range
    driving: 30,    // Races
    stamina: 45,     // Running/swimming
  };
  
  const trainingTime = trainingTimeMap[skill] || 45;
  
  // Calculate value gain from improved efficiency
  // Find tasks that benefit from this skill
  let weeklyValueGain = 0;
  const tasksPerWeek = 10; // Estimate user does ~10 tasks per week
  
  Object.entries(TASK_REQUIREMENTS).forEach(([taskId, requirements]) => {
    const relevantGate = requirements.soft_gates?.find(g => g.stat === skill);
    if (relevantGate) {
      const currentGap = Math.max(0, relevantGate.min - currentPercent);
      const targetGap = Math.max(0, relevantGate.min - targetPercent);
      
      if (currentGap > 0 && targetGap < currentGap) {
        // Skill improvement reduces failure rate
        const failureReduction = (currentGap - targetGap) / 20; // Convert to bars
        const penaltyPerBar = relevantGate.penalty === 'critical' ? 0.20 :
                              relevantGate.penalty === 'high' ? 0.15 :
                              relevantGate.penalty === 'medium' ? 0.10 : 0.05;
        
        // Estimate task value (rough average)
        const avgTaskValue = 500000; // $500k average task
        const efficiencyGain = failureReduction * penaltyPerBar;
        weeklyValueGain += avgTaskValue * efficiencyGain * 0.1; // 10% of tasks benefit
      }
    }
  });
  
  // Calculate payback time (in weeks)
  const paybackTime = trainingTime > 0 && weeklyValueGain > 0
    ? (trainingTime / 60) / (weeklyValueGain / 1000000) // Hours training / weekly value in millions
    : Infinity;
  
  // Determine recommendation
  let recommendation = 'SKIP';
  if (paybackTime < 1) {
    recommendation = 'DO IMMEDIATELY';
  } else if (paybackTime < 2) {
    recommendation = 'HIGH PRIORITY';
  } else if (paybackTime < 4) {
    recommendation = 'MEDIUM PRIORITY';
  }
  
  return {
    skill,
    currentBars,
    targetBars,
    currentPercent,
    targetPercent,
    gap,
    trainingTime,
    weeklyValueGain,
    paybackTime,
    recommendation,
  };
};

/**
 * Basic task database - common money-making activities
 * This can be extended or replaced with a more comprehensive database
 */
export const TASKS_DATABASE = [
  {
    id: 'cayo_perico',
    name: 'Cayo Perico Heist',
    basePayout: 700000,
    baseDuration: 60,
    category: 'heist',
    eventId: 'cayo_perico',
  },
  {
    id: 'auto_shop_contract',
    name: 'Auto Shop Robbery Contract',
    basePayout: 300000,
    baseDuration: 25,
    category: 'mission',
    eventId: 'auto_shop',
    tags: ['auto_shop', 'robbery contract'],
  },
  {
    id: 'business_battle',
    name: 'Business Battle (Freemode)',
    basePayout: 30000,
    baseDuration: 12,
    category: 'freemode',
    eventId: 'business_battles',
    tags: ['business_battles', 'freemode', 'repeatable', 'pvp'],
    description: 'Compete for special cargo in freemode',
    nightclubGoodsValue: 10000,
  },
  {
    id: 'nightclub_sell',
    name: 'Nightclub Goods Sale',
    basePayout: 500000, // Default if no accumulated value
    baseDuration: 10,
    category: 'passive',
    eventId: 'nightclub_sell',
    tags: ['nightclub_goods'],
    dynamicPayout: true, // Uses accumulated value from gameState
  },
  {
    id: 'payphone_hit',
    name: 'Payphone Hit',
    basePayout: 85000,
    baseDuration: 5,
    category: 'mission',
    eventId: 'payphone_hit',
  },
  {
    id: 'paper_trail',
    name: 'Operation Paper Trail',
    basePayout: 40000,
    baseDuration: 15,
    category: 'mission',
    eventId: 'paper_trail',
    tags: ['paper_trail'],
  },
  {
    id: 'mansion_raid',
    name: 'Mansion Raid',
    basePayout: 50000,
    baseDuration: 20,
    category: 'pvp',
    eventId: 'mansion_raid',
    tags: ['mansion_raid', 'pvp', 'new_mode'],
    description: 'New PvP mode with first-win bonus',
    firstWinBonus: true,
  },
  {
    id: 'auto_shop_union_depository',
    name: 'Auto Shop: Union Depository Contract',
    basePayout: 300000,
    baseDuration: 25,
    category: 'heist',
    eventId: 'auto_shop_finales',
    tags: ['auto_shop_finales', 'solo_friendly', 'gta_plus'],
    description: 'Highest paying Auto Shop finale',
    requiresGtaPlus: true,
  },
];

/**
 * Detect missing upgrades that are bleeding passive income
 * @param {Object} user - User object with formData
 * @param {Object} gameState - Game state object
 * @returns {Array} Array of upgrade opportunities
 */
const detectMissingUpgrades = (user, gameState = {}) => {
  const formData = user.formData || user;
  const upgrades = [];
  
  // Bunker without upgrades (values from MODEL_CONFIG single source of truth)
  if (formData.hasBunker && !formData.bunkerUpgraded) {
    const bunkerBase = MODEL_CONFIG.income.bunker.unupgraded.perHour;
    const bunkerMax = MODEL_CONFIG.income.bunker.upgraded.perHour;
    const bunkerUpgradeCost = MODEL_CONFIG.income.passive.bunkerUpgradeCost;
    const bunkerHourlyLoss = bunkerMax - bunkerBase;
    upgrades.push({
      id: 'bunker_upgrades',
      name: 'Bunker Equipment + Staff Upgrades',
      cost: bunkerUpgradeCost,
      hourlyLoss: bunkerHourlyLoss,
      roiHours: Math.ceil(bunkerUpgradeCost / bunkerHourlyLoss),
    });
  }
  
  // Acid Lab without upgrades (values from MODEL_CONFIG single source of truth)
  if (formData.hasAcidLab && !formData.acidLabUpgraded) {
    const acidBase = MODEL_CONFIG.income.passive.acidLabBase;
    const acidUpgradeMult = MODEL_CONFIG.income.passive.acidLabUpgrade;
    const acidUpgradeCost = MODEL_CONFIG.income.passive.acidLabUpgradeCost;
    const acidHourlyLoss = Math.round(acidBase * acidUpgradeMult - acidBase);
    upgrades.push({
      id: 'acid_lab_upgrades',
      name: 'Acid Lab Equipment Upgrade',
      cost: acidUpgradeCost,
      hourlyLoss: acidHourlyLoss,
      roiHours: Math.ceil(acidUpgradeCost / acidHourlyLoss),
    });
  }
  
  // Nightclub with < 5 technicians
  const nightclubTechs = Number(formData.nightclubTechs) || 0;
  if (formData.hasNightclub && nightclubTechs < 5) {
    const missingTechs = 5 - nightclubTechs;
    upgrades.push({
      id: 'nightclub_technicians',
      name: `Hire ${missingTechs} More Nightclub Technician${missingTechs > 1 ? 's' : ''}`,
      cost: getNightclubTechnicianCost(nightclubTechs, 5),
      hourlyLoss: missingTechs * 10000, // ~$10k/hour per missing tech
      roiHours: 15,
    });
  }
  
  return upgrades;
};

/**
 * Detect asset synergies with current events
 * @param {Object} user - User object with formData
 * @param {Object} weeklyEvents - Weekly events data
 * @param {Array} tasks - All tasks with calculated efficiencies
 * @returns {Array} Array of synergy boosts
 */
const detectAssetSynergies = (user, weeklyEvents, tasks) => {
  const formData = user.formData || user;
  const synergies = [];
  
  // Nightclub + 4x Business Battles = compound value
  if (formData.hasNightclub) {
    const bbBoost = weeklyEvents.bonuses?.businessBattles || 
                    weeklyEvents.activeBoosts?.find(b => b.activity === 'business_battles');
    
    if (bbBoost && (bbBoost.multiplier >= 4 || bbBoost.isActive)) {
      synergies.push({
        activity: 'business_battles',
        bonus: 5000, // Extra priority score
        reason: '🏪 You own Nightclub - 4x goods value stacks!',
        compoundValue: 40000, // Extra $40k goods per battle
      });
    }
    
    // Nightclub + 4x Goods sale
    const ncBoost = weeklyEvents.bonuses?.nightclubGoods ||
                    weeklyEvents.activeBoosts?.find(b => b.activity === 'nightclub_goods');
    
    if (ncBoost && (ncBoost.multiplier >= 4 || ncBoost.isActive)) {
      synergies.push({
        activity: 'nightclub_goods',
        bonus: 8000,
        reason: '🏪 Your Nightclub goods are worth 4x this week!',
        compoundValue: 0, // Dynamic based on accumulated goods
      });
    }
  }
  
  // Auto Shop + GTA+ 2x
  if (formData.hasAutoShop && formData.hasGTAPlus) {
    const asBoost = weeklyEvents.gtaPlus?.monthlyBonuses?.find(b => 
      b.activity === 'auto_shop_finales'
    );
    
    if (asBoost) {
      synergies.push({
        activity: 'auto_shop_finales',
        bonus: 6000,
        reason: '⭐ GTA+ 2x bonus on Auto Shop = $600k per finale!',
        compoundValue: 300000,
      });
    }
  }
  
  return synergies;
};

/**
 * Generate prioritized recommendations
 * @param {Object} user - User object with formData and stats
 * @param {Object} gameState - Game state object (optional)
 * @returns {Promise<Array>} Sorted array of recommendations (top 5)
 */
export const generateRecommendations = async (user = {}, gameState = {}) => {
  // 1. Load current weekly events
  const weeklyEvents = await getWeeklyEvents();
  
  // 2. Detect time-sensitive opportunities
  // Create user object compatible with priorityDetector
  const userForDetector = {
    formData: {
      ...(user.formData || user),
      hasGTAPlus: user.gtaPlus || user.formData?.hasGTAPlus || user.formData?.gtaPlus || false,
      claimedFreeCar: user.formData?.claimedFreeCar || false,
    },
  };
  const criticalOpportunities = detectCriticalOpportunities(weeklyEvents, userForDetector, gameState);
  
  // 3. Calculate all task efficiencies with current bonuses
  // Support both formData wrapper and flat user structure
  const formData = user.formData || user;
  const stats = user.stats || formData.stats || {};
  
  // Map user structure to expected format
  const userStats = {
    flying: stats.flying || formData.flying || 0,
    strength: stats.strength || formData.strength || 0,
    shooting: stats.shooting || formData.shooting || (stats.combat || 0), // Support combat as shooting
    stealth: stats.stealth || formData.stealth || 0,
    stamina: stats.stamina || formData.stamina || 0,
    driving: stats.driving || formData.driving || 0,
  };
  
  // Create user object with formData structure for compatibility
  const userWithFormData = {
    formData: {
      ...formData,
      ...stats,
      flying: userStats.flying,
      strength: userStats.strength,
      shooting: userStats.shooting,
      stealth: userStats.stealth,
      stamina: userStats.stamina,
      driving: userStats.driving,
      hasGTAPlus: user.gtaPlus || formData.hasGTAPlus || formData.gtaPlus || false,
      hasKosatka: user.owns?.kosatka || formData.hasKosatka || false,
      hasAgency: user.owns?.agency || formData.hasAgency || false,
      hasAcidLab: user.owns?.acidLab || formData.hasAcidLab || false,
      acidLabUpgraded: formData.acidLabUpgraded || false,
      hasNightclub: user.owns?.nightclub || formData.hasNightclub || false,
      nightclubTechs: formData.nightclubTechs || user.nightclubTechs || 0,
      hasAutoShop: user.owns?.autoShop || formData.hasAutoShop || false,
      hasBunker: user.owns?.bunker || formData.hasBunker || false,
      bunkerUpgraded: formData.bunkerUpgraded || user.bunkerUpgraded || false,
      claimedFreeCar: formData.claimedFreeCar || false,
    },
  };
  
  const allTasks = TASKS_DATABASE.map(task => {
    try {
      // For dynamic payout tasks, use gameState value instead of basePayout
      let taskWithDynamicPayout = task;
      if (task.dynamicPayout && gameState?.businesses?.nightclub?.accumulatedValue) {
        taskWithDynamicPayout = {
          ...task,
          basePayout: gameState.businesses.nightclub.accumulatedValue,
        };
      }
      
      const efficiency = calculateCompoundEfficiency(taskWithDynamicPayout, userWithFormData, gameState, weeklyEvents);
      const metrics = calculateTaskMetrics(taskWithDynamicPayout, userStats, weeklyEvents, userWithFormData);
      return {
        ...taskWithDynamicPayout,
        ...efficiency,
        metrics,
        category: efficiency.gatekeeperResult?.status === 'LOCKED' ? 'blocked' : task.category,
      };
    } catch (error) {
      console.warn(`Error calculating efficiency for task ${task.id}:`, error);
      return {
        ...task,
        score: 0,
        reasoning: ['Error calculating efficiency'],
        warnings: [],
        metrics: { payoutPerHour: 0, effectiveDuration: 0 },
        category: 'blocked',
      };
    }
  });
  
  // 4. Calculate skill training ROI
  const allSkillROIs = [
    calculateTrainingROI('flying', userStats.flying, 4, userWithFormData),
    calculateTrainingROI('stealth', userStats.stealth, 4, userWithFormData),
    calculateTrainingROI('strength', userStats.strength, 3, userWithFormData),
    calculateTrainingROI('shooting', userStats.shooting, 3, userWithFormData),
  ].filter(roi => roi !== null);
  
  // Include skills that pay back in < 4 weeks OR are critically low (< 3 bars)
  const skillImprovements = allSkillROIs.filter(roi => {
    // Always include if skill is critically low
    if (roi.skill === 'flying' && roi.currentBars < 3) return true;
    if (roi.skill === 'stealth' && roi.currentBars < 3) return true;
    // Otherwise filter by payback time
    return roi.paybackTime < 4;
  });
  
  // 5. Detect missing upgrades (opportunity cost)
  const upgradeOpportunities = detectMissingUpgrades(userWithFormData, gameState);
  
  // 6. Detect asset synergies (e.g., nightclub + 4x Business Battles)
  const synergyBoosts = detectAssetSynergies(userWithFormData, weeklyEvents, allTasks);
  
  // 7. Combine and prioritize
  const recommendations = [
    // ONE-TIME BONUSES FIRST (expiring soon = CRITICAL)
    ...criticalOpportunities
      .filter(opp => opp.type === 'one_time_bonus')
      .map(opp => ({
        ...opp,
        effectiveValue: opp.task.reward || 0,
        timeInvestment: opp.task.duration || 20,
        // Expiring bonuses = FREE MONEY, always highest priority
        score: opp.task.timeLeft && opp.task.timeLeft < 48 ? 60000 : 
               opp.task.timeLeft && opp.task.timeLeft < 72 ? 55000 : 
               opp.task.timeLeft && opp.task.timeLeft < 120 ? 45000 : 20000,
        // Any expiring bonus < 5 days = CRITICAL (free money shouldn't be missed)
        priority: opp.task.timeLeft && opp.task.timeLeft < 120 ? 'critical' : 'high',
      })),
    
    // SKILL TRAINING (foundational fixes - boost if critically low)
    ...skillImprovements.map(roi => {
      // Flying < 3 is CRITICAL blocker for efficiency - affects Cayo, Business Battles, etc.
      const isCriticalSkill = (roi.skill === 'flying' && roi.currentBars < 3) ||
                              (roi.skill === 'stealth' && roi.currentBars < 3);
      // Base weekly value gain - if ROI calculation returned 0, estimate conservatively
      const weeklyGain = roi.weeklyValueGain > 0 ? roi.weeklyValueGain : 
                         (roi.skill === 'flying' ? 250000 : 100000); // Flying saves time = money
      return {
        type: 'skill_training',
        priority: isCriticalSkill ? 'critical' : 
                  roi.recommendation === 'DO IMMEDIATELY' ? 'high' : 'medium',
        task: {
          id: `train_${roi.skill}`,
          name: roi.skill === 'flying' ? 'San Andreas Flight School' : 
                `${roi.skill.charAt(0).toUpperCase() + roi.skill.slice(1)} Training`,
          timeLeft: null,
          duration: roi.trainingTime,
        },
        reasoning: isCriticalSkill 
          ? '[!] LOW ' + roi.skill.toUpperCase() + ' (' + roi.currentBars + '/5) - Hurting Cayo/heist efficiency. Pays $250k + saves 20+ mins/run'
          : '+$' + Math.round(weeklyGain / 1000) + 'k/week forever (' + roi.paybackTime.toFixed(1) + ' week payback)',
        effectiveValue: weeklyGain * 4,
        timeInvestment: roi.trainingTime,
        // Critical skills get score 25000 to appear right after one-time bonuses
        score: isCriticalSkill ? 25000 : 
               roi.recommendation === 'DO IMMEDIATELY' ? 8000 : 4000,
        metrics: {
          payoutPerHour: (weeklyGain * 4) / (roi.trainingTime / 60),
          effectiveDuration: roi.trainingTime,
        },
      };
    }),
    
    // EXPIRING HIGH-MULTIPLIER EVENTS (with synergy boost)
    ...criticalOpportunities
      .filter(opp => opp.type === 'expiring_event')
      .map(opp => {
        // Check for asset synergy (e.g., own nightclub + 4x Business Battles)
        const synergy = synergyBoosts.find(s => s.activity === opp.task.activity);
        const synergyBoost = synergy ? synergy.bonus : 0;
        return {
          ...opp,
          effectiveValue: (opp.task.multiplier || 1) * 30000 + synergyBoost,
          timeInvestment: opp.task.duration || 15,
          score: opp.task.multiplier >= 4 ? 12000 + synergyBoost : 
                 opp.task.multiplier >= 3 ? 9000 + synergyBoost : 6000,
          reasoning: synergy 
            ? `${opp.reasoning} + ${synergy.reason}`
            : opp.reasoning,
        };
      }),
    
    // MISSING UPGRADES (opportunity cost - bleeding money every hour!)
    ...upgradeOpportunities.map(upgrade => ({
      type: 'upgrade_needed',
      priority: upgrade.hourlyLoss >= 40000 ? 'high' : 'medium',
      task: {
        id: upgrade.id,
        name: upgrade.name,
        duration: 5, // Upgrades are instant after purchase
      },
      reasoning: `⚠️ Losing $${Math.round(upgrade.hourlyLoss / 1000)}k/hour = $${Math.round(upgrade.hourlyLoss * 24 / 1000)}k/day without upgrades. ROI: ${upgrade.roiHours} hours`,
      effectiveValue: upgrade.hourlyLoss * 24, // Daily value
      timeInvestment: 5,
      // Bunker losing $40k/hr gets score 15000 to show importance
      score: upgrade.hourlyLoss >= 40000 ? 15000 : 
             upgrade.hourlyLoss >= 20000 ? 10000 : 5000,
      cost: upgrade.cost,
    })),
    
    // TOP MONEY-MAKING TASKS
    ...allTasks
      .filter(t => t.category !== 'blocked' && t.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(task => {
        // Check for event boost
        const hasEventBoost = task.multiplier && task.multiplier > 1;
        return {
          type: 'money_grind',
          priority: hasEventBoost ? 'high' : 
                    task.category === 'passive' && task.urgency === 'URGENT' ? 'critical' : 'medium',
          task: {
            id: task.id,
            name: task.name,
            timeLeft: task.timeRemaining ? task.timeRemaining / (1000 * 60 * 60) : null,
            duration: task.metrics?.effectiveDuration || task.baseDuration || 60,
          },
          reasoning: hasEventBoost 
            ? `${task.multiplier}x Event! ${Array.isArray(task.reasoning) ? task.reasoning.join('; ') : (task.reasoning || '')}`
            : Array.isArray(task.reasoning) ? task.reasoning.join('; ') : (task.reasoning || ''),
          // Use task.score (actual payout with multiplier) for effectiveValue
          effectiveValue: task.score || task.metrics?.adjustedPayout || 0,
          timeInvestment: task.metrics?.effectiveDuration || task.baseDuration || 60,
          score: hasEventBoost ? (task.score || 0) + 5000 : task.score || 0,
          // Keep hourly rate in metrics for formatted display
          hourlyRate: task.metrics?.payoutPerHour || 0,
          metrics: task.metrics,
          warnings: task.warnings || [],
        };
      }),
    
    // DISCOUNTS (if user needs the item)
    ...criticalOpportunities
      .filter(opp => opp.type === 'limited_discount')
      .map(opp => ({
        ...opp,
        effectiveValue: opp.task.savings || 0,
        timeInvestment: 5,
        score: opp.task.savings > 500000 ? 6000 : 3000,
      })),
  ];
  
  // 8. DEDUPLICATION - Remove duplicate recommendations
  const seenIds = new Set();
  const seenActivities = new Set();
  
  // First pass: collect activities from one_time_bonus (highest priority)
  recommendations
    .filter(rec => rec.type === 'one_time_bonus')
    .forEach(rec => {
      const activity = rec.task?.activity || rec.task?.id?.replace(/_first_win.*$/, '') || '';
      if (activity) seenActivities.add(activity);
    });
  
  const deduplicatedRecs = recommendations.filter(rec => {
    const id = rec.task?.id || rec.task?.name || JSON.stringify(rec.task);
    
    // Skip if we've seen this exact ID
    if (seenIds.has(id)) return false;
    
    // For money_grind, skip if we already have a one_time_bonus for same activity
    if (rec.type === 'money_grind') {
      const taskActivity = rec.task?.id || '';
      if (seenActivities.has(taskActivity)) return false;
    }
    
    seenIds.add(id);
    return true;
  });
  
  // 9. Sort by priority tiers
  deduplicatedRecs.sort((a, b) => {
    // TIER 1: Critical priority first
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
    
    // TIER 2: Within same priority level
    if (a.priority === b.priority) {
      // One-time bonuses always first within tier (free money expires)
      if (a.type === 'one_time_bonus' && b.type !== 'one_time_bonus') return -1;
      if (b.type === 'one_time_bonus' && a.type !== 'one_time_bonus') return 1;
      
      // Between one-time bonuses, sort by expiry (soonest first)
      if (a.type === 'one_time_bonus' && b.type === 'one_time_bonus') {
        if (a.task.timeLeft && b.task.timeLeft) {
          return a.task.timeLeft - b.task.timeLeft;
        }
      }
      
      // Skill training before money grinds (foundational)
      if (a.type === 'skill_training' && b.type === 'money_grind') return -1;
      if (b.type === 'skill_training' && a.type === 'money_grind') return 1;
      
      // Expiring events before non-expiring
      if (a.task?.timeLeft && !b.task?.timeLeft) return -1;
      if (b.task?.timeLeft && !a.task?.timeLeft) return 1;
      
      // Between expiring events, soonest first
      if (a.task?.timeLeft && b.task?.timeLeft) {
        return a.task.timeLeft - b.task.timeLeft;
      }
    }
    
    // TIER 3: High priority next
    if (a.priority === 'high' && b.priority !== 'high' && b.priority !== 'critical') return -1;
    if (b.priority === 'high' && a.priority !== 'high' && a.priority !== 'critical') return 1;
    
    // TIER 4: By score (captures multipliers, synergies)
    if (a.score && b.score && a.score !== b.score) {
      return b.score - a.score;
    }
    
    // TIER 5: By value-per-minute
    const aValuePerMin = a.effectiveValue && a.timeInvestment 
      ? a.effectiveValue / a.timeInvestment 
      : 0;
    const bValuePerMin = b.effectiveValue && b.timeInvestment 
      ? b.effectiveValue / b.timeInvestment 
      : 0;
    
    return bValuePerMin - aValuePerMin;
  });
  
  return deduplicatedRecs.slice(0, 5); // Top 5 recommendations
};

/**
 * Get recommendations formatted for display
 * @param {Object} user - User object
 * @param {Object} gameState - Game state object (optional)
 * @returns {Promise<Array>} Formatted recommendations
 */
export const getFormattedRecommendations = async (user = {}, gameState = {}) => {
  const recommendations = await generateRecommendations(user, gameState);
  
  return recommendations.map(rec => {
    const base = {
      type: rec.type,
      priority: rec.priority,
      label: rec.task?.name || rec.task?.id || 'Unknown',
      title: rec.task?.name || rec.task?.id || 'Unknown', // Keep for backward compatibility
      reasoning: rec.reasoning || '',
      urgency: rec.urgency || rec.task?.urgency || '',
    };
    
    // Add type-specific formatting with icons
    if (rec.type === 'one_time_bonus') {
      return {
        ...base,
        icon: '🎁',
        value: `$${rec.task.reward?.toLocaleString() || 0}`,
        timeLeft: rec.task.timeLeft ? `${Math.round(rec.task.timeLeft)} hours` : null,
        action: 'Claim Bonus',
        description: rec.reasoning,
      };
    }
    
    if (rec.type === 'expiring_event') {
      return {
        ...base,
        icon: '⚡',
        value: `${rec.task.multiplier}x multiplier`,
        timeLeft: rec.task.timeLeft ? `${Math.round(rec.task.timeLeft)} hours` : null,
        action: 'Grind Now',
        description: rec.reasoning,
      };
    }
    
    if (rec.type === 'limited_discount') {
      return {
        ...base,
        icon: '💰',
        value: `Save $${Math.round(rec.task.savings / 1000)}k`,
        timeLeft: rec.task.timeLeft ? `${Math.round(rec.task.timeLeft)} hours` : null,
        action: 'Buy Now',
        description: rec.reasoning,
      };
    }
    
    if (rec.type === 'gta_plus_free_vehicle') {
      return {
        ...base,
        icon: '🚗',
        value: rec.task.vehicle,
        action: 'Claim Vehicle',
        description: rec.reasoning,
      };
    }
    
    if (rec.type === 'skill_training') {
      return {
        ...base,
        icon: '📚',
        value: rec.reasoning,
        timeInvestment: `${rec.timeInvestment} minutes`,
        action: 'Start Training',
        description: `Improve ${rec.task.id.replace('train_', '')} skill`,
      };
    }
    
    if (rec.type === 'money_grind') {
      return {
        ...base,
        icon: '💵',
        value: rec.metrics?.payoutPerHour 
          ? `$${Math.round(rec.metrics.payoutPerHour / 1000)}k/hr` 
          : 'Unknown',
        timeInvestment: `${Math.round(rec.timeInvestment)} minutes`,
        action: 'Start Grind',
        description: rec.reasoning,
        warnings: rec.warnings || [],
      };
    }
    
    if (rec.type === 'upgrade_needed') {
      return {
        ...base,
        icon: '🔧',
        value: `Losing $${Math.round(rec.effectiveValue / 1000)}k/day`,
        cost: rec.cost ? `Cost: $${(rec.cost / 1000000).toFixed(1)}M` : null,
        action: 'Buy Upgrade',
        description: rec.reasoning,
      };
    }
    
    return {
      ...base,
      icon: '📋',
      description: rec.reasoning,
    };
  });
};
