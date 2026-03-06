// src/utils/infrastructureAdvisor.js
// Smart Shopping Module - Infrastructure Investment Advisor
// Distinguishes between "Owned" and "Optimized" businesses

import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';
import { MODEL_CONFIG } from './modelConfig.js';

/**
 * Infrastructure cost constants (2026 prices)
 */
export const INFRASTRUCTURE_COSTS = {
  bunker: {
    equipmentUpgrade: 1155000,
    staffUpgrade: 598500,
    securityUpgrade: 351000,
    // ROI: Equipment + Staff = essential, Security = optional
  },
  nightclub: {
    floors: {
      1: 0,        // Base
      2: 755000,
      3: 1135000,
      4: 1515000,
      5: 1895000,
    },
    equipmentUpgrade: 1425000,
    staffUpgrade: 475000,
    securityUpgrade: 695000, // Optional - just reduces raids
    technicianCosts: [0, 141000, 184500, 240500, 312000], // Tech 1-5 (first is free)
    technicianTotal: 878000, // Total to hire all 5 technicians
    pounderCustom: 1900000,  // Essential for large sales
    muleCustom: 1400000,     // TRAP - never buy this
    speedo: 0,               // Free with NC
  },
  acidLab: {
    equipmentUpgrade: 250000,
  },
  mcBusinesses: {
    // For Nightclub feeding ONLY - no upgrades needed
    coke: { setup: 975000, equipmentUpgrade: 935000, staffUpgrade: 390000 },
    meth: { setup: 910000, equipmentUpgrade: 1100000, staffUpgrade: 331500 },
    cash: { setup: 845000, equipmentUpgrade: 880000, staffUpgrade: 273000 },
    weed: { setup: 715000, equipmentUpgrade: 990000, staffUpgrade: 273000 },
    documents: { setup: 650000, equipmentUpgrade: 660000, staffUpgrade: 195000 },
  },
};

/**
 * Calculate total cost to hire technicians from current to target count.
 * Tech 1 is free; costs scale for Tech 2-5.
 * @param {number} currentTechs - Current number of technicians (0-5)
 * @param {number} targetTechs - Target number of technicians (0-5)
 * @returns {number} Total cost to reach targetTechs
 */
export const getNightclubTechnicianCost = (currentTechs, targetTechs = 5) => {
  const costs = INFRASTRUCTURE_COSTS.nightclub.technicianCosts;
  const start = Math.max(0, Math.min(5, Number(currentTechs) || 0));
  const end = Math.max(0, Math.min(5, Number(targetTechs) || 0));
  if (end <= start) return 0;

  let total = 0;
  for (let i = start; i < end; i += 1) {
    total += costs[i] || 0;
  }

  return total;
};

/**
 * Nightclub floor AFK duration calculations
 * More floors = longer AFK time before goods cap
 */
export const NIGHTCLUB_FLOOR_AFK = {
  1: { maxHours: 20, description: '20 hours until capped' },
  2: { maxHours: 32, description: '32 hours until capped' },
  3: { maxHours: 44, description: '44 hours until capped' },
  4: { maxHours: 56, description: '56 hours until capped' },
  5: { maxHours: 66, description: '66+ hours until capped (overnight safe)' },
};

/**
 * Calculate current discount percentage for an upgrade category
 * @param {string} category - 'nightclub', 'bunker', etc.
 * @returns {number} Discount percentage (0-1)
 */
const getCurrentDiscount = (category) => {
  const now = Date.now();
  
  if (category === 'nightclub' || category === 'nightclubUpgrades') {
    const discount = WEEKLY_EVENTS.discounts?.nightclubUpgrades;
    if (discount && new Date(discount.validUntil).getTime() > now) {
      return discount.percent / 100;
    }
    const propDiscount = WEEKLY_EVENTS.discounts?.nightclubProperties;
    if (propDiscount && new Date(propDiscount.validUntil).getTime() > now) {
      return propDiscount.percent / 100;
    }
  }
  
  return 0;
};

/**
 * Calculate discounted price
 * @param {number} basePrice - Original price
 * @param {string} category - Discount category
 * @returns {{ price: number, savings: number, isDiscounted: boolean }}
 */
