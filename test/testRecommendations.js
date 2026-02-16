// test/testRecommendations.js

import { generateRecommendations, getFormattedRecommendations } from '../src/utils/recommendationEngine.js';

const testUser = {
  rank: 75,
  cash: 342000,
  gtaPlus: true,
  stats: {
    flying: 2,
    combat: 5,
    stealth: 2,
    strength: 5,
    stamina: 5,
    driving: 5
  },
  owns: {
    kosatka: true,
    sparrow: true,
    agency: true,
    acidLab: true,
    nightclub: true,
    autoShop: true,
    bunker: true // Has bunker but NOT upgraded (will trigger upgrade recommendation)
  },
  // Bunker not upgraded - should trigger upgrade recommendation
  bunkerUpgraded: false,
  // Nightclub only has 3 technicians (should recommend hiring more)
  nightclubTechs: 3,
  gear: ['heavy_armor', 'scuba_suit'],
  playStyle: 'solo',
  timePerSession: 180, // 3 hours
  playTime: 20 // hours per week
};

const testGameState = {
  businesses: {
    nightclub: {
      isSetup: true,
      suppliesEmpty: false,
      fullyUpgraded: true,
      accumulatedValue: 450000,
      technicians: [
        { assigned: 'cocaine', producing: true },
        { assigned: 'meth', producing: true }
      ]
    },
    acidLab: {
      isSetup: true,
      suppliesEmpty: false,
      passiveRate: 11500
    }
  },
  claimedBonuses: [] // No bonuses claimed yet
};

async function runTest() {
  console.log('=== TESTING RECOMMENDATION ENGINE ===\n');
  
  try {
    // Test 1: Get raw recommendations
    console.log('Test 1: Raw Recommendations');
    const recommendations = await generateRecommendations(testUser, testGameState);
    console.log(`Generated ${recommendations.length} recommendations\n`);
    
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.task.name}`);
      console.log(`   Type: ${rec.type}`);
      console.log(`   Reasoning: ${rec.reasoning}`);
      console.log(`   Value: $${Math.round(rec.effectiveValue).toLocaleString()}`);
      console.log(`   Time: ${rec.timeInvestment} mins`);
      if (rec.task.timeLeft) {
        // timeLeft is already in hours from priorityDetector
        const hours = Math.round(rec.task.timeLeft);
        console.log(`   ⏰ Expires in ${hours} hours`);
      }
      console.log('');
    });
    
    // Test 2: Get formatted recommendations
    console.log('\n=== FORMATTED FOR UI ===\n');
    const formatted = await getFormattedRecommendations(testUser, testGameState);
    formatted.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec.icon} ${rec.label}`);
      console.log(`   ${rec.description}`);
      console.log(`   ${rec.action}`);
      if (rec.timeLeft) console.log(`   ${rec.timeLeft}`);
      if (rec.value) console.log(`   ${rec.value}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
  }
}

// Run the test
await runTest();
