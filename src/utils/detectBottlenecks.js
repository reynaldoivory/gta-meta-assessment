// src/utils/detectBottlenecks.js
// Bottleneck detection logic extracted from computeAssessment.js

import { WEEKLY_EVENTS, formatExpiry, getExpiryLabel } from '../config/weeklyEvents.js';
import { validateStat } from './assessmentHelpers.js';
import {
  INFRASTRUCTURE_COSTS,
  NIGHTCLUB_FLOOR_AFK,
  calculateBunkerLeak,
  calculateNightclubOptimization,
  getDiscountedPrice,
} from './infrastructureAdvisor.js';
import { MODEL_CONFIG } from './modelConfig.js';

// ============================================
// TIER 0: URGENT EXPIRING EVENTS (Front of queue)
// ============================================

const detectUrgentExpiring = (params, now, formData) => {
  const { hasGTAPlus } = params;
  const bottlenecks = [];

  // 1. FREE CAR WASH (expiry from WEEKLY_EVENTS config)
  if (!formData.hasCarWash) {
    const carWashBonus = WEEKLY_EVENTS.bonuses?.carWash;
    if (carWashBonus?.isActive) {
      const expiryDate = new Date(carWashBonus.validUntil).getTime();
      const hoursLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60));
      
      if (hoursLeft > 0) {
        bottlenecks.push({
          id: 'free_car_wash',
          label: '⚡ CLAIM FREE CAR WASH NOW',
          critical: true,
          urgent: true, // Sorter uses this
          impact: 'high',
          solution: 'Open Maze Bank Foreclosures → Claim Hands On Car Wash',
          actionType: 'property_claim',
          detail: `Expires in ${hoursLeft}hrs! Save $1.4M + earn 3X missions this week.`,
          timeHours: 0.1,
          expiresAt: expiryDate,
        });
      }
    }
  }

  // 1.5. FREE VEHICLE (GTA+ Only)
  // Only recommend if they have GTA+ AND haven't claimed it yet
  if (hasGTAPlus && !formData.claimedFreeCar) {
    const freeCarName = WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle';
    const freeCarValue = WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1600000;
    const freeCarLocation = WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'The Vinewood Car Club';
    bottlenecks.push({
      id: 'claim_free_car',
      label: `🎁 Claim Free ${freeCarName}`,
      critical: false,
      urgent: false, // Monthly benefit (no expiry rush)
      impact: 'low', // It's just a car, not income
      solution: `Visit ${freeCarLocation}`,
      actionType: 'vehicle_claim',
      detail: `Free $${(freeCarValue / 1000000).toFixed(1)}M vehicle for GTA+ members. Claim even if you won't drive it - free garage asset.`,
      timeHours: 0.1,
      savingsPerHour: 0, // No income gain, just asset value
      savingsValue: freeCarValue, // One-time savings (used by sorter if you add that logic)
    });
  }

  return bottlenecks;
};

// ============================================
// TIER 1: INCOME LEAKS (Costing you money every hour)
// ============================================