export const getDiscountedPrice = (basePrice, category) => {
  const discount = getCurrentDiscount(category);
  const discountedPrice = Math.round(basePrice * (1 - discount));
  return {
    price: discountedPrice,
    savings: basePrice - discountedPrice,
    isDiscounted: discount > 0,
    discountPercent: Math.round(discount * 100),
  };
};

/**
 * Bunker income calculations (derived from MODEL_CONFIG single source of truth)
 */
const _bunkerBase = MODEL_CONFIG.income.passive.bunkerBase;       // $30,000
const _bunkerMax = MODEL_CONFIG.income.bunker.upgraded.perHour;  // $75,000
const BUNKER_INCOME = {
  unupgraded: _bunkerBase,                                       // $30k/hr
  equipmentOnly: Math.round(_bunkerBase + (_bunkerMax - _bunkerBase) * 0.55), // ~$55k/hr
  staffOnly: Math.round(_bunkerBase + (_bunkerMax - _bunkerBase) * 0.4),     // ~$48k/hr
  fullyUpgraded: _bunkerMax,                                     // $75k/hr
};

/**
 * Calculate bunker passive income leak
 * @param {Object} bunkerState - { owned, equipmentUpgrade, staffUpgrade }
 * @returns {Object} Income analysis
 */
export const calculateBunkerLeak = (bunkerState) => {
  if (!bunkerState?.owned) {
    return { hasLeak: false, currentIncome: 0, potentialIncome: 0, lostPerHour: 0 };
  }
  
  let currentIncome = BUNKER_INCOME.unupgraded;
  
  if (bunkerState.equipmentUpgrade && bunkerState.staffUpgrade) {
    currentIncome = BUNKER_INCOME.fullyUpgraded;
  } else if (bunkerState.equipmentUpgrade) {
    currentIncome = BUNKER_INCOME.equipmentOnly;
  } else if (bunkerState.staffUpgrade) {
    currentIncome = BUNKER_INCOME.staffOnly;
  }
  
  const lostPerHour = BUNKER_INCOME.fullyUpgraded - currentIncome;
  const roiHours = lostPerHour > 0 
    ? Math.round((INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade + INFRASTRUCTURE_COSTS.bunker.staffUpgrade) / lostPerHour)
    : 0;
  
  return {
    hasLeak: lostPerHour > 0,
    currentIncome,
    potentialIncome: BUNKER_INCOME.fullyUpgraded,
    lostPerHour,
    roiHours,
    missingEquipment: !bunkerState.equipmentUpgrade,
    missingStaff: !bunkerState.staffUpgrade,
  };
};

/**
 * Calculate nightclub optimization state
 * @param {Object} nightclubState - { owned, floors, equipmentUpgrade, staffUpgrade, hasPounder, hasMule, techs, feeders }
 * @returns {Object} Optimization analysis
 */

const checkFloorIssues = (floors, _nightclubState) => {
  if (floors >= 5) {
    return null;
  }

  const currentAFK = NIGHTCLUB_FLOOR_AFK[floors]?.maxHours || 20;
  const maxAFK = NIGHTCLUB_FLOOR_AFK[5].maxHours;

  const issue = {
    id: 'nc_floors_low',
    severity: 'medium',
    label: `Only ${floors}/5 Floors`,
    detail: `AFK limited to ${currentAFK} hours. With 5 floors: ${maxAFK} hours (overnight safe).`,
  };

  // Calculate cost to max floors
  let floorCost = 0;
  for (let f = floors + 1; f <= 5; f++) {
    floorCost += INFRASTRUCTURE_COSTS.nightclub.floors[f];
  }

  const { price, isDiscounted, discountPercent } = getDiscountedPrice(floorCost, 'nightclub');

  const recommendation = {
    id: 'buy_nc_floors',
    priority: isDiscounted ? 1 : 3,
    label: `Buy Floors ${floors + 1}-5`,
    cost: price,
    originalCost: floorCost,
    isDiscounted,
    discountPercent,
    benefit: `Increase AFK from ${currentAFK}hrs to ${maxAFK}hrs`,
    why: 'Stops production cap while sleeping/working',
  };

  return { issue, recommendation };
};

