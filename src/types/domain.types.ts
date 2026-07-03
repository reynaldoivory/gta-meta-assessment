// src/types/domain.types.ts
// Exhaustive type definitions for the GTA Meta-Assessment domain model.
// Wave 1: All index signatures and any types removed.

import type { Bottleneck } from "../utils/bottleneckTypes";

// ──────────────────────────────────────────────────────────────────────
// Task Requirements (unchanged)
// ──────────────────────────────────────────────────────────────────────

export interface TaskRequirement {
  hard_gates: string[];
  soft_gates: Array<{ stat: string; min: number; penalty: "low" | "medium" | "high" | "critical" }>;
  gear_overrides: string[];
}

// ──────────────────────────────────────────────────────────────────────
// Assessment Form Data - every field actually used across the codebase
// ──────────────────────────────────────────────────────────────────────

export interface AssessmentFormData {
  // Vitals
  rank?: number | string;
  liquidCash?: number | string;
  totalIncomeCollected?: number | string;
  totalRPCollected?: number | string;
  timePlayed?: number | string;
  timePlayedDays?: number | string;
  timePlayedHours?: number | string;
  timePlayedMinutes?: number | string;
  timePlayedMode?: string;
  casinoChips?: number | string;

  // Stats (0-100 percentage)
  strength?: number | string;
  flying?: number | string;
  shooting?: number | string;
  stealth?: number | string;
  stamina?: number | string;
  driving?: number | string;
  lungCapacity?: number | string;
  hacking?: number | string;

  // Properties / Assets
  hasKosatka?: boolean;
  hasAgency?: boolean;
  dreContractDone?: boolean;
  payphoneUnlocked?: boolean;
  securityContracts?: number | string;
  hasArcade?: boolean;
  hasArcadeMct?: boolean;
  hasMansion?: boolean;
  mansionType?: string;
  hasAcidLab?: boolean;
  acidLabUpgraded?: boolean;
  hasNightclub?: boolean;
  hasBunker?: boolean;
  bunkerUpgraded?: boolean;
  hasAutoShop?: boolean;
  hasCarWash?: boolean;
  hasWeedFarm?: boolean;
  hasHeliTours?: boolean;
  hasSalvageYard?: boolean;
  hasTowTruck?: boolean;

  // MC Businesses
  hasCoke?: boolean;
  hasMeth?: boolean;
  hasCash?: boolean;
  hasWeed?: boolean;
  hasDocuments?: boolean;
  cokeEquipmentUpgrade?: boolean;
  cokeStaffUpgrade?: boolean;
  methEquipmentUpgrade?: boolean;
  methStaffUpgrade?: boolean;
  cashEquipmentUpgrade?: boolean;
  cashStaffUpgrade?: boolean;
  weedEquipmentUpgrade?: boolean;
  weedStaffUpgrade?: boolean;
  documentsEquipmentUpgrade?: boolean;
  documentsStaffUpgrade?: boolean;
  mcPlayStyle?: string;
  sellsToStreetDealers?: boolean;

  // Bunker Upgrades (granular)
  bunkerEquipmentUpgrade?: boolean;
  bunkerStaffUpgrade?: boolean;

  // Nightclub Details
  nightclubTechs?: number | string;
  nightclubFeeders?: number | string;
  nightclubSources?: Record<string, boolean>;
  nightclubFloors?: number | string;
  nightclubEquipmentUpgrade?: boolean;
  nightclubStaffUpgrade?: boolean;
  nightclubStorage?: Record<string, unknown>;
  hasPounderCustom?: boolean;
  hasMuleCustom?: boolean;

  // Vehicles
  hasSparrow?: boolean;
  hasOppressor?: boolean;
  hasTerrorbyte?: boolean;
  hasOppressorMissiles?: boolean;
  hasRaiju?: boolean;
  hasArmoredKuruma?: boolean;
  hasBrickade6x6?: boolean;

