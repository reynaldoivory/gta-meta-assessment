// src/utils/taskMetrics.js
// Calculate TRUE efficiency metrics - Returns per-minute values to compare apples-to-apples
//
// Usage Example:
//   const task = {
//     id: 'cayo_perico',
//     name: 'Cayo Perico Heist',
//     basePayout: 1500000,
//     baseDuration: 60, // minutes
//   };
//   
//   const userStats = {
//     flying: 2,    // 2/5 bars = 40%
//     strength: 3,  // 3/5 bars = 60%
//     stealth: 2,   // 2/5 bars = 40%
//   };
//   
//   const metrics = calculateTaskMetrics(task, userStats);
//   const display = displayTaskEfficiency(task, userStats);
//   
//   // Output:
//   // {
//   //   label: 'Cayo Perico Heist',
//   //   payout: '$1,500,000',
//   //   duration: '70 mins (adjusted for Flying 2/5)',
//   //   efficiency: '$21,428/min',
//   //   hourlyRate: '($1.3M/hr)',
//   //   confidence: 'medium',
//   //   warning: '⚠️ 30% estimated failure rate'
//   // }

import { TASK_REQUIREMENTS } from '../config/gatekeeperSchema.js';
import { validateStat } from './assessmentHelpers.js';
import { applyWeeklyBoosts } from './actionPlanBuilder.ts';
import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';

/**
 * Calculate failure rate based on skill gaps
 * @param {Object} task - Task object with id, requirements
 * @param {Object} userStats - User stats object { flying, strength, shooting, stealth, etc. }
 * @returns {number} Failure rate (0-0.5, capped at 50%)
 */
export const calculateFailureRate = (task, userStats) => {
  let failureRate = 0;
  
  // Get requirements from gatekeeper schema
  const taskId = task.id || task.eventId || '';
  const requirements = TASK_REQUIREMENTS[taskId];
  
  if (requirements && requirements.soft_gates) {
    requirements.soft_gates.forEach(gate => {
      const userStatPercent = validateStat(userStats[gate.stat] || 0);
      const requiredPercent = gate.min || 0;
      
      if (userStatPercent < requiredPercent) {
        const gap = requiredPercent - userStatPercent;
        const gapBars = gap / 20; // Convert percentage gap to bars
        
        // Penalty based on severity
        let penaltyPerBar = 0.10; // Default 10% failure per missing bar
        if (gate.penalty === 'critical') penaltyPerBar = 0.20; // 20% per bar
        if (gate.penalty === 'high') penaltyPerBar = 0.15;     // 15% per bar
        if (gate.penalty === 'medium') penaltyPerBar = 0.10;    // 10% per bar
        if (gate.penalty === 'low') penaltyPerBar = 0.05;       // 5% per bar
        
        failureRate += gapBars * penaltyPerBar;
      }
    });
  }
  
  // Also check task.requirements if provided directly
  if (task.requirements) {
    Object.entries(task.requirements).forEach(([stat, requiredBars]) => {
      const userStatBars = userStats[stat] || 0;
      const gap = Math.max(0, requiredBars - userStatBars);
      
      // Default penalty rates
      if (stat === 'flying') {
        failureRate += gap * 0.15; // 15% failure per missing bar
      } else if (stat === 'combat' || stat === 'strength' || stat === 'shooting') {
        failureRate += gap * 0.10; // 10% failure per missing bar
      } else {
        failureRate += gap * 0.08; // 8% failure per missing bar
      }
    });
  }
  
  return Math.min(failureRate, 0.5); // Cap at 50% failure
};

/**
 * Calculate adjusted duration based on user skill
 * @param {Object} task - Task object with id, baseDuration
 * @param {Object} userStats - User stats object
 * @returns {number} Adjusted duration in minutes
 */