const detectIncomeLeaks = (params, now, activeEvents) => {
  const { rank, strength, playMode } = params;
  const isSoloPlayer = playMode === 'invite' || playMode === 'solo';
  const bottlenecks = [];

  // Build event lookups dynamically from whatever events are active this week
  const nightclubDiscountEvent = activeEvents.find(e => e.category === 'discount' && e.name.toLowerCase().includes('nightclub'));

  // Helper to process a single event
  function processEvent(event) {
    // Skip discount events (handled separately below) and GTA+ monthly events
    if (event.category === 'discount' || event.category === 'gtaplus') return;

    const expiryIso = event.expiryTimestamp
      ? new Date(event.expiryTimestamp).toISOString()
      : WEEKLY_EVENTS.meta.validUntil;

    // Play-mode filtering
    if (isSoloPlayer && event.requiresMultiplayer) {
      bottlenecks.push({
        id: `weekly_event_${event.name}`,
        label: `\u26A0\uFE0F ${event.label || event.name} (Requires Other Players)`,
        critical: false,
        urgent: false,
        impact: 'low',
        solution: event.soloNote || `This bonus requires other players and is not effective in ${playMode === 'invite' ? 'Invite Only' : 'Solo'} sessions.`,
        actionType: 'freemode',
        detail: `${getExpiryLabel(expiryIso)}. ${event.multiplier}X bonus active but requires multiplayer. Consider briefly joining a friend\u2019s org to earn the one-time challenge reward, then return to solo.`,
        timeHours: 0,
        savingsPerHour: 0,
        expiresAt: event.expiryTimestamp,
        eventTier: 3, // Demoted tier
        hoursLeft: event.hoursLeft,
        daysLeft: event.daysLeft,
        filteredByPlayMode: true,
      });
      return;
    }

    // Impact assessment
    let impactLevel = 'medium';
    if (
      event.highValue ||
      event.multiplier >= 3 ||
      event.hourlyRate >= 300000
    ) {
      impactLevel = 'high';
    }

    // Solution text
    let solutionText = `Take advantage of ${event.label || event.name} before it expires.`;
    if (isSoloPlayer && event.soloTip) {
      solutionText = event.soloTip;
    } else if (event.hourlyRate > 0) {
      solutionText = `Take advantage of ${event.label || event.name} (~$${Math.round(event.hourlyRate / 1000)}k/hr) before it expires.`;
    }

    // Detail text
    const hourlyRateNote = event.hourlyRate > 0
      ? ` Est. ~$${Math.round(event.hourlyRate / 1000)}k/hr.`
      : '';
    let multiplierNote = `${event.multiplier}X bonus active.`;
    if (event.multiplier > 1) {
      multiplierNote = `${event.multiplier}X bonus active \u2014 prioritize this over normal activities.`;
    } else if (event.highValue) {
      multiplierNote = 'High-value opportunity \u2014 prioritize this week.';
    }

    bottlenecks.push({
      id: `weekly_event_${event.name}`,
      label: `\u26A1 ${event.label || event.name} THIS WEEK`,
      critical: event.critical,
      urgent: event.urgent,
      impact: impactLevel,
      solution: solutionText,
      actionType: { mission: 'mission', passive: 'passive' }[event.category] || 'freemode',
      detail: `${getExpiryLabel(expiryIso)}. ${multiplierNote}${hourlyRateNote}`,
      timeHours: 0,
      savingsPerHour: event.hourlyRate || 0,
      expiresAt: event.expiryTimestamp,
      eventTier: event.tier,
      hoursLeft: event.hoursLeft,
      daysLeft: event.daysLeft,
    });
  }

  // Process all events
  for (const event of activeEvents) {
    processEvent(event);
  }
  
  // Combat Prep Reminder for Rank < 100 during combat-heavy events
  // Logic aligned with buildSmartActionPlan for consistency
  // Thresholds: strength < 60% = needs full prep, strength 60-99% = just snacks/armor
  const hasCombatEvent = activeEvents.some(e => e.category === 'mission' || e.category === 'adversary');
  if (rank < 100 && hasCombatEvent && strength < 100) {
    const maxHealthPercent = Math.floor(50 + (rank / 2)); // Approximate health calculation
    
    if (strength < 60) {
      // Strength is critically low - needs full prep (max strength + snacks/armor)
      bottlenecks.push({
        id: 'combat_prep_auto_shop',
        label: '💪 Prep for Auto Shop Combat (Low Strength)',
        critical: false,
        urgent: true,
        impact: 'high',
        solution: '1. Max Strength (30 min) - reduces damage taken. 2. Stock 10+ Snacks + 10 Super Heavy Armor. 3. Visit Agency armory for free snacks if owned.',
        actionType: 'preparation',
        detail: `Rank ${rank} = ~${maxHealthPercent}% max health. Strength is ${strength}% (low). Before grinding Auto Shop finales: Max Strength (30 min), stock snacks/armor. Without prep: high failure rate on Union Depository/Lost MC finales.`,
        timeHours: 0.5, // One-time 30-40 min investment
        eventTier: 1,
      });
    } else if (rank < 80) {
      // Strength is OK (60-99%) but rank is low - just need snacks/armor
      bottlenecks.push({
        id: 'combat_prep_auto_shop',
        label: '🛡️ Stock Snacks & Armor for Auto Shop',
        critical: false,
        urgent: false,
        impact: 'medium',
        solution: 'Stock 10+ Snacks + 10 Super Heavy Armor. Visit Agency armory for free snacks if owned.',
        actionType: 'preparation',
        detail: `Rank ${rank} = ~${maxHealthPercent}% max health. Strength is good (${strength}%), but you still take more damage at lower ranks. Stock snacks/armor before grinding.`,
        timeHours: 0.15, // 10 mins to stock up
        eventTier: 2,
      });
    }
    // Rank 80+ with strength >= 60 = no prep needed, skip bottleneck
  }

  // --- GTA+ Monthly Bonuses (e.g., 2X Security Contracts) ---
  const { hasGTAPlus, hasAgency } = params;
  if (hasGTAPlus && WEEKLY_EVENTS.gtaPlus?.monthlyBonuses) {
    const now_ts = Date.now();
    WEEKLY_EVENTS.gtaPlus.monthlyBonuses.forEach(bonus => {
      const expiryDate = new Date(bonus.expires);
      if (now_ts >= expiryDate.getTime()) return;

      // DEDUP: If a weekly bonus for the same activity exists, upgrade it instead of adding a duplicate.
      // e.g., 3X Lunar Stunt Races (weekly) vs 6X Lunar Stunt Races (GTA+) — show only 6X.
      const matchingWeeklyIdx = bottlenecks.findIndex(b => 
        b.id === `weekly_event_${bonus.activity}` ||
        (b.label && bonus.label && b.label.toLowerCase().includes(bonus.activity.replaceAll('_', ' ')))
      );
      if (matchingWeeklyIdx !== -1) {
        // GTA+ multiplier is higher — upgrade the existing bottleneck in-place
        const existing = bottlenecks[matchingWeeklyIdx];
        if (bonus.multiplier > (existing.multiplier || 0)) {
          existing.label = `\uD83D\uDC8E ${bonus.label}`;
          existing.detail = `GTA+ enhanced (${bonus.multiplier}X vs base). Expires ${formatExpiry(bonus.expires)} (${Math.ceil((expiryDate.getTime() - now_ts) / (1000 * 60 * 60 * 24))} days left).`;
          existing.savingsPerHour = bonus.estimatedHourlyRate || existing.savingsPerHour;
          existing.impact = bonus.estimatedHourlyRate >= 200000 ? 'high' : existing.impact;
        }
        return; // Don't add a separate entry
      }

      // Skip if it exactly duplicates a weekly bonus already added
      const alreadyAdded = bottlenecks.some(b => b.id === `weekly_event_${bonus.activity}`);
      if (alreadyAdded) return;

      // Check asset prerequisites (e.g., security contracts need Agency)
      if (bonus.activity === 'security_contracts' && !hasAgency) return;

      const daysLeft = Math.ceil((expiryDate.getTime() - now_ts) / (1000 * 60 * 60 * 24));
      const solutionText = (isSoloPlayer && bonus.soloTip) ? bonus.soloTip : `Use ${bonus.label} before it expires.`;

      bottlenecks.push({
        id: `gtaplus_monthly_${bonus.activity}`,
        label: `\uD83D\uDC8E ${bonus.label}`,
        critical: false,
        urgent: false,
        impact: bonus.estimatedHourlyRate >= 200000 ? 'high' : 'medium',
        solution: solutionText,
        actionType: 'mission',
        detail: `GTA+ monthly perk. Expires ${formatExpiry(bonus.expires)} (${daysLeft} days left). Est. ~$${Math.round((bonus.estimatedHourlyRate || 0) / 1000)}k/hr.`,
        timeHours: 0,
        savingsPerHour: bonus.estimatedHourlyRate || 0,
        expiresAt: expiryDate.getTime(),
        eventTier: 2,
        hoursLeft: daysLeft * 24,
        daysLeft,
      });
    });
  }

  return { bottlenecks, nightclubDiscountEvent };
};

