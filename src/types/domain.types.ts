export interface TaskRequirement {
  hard_gates: string[];
  soft_gates: Array<{ stat: string; min: number; penalty: 'low' | 'medium' | 'high' | 'critical' }>;
  gear_overrides: string[];
}

export interface AssessmentFormData {
  strength?: number;
  flying?: number;
  shooting?: number;
  stealth?: number;
  stamina?: number;
  driving?: number;
  hacking?: number;
  hasKosatka?: boolean;
  hasAgency?: boolean;
  hasAcidLab?: boolean;
  acidLabUpgraded?: boolean;
  hasNightclub?: boolean;
  hasBunker?: boolean;
  bunkerUpgraded?: boolean;
  hasAutoShop?: boolean;
  hasSparrow?: boolean;
  hasOppressor?: boolean;
  hasRaiju?: boolean;
  hasMansion?: boolean;
  hasArcade?: boolean;
  hasBrickade6x6?: boolean;
  [key: string]: any;
}

export interface AssessmentResult {
  score: number;
  tier: string;
  incomePerHour: number;
  activeIncome: number;
  passiveIncome: number;
  dailyIncome?: number;
  heistReadyPercent: number;
  heistReady: { rank50: boolean; strength80: boolean; flying80: boolean; diversifiedIncomeTier: number; diversifiedIncomePoints: number; diversifiedIncomeLabel: string; travelOptimized: boolean; bizCore: boolean; };
  bottlenecks?: any[];
}
