// src/config/weeklyEvents.js
// The "Source of Truth" for weekly events
// Update this file every Thursday when Rockstar announces new bonuses

export const WEEKLY_EVENTS = {
  meta: {
    lastUpdated: '2026-01-16',
    validFrom: '2026-01-15T10:00:00Z', // Thursday 4AM ET
    validUntil: '2026-01-21T10:00:00Z', // Next Thursday 4AM ET
    displayDate: 'Jan 15 - Jan 21',
  },
  bonuses: {
    // Priority 0: The "Meta" Event
    businessBattles: {
      isActive: true,
      multiplier: 4.0,
      label: '4X Business Battles',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'freemode',
    },
    nightclubGoods: {
      isActive: true,
      multiplier: 4.0,
      label: '4X Nightclub Goods',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'passive',
    },
    nightclubSafe: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Nightclub Safe Income',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'passive',
    },
    mansionRaid: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Mansion Raid',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'pvp',
    },
    autoShop: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Auto Shop Contracts',
      expiresLabel: 'Feb 4 (GTA+ Monthly)',
      gtaPlusValidUntil: '2026-02-04T10:00:00Z',
      validUntil: '2026-01-21T10:00:00Z',
      gtaPlusOnly: true, // GTA+ only
    },
    paperTrail: {
      isActive: true,
      label: 'Operation Paper Trail',
      multiplier: '2X (GTA+)',
      baseMultiplier: 2.0,
      gtaPlusMultiplier: 2.0,
      isRpEvent: true, // Tag for Rank bottlenecks
      gtaPlusValidUntil: '2026-02-04T10:00:00Z',
      validUntil: '2026-01-21T10:00:00Z',
      gtaPlusOnly: true, // GTA+ only
    },
  },
  oneTimeBonuses: [
    {
      id: 'mansion_raid_first_win',
      reward: 200000,
      description: 'Win one Mansion Raid match',
      expires: '2026-01-18T10:00:00Z',
      deliveryTime: 'within 72 hours',
    },
  ],
  discounts: {
    nightclubProperties: {
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-01-21T10:00:00Z',
    },
    nightclubUpgrades: {
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-01-21T10:00:00Z',
    },
  },
  gtaPlus: {
    freeCar: 'Benefactor SM722',
    freeCarLocation: 'The Vinewood Car Club',
    monthlyCash: 500000,
    monthlyBonuses: [
      {
        activity: 'auto_shop_finales',
        multiplier: 2,
        expires: '2026-02-04T10:00:00Z',
      },
      {
        activity: 'paper_trail',
        multiplier: 2,
        expires: '2026-02-04T10:00:00Z',
      },
    ],
  },
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
  
  // Auto Shop has different expiry for GTA+ members
  if (eventKey === 'autoShop' && hasGTAPlus && event.gtaPlusValidUntil) {
    return event.gtaPlusValidUntil;
  }
  
  return event.validUntil;
};

export const getWeeklyBonuses = () => {
  // Convert new structure to old array format for backward compatibility
  return [
    {
      activity: 'Business Battles',
      multiplier: `${WEEKLY_EVENTS.bonuses.businessBattles.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.businessBattles.label,
      isGTAPlus: false,
    },
    {
      activity: 'Nightclub Goods',
      multiplier: `${WEEKLY_EVENTS.bonuses.nightclubGoods.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.nightclubGoods.label,
      isGTAPlus: false,
    },
    {
      activity: 'Nightclub Safe Income',
      multiplier: `${WEEKLY_EVENTS.bonuses.nightclubSafe.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.nightclubSafe.label,
      isGTAPlus: false,
    },
    {
      activity: 'Mansion Raid',
      multiplier: `${WEEKLY_EVENTS.bonuses.mansionRaid.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.mansionRaid.label,
      isGTAPlus: false,
    },
    {
      activity: 'Auto Shop Contracts',
      multiplier: `${WEEKLY_EVENTS.bonuses.autoShop.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.autoShop.label,
      isGTAPlus: true, // GTA+ only
    },
    {
      activity: 'Operation Paper Trail',
      multiplier: WEEKLY_EVENTS.bonuses.paperTrail.multiplier,
      note: WEEKLY_EVENTS.bonuses.paperTrail.label,
      isGTAPlus: true, // GTA+ only
    },
  ];
};
