import { BUSINESSES } from '../data/verifiedPropertyData';
import type { Business, EmpireState, OwnedBusiness } from '../types/enterprise.types';
import type { BalanceRow, BalanceSection, CapexItem, CfoLedger, IncomeRow, LedgerStatus, SynergySnapshot } from './cfoModeLedgerTypes';

const businessMap = new Map(BUSINESSES.map((business) => [business.id, business]));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getOwnedEntry = (state: EmpireState, businessId: string): OwnedBusiness | undefined =>
  state.ownedBusinesses.find((entry) => entry.businessId === businessId);

const getLocationCost = (business: Business, locationId: string) => {
  const selected = business.locations.find((location) => location.id === locationId);
  if (selected) return selected.price;
  const fallback = business.locations.find((location) => location.id === business.recommendedLocationId) || business.locations[0];
  return fallback?.price || 0;
};

const getUpgradeCost = (business: Business, upgradeIds: string[]) =>
  business.upgrades
    .filter((upgrade) => upgradeIds.includes(upgrade.id))
    .reduce((total, upgrade) => total + upgrade.cost, 0);

const getBookValue = (state: EmpireState, businessId: string) => {
  const owned = getOwnedEntry(state, businessId);
  const business = businessMap.get(businessId);
  if (!owned || !business) return 0;

  const locationCost = getLocationCost(business, owned.locationId);
  const upgradesCost = getUpgradeCost(business, owned.purchasedUpgradeIds);
  return locationCost + upgradesCost;
};

const hasBusiness = (state: EmpireState, businessId: string) => Boolean(getOwnedEntry(state, businessId));

const hasUpgrade = (state: EmpireState, businessId: string, upgradeId: string) => {
  const owned = getOwnedEntry(state, businessId);
  return Boolean(owned?.purchasedUpgradeIds.includes(upgradeId));
};

const getOperationalStatus = (state: EmpireState, businessId: string): LedgerStatus => {
  const owned = getOwnedEntry(state, businessId);
  const business = businessMap.get(businessId);

  if (!owned || !business) {
    return '— NOT OWNED';
  }

  const requiredIds = business.upgrades.filter((upgrade) => upgrade.required).map((upgrade) => upgrade.id);
  const missingRequired = requiredIds.some((id) => !owned.purchasedUpgradeIds.includes(id));
  return missingRequired ? '⚠️ UPGRADE REQ' : '✅ OPERATIONAL';
};

const toIncomeRow = (id: string, label: string, grossRevenue: number, cycleMinutes: number, highlightRed = false): IncomeRow => ({
  id,
  label,
  grossRevenue,
  cycleMinutes,
  yieldPerHour: cycleMinutes > 0 ? Math.round((grossRevenue / cycleMinutes) * 60) : 0,
  highlightRed,
});

const createBalanceSections = (state: EmpireState): BalanceSection[] => {
  const operationsRows: BalanceRow[] = [
    {
      id: 'kosatka_plus_sparrow',
      label: 'Kosatka + Sparrow',
      value: getBookValue(state, 'kosatka'),
      status: getOperationalStatus(state, 'kosatka'),
      notes: 'Primary Revenue Driver (Cayo)',
    },
    {
      id: 'agency_little_seoul',
      label: 'Agency (Little Seoul)',
      value: getBookValue(state, 'agency'),
      status: getOperationalStatus(state, 'agency'),
      notes: 'Includes Armory & Workshop',
    },
    {
      id: 'nightclub_downtown',
      label: 'Nightclub',
      value: getBookValue(state, 'nightclub'),
      status: getOperationalStatus(state, 'nightclub'),
      notes: 'Safe + warehouse operations',
    },
    {
      id: 'acid_lab',
      label: 'Acid Lab (Brickade + Equip)',
      value: getBookValue(state, 'acid_lab'),
      status: getOperationalStatus(state, 'acid_lab'),
      notes: 'Best passive earner by profit/hour',
    },
    {
      id: 'bunker_chumash',
      label: 'Bunker',
      value: getBookValue(state, 'bunker'),
      status: getOperationalStatus(state, 'bunker'),
      notes: 'Gunrunning backbone',
    },
    {
      id: 'arcade_mct',
      label: 'Arcade + MCT',
      value: getBookValue(state, 'arcade'),
      status: getOperationalStatus(state, 'arcade'),
      notes: 'Master Control access',
    },
  ];

  const hasWeed = hasBusiness(state, 'weed_farm');
  const hasSmoke = hasBusiness(state, 'smoke_on_the_water');
  let smokeStatus: LedgerStatus = '— NOT OWNED';
  if (hasSmoke) {
    smokeStatus = hasWeed ? '⚡ BOOSTING' : '✅ OPERATIONAL';
  }

  const moneyFrontRows: BalanceRow[] = [
    {
      id: 'car_wash',
      label: 'Hands On Car Wash',
      value: getBookValue(state, 'car_wash'),
      status: hasBusiness(state, 'car_wash') ? '🟢 LAUNDERING' : '— NOT OWNED',
      notes: 'Reduces network heat pressure',
    },
    {
      id: 'smoke',
      label: 'Smoke on the Water',
      value: getBookValue(state, 'smoke_on_the_water'),
      status: smokeStatus,
      notes: 'Boosts Weed Farm output',
    },
    {
      id: 'helitours',
      label: 'Higgins Helitours',
      value: getBookValue(state, 'higgins_helitours'),
      status: hasBusiness(state, 'higgins_helitours') ? '💤 IDLE' : '— NOT OWNED',
      notes: 'Best with hangar/cargo linkage',
    },
  ];

  const mcRows: BalanceRow[] = [
    {
      id: 'coke',
      label: 'Cocaine Lockup',
      value: getBookValue(state, 'cocaine_lockup'),
      status: getOperationalStatus(state, 'cocaine_lockup'),
      notes: 'Highest MC yield',
    },
    {
      id: 'meth',
      label: 'Meth Lab',
      value: getBookValue(state, 'meth_lab'),
      status: getOperationalStatus(state, 'meth_lab'),
      notes: 'Second-best MC yield',
    },
    {
      id: 'cash',
      label: 'Counterfeit Cash',
      value: getBookValue(state, 'cash_factory'),
      status: getOperationalStatus(state, 'cash_factory'),
      notes: 'Strong with full upgrades',
    },
  ];

  return [
    { id: 'operations', title: 'FIXED ASSETS (Operations)', rows: operationsRows, total: operationsRows.reduce((sum, row) => sum + row.value, 0) },
    { id: 'fronts', title: 'MONEY FRONT NETWORK', rows: moneyFrontRows, total: moneyFrontRows.reduce((sum, row) => sum + row.value, 0) },
    { id: 'mc', title: 'MC SUBSIDIARIES (Top 3)', rows: mcRows, total: mcRows.reduce((sum, row) => sum + row.value, 0) },
  ];
};