// ============================================
// TIER 2: CONTEXT-AWARE STAT CHECKS
// ============================================

// --- Strength sub-check ---
const detectStrengthGap = (params, formData) => {
  const { strength, rank, liquidCash, hasKosatka, hasSparrow, hasAgency, hasAcidLab, hasAutoShop, hasNightclub, hasBunker } = params;
  const criticalStatThreshold = MODEL_CONFIG.thresholds?.stats?.critical ?? 60;
  if (strength >= criticalStatThreshold) return null;

  const hasMansion = formData.hasMansion || false;
  const estimatedNetWorth = liquidCash +
    (hasKosatka ? 2200000 : 0) + (hasSparrow ? 1815000 : 0) +
    (hasAgency ? 2010000 : 0) + (hasAcidLab ? 750000 : 0) +
    (hasAutoShop ? 1670000 : 0) + (hasNightclub ? 1000000 : 0) +
    (hasBunker ? 1165000 : 0) + (hasMansion ? 11500000 : 0);
  const isUnderRank100 = rank < 100;

  let strengthSolution;
  if (hasMansion) {
    strengthSolution = 'Use Mansion Gym (20 mins) - FASTEST METHOD: Bench press or sparring minigame in your Mansion gym';
  } else if (estimatedNetWorth > 15000000) {
    strengthSolution = 'Buy Mansion ($11.5M+) OR use Pier Pressure (free)';
  } else {
    strengthSolution = 'Launch "Pier Pressure" mission → Punch NPCs (20 mins, free)';
  }

  return {
    id: 'strength_low',
    label: 'Strength Critical for Survival',
    critical: true,
    impact: isUnderRank100 ? 'high' : 'medium',
    solution: strengthSolution,
    actionType: 'mission',
    detail: 'Strength provides damage resistance in all combat situations (not just melee). Low strength means you take significantly more damage from bullets, explosions, and falls. Critical for surviving Auto Shop contracts, heists, and PVP.',
    timeHours: 0.33,
  };
};

