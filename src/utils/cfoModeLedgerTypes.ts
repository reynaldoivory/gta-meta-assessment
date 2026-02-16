export type LedgerStatus =
  | '✅ OPERATIONAL'
  | '⚠️ UPGRADE REQ'
  | '🟢 LAUNDERING'
  | '⚡ BOOSTING'
  | '💤 IDLE'
  | '— NOT OWNED';

export type BalanceRow = {
  id: string;
  label: string;
  value: number;
  status: LedgerStatus;
  notes: string;
};

export type BalanceSection = {
  id: string;
  title: string;
  rows: BalanceRow[];
  total: number;
};

export type IncomeRow = {
  id: string;
  label: string;
  grossRevenue: number;
  cycleMinutes: number;
  yieldPerHour: number;
  highlightRed?: boolean;
};

export type CapexItem = {
  id: string;
  tier: string;
  label: string;
  cost: number;
  expectedRoiHours: number;
  roiBand: 'LOW' | 'MED' | 'HIGH' | 'VERY HIGH';
  purchased: boolean;
};

export type SynergySnapshot = {
  weedStandalonePerHour: number;
  weedNetworkedPerHour: number;
  dispensaryPerHour: number;
  carWashPerHour: number;
  standaloneTotalPerHour: number;
  networkedTotalPerHour: number;
  efficiencyPercent: number;
};

export type CfoLedger = {
  balanceSections: BalanceSection[];
  totalAssets: number;
  passiveIncomeRows: IncomeRow[];
  safeIncomeRows: IncomeRow[];
  totalProjectedPerHour: number;
  moneyFrontCombinedCycle: number;
  capexItems: CapexItem[];
  synergy: SynergySnapshot;
  moneyFrontOwnedCount: number;
};
