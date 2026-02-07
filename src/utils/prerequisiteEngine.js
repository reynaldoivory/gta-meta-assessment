// src/utils/prerequisiteEngine.js
// Property purchase advisor - prevents buying properties before prerequisites are met
// Shows warnings, blockers, and "ready to buy" status for each property

import { calculateNightclubIncome } from './incomeCalculators.js';
import { MODEL_CONFIG } from './modelConfig.js';
import { INFRASTRUCTURE_COSTS } from './infrastructureAdvisor.js';

/**
 * Prerequisite check status levels
 */
export const PREREQ_STATUS = {
  READY: 'ready',       // Good to buy, will be profitable
  WARNING: 'warning',   // Can buy but ROI is suboptimal
  BLOCKED: 'blocked',   // Should NOT buy yet, missing critical prereqs
  OWNED: 'owned',       // Already owns this property
};

/**
 * Property database with costs and icons
 */
export const PROPERTIES = {
  kosatka: {
    name: 'Kosatka Submarine',
    cost: 2200000,
    icon: '🚢',
    description: 'Unlocks Cayo Perico heist - best solo money maker',
  },
  sparrow: {
    name: 'Sparrow Helicopter',
    cost: 1815000,
    icon: '🚁',
    description: 'Spawns inside Kosatka, cuts Cayo prep time in half',
  },
  agency: {
    name: 'Agency',
    cost: 2010000,
    icon: '💼',
    description: 'Unlocks Dr. Dre contract + Payphone Hits',
  },
  nightclub: {
    name: 'Nightclub',
    cost: 1500000,
    icon: '🏢',
    description: 'Passive income from linked businesses',
  },
  acidLab: {
    name: 'Acid Lab',
    cost: 0, // Free via First Dose
    icon: '🧪',
    description: 'Free via First Dose missions, great passive income',
  },
  bunker: {
    name: 'Bunker',
    cost: 1165000,
    icon: '🏭',
    description: 'Research + passive income from arms dealing',
  },
  autoShop: {
    name: 'Auto Shop',
    cost: 1670000,
    icon: '🔧',
    description: 'Robbery contracts + passive vehicle repairs',
  },
  salvageYard: {
    name: 'Salvage Yard',
    cost: 1700000,
    icon: '🚗',
    description: 'Vehicle robberies + tow truck passive income',
  },
  mcCocaine: {
    name: 'Cocaine Lockup',
    cost: 975000,
    icon: '❄️',
    description: 'MC business - feeds Nightclub technicians',
  },
  mcMeth: {
    name: 'Meth Lab',
    cost: 910000,
    icon: '💊',
    description: 'MC business - feeds Nightclub technicians',
  },
  mcCash: {
    name: 'Counterfeit Cash',
    cost: 845000,
    icon: '💵',
    description: 'MC business - feeds Nightclub technicians',
  },
};

/**
 * Check prerequisites for a specific property
 * @param {string} propertyKey - Property key from PROPERTIES
 * @param {Object} formData - Player form data
 * @param {Object} assessment - Assessment results (optional)
 * @returns {Object} Prerequisite check result
 */
export const checkPrerequisites = (propertyKey, formData, assessment = null) => {
  // Check if already owned
  const ownershipMap = {
    kosatka: formData.hasKosatka,
    sparrow: formData.hasSparrow,
    agency: formData.hasAgency,
    nightclub: formData.hasNightclub,
    acidLab: formData.hasAcidLab,
    bunker: formData.hasBunker,
    autoShop: formData.hasAutoShop,
    salvageYard: formData.hasSalvageYard,
  };
  
  if (ownershipMap[propertyKey]) {
    return {
      status: PREREQ_STATUS.OWNED,
      property: PROPERTIES[propertyKey],
    };
  }
  
  // Route to specific checker
  switch (propertyKey) {
    case 'kosatka':
      return checkKosatkaPrereqs(formData, assessment);
    case 'sparrow':
      return checkSparrowPrereqs(formData, assessment);
    case 'agency':
      return checkAgencyPrereqs(formData, assessment);
    case 'nightclub':
      return checkNightclubPrereqs(formData, assessment);
    case 'acidLab':
      return checkAcidLabPrereqs(formData);
    case 'bunker':
      return checkBunkerPrereqs(formData, assessment);
    case 'autoShop':
      return checkAutoShopPrereqs(formData, assessment);
    case 'salvageYard':
      return checkSalvageYardPrereqs(formData, assessment);
    default:
      return { status: 'unknown', property: PROPERTIES[propertyKey] };
  }
};