// --- Flying sub-check ---
const detectFlyingGap = (params, activeEvents) => {
  const { flying, hasSparrow, hasRaiju, hasOppressor } = params;
  const criticalStatThreshold = MODEL_CONFIG.thresholds?.stats?.critical ?? 60;
  if (flying >= criticalStatThreshold) return null;

  const hasFastTravel = hasSparrow || hasRaiju || hasOppressor;
  const hasSparrowOrRaiju = hasSparrow || hasRaiju;
  const flyingCritical = hasSparrowOrRaiju && flying < criticalStatThreshold;
  const hasTimeLimitedEvent = activeEvents.some(e => e.multiplier >= 2 && e.tier <= 2);

  let flyingImpact;
  if (hasTimeLimitedEvent) flyingImpact = 'medium';
  else if (hasSparrow) flyingImpact = 'high';
  else if (hasFastTravel) flyingImpact = 'medium';
  else flyingImpact = 'low';

  let flyingDetail;
  if (hasSparrowOrRaiju) {
    flyingDetail = 'Low flying skill causes severe turbulence when using Sparrow/Raiju. This slows down heist preps and freeroam missions (adds 5-10 mins per prep). Flight School fixes this.';
  } else if (hasFastTravel) {
    flyingDetail = 'Flying skill affects vehicle stability. Low skill = more turbulence = slower prep times.';
  } else {
    flyingDetail = 'No fast travel vehicle. Turbulence causes crashes and wastes time.';
  }

  return {
    id: 'flying_low',
    label: 'Flying Skill Low',
    critical: hasTimeLimitedEvent ? false : flyingCritical,
    impact: flyingImpact,
    solution: hasFastTravel
      ? 'Flight School at LSIA (45 mins) - Reduces turbulence during heist prep flights'
      : 'Buy Sparrow ($1.8M) OR do Flight School',
    actionType: hasFastTravel ? 'mission' : 'property_purchase',
    detail: flyingDetail,
    timeHours: hasFastTravel ? 0.75 : 0,
  };
};

// --- Rank sub-check ---
const detectRankGap = (params, activeEvents) => {
  const { rank } = params;
  const paperTrail4XEvent = activeEvents.find(e => e.name === 'paperTrail4X');
  const paperTrail2XEvent = activeEvents.find(e => e.name === 'paperTrail2X');

  if (rank < 50) {
    let rankSolution, rankTimeHours, rankSavingsPerHour;
    if (paperTrail4XEvent) {
      rankSolution = 'Farm Operation Paper Trail (4X RP & 4X GTA$ for GTA+ this week) - Magic Bullet for Rank + Good money variety';
      rankTimeHours = 1.5;
      rankSavingsPerHour = 400000;
    } else if (paperTrail2XEvent) {
      rankSolution = `Farm Operation Paper Trail (2X RP through ${formatExpiry(WEEKLY_EVENTS.gtaPlus?.monthlyBonuses?.[0]?.expires || WEEKLY_EVENTS.meta.validUntil)})`;
      rankTimeHours = 2;
      rankSavingsPerHour = 200000;
    } else {
      rankSolution = 'Run missions & heists (Cayo, Auto Shop, Security Contracts for RP + $)';
      rankTimeHours = 2.5;
      rankSavingsPerHour = 0;
    }

    return [{
      id: 'rank_low',
      label: 'Rank Under 50 (Max Health & Armor Locked)',
      critical: true,
      urgent: !!paperTrail4XEvent,
      impact: 'high',
      solution: rankSolution,
      actionType: 'mission',
      detail: `Rank ${rank} = ~${Math.floor(50 + (rank / 2))}% max health. You die instantly in Auto Shop raids. Cannot carry full body armor. Makes combat-heavy content much harder.`,
      timeHours: rankTimeHours,
      savingsPerHour: rankSavingsPerHour,
    }];
  }

  if (rank < 100 && paperTrail4XEvent) {
    return [{
      id: 'rank_medium',
      label: 'Rank Under 100 (GTA+ Paper Trail 4X Opportunity)',
      critical: false,
      urgent: true,
      impact: 'medium',
      solution: 'Farm Operation Paper Trail (4X RP & GTA$ for GTA+ this week) - Fastest way to Rank 100+',
      actionType: 'mission',
      detail: `Rank ${rank}. Operation Paper Trail is paying 4X RP & 4X GTA$ this week for GTA+ members. Good variety option if you get bored of Auto Shop grinding. This is the fastest way to unlock Rank 100+ benefits.`,
      timeHours: 1.5,
      savingsPerHour: 400000,
    }];
  }

  return [];
};

const detectStatBottlenecks = (params, activeEvents, formData) => {
  const strengthGap = detectStrengthGap(params, formData);
  const flyingGap = detectFlyingGap(params, activeEvents);
  const rankGaps = detectRankGap(params, activeEvents);
  return [strengthGap, flyingGap, ...rankGaps].filter(Boolean);
};

// ============================================
// TIER 3: ASSET GAPS (Same as before)
// ============================================

