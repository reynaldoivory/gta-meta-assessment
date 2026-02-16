// src/utils/bottleneckTypes.ts
// Shared type definitions for the bottleneck detection modules.

export type { Bottleneck } from './actionPlanBuilder';

export interface DetectionParams {
  rank: number;
  strength: number;
  flying: number;
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
  nightclubTechs: number;
  nightclubFeeders: number;
  liquidCash: number;
  dreContractDone: boolean;
  sellsToStreetDealers: boolean;
  [key: string]: unknown;
}

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
  [key: string]: unknown;
}

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
  [key: string]: unknown;
}

export interface GtaPlusMonthlyBonus {
  activity: string;
  label: string;
  expires: string;
  multiplier: number;
  estimatedHourlyRate?: number;
  soloTip?: string;
  [key: string]: unknown;
}

export interface IncomeLeakResult {
  bottlenecks: Bottleneck[];
  nightclubDiscountEvent: ActiveEvent | undefined;
}

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