const checkEquipmentIssues = (nightclubState) => {
  if (nightclubState.equipmentUpgrade) {
    return null;
  }

  const { price, isDiscounted, discountPercent } = getDiscountedPrice(
    INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade, 
    'nightclub'
  );

  const issue = {
    id: 'nc_no_equipment',
    severity: 'high',
    label: 'No Equipment Upgrade',
    detail: 'Production speed is 50% slower without this upgrade.',
  };

  const recommendation = {
    id: 'buy_nc_equipment',
    priority: isDiscounted ? 0 : 2,
    label: 'Equipment Upgrade',
    cost: price,
    originalCost: INFRASTRUCTURE_COSTS.nightclub.equipmentUpgrade,
    isDiscounted,
    discountPercent,
    benefit: '+100% production speed',
    why: 'Essential for passive income',
  };

  return { issue, recommendation };
};

const checkStaffIssues = (nightclubState) => {
  if (nightclubState.staffUpgrade) {
    return null;
  }

  const { price, isDiscounted, discountPercent } = getDiscountedPrice(
    INFRASTRUCTURE_COSTS.nightclub.staffUpgrade,
    'nightclub'
  );

  const issue = {
    id: 'nc_no_staff',
    severity: 'medium',
    label: 'No Staff Upgrade',
    detail: 'Nightclub popularity decays faster.',
  };

  const recommendation = {
    id: 'buy_nc_staff',
    priority: isDiscounted ? 1 : 4,
    label: 'Staff Upgrade',
    cost: price,
    originalCost: INFRASTRUCTURE_COSTS.nightclub.staffUpgrade,
    isDiscounted,
    discountPercent,
    benefit: 'Slower popularity decay',
    why: 'Quality of life improvement',
  };

  return { issue, recommendation };
};

const checkVehicleIssues = (nightclubState, floors, techs) => {
  const issues = [];
  const recommendations = [];

  if (floors < 3 && techs < 3) {
    return { issues, recommendations };
  }

  // Player is scaling up - needs delivery vehicle advice
  if (!nightclubState.hasPounder && !nightclubState.hasMule) {
    recommendations.push({
      id: 'buy_nc_pounder',
      priority: 1,
      label: 'Buy Pounder Custom',
      cost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
      benefit: 'Handles ALL large sales (90+ crates)',
      why: 'Essential for full warehouse sales. DO NOT buy Mule Custom.',
      isVehicle: true,
      isCritical: true,
    });
  } else if (nightclubState.hasMule && !nightclubState.hasPounder) {
    // THE MULE TRAP - Player made a mistake
    issues.push({
      id: 'nc_mule_trap',
      severity: 'critical',
      label: 'Ã¢Å¡Â Ã¯Â¸Â MULE CUSTOM TRAP',
      detail: 'You bought the Mule Custom. It\'s slow and buggy. You still need the Pounder for large sales.',
      isTrap: true,
    });

    recommendations.push({
      id: 'buy_nc_pounder_recovery',
      priority: 0,
      label: 'Buy Pounder Custom (Recovery)',
      cost: INFRASTRUCTURE_COSTS.nightclub.pounderCustom,
      benefit: 'Fixes the Mule trap - covers all large sales',
      why: 'The Mule cannot handle 90+ crate sales. Pounder can.',
      isVehicle: true,
      isCritical: true,
    });
  }

  return { issues, recommendations };
};

const checkTechBalance = (techs, feeders) => {
  if (techs >= feeders) {
    return null;
  }

  return {
    id: 'nc_tech_imbalance',
    severity: 'medium',
    label: 'Technician Shortage',
    detail: `You have ${feeders} feeders but only ${techs} technicians. ${feeders - techs} businesses are idle.`,
  };
};

export const calculateNightclubOptimization = (nightclubState) => {
  if (!nightclubState?.owned) {
    return { isOptimized: true, issues: [], recommendations: [] };
  }
  
  const issues = [];
  const recommendations = [];
  const floors = nightclubState.floors || 1;
  const techs = nightclubState.techs || 0;
  const feeders = nightclubState.feeders || 0;
  
  const floorResult = checkFloorIssues(floors, nightclubState);
  if (floorResult) {
    issues.push(floorResult.issue);
    recommendations.push(floorResult.recommendation);
  }

  const equipmentResult = checkEquipmentIssues(nightclubState);
  if (equipmentResult) {
    issues.push(equipmentResult.issue);
    recommendations.push(equipmentResult.recommendation);
  }

  const staffResult = checkStaffIssues(nightclubState);
  if (staffResult) {
    issues.push(staffResult.issue);
    recommendations.push(staffResult.recommendation);
  }

  const vehicleResult = checkVehicleIssues(nightclubState, floors, techs);
  issues.push(...vehicleResult.issues);
  recommendations.push(...vehicleResult.recommendations);

  const techIssue = checkTechBalance(techs, feeders);
  if (techIssue) {
    issues.push(techIssue);
  }

  recommendations.sort((a, b) => a.priority - b.priority);

  return {
    isOptimized: issues.length === 0,
    issues,
    recommendations,
    currentFloors: floors,
    maxAFKHours: NIGHTCLUB_FLOOR_AFK[floors]?.maxHours || 20,
  };
};

