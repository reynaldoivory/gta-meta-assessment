import { ActionInstruction } from './actionInstructionsTypes';

export const ACTION_INSTRUCTIONS_BUSINESS: Record<string, ActionInstruction> = {
  acid_upgrade: {
    title: 'How to Upgrade Acid Lab',
    steps: [
      'Call Mutt (Freakshop) from phone contacts',
      'Select "Equipment Upgrade" ($250,000)',
      'Increases production speed by 2X',
      'Pays for itself in ~4 hours of playtime',
    ],
    budgetAdvice: {
      minimum: 250000,
      recommended: 250000,
      optimal: 250000,
    },
    warnings: ['✅ Best upgrade ROI in the game'],
  },

  bunker_upgrade: {
    title: 'How to Upgrade Bunker',
    steps: [
      'Go to your Bunker',
      'Computer → Upgrades',
      'BUY THESE (in order):',
      '  1. Staff Upgrade ($598,500) - Production speed',
      '  2. Equipment Upgrade ($1.155M) - Production speed',
      'SKIP: Security Upgrade (useless)',
    ],
    budgetAdvice: {
      minimum: 598500,
      recommended: 1753500,
      optimal: 1753500,
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
      minimum: 250000,
      recommended: 4145000,
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
      '6. Deliver on bike to yellow markers (~10 mins)',
    ],
    warnings: [
      '✅ Delivery bike is VERY tanky (takes 3-5 explosions)',
      '💡 If attacked: Drive away, don\'t fight (you only lose $8K if destroyed)',
      '⚠️ Public lobby risk is LOW, reward is HIGH (+50% payout)',
      '🎯 Best $/min activity in the game ($2-3M/hour effective rate)',
    ],
    timeEstimate: '10 minutes per sale',
    videoGuide: 'Search YouTube: "GTA Online Acid Lab sell guide 2026"',
  },

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
      'METHOD 1: Running - Sprint continuously for 10-15 minutes',
      'METHOD 2: Biking - Faster than running for stamina gain',
      'METHOD 3: Swimming - Also trains Lung Capacity',
    ],
    warnings: [
      '✅ Required for Mansion Yoga buff (+15% run speed)',
      '💡 Can do passively while grinding other content',
    ],
  },

  buy_mansion: {
    title: 'How to Buy a Mansion (Endgame Property)',
    steps: [
      '⚠️ PREREQUISITES: $15M+ liquid cash recommended',
      'Open phone → Internet → Prix Luxury Real Estate',
      'Choose one of three mansions (identical features, different locations):',
      '  💰 Tongva Estate ($11.5M)',
      '  ⭐ Vinewood Residence ($12.2M)',
      '  👑 Richman Villa ($12.8M)',
      'Skip optional upgrades initially (adds $5M+)',
    ],
    budgetAdvice: {
      minimum: 11500000,
      recommended: 12200000,
      optimal: 12800000,
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
      '✅ Key features: Outdoor Gym, Master Control Terminal, Fast Travel',
      '❌ This is NOT a business - it generates $0 income',
    ],
    videoGuide: 'YouTube: "Don\'t Buy The WRONG Mansion In the NEW GTA Online DLC"',
  },
};