/**
 * Check all properties and return prioritized purchase recommendations
 * @param {Object} formData - Player form data
 * @param {Object} assessment - Assessment results
 * @returns {Array} Array of property checks sorted by priority
 */
export const getPropertyRecommendations = (formData, assessment = null) => {
  const checks = [];
  
  for (const [key, property] of Object.entries(PROPERTIES)) {
    const check = checkPrerequisites(key, formData, assessment);
    checks.push({
      key,
      ...property,
      ...check,
    });
  }
  
  // Sort: READY first, then WARNING, then BLOCKED, OWNED last
  const statusOrder = {
    [PREREQ_STATUS.READY]: 0,
    [PREREQ_STATUS.WARNING]: 1,
    [PREREQ_STATUS.BLOCKED]: 2,
    [PREREQ_STATUS.OWNED]: 3,
  };
  
  return checks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
};

/**
 * Get the next recommended property to buy
 * @param {Object} formData - Player form data
 * @param {Object} assessment - Assessment results
 * @returns {Object|null} Next recommended property or null
 */
export const getNextRecommendedPurchase = (formData, assessment = null) => {
  const recommendations = getPropertyRecommendations(formData, assessment);
  const ready = recommendations.filter(r => r.status === PREREQ_STATUS.READY);
  
  if (ready.length === 0) return null;
  
  // Return the first ready property (already sorted by priority)
  return ready[0];
};

// ============================================
// Individual Property Prerequisite Checkers
// ============================================

const checkKosatkaPrereqs = (formData, assessment) => {
  const liquidCash = Number(formData.liquidCash) || 0;
  const property = PROPERTIES.kosatka;
  
  // READY: Always recommended as first major purchase
  if (liquidCash >= property.cost) {
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: '🔥 PRIORITY #1: Best solo money maker in the game. Buy immediately.',
      expectedROI: 'Pays for itself in 3 Cayo runs (~6-8 hours)',
      nextSteps: [
        { step: 'Purchase from Warstock Cache & Carry', reason: 'Only purchase location for military vehicles/submarines' },
        { step: 'Complete Intel mission to unlock heist', reason: 'Scopes the island and unlocks the planning screen' },
        { step: 'Watch a Cayo solo guide on YouTube', reason: 'Optimal route saves 20+ minutes per run' },
      ],
    };
  }
  
  // Need to grind for it
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(property.cost - liquidCash).toLocaleString()} more`,
    recommendation: 'Save up! This should be your #1 priority purchase.',
    grindSuggestion: 'Run Contact Missions, VIP Work, or join heist crews until you have $2.2M',
    whyThisFirst: 'Kosatka unlocks Cayo Perico heist which pays $700k-1.2M solo in 45-60 minutes. No other business comes close to this $/hr.',
  };
};

const checkSparrowPrereqs = (formData, assessment) => {
  const property = PROPERTIES.sparrow;
  
  // BLOCKED: Need Kosatka first
  if (!formData.hasKosatka) {
    return {
      status: PREREQ_STATUS.BLOCKED,
      property,
      blockReason: '🚫 Requires Kosatka submarine first',
      requiredSteps: [
        { step: 'Buy Kosatka ($2.2M) from Warstock Cache & Carry', reason: 'Sparrow can only be stored in Kosatka moon pool' },
        { step: 'THEN buy Sparrow from Kosatka interaction menu', reason: 'Purchased via in-game menu, not website' },
      ],
      whyBlocked: 'Sparrow is a Kosatka-specific vehicle. It spawns inside the submarine and cannot be purchased without owning one.',
    };
  }
  
  const liquidCash = Number(formData.liquidCash) || 0;
  
  // READY: Has Kosatka
  if (liquidCash >= property.cost) {
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: '🚁 Essential Cayo upgrade. Cuts prep time from 90min to 45min.',
      expectedROI: 'Saves 15+ min per run. Pays for itself in 5-6 runs.',
      nextSteps: [
        { step: 'Enter Kosatka submarine', reason: 'Must be inside to access purchase menu' },
        { step: 'Open interaction menu (M on PC)', reason: 'Kosatka has its own submenu' },
        { step: 'Navigate: Kosatka → Moon Pool → Sparrow', reason: 'Moon pool is the underwater vehicle bay' },
        { step: 'Purchase for $1,815,000', reason: 'One-time purchase, spawns instantly' },
      ],
      whyEssential: 'Sparrow spawns ON the Kosatka, eliminating travel time between preps. Has missiles for combat. Cuts each prep from 15min to 5min.',
    };
  }
  
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(property.cost - liquidCash).toLocaleString()} more`,
    recommendation: 'Run 2-3 more Cayo heists to afford this essential upgrade.',
    whyImportant: 'Without Sparrow, you waste 10-15 minutes per prep driving/flying to your Kosatka. This adds up to hours of wasted time.',
  };
};

