// src/data/weeklyEvents.js
// Weekly event data - Update every Thursday after Rockstar's tunables update
// Last updated: 2026-02-05

export const CURRENT_WEEKLY_EVENTS = {
  meta: {
    lastUpdated: '2026-02-05T10:00:00Z',
    eventWeek: '2026-02-05 to 2026-02-12',
    expiresAt: '2026-02-12T10:00:00Z',
  },

  // Active multiplier boosts
  activeBoosts: [
    {
      activity: 'deadline_duet',
      eventId: 'deadline_duet',
      multiplier: 3,
      category: 'adversary',
      expires: '2026-02-12T10:00:00Z',
      description: 'Deadline Duet',
    },
    {
      activity: 'associate_salaries',
      eventId: 'associate_salaries',
      multiplier: 4,
      category: 'freemode',
      expires: '2026-02-18T10:00:00Z',
      description: 'Associate/Bodyguard Salaries',
    },
    {
      activity: 'odd_jobs',
      eventId: 'odd_jobs',
      multiplier: 2,
      category: 'freemode',
      expires: '2026-02-12T10:00:00Z',
      description: 'Odd Jobs',
    },
    {
      activity: 'meth_production',
      eventId: 'meth_production',
      multiplier: 2,
      category: 'passive',
      expires: '2026-02-12T10:00:00Z',
      description: 'Meth Production Speed',
    },
    {
      activity: 'bunker_series',
      eventId: 'bunker_series',
      multiplier: 2,
      category: 'adversary',
      expires: '2026-02-12T10:00:00Z',
      description: 'Bunker Series',
    },
    {
      activity: 'bunker_research',
      eventId: 'bunker_research',
      multiplier: 2,
      category: 'mission',
      expires: '2026-02-12T10:00:00Z',
      description: 'Bunker Research Missions',
    },
    {
      activity: 'salvage_yard',
      eventId: 'salvage_yard',
      multiplier: 2,
      category: 'mission',
      expires: '2026-02-12T10:00:00Z',
      description: 'Salvage Yard Robberies',
    },
  ],

  // Converted to object format for compatibility with existing code
  bonuses: {
    deadlineDuet: {
      isActive: true,
      multiplier: 3,
      label: '3X Deadline Duet',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'adversary',
    },
    associateSalaries: {
      isActive: true,
      multiplier: 4,
      label: '4X Associate/Bodyguard Salaries',
      validUntil: '2026-02-18T10:00:00Z',
      category: 'freemode',
    },
    oddJobs: {
      isActive: true,
      multiplier: 2,
      label: '2X Odd Jobs',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'freemode',
    },
    methProduction: {
      isActive: true,
      multiplier: 2,
      label: '2X Meth Production Speed',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'passive',
    },
    bunkerSeries: {
      isActive: true,
      multiplier: 2,
      label: '2X Bunker Series',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'adversary',
    },
    bunkerResearch: {
      isActive: true,
      multiplier: 2,
      label: '2X Bunker Research Missions',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'mission',
    },
    salvageYard: {
      isActive: true,
      multiplier: 2,
      label: '2X Salvage Yard Robberies',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'mission',
    },
  },

  // One-time bonuses (claim once per event period)
  oneTimeBonuses: [
    {
      id: 'deadline_duet_first_win_feb2026',
      activity: 'deadline_duet',
      reward: 150000,
      description: 'Win one Deadline Duet match',
      expires: '2026-02-12T10:00:00Z',
      deliveryTime: 'within 72 hours',
      requirements: 'Win a single Deadline Duet match',
    },
  ],

  // Property/upgrade discounts
  discounts: [
    {
      category: 'bunker_properties',
      discount: 0.30,
      expires: '2026-02-12T10:00:00Z',
      description: '30% off Bunker Properties',
    },
    {
      category: 'meth_lab_properties',
      discount: 0.40,
      expires: '2026-02-12T10:00:00Z',
      description: '40% off Meth Lab Properties',
    },
    {
      category: 'meth_lab_upgrades',
      discount: 0.40,
      expires: '2026-02-12T10:00:00Z',
      description: '40% off Meth Lab Upgrades',
    },
    {
      category: 'salvage_yard_properties',
      discount: 0.25,
      expires: '2026-02-12T10:00:00Z',
      description: '25% off Salvage Yard Properties',
    },
  ],

  // GTA+ exclusive benefits
  gtaPlus: {
    monthlyBonuses: [
      {
        activity: 'odd_jobs',
        eventId: 'odd_jobs',
        multiplier: 3,
        expires: '2026-03-05T10:00:00Z',
        description: 'Odd Jobs',
      },
      {
        activity: 'salvage_yard',
        eventId: 'salvage_yard',
        multiplier: 3,
        expires: '2026-03-05T10:00:00Z',
        description: 'Salvage Yard Robberies',
      },
    ],
    monthlyCash: 500000,
    freeVehicle: 'Dewbauchee Champion',
    freeVehicleValue: 1850000,
    earlyAccess: 'Grotti Itali Classic',
  },
};
