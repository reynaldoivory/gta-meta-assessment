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
      basePayout: 1200000,        // Solo per-run reference (April 2026): $1.2M-$1.8M; low end used
      tequilaPayout: 630000,       // Most common (60% drop rate)
      pinkDiamondPayout: 1300000,  // Pink Diamond payout (boosted event weeks)
      masteryThreshold: 10,        // Runs needed for mastery
      masteryBonus: 1.1,          // 10% bonus when mastered
      bagFillFactor: 0.80,        // Solo drainage: ~80% bag fill (can't always fill undetected)
      // Solo cooldown: 144 min (confirmed by 20+ community sources, Feb 2026)
      // Co-op cooldown: 48 min
      // Effective $/hr = payout * bagFill * (60 / max(runTime, cooldown))
      solo: {
        basePayout: 1300000,      // $1.3M average solo payout (reference: $1.2M-$1.8M, April 2026)
        cooldownMinutes: 144,     // 2h 24m cooldown (invite-only, verified)
        avgRunMinutes: 75,        // Safe-pace prep + finale (no elite assumption)
        effectiveHourlyRate: 433000, // $1.3M * 0.8 * (60/144) ≈ $433k/hr solo-only
        blendedHourlyRate: 800000,  // With VIP/Agency cooldown fillers: ~$800k/hr
        defaultEstimate: 300000   // Default estimate if no time entered
      },
      crew: {
        basePayout: 1500000,       // $1.5M average crew payout
        cooldownMinutes: 144
      }
    },
    agency: {
      payphoneBase: 70000,         // Base payphone hit payout (April 2026 reference: $70k/hit)
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
      acidLabBase: 34000,          // Base Acid Lab passive accrual per hour
      acidLabUpgrade: 1.5,         // 50% equipment boost when upgraded
      acidLabUpgradeCost: 250000,  // Acid Lab equipment upgrade cost (single source of truth)
      nightclubMax: 50000,         // Max Nightclub income per hour
      bunkerBase: 21000,           // Base Bunker unupgraded stock accrual per hour
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
        perHour: 51000            // Upgraded Acid Lab income ($34k * 1.5)
      },
      unupgraded: {
        perHour: 34000            // Unupgraded Acid Lab income (matches passive.acidLabBase)
      },
      upgradeBenefit: 17000,      // Hourly income gain from upgrading ($51k - $34k)
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
        perHour: 52500            // Upgraded bunker income ($21k * 2.5)
      },
      unupgraded: {
        perHour: 21000            // Unupgraded bunker income (matches passive.bunkerBase)
      }
    },
    autoShop: {
      perHour: 400000             // Auto Shop income per hour (matches calculateIncome.ts hardcoded value)
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