const calculateAdjustedDuration = (task, userStats) => {
  let adjustedDuration = task.baseDuration || task.estimatedMinutes || 60;
  const taskId = task.id || task.eventId || '';
  
  // Cayo Perico specific adjustments
  if (taskId === 'cayo_perico' || taskId.includes('cayo')) {
    const flyingBars = userStats.flying || 0;
    const flyingPercent = validateStat(flyingBars);
    
    // Flying skill affects setup time (helicopter travel)
    if (flyingPercent < 80) {
      const flyingPenalty = Math.max(0, (4 - flyingBars) * 5); // +5 mins per missing bar below 4/5
      adjustedDuration += flyingPenalty;
    }
    
    // Stealth skill affects completion time
    const stealthBars = userStats.stealth || 0;
    const stealthPercent = validateStat(stealthBars);
    if (stealthPercent < 60) {
      const stealthPenalty = Math.max(0, (3 - stealthBars) * 3); // +3 mins per missing bar below 3/5
      adjustedDuration += stealthPenalty;
    }
    
    // Strength affects combat time if stealth fails
    const strengthBars = userStats.strength || 0;
    const strengthPercent = validateStat(strengthBars);
    if (strengthPercent < 60) {
      const strengthPenalty = Math.max(0, (3 - strengthBars) * 2); // +2 mins per missing bar
      adjustedDuration += strengthPenalty * 0.5; // Only applies if stealth fails
    }
  }
  
  // Auto Shop Contracts - combat skill affects time
  if (taskId.includes('auto_shop') || taskId.includes('robbery')) {
    const strengthBars = userStats.strength || 0;
    const shootingBars = userStats.shooting || 0;
    const strengthPercent = validateStat(strengthBars);
    const shootingPercent = validateStat(shootingBars);
    
    if (strengthPercent < 60) {
      adjustedDuration += Math.max(0, (3 - strengthBars) * 2);
    }
    if (shootingPercent < 50) {
      adjustedDuration += Math.max(0, (2.5 - shootingBars) * 1.5);
    }
  }
  
  // Business Battles - flying skill affects travel time
  if (taskId.includes('business_battle') || taskId.includes('business battle')) {
    const flyingBars = userStats.flying || 0;
    const flyingPercent = validateStat(flyingBars);
    if (flyingPercent < 40) {
      adjustedDuration += Math.max(0, (2 - flyingBars) * 3);
    }
  }
  
  return Math.max(adjustedDuration, 1); // Minimum 1 minute
};

/**
 * Calculate TRUE efficiency metrics
 * Returns per-minute values to compare apples-to-apples
 * @param {Object} task - Task object with basePayout, baseDuration, id, etc.
 * @param {Object} userStats - User stats object { flying, strength, shooting, stealth, etc. }
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object (optional, defaults to imported)
 * @param {Object} user - User object with gtaPlus flag (optional)
 * @returns {Object} Metrics object
 */
export const calculateTaskMetrics = (task, userStats, weeklyEvents = WEEKLY_EVENTS, user = {}) => {
  // Base payout
  let adjustedPayout = task.basePayout || 0;
  
  // Apply weekly boosts
  const boost = applyWeeklyBoosts(task, weeklyEvents, user);
  if (boost.multiplier > 1) {
    adjustedPayout *= boost.multiplier;
  }
  
  // Adjust duration based on user skill
  const adjustedDuration = calculateAdjustedDuration(task, userStats);
  
  // Calculate failure rate
  const failureRate = calculateFailureRate(task, userStats);
  
  // Effective duration accounts for retries due to failures
  // Formula: baseDuration / (1 - failureRate)
  // If failureRate = 0.3, effectiveDuration = baseDuration / 0.7 = 1.43x longer
  const effectiveDuration = failureRate > 0 
    ? adjustedDuration / (1 - failureRate)
    : adjustedDuration;
  
  // Calculate efficiency metrics
  const payoutPerMinute = effectiveDuration > 0 
    ? adjustedPayout / effectiveDuration 
    : 0;
  const payoutPerHour = payoutPerMinute * 60;
  
  // Determine confidence level
  let confidence = 'high';
  if (failureRate >= 0.3) {
    confidence = 'low';
  } else if (failureRate >= 0.1) {
    confidence = 'medium';
  }
  
  return {
    payoutPerMinute,
    payoutPerHour,
    effectiveDuration: Math.round(effectiveDuration * 10) / 10, // Round to 1 decimal
    adjustedDuration: Math.round(adjustedDuration * 10) / 10,
    failureRate: Math.round(failureRate * 100) / 100, // Round to 2 decimals
    confidence,
    boostMultiplier: boost.multiplier,
    boostTimeRemaining: boost.timeRemaining,
    adjustedPayout,
  };
};

