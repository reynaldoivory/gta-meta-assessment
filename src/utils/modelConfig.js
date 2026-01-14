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
      nightclubMax: 50000,         // Max Nightclub income per hour
      bunkerBase: 30000,           // Base Bunker income per hour
      bunkerUpgrade: 2.5,          // 2.5x multiplier when upgraded
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
        perHour: 335000           // Upgraded Acid Lab income
      },
      unupgraded: {
        perHour: 62500            // Unupgraded Acid Lab income
      },
      upgradeBenefit: 50000,      // Benefit per sale cycle
      upgradeCost: 750000          // Upgrade cost
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
        perHour: 75000            // Upgraded bunker income
      },
      unupgraded: {
        perHour: 27000            // Unupgraded bunker income
      }
    },
    autoShop: {
      perHour: 40000              // Auto Shop income per hour
    }
  },

  // Heist readiness criteria count
  heistReadiness: {
    totalCriteria: 6
  }
};
