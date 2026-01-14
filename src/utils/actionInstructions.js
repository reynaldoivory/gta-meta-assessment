// src/utils/actionInstructions.js
// Step-by-step instructions for each bottleneck/action type
// Keys must match bottleneck IDs from computeAssessment.js

export const ACTION_INSTRUCTIONS = {
  // ============================================
  // PROPERTY CLAIMS
  // ============================================
  free_car_wash: {
    title: 'How to Claim Free Car Wash (Money Fronts Update)',
    steps: [
      '⚠️ PREREQUISITE: Meet Martin Madrazo at LSIA (airport)',
      '  - You\'ll get a call/text to meet him',
      '  - Complete the cutscene interaction',
      '',
      'THEN:',
      '1. Open your in-game phone (↑ on D-Pad / Arrow Up)',
      '2. Click "Internet" icon',
      '3. Go to "Money and Services" tab',
      '4. Click "Maze Bank Foreclosures"',
      '5. Scroll to "Hands On Car Wash" (should show $0 this week)',
      '6. Select property → Confirm purchase',
      '7. Wait 10-15 seconds for confirmation email',
    ],
    location: 'La Mesa / Mirror Park area (auto-assigned)',
    warnings: [
      '⚠️ Expires Jan 14, 2026 at 4AM ET',
      '💡 Part of "Money Fronts" weekly update - requires meeting Madrazo first',
      '✅ Claim even if you won\'t use it - free $1.4M+ business asset',
    ],
    videoGuide: 'Search YouTube: "How to claim free property GTA Online Money Fronts"',
  },
  
  claim_free_car: {
    title: 'How to Claim Free Pfister Astrale (GTA+)',
    steps: [
      'Go to The Vinewood Car Club (GPS: "Vinewood Car Club")',
      'Location: Elysian Island (south LS, near docks)',
      'Enter the building (yellow marker)',
      'Approach the Pfister Astrale (highlighted vehicle)',
      'Press interaction button to claim',
      'Choose garage to store it',
    ],
    location: 'Vinewood Car Club - Elysian Island',
    warnings: [
      '💡 GTA+ members only (monthly benefit)',
      '✅ Claim even if you don\'t like sports cars - free $1.6M asset',
    ],
  },

  // ============================================
  // PROPERTY PURCHASES
  // ============================================
  buy_auto_shop: {
    title: 'How to Buy Auto Shop',
    steps: [
      'Open phone → Internet → Maze Bank Foreclosures',
      'Select "Auto Shops"',
      'BEST LOCATIONS (by priority):',
      '  ⭐ La Mesa ($1,670,000 / $835k GTA+) - Best location, central',
      '  💰 Strawberry ($1,670,000 / $835k GTA+) - Good highway access',
      '  ✅ Mission Row ($1,670,000 / $835k GTA+) - Near police station',
      '  ❌ Skip: Rancho, Cypress Flats (bad locations)',
      'UPGRADES:',
      '  - Staff ($296,000) - Skip, cosmetic only',
      '  - Vehicle Workshop ($815,000) - Get this for Robbery Contracts',
      'Total: $835k (base) + $815k (workshop) = $1.65M with GTA+',
      'Confirm purchase → Wait for Sessanta call',
    ],
    budgetAdvice: {
      minimum: 1670000, 
      recommended: 2485000, 
      optimal: 2485000,
    },
    warnings: [
      '✅ GTA+ members get 50% off ($835k instead of $1.67M)',
      '💡 2X Robbery Contracts run through Feb 4, 2026 for GTA+',
    ],
  },

  no_kosatka: {
    title: 'How to Buy Kosatka Submarine',
    steps: [
      'Open phone → Internet → Warstock Cache & Carry',
      'Scroll to "Kosatka" ($2,200,000 base)',
      'CRITICAL ADD-ON: Sparrow helicopter ($1,815,000)',
      '  - Cuts prep time in half',
      '  - Spawns next to you instantly',
      'Total minimum: $2.2M (sub only) or $4M (sub + Sparrow)',
      'Skip: Sonar Station, Guided Missiles (useless for Cayo)',
      'Confirm → Wait for Pavel call',
      'Access: Phone → Services → Kosatka',
    ],
    budgetAdvice: {
      minimum: 2200000,
      recommended: 4015000, // Sub + Sparrow
      optimal: 4015000,
    },
    warnings: [
      '⚠️ Don\'t buy Sonar Station - waste of $1.2M',
      '💡 Can grind 1 Cayo without Sparrow, then buy Sparrow',
    ],
  },

  no_sparrow: {
    title: 'How to Buy Sparrow Helicopter',
    steps: [
      'Requirement: Own Kosatka Submarine',
      'Go to Kosatka → Interaction Menu (M key / D-Pad)',
      'Select "Kosatka Services" → "Sparrow"',
      'Cost: $1,815,000',
      'Spawns instantly next to you',
      'Cuts Cayo prep time from 60 mins → 35 mins',
    ],
    budgetAdvice: {
      minimum: 1815000,
      recommended: 1815000,
      optimal: 1815000,
    },
    warnings: [
      '✅ Best ROI upgrade in the game',
      '💡 Can spawn Sparrow even if Kosatka is underwater',
    ],
  },

  no_agency: {
    title: 'How to Buy Agency',
    steps: [
      'Open phone → Internet → Dynasty 8 Executive → Agencies',
      'BEST LOCATIONS:',
      '  💰 Little Seoul ($2,010,000) - Cheapest, central',
      '  ⭐ Hawick ($2,415,000) - Best value',
      '  👑 Rockford Hills ($2,830,000) - Premium',
      'Skip all upgrades on first purchase',
      'Confirm → Wait for Franklin call',
    ],
    budgetAdvice: {
      minimum: 2010000,
      recommended: 2415000,
      optimal: 2830000,
    },
    warnings: [
      '✅ Little Seoul is 90% as good for 70% the price',
      '⚠️ Skip Armory, Vehicle Workshop until later',
    ],
  },

  // ============================================
  // SKILL / MISSION GUIDES
  // ============================================
  strength_low: {
    title: 'How to Max Strength (Damage Resistance Training)',
    steps: [
      'METHOD 1: Pier Pressure Mission (FREE - 20 mins)',
      '  1. Launch contact mission "Pier Pressure" (Gerald)',
      '  2. Don\'t complete objective - just punch NPCs',
      '  3. Find an alley with spawning NPCs',
      '  4. Equip fists (hold weapon wheel → select fists)',
      '  5. Punch NPCs repeatedly for 20 minutes',
      '  6. Each knockout = +0.5% strength',
      '',
      'METHOD 2: Mansion Gym (FASTEST - 20 mins)',
      '  Requirement: Own a Mansion ($11.5M - $12.8M)',
      '  1. Go to your Mansion',
      '  2. Enter the Gym area',
      '  3. Use bench press OR sparring minigame',
      '  4. Complete workout circuits for stat gains',
      '  5. ⚡ FASTEST METHOD IN 2026 - 20 mins to max from 2/5 bars',
      '',
      'MANSION OPTIONS (If you have $11M+ later):',
      '  💰 Tongva Estate ($11.5M) - Cheapest, ocean views',
      '  ⭐ Vinewood Residence ($12.2M) - Iconic city views',
      '  👑 Richman Villa ($12.8M) - Ultimate flex, highest status',
    ],
    warnings: [
      '✅ Method 1 is FREE and works for everyone',
      '⚠️ Don\'t buy a mansion JUST for strength - only buy at endgame ($15M+ net worth)',
      '💡 Mansions unlock Master Control Terminal (manage all businesses from one place)',
      '❌ MYTH DEBUNKED: "Strength only affects melee damage"',
      '   → FALSE: Strength is a damage resistance multiplier. Low strength = you take MORE damage from bullets, explosions, and falls.',
      '   → High strength = armor multiplier effect. Critical for surviving Auto Shop contracts, heists, and PVP.',
      '🎥 Video: "Don\'t Buy The WRONG Mansion In the NEW GTA Online DLC"',
    ],
    videoGuide: 'Search YouTube: "Don\'t Buy The WRONG Mansion GTA Online"',
  },

  flying_low: {
    title: 'How to Max Flying Skill (Vehicle Stability Training)',
    steps: [
      'METHOD 1: Flight School (LSIA) - 45 mins',
      '  1. Go to LSIA Airport → Flight School icon',
      '  2. Complete lessons 1-10 (Bronze is fine)',
      '  3. +40% flying skill total',
      '  4. Reduces turbulence when using Sparrow/Raiju',
      '',
      'METHOD 2: Takeoff/Landing Grind',
      '  1. Steal helicopter → Sandy Shores Airfield',
      '  2. Take off → Circle → Land',
      '  3. Repeat 50-80 times',
    ],
    warnings: [
      '❌ MYTH DEBUNKED: "Flying skill doesn\'t matter if you own Sparrow"',
      '   → FALSE: Low flying skill causes severe turbulence when using Sparrow/Raiju.',
      '   → Turbulence adds 5-10 minutes per Cayo Perico prep run (vehicle shakes, harder to control).',
      '   → Flight School fixes this - makes Sparrow handling smooth and fast.',
      '✅ Flight School pays ~$250k bonus for all Golds',
      '💡 If you own Sparrow/Raiju, Flight School is HIGH priority (not optional)',
    ],
  },
  
  rank_low: {
    title: 'How to Farm Rank (Operation Paper Trail)',
    steps: [
      'Open phone → Click notification for "Operation Paper Trail"',
      'Or go to Jobs → Rockstar Created → Missions → Operation Paper Trail',
      'FASTEST METHOD:',
      '1. Follow GPS to site',
      '2. Snap photos of evidence',
      '3. Deliver to IAA',
      '4. Repeat ~15 times for Rank 33 → 50',
    ],
    warnings: [
      '⚠️ 4X RP ends Jan 14 for GTA+ members',
      '✅ You also earn decent cash ($50k-$100k per run)',
    ],
  },

  rank_medium: {
    title: 'How to Farm Rank 50-100 (Operation Paper Trail)',
    steps: [
      'Same as rank_low, but for Rank 50-100 players',
      'Operation Paper Trail (4X RP for GTA+)',
      'Still fastest way to Rank 100+',
      'Unlocks additional benefits at Rank 100',
    ],
    warnings: [
      '💡 Less urgent than Rank < 50, but still fastest method',
      '✅ Time-limited event - farm while it lasts',
    ],
  },

  // ============================================
  // CAYO PERICO GUIDES
  // ============================================
  cayo_optimization: {
    title: 'How to Optimize Cayo Perico (Sub-60 Mins)',
    steps: [
      '📚 Search YouTube: "Cayo Perico Solo Speed Run 2026"',
      'OPTIMAL ROUTE:',
      '1. Preps: Use Sparrow for ALL intel/equipment',
      '2. Scope: Drainage Tunnel + North Dock cocaine',
      '3. Approach: Kosatka (NOT Longfin - patched)',
      '4. Entry: Drainage Tunnel',
      '5. Compound: Safe + 2 paintings (if available)',
      '6. Exit: Main gate → Drive to North Dock',
      '7. Loot: 2 cocaine stacks',
      '8. Escape: Steal boat → Blue circle',
      '',
      '⏱️ TARGET TIMES:',
      '- Preps: 35-40 mins (with Sparrow)',
      '- Finale: 12-15 mins',
      '- Total: < 60 mins',
    ],
    warnings: [
      '❌ Don\'t grab secondary loot INSIDE compound (needs 2 players)',
      '✅ Elite Challenge: <15 min finale = +$100k bonus',
      '💡 Hard Mode: +10% payout (activate within 48 mins of last heist)',
    ],
  },

  // Alias for consistency (same as cayo_optimization)
  cayo_slow: {
    title: 'How to Optimize Cayo Perico (Sub-60 Mins)',
    steps: [
      '📚 Search YouTube: "Cayo Perico Solo Speed Run 2026"',
      'OPTIMAL ROUTE:',
      '1. Preps: Use Sparrow for ALL intel/equipment',
      '2. Scope: Drainage Tunnel + North Dock cocaine',
      '3. Approach: Kosatka (NOT Longfin - patched)',
      '4. Entry: Drainage Tunnel',
      '5. Compound: Safe + 2 paintings (if available)',
      '6. Exit: Main gate → Drive to North Dock',
      '7. Loot: 2 cocaine stacks',
      '8. Escape: Steal boat → Blue circle',
      '',
      '⏱️ TARGET TIMES:',
      '- Preps: 35-40 mins (with Sparrow)',
      '- Finale: 12-15 mins',
      '- Total: < 60 mins',
    ],
    warnings: [
      '❌ Don\'t grab secondary loot INSIDE compound (needs 2 players)',
      '✅ Elite Challenge: <15 min finale = +$100k bonus',
      '💡 Hard Mode: +10% payout (activate within 48 mins of last heist)',
    ],
  },

  cayo_no_runs: {
    title: 'How to Start Your First Cayo Perico Heist',
    steps: [
      'Requirement: Own Kosatka Submarine',
      'Call Pavel from phone → "Request Kosatka"',
      'Submarine spawns nearby → Swim/boat to it',
      'Enter sub → Go to planning room (downstairs)',
      'Interact with planning board → Start "Cayo Perico Heist"',
      'Follow Pavel\'s tutorial (scope out mission)',
      '',
      'YOUR FIRST RUN WILL TAKE ~2 HOURS',
      '- That\'s normal! Don\'t panic.',
      '- Watch a guide AFTER your first run to optimize',
    ],
    warnings: [
      '✅ First-time payout: ~$1.1M (Tequila target)',
      '💡 Practice scoping: Find drainage tunnel entrance',
    ],
  },

  // ============================================
  // CONTRACTS & MISSIONS
  // ============================================
  dre_contract: {
    title: 'How to Complete Dr. Dre VIP Contract',
    steps: [
      'Requirement: Own an Agency',
      'Go to Agency → Franklin\'s desk → Select VIP Contract',
      'Complete 3 setups + finale (~4-6 hours total)',
      'Payout: $1,000,000 first time',
      'UNLOCKS: Payphone Hits ($85k per 10 mins)',
    ],
    warnings: [
      '✅ Can be done solo',
      '💡 Payphone Hits are the real reward (~$255k/hr)',
    ],
  },

  // ============================================
  // UPGRADES & OPTIMIZATION
  // ============================================
  acid_upgrade: {
    title: 'How to Upgrade Acid Lab',
    steps: [
      'Call Mutt (Freakshop) from phone contacts',
      'Select "Equipment Upgrade" ($500,000)',
      'Increases production speed by 2X',
      'Pays for itself in ~7 hours of playtime',
    ],
    budgetAdvice: {
      minimum: 500000,
      recommended: 500000,
      optimal: 500000,
    },
    warnings: [
      '✅ Best upgrade ROI in the game',
    ],
  },

  bunker_upgrade: {
    title: 'How to Upgrade Bunker',
    steps: [
      'Go to your Bunker',
      'Computer → Upgrades',
      'BUY THESE (in order):',
      '  1. Staff Upgrade ($351k) - Production speed',
      '  2. Equipment Upgrade ($1.155M) - Production speed',
      'SKIP: Security Upgrade (useless)',
    ],
    budgetAdvice: {
      minimum: 351000, // Staff only
      recommended: 1506000, // Staff + Equipment
      optimal: 1506000,
    },
    warnings: [
      '⚠️ Unupgraded bunker is 64% slower',
      '💡 Only buy if you plan to AFK/grind passively',
    ],
  },

  nightclub_partial: {
    title: 'How to Optimize Nightclub',
    steps: [
      'You need FEEDER businesses to make Nightclub worth it:',
      '1. Cocaine Lockup ($975k)',
      '2. Meth Lab ($910k)',
      '3. Counterfeit Cash ($845k)',
      '4. Bunker ($1.165M)',
      '5. CEO Cargo Warehouse ($250k)',
      '',
      'Then in Nightclub:',
      '- Assign Technicians to each business',
      '- Wait for stock to accumulate (passive)',
      '- Sell when full (~$1.5M every 24 hours)',
    ],
    budgetAdvice: {
      minimum: 250000, // Just CEO Warehouse
      recommended: 4145000, // All 5 businesses
      optimal: 4145000,
    },
    warnings: [
      '⚠️ Don\'t buy MC businesses without Nightclub first',
      '💡 Total cost: ~$4-5M to fully optimize',
      '✅ Worth it long-term: +$50k/hr passive',
    ],
  },

  acid_lab_sell: {
    title: 'How to Sell Acid Lab Product ($335K-$502K)',
    steps: [
      '⏰ TIMING: Every 4 hours (upgraded) or 6 hours (base)',
      'Maximum Capacity: $335K (upgraded) or $237.5K (base)',
      '⚠️ Production STOPS when full - don\'t let it sit!',
      '',
      'STEP-BY-STEP:',
      '1. Register as CEO or MC President',
      '2. Call Acid Lab (Interaction Menu > Services > Acid Lab)',
      '3. Enter rear of Brickade truck',
      '4. Walk to wooden pallet near Mutt',
      '5. Press Right D-Pad → "Sell Product"',
      '6. Choose session:',
      '   • Invite-Only: $335K guaranteed',
      '   • Public (20+ players): $419K-$502K (High Demand bonus)',
      '7. Deliver on bike to yellow markers (~10 mins)',
      '',
      'SUPPLIES:',
      'After selling, buy supplies ($60K) OR raid Stash House (free)',
    ],
    warnings: [
      '✅ Delivery bike is VERY tanky (takes 3-5 explosions)',
      '💡 If attacked: Drive away, don\'t fight (you only lose $8K if destroyed)',
      '⚠️ Public lobby risk is LOW, reward is HIGH (+50% payout)',
      '🎯 Best $/min activity in the game ($2-3M/hour effective rate)',
      '⏰ Set phone alarm every 4 hours - highest priority daily task',
    ],
    timeEstimate: '10 minutes per sale',
    videoGuide: 'Search YouTube: "GTA Online Acid Lab sell guide 2026"',
  },

  // ============================================
  // SUBSCRIPTIONS & QUALITY OF LIFE
  // ============================================
  consider_gta_plus: {
    title: 'How to Subscribe to GTA+',
    steps: [
      'PC: Rockstar Games Launcher → Store → GTA+',
      'Console: PlayStation Store / Xbox Store → GTA+',
      'Cost: $5.99/month',
      'Benefits:',
      '  - $500k monthly bonus',
      '  - 50% off select properties',
      '  - Free vehicles monthly',
      '  - Event bonuses (4X RP on Paper Trail)',
    ],
    warnings: [
      '✅ Pays for itself in <1 hour at your income level',
      '💡 Cancel anytime - benefits last until subscription ends',
    ],
  },

  stamina_low: {
    title: 'How to Maximize Stamina',
    steps: [
      'METHOD 1: Running',
      '  - Sprint continuously for 10-15 minutes',
      '  - Do this while doing other activities',
      '',
      'METHOD 2: Biking',
      '  - Steal a bike → Pedal continuously',
      '  - Faster than running',
      '',
      'METHOD 3: Swimming',
      '  - Go to beach → Swim laps',
      '  - Also trains Lung Capacity',
    ],
    warnings: [
      '✅ Required for Mansion Yoga buff (+15% run speed)',
      '💡 Can do passively while grinding other content',
    ],
  },

  buy_mansion: {
    title: 'How to Buy a Mansion (Endgame Property)',
    steps: [
      '⚠️ PREREQUISITES:',
      '  - $15M+ liquid cash recommended (property + upgrades)',
      '  - All core businesses owned (Kosatka, Agency, Nightclub, etc.)',
      '  - This is NOT a money-maker - it\'s a quality-of-life upgrade',
      '',
      'PURCHASE STEPS:',
      '1. Open phone → Internet → Prix Luxury Real Estate',
      '2. Browse the 3 available mansions:',
      '   💰 Tongva Estate ($11.5M) - Ocean/vineyard views, cheapest',
      '   ⭐ Vinewood Residence ($12.2M) - Hollywood Hills, iconic city views',
      '   👑 Richman Villa ($12.8M) - Old money prestige, ultimate status',
      '3. All 3 have identical interiors/features - choose by location preference',
      '4. Confirm purchase → Wait for confirmation',
      '',
      'OPTIONAL UPGRADES (Add $5M+ to cost):',
      '  - Private Security ($1.75M) - Reduces business raid timers',
      '  - Vehicle Workshop ($880k) - Car customization',
      '  - Armory ($720k) - Gun locker',
      '  - Podium ($650k) - Display vehicle outside (flex)',
      '',
      'Skip all upgrades initially. Buy them later if needed.',
    ],
    budgetAdvice: {
      minimum: 11500000, // Tongva Estate
      recommended: 12200000, // Vinewood Residence
      optimal: 12800000, // Richman Villa
    },
    locationMap: {
      'Tongva Estate': { 
        price: 11500000, 
        pros: 'Cheapest, secluded nature setting, sunset ocean views',
        cons: 'Far from city center, longer travel times',
      },
      'Vinewood Residence': { 
        price: 12200000, 
        pros: 'Best city skyline views, near Vinewood Sign, iconic location',
        cons: 'Medium price tier',
      },
      'Richman Villa': { 
        price: 12800000, 
        pros: 'Highest status/prestige, massive gated entry, ultimate flex',
        cons: 'Most expensive, west side location',
      },
    },
    warnings: [
      '⚠️ DO NOT buy this if your net worth is < $15M',
      '✅ Key features: Outdoor Gym (strength training), Master Control Terminal, Fast Travel',
      '💡 Unlocks KnoWay Out missions (Avi Schwartzman storyline)',
      '❌ This is NOT a business - it generates $0 income',
      '🎥 Watch "Don\'t Buy The WRONG Mansion" video before purchasing',
    ],
    videoGuide: 'YouTube: "Don\'t Buy The WRONG Mansion In the NEW GTA Online DLC"',
  },
};

