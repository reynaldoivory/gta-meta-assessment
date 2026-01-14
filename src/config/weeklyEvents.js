// src/config/weeklyEvents.js
// The "Source of Truth" for weekly events
// Update this file every Thursday when Rockstar announces new bonuses

export const WEEKLY_EVENTS = {
  meta: {
    lastUpdated: '2026-01-10',
    validFrom: '2026-01-08T09:00:00Z', // Thursday 4AM ET
    validUntil: '2026-01-15T09:00:00Z', // Next Thursday 4AM ET
    displayDate: 'Jan 8 - Jan 14',
  },
  bonuses: {
    // Priority 0: The "Meta" Event
    autoShop: {
      isActive: true,
      multiplier: 2.0,
      label: '2X Auto Shop Contracts',
      expiresLabel: 'Feb 4 (GTA+ Monthly) / Jan 15 (Everyone else)',
      gtaPlusValidUntil: '2026-02-05T09:00:00Z', // ✅ CORRECTED
      validUntil: '2026-01-15T09:00:00Z',
      gtaPlusOnly: false, // Weekly 2X for everyone, extends to Feb 4 for GTA+
    },
    paperTrail: {
      isActive: true,
      label: 'Operation Paper Trail',
      multiplier: '2X (4X for GTA+)',
      baseMultiplier: 2.0,
      gtaPlusMultiplier: 4.0,
      isRpEvent: true, // Tag for Rank bottlenecks
      validUntil: '2026-01-15T09:00:00Z',
    },
    carWash: {
      isActive: true,
      isFree: true,
      label: 'FREE Hands On Car Wash',
      normalPrice: 1400000,
      validUntil: '2026-01-15T09:00:00Z',
      urgent: true,
    },
    moneyFronts: { multiplier: 3, label: "3X GTA$ Legal Money Fronts" }
  },
  discounts: {
    autoShop: {
      percent: 50,
      requiresGTAPlus: true,
      priceEstimate: 850000 // Strawberry location
    }
  },
  gtaPlus: {
    freeCar: "Pfister Astrale",
    freeCarLocation: "The Vinewood Car Club"
  }
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
      activity: 'Auto Shop Robbery Contracts',
      multiplier: `${WEEKLY_EVENTS.bonuses.autoShop.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.autoShop.label,
      isGTAPlus: false,
    },
    {
      activity: 'Operation Paper Trail',
      multiplier: WEEKLY_EVENTS.bonuses.paperTrail.multiplier,
      note: WEEKLY_EVENTS.bonuses.paperTrail.label,
      isGTAPlus: false, // Both GTA+ and non-GTA+ can access, different multipliers
    },
    {
      activity: 'Legal Money Fronts',
      multiplier: `${WEEKLY_EVENTS.bonuses.moneyFronts.multiplier}X`,
      note: WEEKLY_EVENTS.bonuses.moneyFronts.label,
      isGTAPlus: false,
    },
  ];
};