// --- Income diversification helper ---
const detectIncomeDiversificationGaps = (params) => {
  const { hasKosatka, hasSparrow, hasAutoShop, hasCarWash, hasWeedFarm, hasHeliTours, sellsToStreetDealers } = params;
  const bottlenecks = [];

  // Kosatka is still a good purchase for Cayo access, but not the only path
  if (!hasKosatka) {
    bottlenecks.push({
      id: 'no_kosatka',
      label: 'No Kosatka Submarine',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Kosatka ($2.2M) from Warstock for Cayo Perico access (~$560k/hr solo)',
      actionType: 'purchase',
      detail: 'Unlocks Cayo Perico Heist — a solid solo active income source (~$700k avg per run).',
      timeHours: 5,
    });
  }

  if (hasKosatka && !hasSparrow) {
    bottlenecks.push({
      id: 'no_sparrow',
      label: 'No Sparrow for fast travel',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Sparrow helicopter ($1.8M) from Kosatka interaction menu',
      actionType: 'purchase',
      detail: 'Sparrow cuts Cayo prep time in half and is useful for many freeroam missions.',
      timeHours: 2,
    });
  }

  // Car Wash feeder recommendations
  if (hasCarWash && !hasWeedFarm) {
    bottlenecks.push({
      id: 'no_weed_farm',
      label: 'Car Wash missing Weed Farm feeder',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Weed Farm ($715K) to boost Car Wash passive income by ~$10K/hr',
      actionType: 'purchase',
      detail: 'Weed Farm feeds product to Car Wash, boosting its passive earnings significantly.',
      timeHours: 0.5,
      savingsPerHour: 10000,
    });
  }

  if (hasCarWash && !hasHeliTours) {
    bottlenecks.push({
      id: 'no_heli_tours',
      label: 'Car Wash missing Heli Tours feeder',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Helicopter Tours ($750K) to boost Car Wash passive income by ~$8K/hr',
      actionType: 'purchase',
      detail: 'Helicopter Tours bring tourists to Car Wash, boosting passive earnings.',
      timeHours: 0.5,
      savingsPerHour: 8000,
    });
  }

  // Street Dealer recommendation 
  if (!sellsToStreetDealers) {
    bottlenecks.push({
      id: 'not_selling_street_dealers',
      label: '💊 Not selling to Street Dealers',
      critical: false,
      impact: 'high',
      solution: 'Visit 3 Street Dealers daily (~15 min for ~$202-250K). Requires MC businesses + Acid Lab stocked.',
      actionType: 'daily_routine',
      detail: 'Street Dealers refresh daily at 07:00 UTC. Sell Cocaine, Meth, Weed & Acid for ~$250K/day average with premiums. Best $/minute ratio in the game.',
      timeHours: 0.25,
      savingsPerHour: 250000, // daily but high impact per time invested
    });
  }

  // Auto Shop recommendation
  if (!hasAutoShop) {
    bottlenecks.push({
      id: 'no_auto_shop',
      label: 'No Auto Shop',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Auto Shop ($1.8M) for robbery contracts (~$400-600K/hr solo)',
      actionType: 'purchase',
      detail: 'Union Depository contract pays ~$300K for 30 min work. Great solo active income.',
      timeHours: 1,
    });
  }

  // Car Wash recommendation
  if (!hasCarWash) {
    bottlenecks.push({
      id: 'no_car_wash',
      label: 'No Car Wash (passive income)',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Car Wash ($1.5M) + feeders for up to ~$23K/hr passive income',
      actionType: 'purchase',
      detail: 'Car Wash generates passive income. Add Weed Farm ($715K) and Heli Tours ($750K) as feeders to maximize earnings.',
      timeHours: 1,
    });
  }

  return bottlenecks;
};

const detectAssetGaps = (params, incomePerHour) => {
  const { hasAgency, hasAcidLab, acidLabUpgraded, dreContractDone } = params;
  const bottlenecks = detectIncomeDiversificationGaps(params);

  if (!hasAgency && incomePerHour >= (MODEL_CONFIG.thresholds?.recommendations?.agencyPurchase ?? 400000)) {
    bottlenecks.push({
      id: 'no_agency',
      label: 'No Agency for Dre/Payphone',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Agency ($2M+) and complete setup missions',
      actionType: 'purchase',
      detail: 'Agency unlocks Dr. Dre ($1M) and Payphone Hits (~250k/hr filler).',
      timeHours: MODEL_CONFIG.time?.assets?.agencySetup ?? 3,
    });
  }

  if (hasAgency && !dreContractDone) {
    bottlenecks.push({
      id: 'dre_contract',
      label: 'Dr. Dre Contract not completed',
      critical: false,
      impact: 'medium',
      solution: 'Complete Dr. Dre Contract from Agency computer (unlocks Payphone Hits)',
      actionType: 'contract',
      detail: 'Finishing this unlocks Payphone Hits and a one-time $1M payout.',
      timeHours: MODEL_CONFIG.time?.assets?.dreContract ?? 3,
    });
  }

  if (hasAcidLab && !acidLabUpgraded) {
    bottlenecks.push({
      id: 'acid_upgrade',
      label: 'Acid Lab not upgraded',
      critical: false,
      impact: 'medium',
      detail: 'You lose ~40% of potential Acid Lab profit every cycle without this upgrade.',
      timeHours: 0.5,
    });
  }

  return bottlenecks;
};