const checkAgencyPrereqs = (formData, assessment) => {
  const property = PROPERTIES.agency;
  const liquidCash = Number(formData.liquidCash) || 0;
  const hasKosatka = formData.hasKosatka;
  const totalWealth = assessment?.netWorth || liquidCash;
  
  // BLOCKED: Not enough for Agency + still need Kosatka
  if (!hasKosatka && totalWealth < 4200000) {
    return {
      status: PREREQ_STATUS.BLOCKED,
      property,
      blockReason: '🚫 Buy Kosatka first - it\'s the better income source',
      requiredSteps: [
        'Grind to $2.2M for Kosatka',
        'Run Cayo Perico 2-3 times ($2M+)',
        'THEN buy Agency with Cayo profits',
      ],
    };
  }
  
  // READY: Has Kosatka or enough for both
  if (liquidCash >= property.cost) {
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: '💼 Great secondary income. Payphone Hits earn $255k/hr during Cayo cooldowns.',
      expectedROI: 'Pays for itself in ~8 hours of payphone hits',
      nextSteps: [
        'Purchase Agency from Dynasty 8 Executive',
        'Complete "The Contract" story (3-4 hrs) for $1M bonus',
        'Unlock Payphone Hits for $85k per kill',
      ],
    };
  }
  
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(property.cost - liquidCash).toLocaleString()} more`,
    recommendation: 'Run 2-3 Cayo heists to afford this.',
  };
};

const checkNightclubPrereqs = (formData, assessment) => {
  const property = PROPERTIES.nightclub;
  // Calculate feeders from nightclubSources (new format) or use legacy number
  const feeders = formData.nightclubSources 
    ? Object.values(formData.nightclubSources).filter(Boolean).length 
    : Number(formData.nightclubFeeders) || 0;
  const liquidCash = Number(formData.liquidCash) || 0;
  
  // BLOCKED: No feeder businesses = $0/hr income
  if (feeders === 0) {
    return {
      status: PREREQ_STATUS.BLOCKED,
      property,
      blockReason: '🚫 NIGHTCLUB TRAP: Without feeder businesses, this earns $0/hr',
      reasoning: 'Nightclub technicians produce goods FROM your linked MC businesses. No businesses = technicians have nothing to produce = $0 income forever.',
      requiredSteps: [
        { step: 'Buy CEO Office + Bunker ($1.2M)', reason: 'Bunker product feeds nightclub cargo warehouse (1 of 5 feeders)' },
        { step: 'Buy Cocaine Lockup ($975k)', reason: 'Cocaine is highest-earning nightclub product ($10k/hr)' },
        { step: 'Buy Meth Lab ($910k)', reason: 'Meth is second-highest earner ($8.5k/hr)' },
        { step: 'Buy Counterfeit Cash ($845k)', reason: 'Solid third feeder for balanced production' },
        { step: 'THEN buy Nightclub + hire technicians', reason: 'Now your techs have businesses to source from!' },
      ],
      requiredCost: 975000 + 910000 + 845000, // ~$2.7M
      missing: ['Cocaine Lockup', 'Meth Lab', 'Counterfeit Cash'],
      trapWarning: '⚠️ This is the #1 money trap in GTA Online. 67% of players buy Nightclub before feeders and wonder why it makes $0.',
      whyFeedersRequired: 'Nightclub technicians don\'t create products from nothing. They "source" products from your OTHER businesses. Without feeders, technicians sit idle 24/7.',
    };
  }
  
  // WARNING: 1-2 feeders = suboptimal ROI
  if (feeders < 3) {
    const projectedIncome = calculateNightclubIncome(5, feeders);
    const maxIncome = MODEL_CONFIG.income.passive.nightclubMax;
    const efficiency = (projectedIncome / maxIncome) * 100;
    
    return {
      status: PREREQ_STATUS.WARNING,
      property,
      warning: `With ${feeders} feeder business${feeders !== 1 ? 'es' : ''}, Nightclub will only earn $${projectedIncome.toLocaleString()}/hr (${efficiency.toFixed(0)}% efficiency)`,
      recommendation: 'Buy 1-2 more MC businesses first for better ROI',
      missing: feeders === 1 
        ? ['Cocaine OR Meth Lab']
        : ['One more MC business'],
      whyMoreFeeders: `Each additional feeder business unlocks another technician slot. 3+ feeders hits the sweet spot where passive income justifies the investment. At ${feeders} feeder${feeders !== 1 ? 's' : ''}, you're only using ${Math.round(efficiency)}% of the nightclub's potential.`,
    };
  }
  
  // READY: 3+ feeders
  if (liquidCash >= property.cost) {
    const projectedIncome = calculateNightclubIncome(5, feeders);
    const hoursToPayoff = Math.ceil((property.cost + 705000) / projectedIncome); // +5 techs
    
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: `✅ With ${feeders} feeders, Nightclub will earn $${projectedIncome.toLocaleString()}/hr passive. Good investment!`,
      expectedROI: `Pays for itself (club + techs) in ~${hoursToPayoff} hours`,
      nextSteps: [
        { step: 'Buy Nightclub from Maze Bank Foreclosures', reason: 'Any location works - choose based on convenience' },
        { step: `Hire all 5 technicians ($${INFRASTRUCTURE_COSTS.nightclub.technicianTotal.toLocaleString()} total)`, reason: 'Technician costs scale by tier but produce ~$15k+/hr passively each' },
        { step: 'Assign each technician to a business', reason: 'Unassigned techs don\'t produce anything!' },
        { step: 'Sell when stock reaches ~$800k+', reason: 'Optimal sell point before diminishing production rates' },
      ],
      whyGoodInvestment: `At ${feeders} feeders with 5 techs, nightclub becomes a true passive income source. AFK for a few hours, come back to $800k+ waiting to be sold.`,
    };
  }
  
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(property.cost - liquidCash).toLocaleString()} more`,
    recommendation: 'Save up. Nightclub is worth it with your feeder businesses.',
    whySaveUp: `With ${feeders} feeders already owned, you\'ll hit ~60%+ efficiency immediately. This is one of the better passive income investments once you have the prerequisites.`,
  };
};

