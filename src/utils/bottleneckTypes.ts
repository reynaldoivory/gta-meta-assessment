// src/utils/bottleneckTypes.ts
// Shared type definitions for the bottleneck detection modules.
// Wave 1: All index signatures and  types removed. Discriminated union on .

// ──────────────────────────────────────────────────────────────────────
// Action types emitted by detection modules
// ──────────────────────────────────────────────────────────────────────

export type BottleneckActionType =
  | "property_claim"
  | "vehicle_claim"
  | "freemode"
  | "mission"
  | "preparation"
  | "purchase"
  | "contract"
  | "infrastructure"
  | "optimization"
  | "daily_routine"
  | "daily"
  | "activity"
  | "subscription"
  | "property_purchase";

export type BottleneckImpact = "high" | "medium" | "low";

// ──────────────────────────────────────────────────────────────────────
// Bottleneck — discriminated union by  literal
// ──────────────────────────────────────────────────────────────────────

/** Properties shared by every bottleneck variant. */
export interface BottleneckBase {
  id: string;
  label: string;
  detail: string;
  solution?: string;
  actionType?: BottleneckActionType | string;
  impact?: BottleneckImpact;
  critical?: boolean;
  urgent?: boolean;
  timeHours?: number;
  savingsPerHour?: number;
  expiresAt?: number | null;
  // Properties accessed on generic Bottleneck refs (set by various detectors)
  eventTier?: number;
  hoursLeft?: number;
  daysLeft?: number;
  filteredByPlayMode?: boolean;
  multiplier?: number;
  cost?: number;
  originalCost?: number;
  isDiscounted?: boolean;
  roiHours?: number;
  isTrap?: boolean;
  savingsValue?: number;
}

/** Tier 0: Urgent expiring events. */
export interface UrgentExpiringBottleneck extends BottleneckBase {
  tier: 0;
}

/** Tier 1: Income leaks — active events costing money every hour. */
export interface IncomeLeakBottleneck extends BottleneckBase {
  tier: 1;
}

/** Tier 2: Stat bottlenecks — strength, flying, rank deficiencies. */
export interface StatBottleneck extends BottleneckBase {
  tier: 2;
}

/** Tier 3: Asset gaps — missing properties/vehicles/income diversification. */
export interface AssetGapBottleneck extends BottleneckBase {
  tier: 3;
}

/** Tier 4: Infrastructure gaps — upgrade/optimization issues. */
export interface InfrastructureBottleneck extends BottleneckBase {
  tier: 4;
}

/** Tier 5: Quality of life — optional daily/cosmetic improvements. */
export interface QoLBottleneck extends BottleneckBase {
  tier: 5;
}

/**
 * Many detection modules do NOT set  on the returned objects — the tier
 * is implicit from which detector produced them and gets assigned by the
 * orchestrator. UntieredBottleneck covers objects that have not yet been
 * annotated with a tier.
 */
export interface UntieredBottleneck extends BottleneckBase {
  tier?: undefined;
}

export type Bottleneck =
  | UrgentExpiringBottleneck
  | IncomeLeakBottleneck
  | StatBottleneck
  | AssetGapBottleneck
  | InfrastructureBottleneck
  | QoLBottleneck
  | UntieredBottleneck;

// ──────────────────────────────────────────────────────────────────────
// Detection Parameters — passed to every detection module
// ──────────────────────────────────────────────────────────────────────

export interface DetectionParams {
  rank: number;
  strength: number;
  flying: number;
  shooting: number;
  playMode: string;
  hasGTAPlus: boolean;
  hasAgency: boolean;
  hasKosatka: boolean;
  hasSparrow: boolean;
  hasRaiju: boolean;
  hasOppressor: boolean;
  hasAcidLab: boolean;
  acidLabUpgraded: boolean;
  hasAutoShop: boolean;
  hasCarWash: boolean;
  hasWeedFarm: boolean;
  hasHeliTours: boolean;
  hasNightclub: boolean;
  hasBunker: boolean;
  bunkerUpgraded: boolean;
  hasSalvageYard: boolean;
  hasTowTruck: boolean;
  nightclubTechs: number;
  nightclubFeeders: number;
  liquidCash: number;
  dreContractDone: boolean;
  payphoneUnlocked: boolean;
  sellsToStreetDealers: boolean;
  hasCoke: boolean;
  hasMeth: boolean;
  hasCash: boolean;
  timePlayed: number;
  totalIncomeCollected: number;
  totalRPCollected: number;
  securityContracts: number;
}

// ──────────────────────────────────────────────────────────────────────
// Active Event — weekly/monthly rotation events
// ──────────────────────────────────────────────────────────────────────

export interface ActiveEvent {
  name: string;
  label?: string;
  category: string;
  multiplier: number;
  hourlyRate: number;
  highValue?: boolean;
  requiresMultiplayer?: boolean;
  soloNote?: string;
  soloTip?: string;
  critical?: boolean;
  urgent?: boolean;
  tier: number;
  hoursLeft: number;
  daysLeft: number;
  expiryTimestamp?: number;
}

// ──────────────────────────────────────────────────────────────────────
// Detection Form Data — raw form data fields used by detectors
// ──────────────────────────────────────────────────────────────────────

export interface DetectionFormData {
  hasCarWash?: boolean;
  claimedFreeCar?: boolean;
  hasMansion?: boolean;
  bunkerEquipmentUpgrade?: boolean;
  bunkerStaffUpgrade?: boolean;
  nightclubStorage?: Record<string, unknown>;
  nightclubFloors?: string | number;
  nightclubEquipmentUpgrade?: boolean;
  nightclubStaffUpgrade?: boolean;
  hasPounderCustom?: boolean;
  hasMuleCustom?: boolean;
  stamina?: number | string;
  claimedWheelSpin?: boolean;
}

// ──────────────────────────────────────────────────────────────────────
// GTA+ Monthly Bonus
// ──────────────────────────────────────────────────────────────────────

export interface GtaPlusMonthlyBonus {
  activity: string;
  label: string;
  expires: string;
  multiplier: number;
  estimatedHourlyRate?: number;
  soloTip?: string;
}

// ──────────────────────────────────────────────────────────────────────
// Income Leak Detection Result
// ──────────────────────────────────────────────────────────────────────

export interface IncomeLeakResult {
  bottlenecks: Bottleneck[];
  nightclubDiscountEvent: ActiveEvent | undefined;
}

// ──────────────────────────────────────────────────────────────────────
// Nightclub State
// ──────────────────────────────────────────────────────────────────────

export interface NightclubState {
  owned: boolean;
  floors: number;
  equipmentUpgrade: unknown;
  staffUpgrade: unknown;
  hasPounder: boolean;
  hasMule: boolean;
  techs: number;
  feeders: number;
}
