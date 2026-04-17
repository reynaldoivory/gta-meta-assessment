import { DEFAULTS } from './assessmentFormDefaults';

const { DEFAULT_NIGHTCLUB_SOURCES, DEFAULT_NIGHTCLUB_STORAGE, DEFAULT_PURCHASE_DATES } = DEFAULTS;

const hasTimeParts = (migrated) =>
  migrated.timePlayedDays !== undefined ||
  migrated.timePlayedHours !== undefined ||
  migrated.timePlayedMinutes !== undefined;

const hasLegacyTotalTime = (migrated) => migrated.timePlayed !== undefined && migrated.timePlayed !== '';

const convertTotalHoursToParts = (totalHours) => {
  let days = Math.floor(totalHours / 24);
  const remainder = totalHours - days * 24;
  let hours = Math.floor(remainder);
  let minutes = Math.round((remainder - hours) * 60);

  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }

  if (hours >= 24) {
    days += Math.floor(hours / 24);
    hours %= 24;
  }

  return {
    days: days ? String(days) : '',
    hours: hours ? String(hours) : '',
    minutes: minutes ? String(minutes) : '',
  };
};

const setMissingTimePartDefaults = (migrated) => ({
  timePlayedDays: migrated.timePlayedDays !== undefined ? migrated.timePlayedDays : '',
  timePlayedHours: migrated.timePlayedHours !== undefined ? migrated.timePlayedHours : '',
  timePlayedMinutes: migrated.timePlayedMinutes !== undefined ? migrated.timePlayedMinutes : '',
});

const inferTimePlayedMode = (migrated) => {
  if (hasTimeParts(migrated)) return 'parts';
  if (hasLegacyTotalTime(migrated)) return 'total';
  return 'parts';
};

const ensureBooleanDefaults = (migrated, fields) => {
  const overrides = {};
  fields.forEach((field) => {
    if (migrated[field] === undefined) {
      overrides[field] = false;
    }
  });
  return { ...migrated, ...overrides };
};

const migrateNightclubSources = (migrated) => {
  if (
    migrated.nightclubFeeders !== undefined &&
    migrated.nightclubFeeders !== '' &&
    (!migrated.nightclubSources || Object.values(migrated.nightclubSources).every((value) => value === false))
  ) {
    const feederCount = Number(migrated.nightclubFeeders) || 0;
    const sourceOrder = ['imports', 'cargo', 'pharma', 'sporting', 'cash', 'organic', 'printing'];
    const newSources = { ...DEFAULT_NIGHTCLUB_SOURCES };

    for (let index = 0; index < feederCount && index < sourceOrder.length; index += 1) {
      newSources[sourceOrder[index]] = true;
    }

    return { ...migrated, nightclubSources: newSources };
  }

  if (!migrated.nightclubSources) {
    return { ...migrated, nightclubSources: { ...DEFAULT_NIGHTCLUB_SOURCES } };
  }

  return migrated;
};

const migrateNightclubStorage = (migrated) => {
  if (!migrated.nightclubStorage) {
    return {
      ...migrated,
      nightclubStorage: {
        hasPounder: migrated.hasPounderCustom || false,
        hasMule: migrated.hasMuleCustom || false,
      },
    };
  }

  return migrated;
};

const migrateStamina = (migrated) => {
  if (migrated.lungCapacity !== undefined && migrated.stamina === undefined) {
    const { lungCapacity: _dropped, ...rest } = migrated;
    return { ...rest, stamina: migrated.lungCapacity };
  }

  return migrated;
};

const migrateBunkerUpgrades = (migrated) => {
  const upgrades = {
    bunkerEquipmentUpgrade: migrated.bunkerEquipmentUpgrade !== undefined ? migrated.bunkerEquipmentUpgrade : false,
    bunkerStaffUpgrade: migrated.bunkerStaffUpgrade !== undefined ? migrated.bunkerStaffUpgrade : false,
    bunkerSecurityUpgrade: migrated.bunkerSecurityUpgrade !== undefined ? migrated.bunkerSecurityUpgrade : false,
  };

  if (
    migrated.bunkerUpgraded &&
    migrated.bunkerEquipmentUpgrade === undefined &&
    migrated.bunkerStaffUpgrade === undefined
  ) {
    upgrades.bunkerEquipmentUpgrade = true;
    upgrades.bunkerStaffUpgrade = true;
    upgrades.bunkerSecurityUpgrade = false;
  }

  return { ...migrated, ...upgrades };
};

const migrateTimePlayedParts = (migrated) => {
  let next = migrated;

  if (!hasTimeParts(migrated) && hasLegacyTotalTime(migrated)) {
    const totalHours = Number(migrated.timePlayed);

    if (!Number.isNaN(totalHours) && totalHours >= 0) {
      const parts = convertTotalHoursToParts(totalHours);
      next = { ...next, timePlayedDays: parts.days, timePlayedHours: parts.hours, timePlayedMinutes: parts.minutes };
    }
  }

  return { ...next, ...setMissingTimePartDefaults(next) };
};

const ensureDefaults = (migrated) => {
  const { cayoCompletions: _c, cayoAvgTime: _a, cayoHistory: _h, lastCayoRun: _l, ...rest } = migrated;

  const withDefaults = {
    ...rest,
    timePlayedMode: rest.timePlayedMode || inferTimePlayedMode(rest),
    purchaseDates: (rest.purchaseDates && typeof rest.purchaseDates === 'object')
      ? rest.purchaseDates
      : { ...DEFAULT_PURCHASE_DATES },
    nightclubStorage: (rest.nightclubStorage && typeof rest.nightclubStorage === 'object')
      ? rest.nightclubStorage
      : { ...DEFAULT_NIGHTCLUB_STORAGE },
  };

  return ensureBooleanDefaults(withDefaults, [
    'hasWeedFarm',
    'hasHeliTours',
    'sellsToStreetDealers',
    'dailyStashHouse',
    'dailyGsCache',
    'dailySafeCollect',
  ]);
};

export const migrateUserData = (data) => {
  let migrated = { ...data };
  migrated = migrateNightclubSources(migrated);
  migrated = migrateNightclubStorage(migrated);
  migrated = migrateStamina(migrated);
  migrated = migrateBunkerUpgrades(migrated);
  migrated = migrateTimePlayedParts(migrated);
  migrated = ensureDefaults(migrated);
  return migrated;
};
