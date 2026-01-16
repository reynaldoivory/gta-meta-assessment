// src/data/weeklyEvents.js
// Weekly event data - Update every Thursday after Rockstar's tunables update
// Last updated: 2026-01-16

export const CURRENT_WEEKLY_EVENTS = {
  meta: {
    lastUpdated: '2026-01-16T10:00:00Z',
    eventWeek: '2026-01-15 to 2026-01-21',
    expiresAt: '2026-01-21T10:00:00Z',
  },

  // Active multiplier boosts
  activeBoosts: [
    {
      activity: 'business_battles',
      eventId: 'business_battles',
      multiplier: 4,
      category: 'freemode',
      expires: '2026-01-21T10:00:00Z',
      description: 'Business Battles',
    },
    {
      activity: 'nightclub_goods',
      eventId: 'nightclub_goods',
      multiplier: 4,
      category: 'passive',
      expires: '2026-01-21T10:00:00Z',
      description: 'Nightclub Goods from Business Battles',
    },
    {
      activity: 'nightclub_safe',
      eventId: 'nightclub_safe',
      multiplier: 2,
      category: 'passive',
      expires: '2026-01-21T10:00:00Z',
      description: 'Nightclub Safe Income',
    },
    {
      activity: 'mansion_raid',
      eventId: 'mansion_raid',
      multiplier: 2,
      category: 'pvp',
      expires: '2026-01-21T10:00:00Z',
      description: 'Mansion Raid',
    },
  ],

  // Converted to object format for compatibility with existing code
  bonuses: {
    businessBattles: {
      isActive: true,
      multiplier: 4,
      label: 'Business Battles',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'freemode',
    },
    nightclubGoods: {
      isActive: true,
      multiplier: 4,
      label: 'Nightclub Goods from Business Battles',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'passive',
    },
    nightclubSafe: {
      isActive: true,
      multiplier: 2,
      label: 'Nightclub Safe Income',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'passive',
    },
    mansionRaid: {
      isActive: true,
      multiplier: 2,
      label: 'Mansion Raid',
      validUntil: '2026-01-21T10:00:00Z',
      category: 'pvp',
    },
  },

  // One-time bonuses (claim once per event period)
  oneTimeBonuses: [
    {
      id: 'mansion_raid_first_win_jan2026',
      activity: 'mansion_raid',
      reward: 200000,
      description: 'Win one Mansion Raid match',
      expires: '2026-01-18T10:00:00Z',
      deliveryTime: 'within 72 hours',
      requirements: 'Win a single Mansion Raid match',
    },
  ],

  // Property/upgrade discounts
  discounts: [
    {
      category: 'nightclub_properties',
      discount: 0.40,
      expires: '2026-01-21T10:00:00Z',
      description: '40% off Nightclub Properties',
    },
    {
      category: 'nightclub_upgrades',
      discount: 0.40,
      expires: '2026-01-21T10:00:00Z',
      description: '40% off Nightclub Upgrades',
    },
  ],

  // GTA+ exclusive benefits
  gtaPlus: {
    monthlyBonuses: [
      {
        activity: 'auto_shop_finales',
        eventId: 'auto_shop_finales',
        multiplier: 2,
        expires: '2026-02-04T10:00:00Z',
        description: 'Auto Shop Robbery Contract Finales',
      },
      {
        activity: 'paper_trail',
        eventId: 'paper_trail',
        multiplier: 2,
        expires: '2026-02-04T10:00:00Z',
        description: 'Operation Paper Trail',
      },
    ],
    monthlyCash: 500000,
    monthlyProperty: 'La Mesa Auto Shop',
    freeVehicle: 'Benefactor SM722',
  },
};