/**
 * MC Business over-investment detector
 * @param {Object} mcState - MC business ownership/upgrade state
 * @param {string} playStyle - 'nightclub_only', 'active_mc', 'hybrid'
 * @returns {Object} Over-investment analysis
 */
const detectMCOverInvestment = (mcState, playStyle = 'nightclub_only') => {
  if (playStyle !== 'nightclub_only') {
    return { hasOverInvestment: false, wastedMoney: 0, businesses: [] };
  }
  
  const overInvestedBusinesses = [];
  let wastedMoney = 0;
  
  const mcTypes = ['coke', 'meth', 'cash', 'weed', 'documents'];
  
  mcTypes.forEach(type => {
    const biz = mcState?.[type];
    if (biz?.owned) {
      // For NC-only play, upgrades are wasted
      if (biz.equipmentUpgrade) {
        wastedMoney += INFRASTRUCTURE_COSTS.mcBusinesses[type].equipmentUpgrade;
        overInvestedBusinesses.push({
          business: type,
          upgrade: 'equipment',
          wasted: INFRASTRUCTURE_COSTS.mcBusinesses[type].equipmentUpgrade,
        });
      }
      if (biz.staffUpgrade) {
        wastedMoney += INFRASTRUCTURE_COSTS.mcBusinesses[type].staffUpgrade;
        overInvestedBusinesses.push({
          business: type,
          upgrade: 'staff',
          wasted: INFRASTRUCTURE_COSTS.mcBusinesses[type].staffUpgrade,
        });
      }
    }
  });
  
  return {
    hasOverInvestment: overInvestedBusinesses.length > 0,
    wastedMoney,
    businesses: overInvestedBusinesses,
    advice: overInvestedBusinesses.length > 0
      ? 'MC upgrades don\'t boost Nightclub accumulation speed. For NC-only play, these were unnecessary purchases.'
      : null,
  };
};

/**
 * Generate all infrastructure investment recommendations
 * @param {Object} formData - Full form data with business states
 * @returns {Array} Prioritized infrastructure recommendations
 */
