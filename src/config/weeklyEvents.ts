// src/config/weeklyEvents.js
// The "Source of Truth" for weekly events
// Update this file every Thursday when Rockstar announces new bonuses
// Last updated: Apr 17, 2026
// Source: rockstargames.com/newswire + fandomwire/rockstarintel weekly recaps

export const WEEKLY_EVENTS: any = {
  meta: {
    lastUpdated: '2026-04-17',
    validFrom: '2026-04-16T09:00:00Z', // Thursday 5AM EDT
    validUntil: '2026-04-23T09:00:00Z', // Next Thursday 5AM EDT
    displayDate: 'Apr 16 - Apr 23',
    eventTag: 'ld_organics_420',
  },
  bonuses: {
    // "LD Organics Presents: The 420 Event" — two-week cannabis-themed event
    stonerSurvival: {
      isActive: true,
      multiplier: 4,
      label: '4X Stoner Survival',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'adversary',
      tag: 'ld_organics_420',
      note: 'New adversary mode introduced this week.',
    },
    huntingPackGetLamar: {
      isActive: true,
      multiplier: 4,
      label: '4X Hunting Pack (Get Lamar)',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'adversary',
      tag: 'ld_organics_420',
      requiresMultiplayer: true,
      soloNote: 'Adversary mode — requires other players.',
    },
    pizzaDelivery: {
      isActive: true,
      multiplier: 4,
      label: '4X Pizza Delivery',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'freemode',
      soloFriendly: true,
      estimatedHourlyRate: 180000,
      soloTip: 'Pizza Delivery jobs spawn from street payphones — pair with other freemode activities.',
    },
    firstLastDose: {
      isActive: true,
      multiplier: 3,
      label: '3X First Dose & Last Dose Missions',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'mission',
      tag: 'ld_organics_420',
      soloFriendly: true,
      estimatedHourlyRate: 400000,
      soloTip: 'Last Dose finale pays best. Chain doses back-to-back for sustained hourly.',
    },
    shortTrips: {
      isActive: true,
      multiplier: 2,
      label: '2X Short Trips',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'mission',
      soloFriendly: true,
      soloTip: 'Franklin & Lamar Short Trips from Record A Studios — quick $20-40k each.',
    },
    weedSellMissions: {
      isActive: true,
      multiplier: 2,
      label: '2X Weed Sell Missions (incl. Nightclub Organic Produce)',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'business',
      tag: 'ld_organics_420',
      soloFriendly: true,
      highValue: true,
      soloTip: 'Upgrade Weed MC to full stock then sell solo in Invite Only. Doubles Nightclub Organic Produce warehouse sells too.',
    },
    communityCombatSeries: {
      isActive: true,
      multiplier: 2,
      label: '2X Community Combat Series',
      validUntil: '2026-04-23T09:00:00Z',
      category: 'race',
    },
  },
  specialEvents: {
    ldOrganics420: {
      label: 'LD Organics Presents: The 420 Event',
      validUntil: '2026-04-30T09:00:00Z',
      rewards: [
        'Black LD Organics Tee (login reward)',
        'Multicolor 420 Festival Outfit (Propaganda email subscribers, within 72hr of playing Apr 16-29)',
        'Sasquatch Outfit (complete Community Combat Series challenge)',
        'Returning Peyote Plants',
        '2X Weed Sell Missions',
      ],
    },
  },
  oneTimeBonuses: [
    {
      id: 'community_combat_sasquatch',
      reward: 0,
      description: 'Complete the Community Combat Series challenge → Sasquatch Outfit',
      expires: '2026-04-23T09:00:00Z',
      deliveryTime: 'immediate',
    },
  ],
  discounts: {
    weedFarms: {
      label: 'Weed Farms',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
      tag: 'ld_organics_420',
    },
    weedFarmUpgrades: {
      label: 'Weed Farm Upgrades',
      percent: 40,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
      tag: 'ld_organics_420',
    },
    festivalBus: {
      label: 'Vapid Festival Bus',
      percent: 50,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
      tag: 'ld_organics_420',
    },
    greenTireSmoke: {
      label: 'Green Tire Smoke',
      percent: 50,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
      tag: 'ld_organics_420',
    },
    greenSpaceHorrorSuit: {
      label: 'Green Space Horror Suit',
      percent: 50,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
      tag: 'ld_organics_420',
    },
    vehicles30: {
      label: 'Select Vehicles (Baller ST-D, Baller ST, Walton L35, Neon, Tug, Hakuchou Drag, Caracara 4x4, Ultralight, Nightshade)',
      percent: 30,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
    },
    gunVanRailgun: {
      label: 'Railgun (Gun Van)',
      percent: 30,
      requiresGTAPlus: false,
      validUntil: '2026-04-23T09:00:00Z',
    },
    gunVanMilitaryRifle: {
      label: 'Military Rifle (Gun Van)',
      percent: 40,
      requiresGTAPlus: true,
      validUntil: '2026-04-23T09:00:00Z',
    },
    gunVanBodyArmor: {
      label: 'Body Armor (Gun Van)',
      percent: 70,
      requiresGTAPlus: true,
      validUntil: '2026-04-23T09:00:00Z',
    },
  },
  gtaPlus: {
    freeCar: 'Bravado Buffalo STX Pursuit',
    freeCarValue: 5370000,
    freeCarLocation: 'The Vinewood Car Club',
    earlyAccess: 'Bravado Buffalo STX Pursuit (general release Apr 8)',
    earlyAccessDiscount: 0,
    monthlyCash: 500000,
    benefitsExpire: '2026-05-06T09:00:00Z',
    monthlyBonuses: [
      {
        activity: 'bounty_hunting',
        multiplier: 2,
        label: '2X Bounty Hunting (GTA+ Perk)',
        expires: '2026-05-06T09:00:00Z',
        soloFriendly: true,
        estimatedHourlyRate: 300000,
        soloTip: 'Bail Office bounties + Most Wanted Targets — chain back-to-back for ~$300k/hr.',
      },
      {
        activity: 'dispatch_work',
        multiplier: 1.5,
        label: '1.5X Dispatch Work (GTA+ Perk)',
        expires: '2026-05-06T09:00:00Z',
        soloFriendly: true,
      },
      {
        activity: 'wildlife_photography',
        multiplier: 2,
        label: '2X Wildlife Photography (GTA+ Perk)',
        expires: '2026-05-06T09:00:00Z',
        soloFriendly: true,
      },
      {
        activity: 'gun_van_stun_gun',
        multiplier: 1,
        label: 'Free Stun Gun at Gun Van (GTA+ Perk)',
        expires: '2026-04-23T09:00:00Z',
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
