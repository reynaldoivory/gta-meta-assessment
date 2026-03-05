
// Centralized types for Action Plan logic
export type { Action, Bottleneck, FormData } from './actionPlanBuilder';

export type Results = {
  bottlenecks?: Bottleneck[];
  incomePerHour?: number;
  heistReady?: Record<string, unknown>;
  nextGoal?: string;
  [key: string]: unknown;
};
