// src/config/weeklyEvents.js
// The "Source of Truth" for weekly events
// Update this file every Thursday when Rockstar announces new bonuses
// Last updated: Jul 18, 2026 (Jul 16-22 week; sources: gtabase.com + dexerto.com weekly recaps)
// Source: rockstargames.com/newswire + powerupgaming/rockstarintel/gtabase weekly recaps

export const WEEKLY_EVENTS: any = {
  meta: {
    lastUpdated: '2026-07-18',
    validFrom: '2026-07-16T09:00:00Z', // Thursday 5AM EDT
    validUntil: '2026-07-23T09:00:00Z',
    displayDate: 'Jul 16 - Jul 22',
    eventTag: 'kortz_center_heist_week',
  },
  bonuses: {
    // Independence Day Special — extended 11-day event week
    stuntRaceSeries: {
      isActive: true,
      multiplier: 3,
      label: '3X Stunt Race Series',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'race',
      tag: 'independence_day_2026',
    },
    bunkerSellMissions: {
      isActive: true,
      multiplier: 2,
      label: '2X Bunker Sell Missions',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'business',
      tag: 'independence_day_2026',
      soloFriendly: true,
      highValue: true,
      soloTip: 'Sell at ~25% stock ($175k base -> $350k this week) to guarantee a single delivery vehicle solo. Pairs with the FREE Lago Zancudo Bunker for new owners.',
    },
    bunkerResearch: {
      isActive: true,
      multiplier: 2,
      label: '2X Bunker Research Missions + 2X Research Speed',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'business',
      tag: 'independence_day_2026',
      soloFriendly: true,
      soloTip: 'Best week of the year to unlock MK II upgrades — research accrues at double speed.',
    },
    ammuNationContracts: {
      isActive: true,
      multiplier: 2,
      label: '2X Ammu-Nation Contract Missions',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'mission',
      soloFriendly: true,
    },
    communitySeries: {
      isActive: true,
      multiplier: 2,
      label: '2X Community Series',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'race',
    },
    runningBackRemix: {
      isActive: true,
      multiplier: 2,
      label: '2X Running Back (Remix)',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'adversary',
      requiresMultiplayer: true,
      soloNote: 'Adversary mode — requires other players.',
    },
    gsCache: {
      isActive: true,
      multiplier: 5,
      label: '5X G\'s Cache (GTA+ only this week)',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'freemode',
      gtaPlusOnly: true,
      soloFriendly: true,
      soloTip: 'Daily freemode pickup — ~$50k base becomes ~$250k for GTA+ members. Check the G\'s Cache toast on session join.',
    },
    knoWayOutMissions: {
      isActive: true,
      multiplier: 2,
      label: '2X KnoWay Out Missions (GTA+ only this week)',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'mission',
      gtaPlusOnly: true,
      soloFriendly: true,
    },
    smugglerSellMissions: {
      isActive: true,
      multiplier: 2,
      label: '2X Smuggler (Hangar) Sell Missions (GTA+ only this week)',
      validUntil: '2026-07-13T09:00:00Z',
      category: 'business',
      gtaPlusOnly: true,
      highValue: true,
      soloTip: 'Pairs with 60% off Hangars + upgrades — cheapest week to enter the Smuggler business.',
    },

    // ── Jul 16-22 week (Kortz Center Heist launch) ──────────────────────────
    communitySeriesJul16: {
      isActive: true,
      validFrom: '2026-07-16T09:00:00Z',
      multiplier: 3,
      label: '3X Community Series',
      validUntil: '2026-07-23T09:00:00Z',
      category: 'race',
    },
    sumoRemix: {
      isActive: true,
      validFrom: '2026-07-16T09:00:00Z',
      multiplier: 3,
      label: '3X Sumo (Remix)',
      validUntil: '2026-07-23T09:00:00Z',
      category: 'adversary',
      requiresMultiplayer: true,
      soloNote: 'Adversary mode — requires other players.',
    },
    hswTimeTrials: {
      isActive: true,
      validFrom: '2026-07-16T09:00:00Z',
      multiplier: 2,
      label: '2X HSW Time Trials',
      validUntil: '2026-07-23T09:00:00Z',
      category: 'freemode',
      soloFriendly: true,
      soloTip: 'One attempt pays out on beating par time — quick solo money on new-gen (HSW requires PS5/XSX-gen).',
    },
    blackBoxFile: {
      isActive: true,
      validFrom: '2026-07-16T09:00:00Z',
      multiplier: 2,
      label: '2X The Black Box File',
      validUntil: '2026-07-23T09:00:00Z',
      category: 'mission',
      soloFriendly: true,
    },
  },
  specialEvents: {
    independenceDay2026: {
      label: 'Independence Day Special + Fine Art Collector Program',
      validUntil: '2026-07-13T09:00:00Z',
      rewards: [
        'FREE Lago Zancudo Bunker (all players — claim before Jul 13)',
        'GTA$500,000 login bonus (delivered within 72hr)',
        'Free Benefactor Turreted Limo (Warstock Cache & Carry)',
        'Free Firework Launcher + ammo, free Musket, free High-End Garages',
        'Lady Liberty Bucket Hat (login reward)',
        'Complete ANY heist -> GTA$1,000,000 + NOOSE Outfit (within 72hr)',
        'Podium Vehicle: Ocelot Jugular ($1,225,000 value)',
        'Prize Ride: Lampadati Viseris (win LS Car Meet Series 2 days straight)',
        'Mansion owners (Jul 13): free Annihilator Stealth, $1M off Art Studio upgrade, High-End Painting in Kortz Center Heist',
      ],
    },
    kortzCenterHeist: {
      label: 'The Kortz Center Heist launch week',
      validUntil: '2026-07-23T09:00:00Z',
      rewards: [
        'NEW: The Kortz Center Heist — first new big score since Cayo Perico (requires Mansion + Art Studio)',
        'Weekly Challenge: complete The Kortz Center Heist once -> GTA$100,000',
        'Podium Vehicle: Dinka Jester RR',
        'Prize Ride: Obey Omnis e-GT (top-4 in LS Car Meet Series)',
        'Salvage Yard robbery vehicles: Pfister Neon (McTony), Gauntlet Hellfire (Duggan), Blista Kanjo (Cargo Ship)',
      ],
    },
  },
  oneTimeBonuses: [
    {
      id: 'independence_heist_million',
      reward: 1000000,
      description: 'Complete any Heist Finale -> GTA$1,000,000 + NOOSE Outfit (within 72hr)',
      expires: '2026-07-13T09:00:00Z',
      deliveryTime: '72hr',
    },
    {
      id: 'independence_login_500k',
      reward: 500000,
      description: 'Log in during the event -> GTA$500,000 (within 72hr)',
      expires: '2026-07-13T09:00:00Z',
      deliveryTime: '72hr',
    },
    {
      id: 'kortz_weekly_challenge_100k',
      reward: 100000,
      description: 'Complete The Kortz Center Heist once this week -> GTA$100,000',
      expires: '2026-07-23T09:00:00Z',
      deliveryTime: '72hr',
    },
  ],
  discounts: {
    lagoZancudoBunker: {
      label: 'Lago Zancudo Bunker (FREE)',
      percent: 100,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
      tag: 'independence_day_2026',
    },
    bunkerProperties: {
      label: 'Bunker Properties + modifications/upgrades',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
      tag: 'independence_day_2026',
    },
    agencyProperties: {
      label: 'Agency Properties + modifications/upgrades',
      percent: 60,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
    },
    hangarProperties: {
      label: 'Hangar Properties + modifications/upgrades',
      percent: 60,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
    },
    weaponizedAircraft70: {
      label: 'Top-shelf weaponized/support (B-11 Strikeforce, Avenger, MOC, Terrorbyte, Luxor, Bombushka, Alkonost)',
      percent: 70,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
    },
    supercars60: {
      label: 'Select supers/exotics (Deluxo, Scramjet, Furia, X80 Proto, Zeno, Tezeract, Emerus, Stinger TT)',
      percent: 60,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
    },
    vehicles50: {
      label: 'Huge 50%-off vehicle list (Oppressor, Toreador, Raiju, Hydra, Khanjali, Krieger, Ignus, LAZER, Vigero ZX, +25 more)',
      percent: 50,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
    },
    independenceDayContent: {
      label: 'Independence Day clothing/liveries/content',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
      tag: 'independence_day_2026',
    },
    gunVanHeavyRifle: {
      label: 'Heavy Rifle (Gun Van)',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-07-13T09:00:00Z',
    },
    gunVanRailgun: {
      label: 'Railgun (Gun Van)',
      percent: 30,
      requiresGTAPlus: true,
      validUntil: '2026-07-13T09:00:00Z',
    },
    vehicles30Jul16: {
      validFrom: '2026-07-16T09:00:00Z',
      label: '30% off: Hellion, Greenwood, Brawler, Nightshade, Futo GTX, Stryder, Taxi, FMJ, Neo',
      percent: 30,
      requiresGTAPlus: false,
      validUntil: '2026-07-23T09:00:00Z',
    },
    hswConversions: {
      validFrom: '2026-07-14T09:00:00Z',
      label: "Hao's Special Works conversions",
      percent: 50,
      requiresGTAPlus: true,
      validUntil: '2026-08-12T09:00:00Z',
    },
  },
  gtaPlus: {
    freeCar: 'Grotti Veleno GT (Attack livery)',
    freeCarValue: 0, // new July 2026 vehicle — list price unverified, do not guess
    freeCarLocation: 'The Vinewood Car Club',
    earlyAccess: '',
    earlyAccessDiscount: 0,
    monthlyCash: 500000,
    benefitsExpire: '2026-08-12T09:00:00Z', // GTA+ period Jul 14 - Aug 12
    monthlyBonuses: [
      // NOTE: this event week's GTA+ multipliers (5X G's Cache, 2X KnoWay Out, 2X Smuggler Sells)
      // live in `bonuses` above with gtaPlusOnly: true, so they render with the weekly set.
      {
        activity: 'hangar_discount',
        multiplier: 1,
        label: '60% off Hangars + mods (GTA+ Perk, stacks with event pricing)',
        expires: '2026-07-13T09:00:00Z',
      },
      {
        activity: 'mansion_discount',
        validFrom: '2026-07-14T09:00:00Z',
        multiplier: 1,
        label: 'Up to GTA$2,000,000 off Mansion properties (until Aug 5)',
        expires: '2026-08-05T09:00:00Z',
      },
      {
        activity: 'art_studio_discount',
        validFrom: '2026-07-14T09:00:00Z',
        multiplier: 1,
        label: 'GTA$1,000,000 off the Mansion Art Studio (needed for the Kortz Center Heist)',
        expires: '2026-08-12T09:00:00Z',
      },
      {
        activity: 'vehicle_discount_20',
        validFrom: '2026-07-14T09:00:00Z',
        multiplier: 1,
        label: '20% off select vehicles (Deluxo, Scramjet, LRC GT, E-Stride, Cartuccia GT, Itali RSX, LM87, Astrale, Revolter)',
        expires: '2026-08-12T09:00:00Z',
      },
    ],
  },
};