/**
 * Get budget-aware recommendation for property purchase
 * @param {string} propertyType - Bottleneck ID (e.g., 'buy_auto_shop', 'no_kosatka')
 * @param {number} liquidCash - Current cash available
 * @param {boolean} hasGTAPlus - Whether player has GTA+ subscription
 * @returns {Object|null} Recommendation object or null if no budget advice available
 */
export const getPropertyRecommendation = (propertyType, liquidCash, hasGTAPlus = false) => {
  const instructions = ACTION_INSTRUCTIONS[propertyType];
  if (!instructions?.budgetAdvice) return null;

  const { minimum, recommended, optimal } = instructions.budgetAdvice;
  
  // Apply GTA+ discounts
  const discountMultiplier = (hasGTAPlus && propertyType === 'buy_auto_shop') ? 0.5 : 1;
  const adjustedMin = minimum * discountMultiplier;
  const adjustedRec = recommended * discountMultiplier;
  const adjustedOpt = optimal * discountMultiplier;

  // Can't afford minimum
  if (liquidCash < adjustedMin) {
    return {
      canAfford: false,
      recommendation: `Need $${adjustedMin.toLocaleString()} minimum. You have $${liquidCash.toLocaleString()}.`,
      shortfall: adjustedMin - liquidCash,
      tier: null,
    };
  }

  // Can afford minimum but not recommended
  if (liquidCash < adjustedRec) {
    return {
      canAfford: true,
      recommendation: `Buy minimum version ($${adjustedMin.toLocaleString()}). Upgrade later when you have $${adjustedRec.toLocaleString()}.`,
      tier: 'minimum',
    };
  }

  // Can afford recommended but not optimal
  if (liquidCash < adjustedOpt) {
    return {
      canAfford: true,
      recommendation: `Buy recommended version ($${adjustedRec.toLocaleString()}). Best value for money.`,
      tier: 'recommended',
    };
  }

  // Can afford optimal
  return {
    canAfford: true,
    recommendation: `Buy optimal version ($${adjustedOpt.toLocaleString()}). You can afford the best setup.`,
    tier: 'optimal',
  };
};
