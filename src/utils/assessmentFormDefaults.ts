interface NightclubSources {
  imports: boolean;
  cargo: boolean;
  pharma: boolean;
  sporting: boolean;
  cash: boolean;
  organic: boolean;
  printing: boolean;
}

interface PurchaseDates {
  kosatka: string | null;
  sparrow: string | null;
  agency: string | null;
  nightclub: string | null;
  acidLab: string | null;
  bunker: string | null;
  autoShop: string | null;
  salvageYard: string | null;
}

interface NightclubStorage {
  hasPounder: boolean;
  hasMule: boolean;
}

const DEFAULT_NIGHTCLUB_SOURCES: NightclubSources = {
  imports: false,
  cargo: false,
  pharma: false,
  sporting: false,
  cash: false,
  organic: false,
  printing: false,
};

const DEFAULT_PURCHASE_DATES: PurchaseDates = {
  kosatka: null,
  sparrow: null,
  agency: null,
  nightclub: null,
  acidLab: null,
  bunker: null,
  autoShop: null,
  salvageYard: null,
};

const DEFAULT_NIGHTCLUB_STORAGE: NightclubStorage = {
  hasPounder: false,
  hasMule: false,
};

export const LEGACY_STORAGE_KEYS = [
  'gta_assessment_draft_v1',
  'gta_assessment_draft_v2',
  'gta_assessment_draft_v3',
  'gta_assessment_draft_v4',
  'gtaAssessmentDraft_v1',
  'gtaAssessmentDraft_v2',
  'gtaAssessmentDraft_v3',
  'gtaAssessmentDraft_v4',
];

export interface FormData {
  rank: string;
  timePlayed: string;
  timePlayedDays: string;
  timePlayedHours: string;
  timePlayedMinutes: string;
  timePlayedMode: string;
  liquidCash: string;
  totalIncomeCollected: string;
  totalRPCollected: string;
  strength: number;
  flying: number;
  shooting: number;
  stealth: number;
  stamina: number;
  driving: number;
  hasKosatka: boolean;
  hasSparrow: boolean;
  hasAgency: boolean;
  dreContractDone: boolean;
  payphoneUnlocked: boolean;
  securityContracts: string;
  hasAcidLab: boolean;
  acidLabUpgraded: boolean;
  hasNightclub: boolean;
  nightclubTechs: string;
  nightclubSources: NightclubSources;
  nightclubFloors: string;
  nightclubStorage: NightclubStorage;
  hasSalvageYard: boolean;
  hasTowTruck: boolean;
  hasSafehouse: boolean;
  hasRaiju: boolean;
  hasOppressor: boolean;
  hasArmoredKuruma: boolean;
  hasBunker: boolean;
  bunkerUpgraded: boolean;
  bunkerEquipmentUpgrade: boolean;
  bunkerStaffUpgrade: boolean;
  bunkerSecurityUpgrade: boolean;
  hasAutoShop: boolean;
  hasMansion: boolean;
  mansionType: string;
  hasCarWash: boolean;
  hasWeedFarm: boolean;
  hasHeliTours: boolean;
  sellsToStreetDealers: boolean;
  dailyStashHouse: boolean;
  dailyGsCache: boolean;
  dailySafeCollect: boolean;
  claimedFreeCar: boolean;
  claimedWheelSpin: boolean;
  hasGTAPlus: boolean;
  playMode: string;
  purchaseDates: PurchaseDates;
}

export const createInitialFormData = (): FormData => ({
  rank: '',
  timePlayed: '',
  timePlayedDays: '',
  timePlayedHours: '',
  timePlayedMinutes: '',
  timePlayedMode: 'parts',
  liquidCash: '0',
  totalIncomeCollected: '',
  totalRPCollected: '',
  strength: 0,
  flying: 0,
  shooting: 0,
  stealth: 0,
  stamina: 0,
  driving: 0,
  hasKosatka: false,
  hasSparrow: false,
  hasAgency: false,
  dreContractDone: false,
  payphoneUnlocked: false,
  securityContracts: '',
  hasAcidLab: false,
  acidLabUpgraded: false,
  hasNightclub: false,
  nightclubTechs: '',
  nightclubSources: { ...DEFAULT_NIGHTCLUB_SOURCES },
  nightclubFloors: '1',
  nightclubStorage: { ...DEFAULT_NIGHTCLUB_STORAGE },
  hasSalvageYard: false,
  hasTowTruck: false,
  hasSafehouse: false,
  hasRaiju: false,
  hasOppressor: false,
  hasArmoredKuruma: false,
  hasBunker: false,
  bunkerUpgraded: false,
  bunkerEquipmentUpgrade: false,
  bunkerStaffUpgrade: false,
  bunkerSecurityUpgrade: false,
  hasAutoShop: false,
  hasMansion: false,
  mansionType: '',
  hasCarWash: false,
  hasWeedFarm: false,
  hasHeliTours: false,
  sellsToStreetDealers: false,
  dailyStashHouse: false,
  dailyGsCache: false,
  dailySafeCollect: false,
  claimedFreeCar: false,
  claimedWheelSpin: false,
  hasGTAPlus: false,
  playMode: 'invite',
  purchaseDates: { ...DEFAULT_PURCHASE_DATES },
});

export const DEFAULTS = {
  DEFAULT_NIGHTCLUB_SOURCES,
  DEFAULT_NIGHTCLUB_STORAGE,
  DEFAULT_PURCHASE_DATES,
};