  // GTA+
  hasGTAPlus?: boolean;
  /** @deprecated alias - prefer hasGTAPlus */
  gtaPlus?: boolean;
  claimedFreeCar?: boolean;
  claimedWheelSpin?: boolean;

  // Dailies
  dailyStashHouse?: boolean;
  dailyGsCache?: boolean;
  dailySafeCollect?: boolean;

  // Play Style
  playMode?: "invite" | "solo" | "public" | string;

  // Cayo Perico
  cayoCompletions?: number | string;

  // CFO / Heat
  cfoHeat?: number | string;

  // Financial Workbook Fields
  financialWorkbookSelections?: Record<string, boolean>;
  activeIncomeWorkbook?: number | string;
  passiveIncomeWorkbook?: number | string;
  cayoIncomeWorkbook?: number | string;
  dreIncomeWorkbook?: number | string;
  payphoneIncomeWorkbook?: number | string;
  acidSalesWorkbook?: number | string;
  acidSuppliesWorkbook?: number | string;
  bunkerSalesWorkbook?: number | string;
  bunkerSuppliesWorkbook?: number | string;
  nightclubSalesWorkbook?: number | string;
  mcSuppliesWorkbook?: number | string;
  restockWorkbook?: number | string;
  propertyFeesWorkbook?: number | string;
  insuranceWorkbook?: number | string;
  financingWorkbook?: number | string;
  beginningCashWorkbook?: number | string;
  workbookDebt?: number | string;
}

// ──────────────────────────────────────────────────────────────────────
// Heist Readiness
// ──────────────────────────────────────────────────────────────────────

export interface HeistReadiness {
  rank50: boolean;
  strength80: boolean;
  flying80: boolean;
  diversifiedIncome: boolean;
  diversifiedIncomeTier: string;
  diversifiedIncomePoints: number;
  diversifiedIncomeLabel: string;
  diversifiedIncomeScore: number;
  travelOptimized: boolean;
  bizCore: boolean;
}

// ──────────────────────────────────────────────────────────────────────
// Dynamic Income
// ──────────────────────────────────────────────────────────────────────

export interface DynamicIncome {
  bestSource: string;
  bestIncome: number;
  isEventBoosted: boolean;
  activeEvents: Array<{ name: string; multiplier: number; hourlyRate: number }>;
  daysUntilExpiry: number;
}

// ──────────────────────────────────────────────────────────────────────
// Next Goal
// ──────────────────────────────────────────────────────────────────────

export interface NextGoal {
  name: string;
  cost: number;
  currentCash: number;
  needed: number;
  hoursRemaining: number;
  canAffordNow: boolean;
  fastestGrind: string;
}

// ──────────────────────────────────────────────────────────────────────
// Efficiency Metrics
// ──────────────────────────────────────────────────────────────────────

export interface EfficiencyMetrics {
  incomePerHour: number;
  rpPerHour: number;
  incomeEfficiency: number;
  rpEfficiency: number;
  incomeGrade: string;
  rpGrade: string;
  incomeVsBench: string;
  rpVsBench: string;
  benchmarks?: {
    incomePerHour: number;
    rpPerHour: number;
    incomePerHourHardcore: number;
    rpPerHourHardcore: number;
  };
}

// ──────────────────────────────────────────────────────────────────────
// Assessment Result - matches computeAssessment() return shape
// ──────────────────────────────────────────────────────────────────────

export interface AssessmentResult {
  score: number;
  tier: string;
  tierColor: string;
  incomePerHour: number;
  activeIncome: number;
  passiveIncome: number;
  gtaPlusBonus: number;
  gtaPlusActive: boolean;
  bottlenecks: Bottleneck[];
  heistReady: HeistReadiness;
  heistReadyPercent: number;
  totalHoursPlayed: number;
  currentCash: number;
  netWorth: number;
  netWorthPerHour: number;
  dynamicIncome: DynamicIncome;
  nextGoal: NextGoal | null;
  efficiencyMetrics: EfficiencyMetrics;
}