const createPassiveIncomeRows = (state: EmpireState): IncomeRow[] => {
  const hasWeed = hasBusiness(state, 'weed_farm');
  const boostedWeed = hasWeed && hasBusiness(state, 'smoke_on_the_water');
  const weedLabel = boostedWeed ? '⚡ Weed Farm (Boosted)' : '🟢 Weed Farm';
  const weedGross = boostedWeed ? 140000 : 120000;
  const rows: Array<IncomeRow | null> = [
    hasBusiness(state, 'acid_lab') ? toIncomeRow('acid_sale', '🟢 Acid Lab Sale', 329375, 150) : null,
    hasBusiness(state, 'cocaine_lockup') ? toIncomeRow('coke_sale', '🟢 Cocaine Lockup', 210000, 120) : null,
    hasBusiness(state, 'meth_lab') ? toIncomeRow('meth_sale', '🟢 Meth Lab', 208250, 168) : null,
    hasBusiness(state, 'cash_factory') ? toIncomeRow('cash_sale', '🟢 Counterfeit Cash', 160766, 138) : null,
    hasWeed ? toIncomeRow('weed_sale', weedLabel, weedGross, 138) : null,
  ];

  return rows.filter((row): row is IncomeRow => Boolean(row));
};

const createSafeIncomeRows = (state: EmpireState, effectiveHeat: number) => {
  const hasCarWash = hasBusiness(state, 'car_wash');
  const hasDispensary = hasBusiness(state, 'smoke_on_the_water');
  const hasHelitours = hasBusiness(state, 'higgins_helitours');
  const isRedHeat = effectiveHeat >= 71;

  const frontsCycle = (hasCarWash ? 8500 : 0) + (hasDispensary ? 5000 : 0) + (hasHelitours ? 5000 : 0);
  const activeFrontsCycle = isRedHeat ? 0 : frontsCycle;

  const rows: Array<IncomeRow | null> = [
    hasBusiness(state, 'nightclub') ? toIncomeRow('nightclub_safe', '🟢 Nightclub Safe (Max Pop.)', 50000, 48) : null,
    hasBusiness(state, 'agency') ? toIncomeRow('agency_safe', '🟢 Agency Safe', 20000, 48) : null,
    hasCarWash || hasDispensary || hasHelitours
      ? toIncomeRow('front_safe', '⚡ Money Fronts (Combined)', activeFrontsCycle, 48, isRedHeat)
      : null,
  ].filter((row): row is IncomeRow => Boolean(row));

  return {
    rows,
    combinedCycleIncome: activeFrontsCycle,
    ownedCount: [hasCarWash, hasDispensary, hasHelitours].filter(Boolean).length,
  };
};

