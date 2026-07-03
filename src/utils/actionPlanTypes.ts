// src/utils/actionPlanTypes.ts
// Centralized types for Action Plan logic.
// Wave 1: All index signatures and any types removed.
// Re-exports from bottleneckTypes for backward compatibility.

import type { Bottleneck } from "./bottleneckTypes";
import type { AssessmentFormData } from "../types/domain.types";

export type { Bottleneck };
export type { AssessmentFormData as FormData };

// ──────────────────────────────────────────────────────────────────────
// Action urgency and impact literals
// ──────────────────────────────────────────────────────────────────────

export type ActionUrgency = "URGENT" | "GRIND NOW" | "HIGH" | "BLOCKER" | "MEDIUM" | "LOW";
export type ActionImpact = "CRITICAL" | "high" | "medium" | "low";
export type ActionType =
  | "ACTION"
  | "BLOCKER"
  | "STAT"
  | "SKILL"
  | "GRIND"
  | "PURCHASE"
  | "TAX"
  | "OPTIMIZE"
  | "PROPERTY_CLAIM"
  | "VEHICLE_CLAIM"
  | "FREEMODE"
  | "MISSION"
  | "PREPARATION"
  | "CONTRACT"
  | "INFRASTRUCTURE"
  | "OPTIMIZATION"
  | "DAILY_ROUTINE"
  | "DAILY"
  | "ACTIVITY"
  | "SUBSCRIPTION"
  | "PROPERTY_PURCHASE"
  | string; // Allow runtime-computed uppercased actionType values

// ──────────────────────────────────────────────────────────────────────
// Compound Efficiency Metadata
// ──────────────────────────────────────────────────────────────────────

export interface CompoundMeta {
  passiveReady: number;
  passiveTotal: number;
  passiveAllMaxed: boolean;
  annotatedAt: number;
}

// ──────────────────────────────────────────────────────────────────────
// Action — a single recommended step in the action plan
// ──────────────────────────────────────────────────────────────────────

export interface Action {
  priority: number;
  urgency: ActionUrgency | string;
  type: ActionType;
  title: string;
  why: string;
  solution?: string;
  timeToComplete?: string;
  estimatedMinutes?: number | null;
  cost?: number;
  timeRemaining?: string | null;
  expiresAt?: number | null;
  savingsPerHour?: number;
  impact?: ActionImpact | string;
  bottleneckId?: string;
  launchesPassiveTimer?: boolean;
  unlockVelocity?: number;
  futureValue?: number;
  blockedBy?: string[];
  compoundScore?: number;
  _priorityScore?: number;
  _compoundMeta?: CompoundMeta;
  // Additional properties set by buildSmartActionPlan
  earnings?: string | number;
  method?: string;
  savings?: string | number;
  note?: string;
  currentStat?: string | number;
  potentialEarnings?: string;
  strategy?: string;
  category?: string;
  gatekeeperStatus?: string;
  gatekeeperPenalty?: number;
  targetStat?: string;
  methodDetails?: string;
  avoidMethod?: string;
  blocksAction?: string;
  impactsNeeded?: number;
  efficiencyGap?: number;
  roiHours?: number | null;
  isDiscounted?: boolean;
  discountPercent?: number;
}

// ──────────────────────────────────────────────────────────────────────
// Results — the shape consumed by buildSmartActionPlan
// ──────────────────────────────────────────────────────────────────────

export interface Results {
  bottlenecks?: Bottleneck[];
  incomePerHour?: number;
  heistReady?: {
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
  };
  nextGoal?: {
    name: string;
    cost: number;
    currentCash: number;
    needed: number;
    hoursRemaining: number;
    canAffordNow: boolean;
    fastestGrind: string;
  } | null;
  score?: number;
  tier?: string;
  tierColor?: string;
  activeIncome?: number;
  passiveIncome?: number;
  gtaPlusBonus?: number;
  gtaPlusActive?: boolean;
  heistReadyPercent?: number;
  totalHoursPlayed?: number;
  currentCash?: number;
  netWorth?: number;
  netWorthPerHour?: number;
  dynamicIncome?: {
    bestSource: string;
    bestIncome: number;
    isEventBoosted: boolean;
    activeEvents: Array<{ name: string; multiplier: number; hourlyRate: number }>;
    daysUntilExpiry: number;
  };
  efficiencyMetrics?: {
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
  };
}