const checkAcidLabPrereqs = (formData) => {
  const property = PROPERTIES.acidLab;
  
  // ALWAYS READY: Free via First Dose missions
  return {
    status: PREREQ_STATUS.READY,
    property,
    recommendation: '🔥 BEST BEGINNER BUSINESS: 100% free via "First Dose" missions. Earns $75k/hr+ upgraded.',
    expectedROI: 'FREE! Upgrade costs $250k but pays for itself in ~4 hours.',
    nextSteps: [
      'Call Ron on your phone',
      'Accept "First Dose" mission series',
      'Complete 6 missions (2-3 hours)',
      'Acid Lab is yours - FREE!',
      'Later: Buy equipment upgrade ($250k) for 40% more income',
    ],
  };
};

const checkBunkerPrereqs = (formData, assessment) => {
  const property = PROPERTIES.bunker;
  const liquidCash = Number(formData.liquidCash) || 0;
  const hasKosatka = formData.hasKosatka;
  
  // WARNING: Kosatka should come first
  if (!hasKosatka) {
    return {
      status: PREREQ_STATUS.WARNING,
      property,
      warning: 'Kosatka is a higher priority purchase for income',
      recommendation: 'Buy Kosatka first, then use Cayo profits for Bunker.',
    };
  }
  
  if (liquidCash >= property.cost + 1800000) { // Bunker + upgrades
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: '🏭 Good passive income. Make sure to buy Equipment + Staff upgrades immediately.',
      expectedROI: 'Upgraded bunker earns $75k/hr. Pays off in ~40 hours AFK.',
      nextSteps: [
        'Buy Bunker from Maze Bank Foreclosures',
        'IMMEDIATELY buy Equipment Upgrade (~$1.1M)',
        'Buy Staff Upgrade (~$600k)',
        'Optional: Research for weapon mods',
      ],
      note: 'Unupgraded bunker is a trap - always buy with upgrade budget!',
    };
  }
  
  if (liquidCash >= property.cost) {
    return {
      status: PREREQ_STATUS.WARNING,
      property,
      warning: 'You can afford the bunker but NOT the upgrades',
      recommendation: 'Save $1.8M more for upgrades. Unupgraded bunker earns 64% less.',
    };
  }
  
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(property.cost + 1800000 - liquidCash).toLocaleString()} for bunker + upgrades`,
    recommendation: 'Save up. Bunker is mid-tier priority after Kosatka/Agency.',
  };
};

const checkAutoShopPrereqs = (formData, assessment) => {
  const property = PROPERTIES.autoShop;
  const liquidCash = Number(formData.liquidCash) || 0;
  const hasGTAPlus = formData.hasGTAPlus;
  
  // GTA+ discount
  const discountedCost = hasGTAPlus ? 835000 : property.cost;
  
  if (liquidCash >= discountedCost) {
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: hasGTAPlus 
        ? '🔥 GTA+ DISCOUNT: Only $835k! During 2X events, this is the BEST income source.'
        : '🔧 Good variety business. Robbery contracts during 2X events are excellent.',
      expectedROI: '2X event income: $1M+/hr. Normal: $300-400k/hr.',
      nextSteps: [
        'Buy Auto Shop from Maze Bank Foreclosures',
        hasGTAPlus ? '(50% off for GTA+ members!)' : '',
        'Staff will prep contracts automatically',
        'Run Union Depository for highest payout',
      ].filter(Boolean),
    };
  }
  
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(discountedCost - liquidCash).toLocaleString()} more`,
    recommendation: hasGTAPlus 
      ? 'GTA+ discount makes this affordable fast. Consider during 2X events.'
      : 'Mid-tier priority. Great during 2X events.',
  };
};

