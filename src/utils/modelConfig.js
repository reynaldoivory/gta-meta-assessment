/**
 * Configuration object for GTA Meta Assessment
 * Contains scoring rules, thresholds, income calculations, and time estimates
 */
export const MODEL_CONFIG = {
  // Scoring system
  scoring: {
    rank: {
      high: {
        threshold: 100,
        points: 10
      },
      medium: {
        threshold: 50,
        points: 5
      }
    },
    stats: {
      minBars: 3,
      perStat: 5
    },
    assets: {
      kosatka: 15,
      kosatkaEfficiency: {
        elite: {
          maxTime: 50,
          minRuns: 20,
          points: 20
        },
        good: {
          maxTime: 65,
          minRuns: 10,
          points: 10
        },
        average: {
          maxTime: 80,
          points: 5
        }
      },
      agency: 10,
      agencyDreContract: 5,
      acidLab: 5,
      nightclub: {
        max: {
          points: 15
        },
        partial: {
          points: 8
        },
        minimal: {
          points: 3
        }
      }
    }
  },

  // Tier thresholds
  tiers: {
    kingpin: 90,
    crimeBoss: 60,
    established: 40
  },

  // Thresholds for various checks
  thresholds: {
    stats: {
      critical: 60, // 60% (3 bars)
      minimum: 80   // 80% (4 bars)
    },
    rank: {
      max: 8000,
      heistReady: 50
    },
    cayo: {
      masteryRuns: 10
    },
    nightclub: {
      maxTechs: 5,
      maxFeeders: 5,
      partialTechs: 3,
      partialFeeders: 3
    },
    recommendations: {
      agencyPurchase: 500000 // Income per hour threshold to recommend agency
    }
  },

  // Time estimates (in hours)
  time: {
    stats: {
      strength: 2,
      flying: 2
    },
    assets: {
      kosatkaGrind: 3,
      firstCayo: 4,
      dreContract: 3,
      sparrowPurchase: 2,
      agencySetup: 3
    },
    cayo: {
      hoursPerRun: 1.5 // Average time per Cayo run including prep
    }
  },

  // Action plan time buckets
  actionPlan: {
    immediate: 2,    // Under 2 hours = "Tonight"
    thisWeek: 10     // Under 10 hours = "This Week"
  },

  // Priority action time estimates
  priorityActions: {
    strengthFix: 30,      // minutes
    flyingFix: 30,        // minutes
    kosatkaGrind: '3h',
    sparrowPurchase: '0h',
    agencySetup: '3h'
  },

  // Income calculations (per hour)
  income: {
    // New optimized Cayo structure
    cayo: {
      basePayout: 700000,         // Average post-nerf payout (~$700k)
      tequilaPayout: 630000,       // Most common (60% drop rate)
      masteryThreshold: 10,        // Runs needed for mastery
      masteryBonus: 1.1,          // 10% bonus when mastered
      // Legacy structure for backward compatibility
      solo: {
        basePayout: 1100000,      // $1.1M average solo payout
        cooldownMinutes: 144,     // 2h 24m cooldown
        defaultEstimate: 300000   // Default estimate if no time entered
      },
      crew: {
        basePayout: 1500000,       // $1.5M average crew payout
        cooldownMinutes: 144
      }
    },
    agency: {
      payphoneBase: 85000,         // Base payphone hit payout
      hitsPerHour: 3,             // Realistic solo hits per hour
      payphoneHits: 50000,         // Legacy: $50k/hr during Cayo cooldown
      safe: {
        max: {
          contracts: 201,
          perHour: 20000          // $20k/hr max safe income
        },
        mid: {
          contracts: 50,
          perHour: 10000          // $10k/hr mid-tier
        },
        low: {
          contracts: 1,
          perHour: 5000           // $5k/hr low-tier
        }
      }
    },
    // New passive income structure
    passive: {
      acidLabBase: 75000,          // Base Acid Lab income per hour
      acidLabUpgrade: 1.4,         // 40% boost when upgraded
      acidLabUpgradeCost: 250000,  // Acid Lab equipment upgrade cost (single source of truth)
      nightclubMax: 50000,         // Max Nightclub income per hour
      bunkerBase: 30000,           // Base Bunker income per hour
      bunkerUpgrade: 2.5,          // 2.5x multiplier when upgraded
      bunkerUpgradeCost: 1753500,  // Equipment ($1,155,000) + Staff ($598,500) = $1,753,500
      salvageYard: 35000           // Salvage Yard passive income per hour
    },
    // GTA+ subscription benefits
    gtaPlus: {
      monthlyBonus: 500000,        // $500k/month bonus
      avgMonthlyHours: 20,         // Average hours per month for calculation
      effectiveHourly: 25000      // $500k / 20hr = $25k/hr effective
    },
    acidLab: {
      upgraded: {
        perHour: 105000           // Upgraded Acid Lab income ($75k * 1.4)
      },
      unupgraded: {
        perHour: 75000            // Unupgraded Acid Lab income (matches passive.acidLabBase)
      },
      upgradeBenefit: 30000,      // Hourly income gain from upgrading ($105k - $75k)
      upgradeCost: 250000          // Upgrade cost (matches infrastructureAdvisor)
    },
    salvageYard: {
      robbery: 100000,            // Robbery income per hour
      towTruck: 50000             // Passive tow truck income per hour
    },
    nightclub: {
      max: 50000,                 // Max passive income ($50k/hr)
      partial: 25000,             // Partial setup ($25k/hr)
      minimal: 8500              // Minimal setup ($8.5k/hr)
    },
    bunker: {
      upgraded: {
        perHour: 75000            // Upgraded bunker income ($30k * 2.5)
      },
      unupgraded: {
        perHour: 30000            // Unupgraded bunker income (matches passive.bunkerBase)
      }
    },
    autoShop: {
      perHour: 40000              // Auto Shop income per hour
    },
    // Car Wash passive income (Bottom Dollar Bounties DLC)
    carWash: {
      base: 5000,                 // Base safe income per hr (no feeders)
      withWeedFarm: 10000,        // Added safe income from Weed Farm feeder
      withHeliTours: 8000,        // Added safe income from Heli Tours feeder
      maxSafe: 250000,            // Safe capacity
      // Total with all feeders: ~$23,000/hr
    },
    // Street Dealers (3 daily, sell all 4 drug types)
    streetDealers: {
      // Per dealer averages (all 4 types sold)
      cocainePerDealer: 20000,    // 1 unit × ~$20k avg
      methPerDealer: 17500,       // 2 units × ~$8.75k avg
      weedPerDealer: 15000,       // 10 units × ~$1.5k avg
      acidPerDealer: 14850,       // 10 units × ~$1.485k avg
      allTypesPerDealer: 67350,   // Sum of all 4 types (no premium)
      dealersPerDay: 3,           // 3 dealers spawn daily
      dailyTotal: 202050,         // ~$202k/day (no premiums)
      dailyWithPremiums: 250000,  // ~$250k/day avg (some premiums)
      timeMinutes: 15,            // ~15 min to visit all 3
    },
    // Cluckin Bell Factory Raid
    cluckinBell: {
      payout: 400000,             // ~$400k per completion
      timeMinutes: 25,            // ~25 min per run
      perHour: 960000,            // ~$960k/hr (repeatable)
    },
  },
  // Heist readiness criteria count
  heistReadiness: {
    totalCriteria: 6,
    weights: {
      rank: 16,
      strength: 16,
      flying: 16,
      diversifiedIncome: 20,
      travelOptimized: 16,
      bizCore: 16
    },
    diversifiedIncome: {
      points: {
        acidLab: 3,
        agency: 3,
        nightclub: 3,
        kosatka: 2,
        bunker: 2,
        autoShop: 1,
        salvageYard: 1,
        carWash: 1,
        streetDealers: 1
      },
      mcPoints: {
        coke: 0.5,
        meth: 0.5,
        cash: 0.5
      },
      tiers: {
        bronze: 3,
        silver: 6,
        gold: 10,
        platinum: 15
      },
      tierScores: {
        paper: 0,
        bronze: 40,
        silver: 75,
        gold: 90,
        platinum: 100
      },
      tierLabels: {
        paper: 'Fresh Meat',
        bronze: 'Hustler',
        silver: 'Established',
        gold: 'Diversified Mogul',
        platinum: 'Empire Builder'
      }
    }
  }
};