const createCapexItems = (state: EmpireState): CapexItem[] => [
  {
    id: 'nightclub_equipment',
    tier: 'TIER 1: FOUNDATION (Critical)',
    label: 'Nightclub Equipment Upgrade',
    cost: 1400000,
    expectedRoiHours: 12,
    roiBand: 'HIGH',
    purchased: hasUpgrade(state, 'nightclub', 'nightclub_equipment'),
  },
  {
    id: 'cash_staff',
    tier: 'TIER 1: FOUNDATION (Critical)',
    label: 'Counterfeit Cash Staff Upgrade',
    cost: 292500,
    expectedRoiHours: 3,
    roiBand: 'MED',
    purchased: hasUpgrade(state, 'cash_factory', 'cash_staff'),
  },
  {
    id: 'smoke_front',
    tier: 'TIER 2: FRONT EXPANSION',
    label: 'Smoke on the Water',
    cost: 850000,
    expectedRoiHours: 14,
    roiBand: 'HIGH',
    purchased: hasBusiness(state, 'smoke_on_the_water'),
  },
  {
    id: 'helitours',
    tier: 'TIER 2: FRONT EXPANSION',
    label: 'Higgins Helitours',
    cost: 900000,
    expectedRoiHours: 36,
    roiBand: 'MED',
    purchased: hasBusiness(state, 'higgins_helitours'),
  },
  {
    id: 'meth_security',
    tier: 'TIER 3: MC OPTIMIZATION',
    label: 'Meth Lab Security Upgrade',
    cost: 297000,
    expectedRoiHours: 4,
    roiBand: 'LOW',
    purchased: hasUpgrade(state, 'meth_lab', 'meth_security'),
  },
  {
    id: 'terrorbyte_plus_workshop',
    tier: 'TIER 4: SCALING',
    label: 'Terrorbyte + Workshop',
    cost: 1870000,
    expectedRoiHours: 20,
    roiBand: 'HIGH',
    purchased: hasBusiness(state, 'terrorbyte') && hasUpgrade(state, 'terrorbyte', 'terrorbyte_workshop'),
  },
  {
    id: 'oppressor_mk2',
    tier: 'TIER 4: SCALING',
    label: 'Oppressor Mk II',
    cost: 8000000,
    expectedRoiHours: 80,
    roiBand: 'VERY HIGH',
    purchased: hasBusiness(state, 'oppressor_mk2'),
  },
];

const createSynergy = (state: EmpireState): SynergySnapshot => {
  const hasWeed = hasBusiness(state, 'weed_farm');
  const hasDispensary = hasBusiness(state, 'smoke_on_the_water');
  const hasCarWash = hasBusiness(state, 'car_wash');

  const weedStandalonePerHour = 52174;
  const weedNetworkedPerHour = hasWeed && hasDispensary ? 60870 : weedStandalonePerHour;
  const dispensaryPerHour = hasDispensary ? 6250 : 0;
  const carWashPerHour = hasCarWash ? 10625 : 0;

  const standaloneTotalPerHour = weedStandalonePerHour + dispensaryPerHour + carWashPerHour;
  const networkedTotalPerHour = weedNetworkedPerHour + dispensaryPerHour + carWashPerHour;
  const efficiencyPercent = standaloneTotalPerHour > 0
    ? Math.round(((networkedTotalPerHour - standaloneTotalPerHour) / standaloneTotalPerHour) * 100)
    : 0;

  return {
    weedStandalonePerHour,
    weedNetworkedPerHour,
    dispensaryPerHour,
    carWashPerHour,
    standaloneTotalPerHour,
    networkedTotalPerHour,
    efficiencyPercent,
  };
};

export const getEffectiveHeat = (rawHeat: number, moneyFrontOwnedCount: number) =>
  clamp(rawHeat - (moneyFrontOwnedCount * 5), 0, 100);

export const createCfoModeLedger = (state: EmpireState, rawHeat: number): CfoLedger => {
  const balanceSections = createBalanceSections(state);
  const passiveIncomeRows = createPassiveIncomeRows(state);

  const moneyFrontOwnedCount = [
    hasBusiness(state, 'car_wash'),
    hasBusiness(state, 'smoke_on_the_water'),
    hasBusiness(state, 'higgins_helitours'),
  ].filter(Boolean).length;

  const effectiveHeat = getEffectiveHeat(rawHeat, moneyFrontOwnedCount);
  const safeIncome = createSafeIncomeRows(state, effectiveHeat);

  const totalAssets = balanceSections.reduce((sum, section) => sum + section.total, 0);
  const totalProjectedPerHour = [...passiveIncomeRows, ...safeIncome.rows]
    .reduce((sum, row) => sum + row.yieldPerHour, 0);

  return {
    balanceSections,
    totalAssets,
    passiveIncomeRows,
    safeIncomeRows: safeIncome.rows,
    totalProjectedPerHour,
    moneyFrontCombinedCycle: safeIncome.combinedCycleIncome,
    capexItems: createCapexItems(state),
    synergy: createSynergy(state),
    moneyFrontOwnedCount,
  };
};