/**
 * Format an expiry date string from an ISO timestamp
 * @param {string} isoDate - ISO date string (e.g., '2026-02-12T10:00:00Z')
 * @returns {string} Formatted short date (e.g., 'Feb 12')
 */
export const formatExpiry = (isoDate) => {
  if (!isoDate) return 'Unknown';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

/**
 * Get a human-readable expiry label for a bonus or the weekly event
 * @param {string} isoDate - ISO date string
 * @param {number} [now] - Current timestamp (defaults to Date.now())
 * @returns {string} e.g., 'Expires Feb 12 (3 days left)'
 */
export const getExpiryLabel = (isoDate, now = Date.now()) => {
  if (!isoDate) return '';
  const expiryMs = new Date(isoDate).getTime();
  const hoursLeft = Math.ceil((expiryMs - now) / (1000 * 60 * 60));
  const daysLeft = Math.ceil(hoursLeft / 24);
  const dateStr = formatExpiry(isoDate);
  if (hoursLeft <= 0) return `Expired ${dateStr}`;
  if (hoursLeft < 48) return `Expires ${dateStr} (${hoursLeft}hrs left)`;
  return `Expires ${dateStr} (${daysLeft} days left)`;
};

// Helper to calculate days remaining
export const getDaysRemaining = () => {
  const now = new Date();
  const expires = new Date(WEEKLY_EVENTS.meta.validUntil);
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Helper to check if event is still active
export const isEventActive = () => {
  return new Date() < new Date(WEEKLY_EVENTS.meta.validUntil);
};



export const getWeeklyBonuses = (options: any = {}) => {
  const { hasGTAPlus = false, includeGTAPlus = false } = options;

  // Dynamically build from bonuses object for backward compatibility
  const regularBonuses = Object.entries(WEEKLY_EVENTS.bonuses)
    .filter(([, bonus]: any) => {
      if (!bonus.isActive) return false;
      if (bonus.validFrom && new Date(bonus.validFrom).getTime() > Date.now()) return false;
      if (bonus.validUntil && new Date(bonus.validUntil).getTime() < Date.now()) return false;
      return true;
    })
    .map(([, bonus]: any) => ({
      activity: bonus.label.replace(/^\d+(\.\d+)?X\s*/, ''), // Strip multiplier prefix if present
      multiplier: `${bonus.multiplier}X`,
      note: bonus.label,
      isGTAPlus: bonus.gtaPlusOnly || false,
    }));

  // Add GTA+ monthly bonuses if includeGTAPlus is true
  if (includeGTAPlus && WEEKLY_EVENTS.gtaPlus?.monthlyBonuses) {
    const gtaPlusBonuses = WEEKLY_EVENTS.gtaPlus.monthlyBonuses.map(bonus => ({
      activity: bonus.label.replace(/^\d+(\.\d+)?X\s*/, ''),
      multiplier: `${bonus.multiplier}X`,
      note: bonus.label,
      isGTAPlus: true,
      locked: !hasGTAPlus, // Add locked property for non-subscribers
    }));
    return [...regularBonuses, ...gtaPlusBonuses];
  }

  return regularBonuses;
};

// ---------------------------------------------------------------------------
// Staleness guard
// ---------------------------------------------------------------------------
// This file is hand-maintained ("update every Thursday"). If it stops being
// updated, the whole time-sensitive action plan silently serves stale advice
// with no signal. These helpers surface that. `now` is a parameter so they
// stay pure and testable; no module-load side effects.

export const WEEKLY_DATA_STALE_AFTER_DAYS = 10;

export const weeklyDataAgeDays = (now) => {
  const last = new Date(WEEKLY_EVENTS.meta?.lastUpdated ?? 0).getTime();
  return Math.floor((now.getTime() - last) / (1000 * 60 * 60 * 24));
};

export const isWeeklyDataStale = (now, thresholdDays = WEEKLY_DATA_STALE_AFTER_DAYS) =>
  weeklyDataAgeDays(now) > thresholdDays;

// Logs a console warning if the weekly data is stale. Wire into app startup
// (one call) to surface it; kept out of module load so imports stay pure.
export const warnIfWeeklyDataStale = (now = new Date()) => {
  if (!isWeeklyDataStale(now)) return false;
  console.warn(
    `[weeklyEvents] meta.lastUpdated (${WEEKLY_EVENTS.meta?.lastUpdated}) is more than ` +
      `${WEEKLY_DATA_STALE_AFTER_DAYS} days old -- weekly bonuses may be stale.`
  );
  return true;
};
