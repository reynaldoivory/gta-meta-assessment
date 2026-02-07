// src/config/weeklyEvents.js
// The "Source of Truth" for weekly events
// Update this file every Thursday when Rockstar announces new bonuses
// Last updated: Feb 5, 2026

export const WEEKLY_EVENTS = {
  meta: {
    lastUpdated: '2026-02-05',
    validFrom: '2026-02-05T10:00:00Z', // Thursday 4AM ET
    validUntil: '2026-02-12T10:00:00Z', // Next Thursday 4AM ET
    displayDate: 'Feb 5 - Feb 12',
  },
  bonuses: {
    // Priority 0: The "Meta" Event
    deadlineDuet: {
      isActive: true,
      multiplier: 3.0,
      label: '3X Deadline Duet',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'adversary',
    },
    associateSalaries: {
      isActive: true,
      multiplier: 4.0,
      label: '4X Associate/Bodyguard Salaries',
      validUntil: '2026-02-18T10:00:00Z',
      category: 'freemode',
    },
    oddJobs: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Odd Jobs',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'freemode',
    },
    methProduction: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Meth Production Speed',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'passive',
    },
    bunkerSeries: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Bunker Series',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'adversary',
    },
    bunkerResearch: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Bunker Research Missions',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'mission',
    },
    salvageYard: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Salvage Yard Robberies',
      validUntil: '2026-02-12T10:00:00Z',
      category: 'mission',
    },
  },
  oneTimeBonuses: [
    {
      id: 'deadline_duet_first_win',
      reward: 150000,
      description: 'Win one Deadline Duet match',
      expires: '2026-02-12T10:00:00Z',
      deliveryTime: 'within 72 hours',
    },
  ],
  discounts: {
    bunkerProperties: {
      percent: 30,
      requiresGTAPlus: false,
      validUntil: '2026-02-12T10:00:00Z',
    },
    methLabProperties: {
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-02-12T10:00:00Z',
    },
    methLabUpgrades: {
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-02-12T10:00:00Z',
    },
    salvageYardProperties: {
      percent: 25,
      requiresGTAPlus: false,
      validUntil: '2026-02-12T10:00:00Z',
    },
  },
  gtaPlus: {
    freeCar: 'Dewbauchee Champion',
    freeCarValue: 1850000,
    freeCarLocation: 'The Vinewood Car Club',
    earlyAccess: 'Grotti Itali Classic',
    monthlyCash: 500000,
    monthlyBonuses: [
      {
        activity: 'odd_jobs',
        multiplier: 3,
        expires: '2026-03-05T10:00:00Z',
      },
      {
        activity: 'salvage_yard',
        multiplier: 3,
        expires: '2026-03-05T10:00:00Z',
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