// ============================================
// INFRASTRUCTURE INVESTMENT BOTTLENECKS (Smart Shopping)
// ============================================

// --- Bunker infrastructure sub-check ---
const detectBunkerInfra = (params, formData) => {
  const { hasBunker, bunkerUpgraded } = params;
  if (!hasBunker) return [];

  const bunkerState = {
    owned: true,
    equipmentUpgrade: formData.bunkerEquipmentUpgrade || bunkerUpgraded,
    staffUpgrade: formData.bunkerStaffUpgrade || bunkerUpgraded,
  };

  const bunkerLeak = calculateBunkerLeak(bunkerState);
  if (!bunkerLeak.hasLeak) return [];

  let bunkerSolution, bunkerUpgradeCost;
  if (bunkerLeak.missingEquipment && bunkerLeak.missingStaff) {
    bunkerSolution = `Buy Equipment ($${(INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade / 1000000).toFixed(2)}M) + Staff ($${(INFRASTRUCTURE_COSTS.bunker.staffUpgrade / 1000).toFixed(0)}k) upgrades.`;
    bunkerUpgradeCost = INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade + INFRASTRUCTURE_COSTS.bunker.staffUpgrade;
  } else if (bunkerLeak.missingEquipment) {
    bunkerSolution = `Buy Equipment Upgrade ($${(INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade / 1000000).toFixed(2)}M)`;
    bunkerUpgradeCost = INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade;
  } else {
    bunkerSolution = `Buy Staff Upgrade ($${(INFRASTRUCTURE_COSTS.bunker.staffUpgrade / 1000).toFixed(0)}k)`;
    bunkerUpgradeCost = INFRASTRUCTURE_COSTS.bunker.staffUpgrade;
  }

  return [{
    id: 'bunker_passive_leak',
    label: '🚨 BUNKER PASSIVE INCOME LEAK',
    critical: true,
    urgent: bunkerLeak.lostPerHour >= 30000,
    impact: 'high',
    solution: bunkerSolution,
    actionType: 'infrastructure',
    detail: `You're earning $${bunkerLeak.currentIncome.toLocaleString()}/hr instead of $${bunkerLeak.potentialIncome.toLocaleString()}/hr. Losing $${bunkerLeak.lostPerHour.toLocaleString()}/hr. ROI: ${bunkerLeak.roiHours} hours of passive income.`,
    timeHours: 0.25,
    savingsPerHour: bunkerLeak.lostPerHour,
    cost: bunkerUpgradeCost,
    roiHours: bunkerLeak.roiHours,
  }];
};

// --- Nightclub helper functions ---
const buildNightclubMuleTrapBottleneck = (ncOptimization) => {
  const muleTrap = ncOptimization.issues.find(i => i.id === 'nc_mule_trap');
  if (!muleTrap) return null;

  return {
    id: 'nightclub_mule_trap',
    label: '⚠️ MULE CUSTOM TRAP DETECTED',
    critical: true,
    urgent: true,
    impact: 'high',
    solution: 'Buy Pounder Custom ($1.9M). The Mule cannot handle 90+ crate sales. This is a permanent fix.',
    actionType: 'infrastructure',
    detail: muleTrap.detail,
    timeHours: 0.25,
    cost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
    isTrap: true,
  };
};

const buildNightclubEquipmentBottleneck = (ncOptimization, nightclubDiscountEvent) => {
  const needsEquipment = ncOptimization.issues.find(i => i.id === 'nc_no_equipment');
  if (!needsEquipment) return null;

  const { price, isDiscounted, discountPercent } = getDiscountedPrice(
    INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
    'nightclub'
  );
  return {
    id: 'nightclub_equipment',
    label: isDiscounted
      ? `💰 NC Equipment ${discountPercent}% OFF (Production 50% Slower)`
      : '🎭 Nightclub Equipment Upgrade Missing',
    critical: isDiscounted,
    urgent: isDiscounted,
    impact: 'high',
    solution: `Buy Equipment Upgrade ($${(price / 1000000).toFixed(2)}M${isDiscounted ? ' - ' + discountPercent + '% OFF!' : ''})`,
    actionType: 'infrastructure',
    detail: needsEquipment.detail + (isDiscounted ? ` 🎉 ${discountPercent}% OFF expires soon!` : ''),
    timeHours: 0.25,
    cost: price,
    originalCost: INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
    isDiscounted,
    expiresAt: isDiscounted && nightclubDiscountEvent ? nightclubDiscountEvent.expiryTimestamp : null,
  };
};