const checkSalvageYardPrereqs = (formData, assessment) => {
  const property = PROPERTIES.salvageYard;
  const liquidCash = Number(formData.liquidCash) || 0;
  const hasKosatka = formData.hasKosatka;
  const hasAgency = formData.hasAgency;
  
  // WARNING: Lower priority than Kosatka/Agency
  if (!hasKosatka || !hasAgency) {
    return {
      status: PREREQ_STATUS.WARNING,
      property,
      warning: 'Salvage Yard is fun but not optimal ROI',
      recommendation: 'Get Kosatka + Agency first for better income per dollar spent.',
    };
  }
  
  if (liquidCash >= property.cost) {
    return {
      status: PREREQ_STATUS.READY,
      property,
      recommendation: '🚗 Good variety business for experienced players. Robberies are fun!',
      expectedROI: 'Earns ~$100k/hr active + tow truck passive. Pays off in ~17 hours.',
      nextSteps: [
        'Buy Salvage Yard from Maze Bank Foreclosures',
        'Buy Tow Truck for passive income',
        'Run vehicle robberies for active income',
      ],
    };
  }
  
  return {
    status: PREREQ_STATUS.WARNING,
    property,
    warning: `You need $${(property.cost - liquidCash).toLocaleString()} more`,
    recommendation: 'Lower priority. Buy after core businesses are set up.',
  };
};
