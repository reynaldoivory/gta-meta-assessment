export type BudgetAdvice = {
  minimum?: number;
  recommended?: number;
  optimal?: number;
};

export type ActionInstruction = {
  title: string;
  steps: string[];
  budgetAdvice?: BudgetAdvice;
  warnings?: string[];
  location?: string;
  locationMap?: Record<string, unknown>;
  timeEstimate?: string;
  videoGuide?: string;
};
