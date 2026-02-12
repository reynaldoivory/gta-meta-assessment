// src/config/weeklyEvents.js
// The "Source of Truth" for weekly events
// Update this file every Thursday when Rockstar announces new bonuses
// Last updated: Feb 12, 2026
// Source: r/gtaonline weekly thread by PapaXan + rockstargames.com/gta-plus

export const WEEKLY_EVENTS = {
  meta: {
    lastUpdated: '2026-02-12',
    validFrom: '2026-02-12T10:00:00Z', // Thursday 5AM ET
    validUntil: '2026-02-19T10:00:00Z', // Next Thursday 5AM ET
    displayDate: 'Feb 12 - Feb 19',
  },
  bonuses: {
    // Valentine's Event (through Feb 18)
    deadlineDuet: {
      isActive: true,
      multiplier: 3,
      label: '3X Deadline Duet',
      validUntil: '2026-02-18T10:00:00Z',
      category: 'adversary',
      tag: 'valentines',
    },
    associateSalaries: {
      isActive: true,
      multiplier: 4,
      label: '4X Associate/Bodyguard Salaries',
      validUntil: '2026-02-18T10:00:00Z',
      category: 'freemode',
      tag: 'valentines',
      requiresMultiplayer: true,
      soloNote: 'Requires being hired as Associate/Bodyguard by another CEO — not available solo in Invite Only.',
    },
    ceoVipWork: {
      isActive: true,
      multiplier: 4,
      label: '4X CEO/VIP Work',
      validUntil: '2026-02-19T10:00:00Z',
      category: 'freemode',
      soloFriendly: true,
      estimatedHourlyRate: 700000,
      soloTip: 'Loop Headhunter + Sightseer in Invite Only with Sparrow for ~$600-800k/hr.',
    },
    lunarNewYearStuntRaces: {
      isActive: true,
      multiplier: 3,
      label: '3X Lunar New Year Stunt Races',
      validUntil: '2026-03-04T10:00:00Z',
      category: 'race',
      tag: 'lunar_new_year',
      gtaPlusMultiplier: 6,
    },
    communitySeries: {
      isActive: true,
      multiplier: 2,
      label: '2X Community Series',
      validUntil: '2026-02-19T10:00:00Z',
      category: 'race',
    },
    cayoPericoPinkDiamond: {
      isActive: true,
      multiplier: 1,
      label: 'Boosted Pink Diamond Chance (~50%)',
      validUntil: '2026-02-19T10:00:00Z',
      category: 'heist',
      note: 'Cayo Perico Heist primary target',
      soloFriendly: true,
      highValue: true,
      estimatedHourlyRate: 1300000,
      soloTip: 'Pink Diamond ($1.3M) makes even slow Cayo runs highly profitable. Run Cayo this week.',
    },
  },
  specialEvents: {
    valentines: {
      label: "Valentine's Day Event",
      validUntil: '2026-02-18T10:00:00Z',
      rewards: [
        'Valentines Onesie (login reward)',
        '50% off Valentine\'s Clothing',
        '50% off Nagasaki Shotaro',
        'Free Champagne in all Nightclubs',
      ],
    },
    lunarNewYear: {
      label: 'Lunar New Year: Year of the Fire Horse',
      validUntil: '2026-03-04T10:00:00Z',
      rewards: [
        'Red Year of the Horse Tee (login reward)',
        'Free Horse Masks & Tattoos',
        'Yuanbao Collectibles Return (36 total)',
        'New Stunt Race: The Senora Derby',
      ],
    },
  },
  oneTimeBonuses: [
    {
      id: 'valentines_blazer_challenge',
      reward: 100000,
      description: 'Earn $100k as Associate/Bodyguard → Valentines Blazer + $100k',
      expires: '2026-02-19T10:00:00Z',
      deliveryTime: 'immediate',
    },
  ],
  discounts: {
    executiveOffices: {
      label: 'Executive Offices',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-02-19T10:00:00Z',
    },
    executiveOfficeUpgrades: {
      label: 'Executive Office Upgrades',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-02-19T10:00:00Z',
    },
    valentinesClothing: {
      label: "Valentine's Clothing",
      percent: 50,
      requiresGTAPlus: false,
      validUntil: '2026-02-18T10:00:00Z',
      tag: 'valentines',
    },
    nagasakiShotaro: {
      label: 'Nagasaki Shotaro',
      percent: 50,
      requiresGTAPlus: false,
      validUntil: '2026-02-18T10:00:00Z',
      tag: 'valentines',
    },
    vehicles30: {
      label: 'Select Vehicles (Hotring Everon, Tulip M-100, Vagner, Tahoma Coupe, Neon, Raiden, Velum 5-Seat, Yosemite 1500, Torero, Cheetah Classic)',
      percent: 30,
      requiresGTAPlus: false,
      validUntil: '2026-02-19T10:00:00Z',
    },
    gunVanGusenberg: {
      label: 'Gusenberg Sweeper (Gun Van)',
      percent: 100,
      requiresGTAPlus: false,
      validUntil: '2026-02-19T10:00:00Z',
    },
    gunVanTacticalSMG: {
      label: 'Tactical SMG (Gun Van)',
      percent: 30,
      requiresGTAPlus: true,
      validUntil: '2026-02-19T10:00:00Z',
    },
  },
  gtaPlus: {
    freeCar: 'Dewbauchee Champion',
    freeCarValue: 1850000,
    freeCarLocation: 'The Vinewood Car Club',
    earlyAccess: 'Grotti Itali Classic',
    earlyAccessDiscount: 20,
    monthlyCash: 500000,
    benefitsExpire: '2026-03-04T10:00:00Z',
    monthlyBonuses: [
      {
        activity: 'lunar_stunt_races',
        multiplier: 6,
        label: '6X Lunar New Year Stunt Races (vs 3X)',
        expires: '2026-03-04T10:00:00Z',
      },
      {
        activity: 'security_contracts',
        multiplier: 2,
        label: '2X Security Contracts (GTA+ Perk)',
        expires: '2026-03-04T10:00:00Z',
        soloFriendly: true,
        estimatedHourlyRate: 280000,
        soloTip: 'Run Specialist+ difficulty contracts from Agency during Cayo cooldown (~$100-140k each).',
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
  const diff = expires - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Helper to check if event is still active
export const isEventActive = () => {
  return new Date() < new Date(WEEKLY_EVENTS.meta.validUntil);
};

// Legacy support for old structure
export const isEventStale = () => {
  return new Date() > new Date(WEEKLY_EVENTS.meta.validUntil);
};

// Helper function for expiry checks
export const getEventExpiry = (eventKey, hasGTAPlus = false) => {
  const event = WEEKLY_EVENTS.bonuses[eventKey];
  if (!event) return null;

  // GTA+ monthly bonuses may have a longer expiry
  if (hasGTAPlus) {
    const monthlyBonus = WEEKLY_EVENTS.gtaPlus?.monthlyBonuses?.find(
      b => b.activity === eventKey || event.label?.toLowerCase().includes(b.activity.replace('_', ' '))
    );
    if (monthlyBonus?.expires) return monthlyBonus.expires;
  }

  return event.validUntil;
};

export const getWeeklyBonuses = () => {
  // Dynamically build from bonuses object for backward compatibility
  return Object.entries(WEEKLY_EVENTS.bonuses)
    .filter(([, bonus]) => bonus.isActive)
    .map(([key, bonus]) => ({
      activity: bonus.label.replace(/^\d+(\.\d+)?X\s*/, ''), // Strip multiplier prefix if present
      multiplier: `${bonus.multiplier}X`,
      note: bonus.label,
      isGTAPlus: bonus.gtaPlusOnly || false,
    }));
};