const buildNightclubFloorsBottleneck = (ncOptimization, nightclubState, nightclubDiscountEvent) => {
  const needsFloors = ncOptimization.issues.find(i => i.id === 'nc_floors_low');
  if (!needsFloors) return null;

  const currentFloors = nightclubState.floors;
  const currentAFK = NIGHTCLUB_FLOOR_AFK[currentFloors]?.maxHours || 20;
  const maxAFK = NIGHTCLUB_FLOOR_AFK[5].maxHours;
  let floorCost = 0;
  for (let f = currentFloors + 1; f <= 5; f++) {
    floorCost += INFRASTRUCTURE_COSTS.nightclub.floors[f];
  }
  const { price, isDiscounted, discountPercent } = getDiscountedPrice(floorCost, 'nightclub');
  return {
    id: 'nightclub_floors',
    label: isDiscounted
      ? `💰 NC Floors ${discountPercent}% OFF (AFK Limited)`
      : `🎭 Nightclub Floors ${currentFloors}/5 (AFK Limited)`,
    critical: false,
    urgent: isDiscounted,
    impact: isDiscounted ? 'high' : 'medium',
    solution: `Buy Floors ${currentFloors + 1}-5 ($${(price / 1000000).toFixed(2)}M${isDiscounted ? ' - ' + discountPercent + '% OFF!' : ''})`,
    actionType: 'infrastructure',
    detail: `AFK limited to ${currentAFK} hours. With 5 floors: ${maxAFK} hours (overnight safe).${isDiscounted ? ' 🎉 Discount expires soon!' : ''}`,
    timeHours: 0.25,
    cost: price,
    originalCost: floorCost,
    isDiscounted,
    expiresAt: isDiscounted && nightclubDiscountEvent ? nightclubDiscountEvent.expiryTimestamp : null,
  };
};

const buildNightclubPounderBottleneck = (ncOptimization, nightclubState, hasMuleTrap) => {
  const needsPounder = ncOptimization.recommendations.find(r => r.id === 'buy_nc_pounder');
  if (!needsPounder || hasMuleTrap) return null;

  return {
    id: 'nightclub_pounder',
    label: '🚚 Need Pounder Custom for Large Sales',
    critical: false,
    urgent: nightclubState.floors >= 4 || nightclubState.techs >= 4,
    impact: 'high',
    solution: 'Buy Pounder Custom ($1.9M) from Warstock. DO NOT buy Mule Custom.',
    actionType: 'infrastructure',
    detail: 'Essential for selling 90+ crates. The Mule is slow and buggy - skip it entirely.',
    timeHours: 0.25,
    cost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
  };
};

const buildNightclubTechFeederBottleneck = (ncOptimization, nightclubTechs, nightclubFeeders) => {
  if (nightclubTechs >= 5 && nightclubFeeders >= 5) return null;

  const techImbalance = ncOptimization.issues.find(i => i.id === 'nc_tech_imbalance');
  return {
    id: 'nightclub_partial',
    label: 'Nightclub Not Fully Optimized',
    critical: false,
    impact: 'medium',
    solution: techImbalance
      ? `Hire ${nightclubFeeders - nightclubTechs} more technicians. You have idle businesses.`
      : 'Add more technicians and link feeder businesses.',
    actionType: 'optimization',
    detail: techImbalance?.detail || `${nightclubTechs}/5 techs, ${nightclubFeeders}/5 feeders. Missing up to 50% potential income.`,
    timeHours: 0.5,
  };
};

// --- Nightclub infrastructure sub-check ---
const detectNightclubInfra = (params, formData, nightclubDiscountEvent) => {
  const { hasNightclub, nightclubTechs, nightclubFeeders } = params;
  if (!hasNightclub) return [];

  const storage = formData.nightclubStorage || {};
  const nightclubState = {
    owned: true,
    floors: Number(formData.nightclubFloors) || 1,
    equipmentUpgrade: formData.nightclubEquipmentUpgrade,
    staffUpgrade: formData.nightclubStaffUpgrade,
    hasPounder: storage.hasPounder || formData.hasPounderCustom || false,
    hasMule: storage.hasMule || formData.hasMuleCustom || false,
    techs: nightclubTechs,
    feeders: nightclubFeeders,
  };

  const ncOptimization = calculateNightclubOptimization(nightclubState);
  const muleTrapResult = buildNightclubMuleTrapBottleneck(ncOptimization);

  return [
    muleTrapResult,
    buildNightclubEquipmentBottleneck(ncOptimization, nightclubDiscountEvent),
    buildNightclubFloorsBottleneck(ncOptimization, nightclubState, nightclubDiscountEvent),
    buildNightclubPounderBottleneck(ncOptimization, nightclubState, !!muleTrapResult),
    buildNightclubTechFeederBottleneck(ncOptimization, nightclubTechs, nightclubFeeders),
  ].filter(Boolean);
};