export const generateInfrastructureRecommendations = (formData) => {
  const recommendations = [];
  const cash = Number(formData.liquidCash) || 0;
  
  // --- BUNKER ANALYSIS ---
  if (formData.hasBunker) {
    const bunkerState = {
      owned: true,
      equipmentUpgrade: formData.bunkerEquipmentUpgrade || formData.bunkerUpgraded,
      staffUpgrade: formData.bunkerStaffUpgrade || formData.bunkerUpgraded,
    };
    
    const bunkerLeak = calculateBunkerLeak(bunkerState);
    
    if (bunkerLeak.hasLeak) {
      if (bunkerLeak.missingEquipment) {
        recommendations.push({
          id: 'bunker_equipment',
          category: 'bunker',
          priority: 1,
          type: 'INFRASTRUCTURE',
          title: 'Ã°Å¸ÂÂ­ Buy Bunker Equipment Upgrade',
          cost: INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade,
          benefit: `+$${(bunkerLeak.potentialIncome - BUNKER_INCOME.unupgraded).toLocaleString()}/hr passive`,
          why: `You're earning $${bunkerLeak.currentIncome.toLocaleString()}/hr instead of $${bunkerLeak.potentialIncome.toLocaleString()}/hr. 300% income increase.`,
          roiHours: bunkerLeak.roiHours,
          canAfford: cash >= INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade,
          urgency: 'HIGH',
        });
      }
      
      if (bunkerLeak.missingStaff) {
        recommendations.push({
          id: 'bunker_staff',
          category: 'bunker',
          priority: 2,
          type: 'INFRASTRUCTURE',
          title: 'Ã°Å¸ÂÂ­ Buy Bunker Staff Upgrade',
          cost: INFRASTRUCTURE_COSTS.bunker.staffUpgrade,
          benefit: 'Faster production speed',
          why: 'Required for "Buy Supplies" strategy to be profitable.',
          canAfford: cash >= INFRASTRUCTURE_COSTS.bunker.staffUpgrade,
          urgency: 'HIGH',
        });
      }
    }
  }
  
  // --- NIGHTCLUB ANALYSIS ---
  if (formData.hasNightclub) {
    const nightclubState = {
      owned: true,
      floors: Number(formData.nightclubFloors) || 1,
      equipmentUpgrade: formData.nightclubEquipmentUpgrade,
      staffUpgrade: formData.nightclubStaffUpgrade,
      hasPounder: formData.hasPounderCustom || formData.nightclubStorage?.hasPounder,
      hasMule: formData.hasMuleCustom || formData.nightclubStorage?.hasMule,
      techs: Number(formData.nightclubTechs) || 0,
      feeders: formData.nightclubSources 
        ? Object.values(formData.nightclubSources).filter(Boolean).length 
        : Number(formData.nightclubFeeders) || 0,
    };
    
    const ncOptimization = calculateNightclubOptimization(nightclubState);
    
    // Add all NC recommendations
    ncOptimization.recommendations.forEach(rec => {
      let recUrgency;
      if (rec.isDiscounted) recUrgency = 'URGENT';
      else if (rec.isCritical) recUrgency = 'HIGH';
      else recUrgency = 'MEDIUM';

      recommendations.push({
        id: rec.id,
        category: 'nightclub',
        priority: rec.priority,
        type: rec.isCritical ? 'CRITICAL' : 'INFRASTRUCTURE',
        title: rec.isCritical ? `Ã¢Å¡Â Ã¯Â¸Â ${rec.label}` : `Ã°Å¸Å½Â­ ${rec.label}`,
        cost: rec.cost,
        originalCost: rec.originalCost,
        isDiscounted: rec.isDiscounted,
        discountPercent: rec.discountPercent,
        benefit: rec.benefit,
        why: rec.why,
        canAfford: cash >= rec.cost,
        urgency: recUrgency,
        expiresAt: rec.isDiscounted ? new Date(WEEKLY_EVENTS.discounts?.nightclubUpgrades?.validUntil).getTime() : null,
      });
    });
    
    // Add trap warnings as high-priority items
    ncOptimization.issues.filter(i => i.isTrap).forEach(trap => {
      recommendations.unshift({
        id: trap.id,
        category: 'nightclub',
        priority: -1, // Highest priority
        type: 'WARNING',
        title: trap.label,
        why: trap.detail,
        urgency: 'CRITICAL',
        isTrap: true,
      });
    });
  }
  
  // --- MC OVER-INVESTMENT CHECK ---
  const mcState = {
    coke: { owned: formData.hasCoke, equipmentUpgrade: formData.cokeEquipmentUpgrade, staffUpgrade: formData.cokeStaffUpgrade },
    meth: { owned: formData.hasMeth, equipmentUpgrade: formData.methEquipmentUpgrade, staffUpgrade: formData.methStaffUpgrade },
    cash: { owned: formData.hasCash, equipmentUpgrade: formData.cashEquipmentUpgrade, staffUpgrade: formData.cashStaffUpgrade },
    weed: { owned: formData.hasWeed, equipmentUpgrade: formData.weedEquipmentUpgrade, staffUpgrade: formData.weedStaffUpgrade },
    documents: { owned: formData.hasDocuments, equipmentUpgrade: formData.documentsEquipmentUpgrade, staffUpgrade: formData.documentsStaffUpgrade },
  };
  
  const mcOverInvestment = detectMCOverInvestment(mcState, formData.mcPlayStyle || 'nightclub_only');
  
  if (mcOverInvestment.hasOverInvestment) {
    recommendations.push({
      id: 'mc_over_investment',
      category: 'mc',
      priority: 10, // Low priority - just informational
      type: 'INFO',
      title: 'Ã°Å¸â€œÅ  MC Over-Investment Detected',
      why: mcOverInvestment.advice,
      wastedMoney: mcOverInvestment.wastedMoney,
      urgency: 'LOW',
      isWarning: true,
    });
  }
  
  // Sort by priority (lower = higher priority)
  return recommendations.sort((a, b) => a.priority - b.priority);
};

