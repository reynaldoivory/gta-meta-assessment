import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';
import { MODEL_CONFIG } from './modelConfig';

export const INFRASTRUCTURE_COSTS = {
  bunker: {
    equipmentUpgrade: 1155000,
    staffUpgrade: 598500,
    securityUpgrade: 351000,
  },
  nightclub: {
    floors: { 1: 0, 2: 755000, 3: 1135000, 4: 1515000, 5: 1895000 },
    equipmentUpgrade: 1425000,
    staffUpgrade: 475000,
    securityUpgrade: 695000,
    technicianCosts: [0, 141000, 184500, 240500, 312000],
    technicianTotal: 878000,
    pounderCustom: 1900000,
    muleCustom: 1400000,
    speedo: 0,
  },
  acidLab: { equipmentUpgrade: 250000 },
  mcBusinesses: {
    coke: { setup: 975000, equipmentUpgrade: 935000, staffUpgrade: 390000 },
    meth: { setup: 910000, equipmentUpgrade: 1100000, staffUpgrade: 331500 },
    cash: { setup: 845000, equipmentUpgrade: 880000, staffUpgrade: 273000 },
    weed: { setup: 715000, equipmentUpgrade: 990000, staffUpgrade: 273000 },
    documents: { setup: 650000, equipmentUpgrade: 550000, staffUpgrade: 195000 },
  },
} as const;

export const NIGHTCLUB_FLOOR_AFK = {
  1: { maxHours: 20, description: '20 hours until capped' },
  2: { maxHours: 32, description: '32 hours until capped' },
  3: { maxHours: 44, description: '44 hours until capped' },
  4: { maxHours: 56, description: '56 hours until capped' },
  5: { maxHours: 66, description: '66+ hours until capped (overnight safe)' },
} as const;

export const getNightclubTechnicianCost = (currentTechs: number, targetTechs = 5) => {
  const costs = INFRASTRUCTURE_COSTS.nightclub.technicianCosts;
  const start = Math.max(0, Math.min(5, Number(currentTechs) || 0));
  const end = Math.max(0, Math.min(5, Number(targetTechs) || 0));
  if (end <= start) return 0;
  let total = 0;
  for (let index = start; index < end; index += 1) {
    total += costs[index] || 0;
  }
  return total;
};

export const getCurrentDiscount = (category: string) => {
  const now = Date.now();
  if (category !== 'nightclub' && category !== 'nightclubUpgrades') return 0;

  const discounts = [
    WEEKLY_EVENTS.discounts?.nightclubUpgrades,
    WEEKLY_EVENTS.discounts?.nightclubProperties,
  ];

  const active = discounts.find((discount) => {
    if (!discount) return false;
    return new Date(discount.validUntil).getTime() > now;
  });

  if (!active) return 0;
  return (active.percent || 0) / 100;
};

export const getDiscountedPrice = (basePrice: number, category: string) => {
  const discount = getCurrentDiscount(category);
  const price = Math.round(basePrice * (1 - discount));
  return {
    price,
    savings: basePrice - price,
    isDiscounted: discount > 0,
    discountPercent: Math.round(discount * 100),
  };
};

const bunkerBase = MODEL_CONFIG.income.passive.bunkerBase;
const bunkerMax = MODEL_CONFIG.income.bunker.upgraded.perHour;
export const BUNKER_INCOME = {
  unupgraded: bunkerBase,
  equipmentOnly: Math.round(bunkerBase + (bunkerMax - bunkerBase) * 0.55),
  staffOnly: Math.round(bunkerBase + (bunkerMax - bunkerBase) * 0.4),
  fullyUpgraded: bunkerMax,
};

export const NIGHTCLUB_INCOME = {
  basePerTech: 10000,
  unupgradedPenalty: 0.5,
  maxTechs: 5,
};

export const calculateBunkerLeak = (bunkerState: { owned?: boolean; equipmentUpgrade?: boolean; staffUpgrade?: boolean }) => {
  if (!bunkerState?.owned) {
    return { hasLeak: false, currentIncome: 0, potentialIncome: 0, lostPerHour: 0 };
  }

  let incomeByState = BUNKER_INCOME.unupgraded;
  if (bunkerState.equipmentUpgrade && bunkerState.staffUpgrade) {
    incomeByState = BUNKER_INCOME.fullyUpgraded;
  } else if (bunkerState.equipmentUpgrade) {
    incomeByState = BUNKER_INCOME.equipmentOnly;
  } else if (bunkerState.staffUpgrade) {
    incomeByState = BUNKER_INCOME.staffOnly;
  }

  const lostPerHour = BUNKER_INCOME.fullyUpgraded - incomeByState;
  const roiHours = lostPerHour > 0
    ? Math.round((INFRASTRUCTURE_COSTS.bunker.equipmentUpgrade + INFRASTRUCTURE_COSTS.bunker.staffUpgrade) / lostPerHour)
    : 0;

  return {
    hasLeak: lostPerHour > 0,
    currentIncome: incomeByState,
    potentialIncome: BUNKER_INCOME.fullyUpgraded,
    lostPerHour,
    roiHours,
    missingEquipment: !bunkerState.equipmentUpgrade,
    missingStaff: !bunkerState.staffUpgrade,
  };
};