const detectInfrastructureGaps = (params, formData, nightclubDiscountEvent) => {
  const { hasNightclub } = params;
  const bottlenecks = [
    ...detectBunkerInfra(params, formData),
    ...detectNightclubInfra(params, formData, nightclubDiscountEvent),
  ];

  // Recommend buying Nightclub if player doesn't have one and discount is active
  if (!hasNightclub && nightclubDiscountEvent) {
    bottlenecks.push({
      id: 'nightclub_discount_buy',
      label: '🏢 40% Off Nightclub Properties THIS WEEK',
      critical: nightclubDiscountEvent.hoursLeft < 24,
      urgent: true,
      impact: 'high',
      solution: 'Purchase Nightclub from Maze Bank Foreclosures at 40% off. Best time to buy!',
      actionType: 'purchase',
      detail: `40% off Nightclub properties ${getExpiryLabel(nightclubDiscountEvent.expiryTimestamp ? new Date(nightclubDiscountEvent.expiryTimestamp).toISOString() : WEEKLY_EVENTS.meta.validUntil)} (${nightclubDiscountEvent.hoursLeft < 48 ? nightclubDiscountEvent.hoursLeft + ' hours' : nightclubDiscountEvent.daysLeft + ' days'} left). Save ~$600k on property. Unlocks passive income + Business Battles synergy.`,
      timeHours: 0.25,
      expiresAt: nightclubDiscountEvent.expiryTimestamp,
      savingsValue: 600000,
    });
  }

  return bottlenecks;
};

// ============================================
// TIER 4: DAILY/QUALITY OF LIFE
// ============================================

const detectQualityOfLife = (params, formData, incomePerHour, _nightclubDiscountEvent) => {
  const { hasGTAPlus, hasKosatka } = params;
  const bottlenecks = [];

  // Suggest GTA+ only when it clearly pays off
  if (!hasGTAPlus && hasKosatka && incomePerHour >= 500000) {
    bottlenecks.push({
      id: 'consider_gta_plus',
      label: 'Consider GTA+ for extra bonuses',
      critical: false,
      impact: 'medium',
      solution: 'Subscribe to GTA+ via Rockstar Games Launcher or console store',
      actionType: 'subscription',
      detail:
        'At your income level, the $500k monthly bonus + event boosts pay for the sub in <1 hour.',
      timeHours: 0,
    });
  }

  // Optional: Stamina Check (Quality of Life)
  const stamina = validateStat(formData.stamina); // Already returns percentage (0-100)
  if (stamina < 100) {
    bottlenecks.push({
      id: 'stamina_low',
      label: 'Maximize Stamina',
      solution: 'Run, bike, or swim regularly to build stamina',
      actionType: 'activity',
      detail: 'Allows unlimited sprinting. Required for Mansion Yoga buff (+15% run speed).',
      critical: false,
      impact: 'low',
      timeHours: 0.5,
    });
  }

  // Casino Wheel (GTA+ gets 2 spins) - Only if not claimed/opted out
  const claimedWheelSpin = !!formData.claimedWheelSpin;
  if (hasGTAPlus && !claimedWheelSpin) {
    bottlenecks.push({
      id: 'casino_spin',
      label: '🎰 Spin Lucky Wheel (2X Daily)',
      critical: false,
      impact: 'low',
      solution: 'Go to Casino. Spin. Wait 5s. Spin again.',
      actionType: 'daily',
      detail: 'GTA+ gets 2 spins per day. Target: Podium Vehicle (Rebla GTS) or RP.',
      timeHours: 0.1,
    });
  }

  return bottlenecks;
};

/**
 * Detect all bottlenecks for a player based on their current state
 * @param {Object} params - Normalized player data
 * @param {number} now - Current timestamp (passed to avoid duplication)
 * @param {Array} activeEvents - Active events from getCurrentEvents
 * @param {number} incomePerHour - Calculated income per hour
 * @param {Object} formData - Original form data for additional checks
 * @returns {Array} Array of bottleneck objects
 */
export const detectBottlenecks = (params, now, activeEvents, incomePerHour, formData) => {
  const tier0 = detectUrgentExpiring(params, now, formData);
  const { bottlenecks: tier1, nightclubDiscountEvent } = detectIncomeLeaks(params, now, activeEvents);
  const tier2 = detectStatBottlenecks(params, activeEvents, formData);
  const tier3 = detectAssetGaps(params, incomePerHour);
  const infra = detectInfrastructureGaps(params, formData, nightclubDiscountEvent);
  const qol = detectQualityOfLife(params, formData, incomePerHour, nightclubDiscountEvent);
  
  return [...tier0, ...tier1, ...tier2, ...tier3, ...infra, ...qol];
};