/**
 * Format task efficiency for display
 * @param {Object} task - Task object
 * @param {Object} userStats - User stats object
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object (optional)
 * @param {Object} user - User object (optional)
 * @returns {Object} Formatted display object
 */
export const displayTaskEfficiency = (task, userStats, weeklyEvents = WEEKLY_EVENTS, user = {}) => {
  const metrics = calculateTaskMetrics(task, userStats, weeklyEvents, user);
  
  // Format duration
  const durationDisplay = metrics.adjustedDuration !== metrics.effectiveDuration
    ? `${Math.round(metrics.adjustedDuration)} mins (${Math.round(metrics.effectiveDuration)} effective)`
    : `${Math.round(metrics.adjustedDuration)} mins`;
  
  // Format payout
  const payoutDisplay = metrics.boostMultiplier > 1
    ? `$${metrics.adjustedPayout.toLocaleString()} (${metrics.boostMultiplier}x Event)`
    : `$${metrics.adjustedPayout.toLocaleString()}`;
  
  // Format efficiency
  const efficiencyDisplay = `$${Math.round(metrics.payoutPerMinute).toLocaleString()}/min`;
  
  // Format hourly rate (in thousands)
  const hourlyRateDisplay = `($${Math.round(metrics.payoutPerHour / 1000)}k/hr)`;
  
  // Generate warnings
  const warnings = [];
  
  if (metrics.failureRate > 0.2) {
    warnings.push(`⚠️ ${Math.round(metrics.failureRate * 100)}% estimated failure rate`);
  }
  
  if (metrics.boostTimeRemaining && metrics.boostTimeRemaining < 48 * 60 * 60 * 1000) {
    const hoursLeft = Math.round(metrics.boostTimeRemaining / (1000 * 60 * 60));
    warnings.push(`⏰ ${metrics.boostMultiplier}x bonus expires in ${hoursLeft} hours`);
  }
  
  // Confidence indicator
  const confidenceEmoji = {
    high: '✅',
    medium: '⚠️',
    low: '❌',
  };
  
  return {
    label: task.name || task.title || 'Unknown Task',
    payout: payoutDisplay,
    duration: durationDisplay,
    efficiency: efficiencyDisplay,
    hourlyRate: hourlyRateDisplay,
    confidence: metrics.confidence,
    confidenceEmoji: confidenceEmoji[metrics.confidence],
    warning: warnings.length > 0 ? warnings.join(' - ') : null,
    metrics, // Include raw metrics for advanced use
  };
};

/**
 * Compare multiple tasks and return sorted by efficiency
 * @param {Array} tasks - Array of task objects
 * @param {Object} userStats - User stats object
 * @param {Object} weeklyEvents - WEEKLY_EVENTS object (optional)
 * @param {Object} user - User object (optional)
 * @returns {Array} Sorted array of tasks with metrics
 */
export const compareTaskEfficiency = (tasks, userStats, weeklyEvents = WEEKLY_EVENTS, user = {}) => {
  return tasks
    .map(task => ({
      ...task,
      metrics: calculateTaskMetrics(task, userStats, weeklyEvents, user),
      display: displayTaskEfficiency(task, userStats, weeklyEvents, user),
    }))
    .sort((a, b) => b.metrics.payoutPerMinute - a.metrics.payoutPerMinute);
};
