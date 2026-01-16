// src/utils/detectBottlenecks.js
// Bottleneck detection logic extracted from computeAssessment.js

import { MODEL_CONFIG } from './modelConfig.js';
import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';
import { validateStat } from './assessmentHelpers.js';
import { 
  calculateBunkerLeak, 
  calculateNightclubOptimization,
  INFRASTRUCTURE_COSTS,
  NIGHTCLUB_FLOOR_AFK,
  getDiscountedPrice,
} from './infrastructureAdvisor.js';

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
  const {
    rank,
    liquidCash,
    strength,
    flying,
    cayoCompletions,
    cayoAvgTime,
    nightclubTechs,
    nightclubFeeders,
    hasKosatka,
    hasSparrow,
    hasAgency,
    hasAcidLab,
    acidLabUpgraded,
    hasNightclub,
    hasBunker,
    bunkerUpgraded,
    dreContractDone,
    hasRaiju,
    hasOppressor,
    hasGTAPlus,
    hasAutoShop,
  } = params;

  const bottlenecks = [];

  // ============================================
  // TIER 0: URGENT EXPIRING EVENTS (Front of queue)
  // ============================================

  // 1. FREE CAR WASH (Expires Jan 14)
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
    bottlenecks.push({
      id: 'claim_free_car',
      label: '🎁 Claim Free Pfister Astrale',
      critical: false,
      urgent: false, // Monthly benefit (no expiry rush)
      impact: 'low', // It's just a car, not income
      solution: 'Visit The Vinewood Car Club (Elysian Island)',
      actionType: 'vehicle_claim',
      detail: 'Free $1.6M vehicle for GTA+ members. Claim even if you won\'t drive it - free garage asset.',
      timeHours: 0.1,
      savingsPerHour: 0, // No income gain, just asset value
      savingsValue: 1600000, // One-time savings (used by sorter if you add that logic)
    });
  }

  // ============================================
  // TIER 1: INCOME LEAKS (Costing you money every hour)
  // ============================================

  const autoShop2XEvent = activeEvents.find(e => e.name === 'autoShop2X');
  const businessBattles4XEvent = activeEvents.find(e => e.name === 'businessBattles4X');
  const nightclubGoods4XEvent = activeEvents.find(e => e.name === 'nightclubGoods4X');
  const nightclubDiscountEvent = activeEvents.find(e => e.name === 'nightclubDiscount40');
  
  // Create bottlenecks from active events (highest priority)
  activeEvents.forEach(event => {
    // ============================================
    // WEEKLY EVENTS (Higher priority - expires sooner)
    // ============================================
    
    if (event.name === 'businessBattles4X') {
      const urgencyText = event.hoursLeft < 48 
        ? `${event.hoursLeft} hours left`
        : `${event.daysLeft} days left`;
      
      bottlenecks.push({
        id: 'business_battles_4x',
        label: '⚡ 4X Business Battles THIS WEEK',
        critical: event.critical,
        urgent: event.urgent,
        impact: 'high',
        solution: 'Contest Business Battles in Freemode (every 15 mins). Goods go directly to your Nightclub at 4X value. Stack between Auto Shop contracts.',
        actionType: 'freemode',
        detail: `Expires Jan 21 (${urgencyText}). Business Battles pay 4X goods + 4X Nightclub value. If you have a Nightclub, this is massive passive income. Stack between mission cooldowns.`,
        timeHours: 0,
        savingsPerHour: event.hourlyRate,
        expiresAt: event.expiryTimestamp,
        eventTier: event.tier,
        hoursLeft: event.hoursLeft,
        daysLeft: event.daysLeft,
      });
    } else if (event.name === 'nightclubGoods4X' && hasNightclub) {
      const urgencyText = event.hoursLeft < 48 
        ? `${event.hoursLeft} hours left`
        : `${event.daysLeft} days left`;
      
      bottlenecks.push({
        id: 'nightclub_goods_4x',
        label: '💰 4X Nightclub Goods (From Business Battles)',
        critical: event.critical,
        urgent: event.urgent,
        impact: 'high',
        solution: 'Win Business Battles to deposit 4X goods into your Nightclub. Sell when full for massive payout.',
        actionType: 'passive',
        detail: `Expires Jan 21 (${urgencyText}). Every Business Battle win deposits 4X goods into your Nightclub. Combined with Business Battles 4X = exponential value.`,
        timeHours: 0,
        expiresAt: event.expiryTimestamp,
        eventTier: event.tier,
        hoursLeft: event.hoursLeft,
        daysLeft: event.daysLeft,
      });
    } else if (event.name === 'autoShop2X') {
      const expiryText = event.daysLeft < 3 
        ? `${Math.ceil(event.daysLeft * 24)} hours left`
        : `${event.daysLeft} days left`;
      
      bottlenecks.push({
        id: 'auto_shop_2x_grind',
        label: '🔥 Auto Shop 2X Event Active (GTA+)',
        critical: event.critical,
        urgent: event.urgent,
        impact: 'high',
        solution: 'Run Union Depository, Lost MC, Superdollar Deal contracts repeatedly. Stack with client vehicle jobs (also 2X) between contracts. This beats Cayo Perico and requires zero prep time.',
        actionType: 'mission',
        detail: `Robbery Contract finales pay $600-800k per 20-min run = ${event.earningsRate}. Zero prep time. Expires Feb 4 (${expiryText}). Highest $/hr in game right now. Solves cash crisis faster than Cayo.`,
        timeHours: 0, // Ongoing activity
        savingsPerHour: event.hourlyRate,
        expiresAt: event.expiryTimestamp,
        eventTier: event.tier,
        daysLeft: event.daysLeft,
      });
    } else if (event.name === 'paperTrail4X') {
      const urgencyText = event.hoursLeft < 72 
        ? `${event.hoursLeft} hours left`
        : `${event.daysLeft} days left`;
      
      bottlenecks.push({
        id: 'paper_trail_4x',
        label: '⚡ Paper Trail 4X THIS WEEK',
        critical: event.critical,
        urgent: event.urgent,
        impact: 'high',
        solution: 'Complete Operation Paper Trail missions repeatedly. GTA+ gets 4X GTA$ & 4X RP this week (Jan 8-15), then 2X through Feb 4. Good variety if you get bored of Auto Shop grinding.',
        actionType: 'mission',
        detail: `Expires Jan 15 (${urgencyText}). ${event.hoursLeft < 24 ? '🚨 DO THIS NOW - ' : ''}Massive RP boost = fastest path to Rank 50/100. Then drops to 2X through Feb 4. 4X RP solves 'Rank Under 50' health/armor bottleneck faster than any grind method. Top priority for next ${event.hoursLeft < 24 ? 'few hours' : '24 hours'}.`,
        timeHours: 0,
        savingsPerHour: event.hourlyRate,
        expiresAt: event.expiryTimestamp,
        eventTier: event.tier,
        hoursLeft: event.hoursLeft,
      });
    } else if (event.name === 'paperTrail2X') {
      bottlenecks.push({
        id: 'paper_trail_2x',
        label: 'Paper Trail 2X Active',
        critical: event.critical,
        urgent: event.urgent,
        impact: 'medium',
        solution: 'Complete Operation Paper Trail missions. Good variety option and solid RP/$ ratio.',
        actionType: 'mission',
        detail: `Continues through Feb 4 (${event.daysLeft} days left). Good RP for ranking.`,
        timeHours: 0,
        savingsPerHour: event.hourlyRate,
        expiresAt: event.expiryTimestamp,
        eventTier: event.tier,
        daysLeft: event.daysLeft,
      });
    }
  });
  
  // Combat Prep Reminder for Rank < 100 during Auto Shop event
  // Logic aligned with buildSmartActionPlan for consistency
  // Thresholds: strength < 60% = needs full prep, strength 60-99% = just snacks/armor
  if (rank < 100 && autoShop2XEvent && strength < 100) {
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

  // ============================================
  // TIER 2: CONTEXT-AWARE STAT CHECKS
  // ============================================

  // Stat bottlenecks
  const criticalStatThreshold = MODEL_CONFIG.thresholds?.stats?.critical ?? 60;
  
  // 3. STRENGTH (Context-Aware + Mansion Check)
  if (strength < criticalStatThreshold) {
    const hasMansion = formData.hasMansion || false;
    
    // Calculate estimated net worth (sum of owned property values)
    const estimatedNetWorth = liquidCash + 
      (hasKosatka ? 2200000 : 0) +
      (hasSparrow ? 1815000 : 0) +
      (hasAgency ? 2010000 : 0) +
      (hasAcidLab ? 750000 : 0) +
      (hasAutoShop ? 1670000 : 0) +
      (hasNightclub ? 1000000 : 0) +
      (hasBunker ? 1165000 : 0) +
      (hasMansion ? 11500000 : 0); // Minimum mansion value
    
    // Strength is CRITICAL for all players under Rank 100
    // Provides damage resistance (not just melee) - critical for survival in combat-heavy content
    const isUnderRank100 = rank < 100;
    
    bottlenecks.push({
      id: 'strength_low',
      label: 'Strength Critical for Survival',
      critical: true, // Always critical - provides damage resistance
      impact: isUnderRank100 ? 'high' : 'medium', // High priority for players under Rank 100
      solution: hasMansion 
        ? 'Use Mansion Gym (20 mins) - FASTEST METHOD: Bench press or sparring minigame in your Mansion gym' 
        : estimatedNetWorth > 15000000
          ? 'Buy Mansion ($11.5M+) OR use Pier Pressure (free)'
          : 'Launch "Pier Pressure" mission → Punch NPCs (20 mins, free)',
      actionType: 'mission',
      detail: 'Strength provides damage resistance in all combat situations (not just melee). Low strength means you take significantly more damage from bullets, explosions, and falls. Critical for surviving Auto Shop contracts, heists, and PVP.',
      timeHours: hasMansion ? 0.33 : 0.33, // 20 minutes for both methods (Mansion is faster but same time estimate)
    });
  }
  
  // 4. FLYING (Critical if owns fast travel vehicle but low skill)
  const hasFastTravel = hasSparrow || hasRaiju || hasOppressor;
  const hasSparrowOrRaiju = hasSparrow || hasRaiju;

  if (flying < criticalStatThreshold) {
    // Critical if player owns Sparrow/Raiju but has low flying skill
    // Low flying skill causes turbulence which slows down Cayo prep runs significantly
    const flyingCritical = hasSparrowOrRaiju && flying < criticalStatThreshold;
    
      // Lower priority when time-limited events are active (Paper Trail 4X, Auto Shop 2X)
      const hasTimeLimitedEvent = activeEvents.some(e => e.name === 'paperTrail4X' || e.name === 'autoShop2X');
      const flyingImpact = hasTimeLimitedEvent ? 'medium' : (hasSparrow ? 'high' : hasFastTravel ? 'medium' : 'low');
      
      bottlenecks.push({
        id: 'flying_low',
        label: 'Flying Skill Low',
        critical: hasTimeLimitedEvent ? false : flyingCritical, // Not critical when time-limited events are active
        impact: flyingImpact,
      solution: hasFastTravel
        ? 'Flight School at LSIA (45 mins) - Reduces turbulence during Cayo prep runs'
        : 'Buy Sparrow ($1.8M) OR do Flight School',
      actionType: hasFastTravel ? 'mission' : 'property_purchase',
      detail: hasSparrowOrRaiju
        ? 'Low flying skill causes severe turbulence when using Sparrow/Raiju. This slows down Cayo Perico prep runs significantly (adds 5-10 mins per prep). Flight School fixes this.'
        : !hasFastTravel
        ? 'No fast travel vehicle. Turbulence causes crashes and wastes time.'
        : 'Flying skill affects vehicle stability. Low skill = more turbulence = slower prep times.',
      timeHours: hasFastTravel ? 0.75 : 0, // 45 mins for Flight School, 0 = buy vehicle
    });
  }
  
  // 5. RANK (Event-aware) - HIGH PRIORITY for GTA+ with Paper Trail active
  const paperTrail4XEvent = activeEvents.find(e => e.name === 'paperTrail4X');
  const paperTrail2XEvent = activeEvents.find(e => e.name === 'paperTrail2X');
  
  // CRITICAL for all players under Rank 50 (low health/armor), HIGH priority for Rank < 100 with GTA+ and Paper Trail
  if (rank < 50) {
    // Rank < 50 = CRITICAL for ALL players (low health, no full armor)
    // Rank 33 = ~60% max health - makes combat-heavy content (Auto Shop) much harder
    bottlenecks.push({
      id: 'rank_low',
      label: 'Rank Under 50 (Max Health & Armor Locked)',
      critical: true, // ALWAYS critical for Rank < 50
      urgent: !!paperTrail4XEvent, // Urgent for GTA+ members with Paper Trail 4X active (this week only)
      impact: 'high',
      solution: paperTrail4XEvent
        ? 'Farm Operation Paper Trail (4X RP & 4X GTA$ for GTA+ this week) - Magic Bullet for Rank + Good money variety'
        : paperTrail2XEvent
        ? 'Farm Operation Paper Trail (2X RP through Feb 4)'
        : 'Run Cayo Perico (best RP/$ combo)',
      actionType: 'mission',
      detail: `Rank ${rank} = ~${Math.round(rank * 1.2)}% max health. You die instantly in Auto Shop raids. Cannot carry full body armor. Makes combat-heavy content much harder.`,
      timeHours: paperTrail4XEvent ? 1.5 : paperTrail2XEvent ? 2.0 : 2.5,
      savingsPerHour: paperTrail4XEvent ? 400000 : paperTrail2XEvent ? 200000 : 0,
    });
  } else if (rank < 100 && paperTrail4XEvent) {
    // Rank 50-99 with GTA+ and Paper Trail 4X = HIGH priority (but not critical)
    // Still beneficial to rank up for unlocks, but not blocking
    bottlenecks.push({
      id: 'rank_medium',
      label: 'Rank Under 100 (GTA+ Paper Trail 4X Opportunity)',
      critical: false,
      urgent: true, // Urgent because Paper Trail 4X event is time-limited (this week only)
      impact: 'medium',
      solution: 'Farm Operation Paper Trail (4X RP & GTA$ for GTA+ this week) - Fastest way to Rank 100+',
      actionType: 'mission',
      detail: `Rank ${rank}. Operation Paper Trail is paying 4X RP & 4X GTA$ this week for GTA+ members. Good variety option if you get bored of Auto Shop grinding. This is the fastest way to unlock Rank 100+ benefits.`,
      timeHours: 1.5,
      savingsPerHour: 400000, // Paper Trail pays ~$400k/hr at 4X
    });
  }

  // ============================================
  // TIER 3: ASSET GAPS (Same as before)
  // ============================================

  // Asset bottlenecks
  if (!hasKosatka) {
    bottlenecks.push({
      id: 'no_kosatka',
      label: 'No Kosatka Submarine',
      critical: false,
      impact: 'high',
      solution: 'Grind to $2.2M and purchase Kosatka from Warstock',
      actionType: 'purchase',
      detail: 'You are locked out of Cayo Perico, the best solo content even post-nerf.',
      timeHours: MODEL_CONFIG.time?.assets?.kosatkaGrind ?? 5,
    });
  } else {
    // Has Kosatka - check for optimization opportunities (consolidated to prevent duplicates)
    if (!hasSparrow) {
      bottlenecks.push({
        id: 'no_sparrow',
        label: 'No Sparrow for Cayo',
        critical: false,
        impact: 'medium',
        solution: 'Purchase Sparrow helicopter ($1.8M) from Kosatka interaction menu',
        actionType: 'purchase',
        detail: 'Sparrow cuts Cayo setup time in half and makes preps painless.',
        timeHours: MODEL_CONFIG.time?.assets?.sparrowPurchase ?? 2,
      });
    }
    
    // Consolidated Cayo optimization check (prevents duplicates)
    const masteryRuns = MODEL_CONFIG.thresholds?.cayo?.masteryRuns ?? 10;
    
    // Case 1: No completions yet
    if (cayoCompletions === 0) {
      bottlenecks.push({
        id: 'cayo_no_runs',
        label: 'No Cayo completions yet',
        critical: false,
        impact: 'high',
        solution: 'Complete your first Cayo Perico heist (follow guide for optimal approach)',
        actionType: 'heist',
        detail: 'First Cayo unlocks your main solo grind loop.',
        timeHours: MODEL_CONFIG.time?.assets?.firstCayo ?? 2,
      });
    }
    // Case 2: Slow runs (cayoAvgTime > 50) OR under mastery threshold
    else if (cayoAvgTime > 50 || cayoCompletions < masteryRuns) {
      // Determine target time and base payout based on completion count
      const isNewPlayer = cayoCompletions < masteryRuns;
      const targetTime = isNewPlayer ? 50 : 45; // New players: 50 min goal, experienced: 45 min goal
      const basePayout = isNewPlayer ? 800000 : 700000; // Slightly lower for experienced (more realistic)
      
      const potentialPerHour = (60 / targetTime) * basePayout;
      const currentPerHour = (60 / cayoAvgTime) * basePayout;
      const lossPerHour = potentialPerHour - currentPerHour;
      
      // If player has Sparrow, this is purely a knowledge/skill gap, not an asset issue
      const isSkillIssue = hasSparrow;

      bottlenecks.push({
        id: 'cayo_optimization',
        label: isSkillIssue ? '🎯 Fix Cayo Perico Strategy (Skill/Route Issue)' : '🎯 OPTIMIZE CAYO RUNS (Critical)',
        critical: true,
        impact: 'high',
        solution: 'Watch "Cayo Perico Solo Speedrun 2026" guide → Practice Longfin/Drainage Tunnel approach',
        actionType: 'skill_improvement',
        detail: isSkillIssue
          ? `You have Sparrow (fast travel). Your ${cayoAvgTime}-min runs cost you $${Math.round(lossPerHour).toLocaleString()}/hr. This is purely a knowledge gap. Target: ${targetTime} mins.`
          : `Your ${cayoAvgTime}-min runs cost you $${Math.round(lossPerHour).toLocaleString()}/hr. Target: ${targetTime} mins. This is your #1 income leak.`,
        timeHours: isNewPlayer ? 2.0 : ((masteryRuns - cayoCompletions) * 0.75),
        savingsPerHour: Math.round(lossPerHour), // ✅ Sorter prioritizes this
      });
    }
  }

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

  // ============================================
  // INFRASTRUCTURE INVESTMENT BOTTLENECKS (Smart Shopping)
  // ============================================

  // --- BUNKER INFRASTRUCTURE ---
  if (hasBunker) {
    const bunkerState = {
      owned: true,
      equipmentUpgrade: formData.bunkerEquipmentUpgrade || bunkerUpgraded,
      staffUpgrade: formData.bunkerStaffUpgrade || bunkerUpgraded,
    };
    
    const bunkerLeak = calculateBunkerLeak(bunkerState);
    
    if (bunkerLeak.hasLeak) {
      bottlenecks.push({
        id: 'bunker_passive_leak',
        label: '🚨 BUNKER PASSIVE INCOME LEAK',
        critical: true,
        urgent: bunkerLeak.lostPerHour >= 30000, // Critical if losing $30k+/hr
        impact: 'high',
        solution: bunkerLeak.missingEquipment && bunkerLeak.missingStaff
          ? `Buy Equipment ($${(INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade / 1000000).toFixed(2)}M) + Staff ($${(INFRASTRUCTURE_COSTS.bunker.staffUpgrade / 1000).toFixed(0)}k) upgrades.`
          : bunkerLeak.missingEquipment
            ? `Buy Equipment Upgrade ($${(INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade / 1000000).toFixed(2)}M)`
            : `Buy Staff Upgrade ($${(INFRASTRUCTURE_COSTS.bunker.staffUpgrade / 1000).toFixed(0)}k)`,
        actionType: 'infrastructure',
        detail: `You're earning $${bunkerLeak.currentIncome.toLocaleString()}/hr instead of $${bunkerLeak.potentialIncome.toLocaleString()}/hr. Losing $${bunkerLeak.lostPerHour.toLocaleString()}/hr. ROI: ${bunkerLeak.roiHours} hours of passive income.`,
        timeHours: 0.25,
        savingsPerHour: bunkerLeak.lostPerHour,
        cost: bunkerLeak.missingEquipment && bunkerLeak.missingStaff
          ? INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade + INFRASTRUCTURE_COSTS.bunker.staffUpgrade
          : bunkerLeak.missingEquipment
            ? INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade
            : INFRASTRUCTURE_COSTS.bunker.staffUpgrade,
        roiHours: bunkerLeak.roiHours,
      });
    }
  }

  // --- NIGHTCLUB INFRASTRUCTURE ---
  if (hasNightclub) {
    // Read from nightclubStorage (new format) with fallback to legacy fields
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
    
    // MULE TRAP WARNING (Highest Priority)
    const muleTrap = ncOptimization.issues.find(i => i.id === 'nc_mule_trap');
    if (muleTrap) {
      bottlenecks.push({
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
      });
    }
    
    // Equipment Upgrade (if missing)
    const needsEquipment = ncOptimization.issues.find(i => i.id === 'nc_no_equipment');
    if (needsEquipment) {
      const { price, isDiscounted, discountPercent } = getDiscountedPrice(
        INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
        'nightclub'
      );
      
      bottlenecks.push({
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
      });
    }
    
    // Floor expansion (if < 5 floors)
    const needsFloors = ncOptimization.issues.find(i => i.id === 'nc_floors_low');
    if (needsFloors) {
      const currentFloors = nightclubState.floors;
      const currentAFK = NIGHTCLUB_FLOOR_AFK[currentFloors]?.maxHours || 20;
      const maxAFK = NIGHTCLUB_FLOOR_AFK[5].maxHours;
      
      // Calculate cost to max floors
      let floorCost = 0;
      for (let f = currentFloors + 1; f <= 5; f++) {
        floorCost += INFRASTRUCTURE_COSTS.nightclub.floors[f];
      }
      const { price, isDiscounted, discountPercent } = getDiscountedPrice(floorCost, 'nightclub');
      
      bottlenecks.push({
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
      });
    }
    
    // Pounder recommendation (if scaling up without delivery vehicle)
    const needsPounder = ncOptimization.recommendations.find(r => r.id === 'buy_nc_pounder');
    if (needsPounder && !muleTrap) {
      bottlenecks.push({
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
      });
    }
    
    // Tech/Feeder balance
    if (nightclubTechs < 5 || nightclubFeeders < 5) {
      const techImbalance = ncOptimization.issues.find(i => i.id === 'nc_tech_imbalance');
      
      bottlenecks.push({
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
      });
    }
  }
  
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
      detail: `40% off Nightclub properties expires Jan 21 (${nightclubDiscountEvent.hoursLeft < 48 ? nightclubDiscountEvent.hoursLeft + ' hours' : nightclubDiscountEvent.daysLeft + ' days'} left). Save ~$600k on property. Unlocks passive income + Business Battles synergy.`,
      timeHours: 0.25,
      expiresAt: nightclubDiscountEvent.expiryTimestamp,
      savingsValue: 600000,
    });
  }

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

  // ============================================
  // TIER 4: DAILY/QUALITY OF LIFE
  // ============================================

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
