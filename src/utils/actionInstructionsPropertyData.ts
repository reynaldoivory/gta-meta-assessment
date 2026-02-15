import { ActionInstruction } from './actionInstructionsTypes';

export const ACTION_INSTRUCTIONS_PROPERTY: Record<string, ActionInstruction> = {
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
      '⚠️ Check weekly events for current expiry date',
      '💡 Part of "Money Fronts" weekly update - requires meeting Madrazo first',
      '✅ Claim even if you won\'t use it - free $1.4M+ business asset',
    ],
    videoGuide: 'Search YouTube: "How to claim free property GTA Online Money Fronts"',
  },

  claim_free_car: {
    title: 'How to Claim Free GTA+ Vehicle',
    steps: [
      'Go to The Vinewood Car Club (GPS: "Vinewood Car Club")',
      'Location: Elysian Island (south LS, near docks)',
      'Enter the building (yellow marker)',
      'Approach the highlighted vehicle',
      'Press interaction button to claim',
      'Choose garage to store it',
    ],
    location: 'Vinewood Car Club - Elysian Island',
    warnings: [
      '💡 GTA+ members only (monthly benefit)',
      '✅ Claim even if you don\'t like the car - free garage asset',
    ],
  },

  buy_auto_shop: {
    title: 'How to Buy Auto Shop',
    steps: [
      'Open phone → Internet → Maze Bank Foreclosures',
      'Select "Auto Shops"',
      'BEST LOCATIONS (by priority):',
      '  ✅ Mission Row ($1,670,000) - Cheapest option',
      '  ⭐ Strawberry ($1,705,000) - Great central routing',
      '  💰 Rancho ($1,750,000) - Near LS Car Meet',
      '  ⚠️ Burton ($1,830,000) / La Mesa ($1,920,000) cost more for similar output',
      'UPGRADES:',
      '  - Staff ($385,000 each) - Convenience only',
      '  - Vehicle Workshop ($800,000) - Required for Imani Tech workflows',
      'Baseline target: $1.67M + $800k workshop = $2.47M',
      'Confirm purchase → Wait for Sessanta call',
    ],
    budgetAdvice: {
      minimum: 1670000,
      recommended: 2485000,
      optimal: 2485000,
    },
    warnings: [
      '💡 Discounts are weekly-variable; verify Newswire before buying',
      '✅ Auto Shop remains strong active-income utility even without discounts',
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
      recommended: 4015000,
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
      '  ✅ Vespucci Canals ($2,145,000) - Good central access',
      '  ⭐ Rockford Hills ($2,415,000) - Balanced premium',
      '  👑 Hawick ($2,830,000) - Prestige/premium',
      'Skip all upgrades on first purchase',
      'Confirm → Wait for Franklin call',
    ],
    budgetAdvice: {
      minimum: 2010000,
      recommended: 2145000,
      optimal: 2830000,
    },
    warnings: [
      '✅ Little Seoul is 90% as good for 70% the price',
      '⚠️ Skip Armory, Vehicle Workshop until later',
    ],
  },
};