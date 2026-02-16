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

const setMissingTimePartDefaults = (migrated) => {
  if (migrated.timePlayedDays === undefined) migrated.timePlayedDays = '';
  if (migrated.timePlayedHours === undefined) migrated.timePlayedHours = '';
  if (migrated.timePlayedMinutes === undefined) migrated.timePlayedMinutes = '';
};

const inferTimePlayedMode = (migrated) => {
  if (hasTimeParts(migrated)) return 'parts';
  if (hasLegacyTotalTime(migrated)) return 'total';
  return 'parts';
};

const ensureBooleanDefaults = (migrated, fields) => {
  fields.forEach((field) => {
    if (migrated[field] === undefined) {
      migrated[field] = false;
    }
  });
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

    migrated.nightclubSources = newSources;
  }

  if (!migrated.nightclubSources) {
    migrated.nightclubSources = { ...DEFAULT_NIGHTCLUB_SOURCES };
  }

  return migrated;
};

const migrateNightclubStorage = (migrated) => {
  if (!migrated.nightclubStorage) {
    migrated.nightclubStorage = {
      hasPounder: migrated.hasPounderCustom || false,
      hasMule: migrated.hasMuleCustom || false,
    };
  }

  return migrated;
};

const migrateStamina = (migrated) => {
  if (migrated.lungCapacity !== undefined && migrated.stamina === undefined) {
    migrated.stamina = migrated.lungCapacity;
    delete migrated.lungCapacity;
  }

  return migrated;
};

const migrateBunkerUpgrades = (migrated) => {
  if (
    migrated.bunkerUpgraded &&
    migrated.bunkerEquipmentUpgrade === undefined &&
    migrated.bunkerStaffUpgrade === undefined
  ) {
    migrated.bunkerEquipmentUpgrade = true;
    migrated.bunkerStaffUpgrade = true;
    migrated.bunkerSecurityUpgrade = false;
  }

  if (migrated.bunkerEquipmentUpgrade === undefined) migrated.bunkerEquipmentUpgrade = false;
  if (migrated.bunkerStaffUpgrade === undefined) migrated.bunkerStaffUpgrade = false;
  if (migrated.bunkerSecurityUpgrade === undefined) migrated.bunkerSecurityUpgrade = false;

  return migrated;
};

const migrateTimePlayedParts = (migrated) => {
  if (!hasTimeParts(migrated) && hasLegacyTotalTime(migrated)) {
    const totalHours = Number(migrated.timePlayed);

    if (!Number.isNaN(totalHours) && totalHours >= 0) {
      const parts = convertTotalHoursToParts(totalHours);
      migrated.timePlayedDays = parts.days;
      migrated.timePlayedHours = parts.hours;
      migrated.timePlayedMinutes = parts.minutes;
    }
  }

  setMissingTimePartDefaults(migrated);
  return migrated;
};

const ensureDefaults = (migrated) => {
  if (!migrated.timePlayedMode) {
    migrated.timePlayedMode = inferTimePlayedMode(migrated);
  }

  if (!migrated.purchaseDates || typeof migrated.purchaseDates !== 'object') {
    migrated.purchaseDates = { ...DEFAULT_PURCHASE_DATES };
  }

  if (!migrated.nightclubStorage || typeof migrated.nightclubStorage !== 'object') {
    migrated.nightclubStorage = { ...DEFAULT_NIGHTCLUB_STORAGE };
  }

  delete migrated.cayoCompletions;
  delete migrated.cayoAvgTime;
  delete migrated.cayoHistory;
  delete migrated.lastCayoRun;

  ensureBooleanDefaults(migrated, [
    'hasWeedFarm',
    'hasHeliTours',
    'sellsToStreetDealers',
    'dailyStashHouse',
    'dailyGsCache',
    'dailySafeCollect',
  ]);

  return migrated;
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
