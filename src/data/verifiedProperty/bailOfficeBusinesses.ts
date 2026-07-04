import type { Business } from '../../types/enterprise.types';

// Bottom Dollar Bounties (2023). Prices verified against gtabase.com
// 2026-07-04. Income is mission-based (bounty captures), not a passive
// stock-sell cycle like Bunker/Nightclub/MC businesses -- baseProfit/baseTime
// approximate a single regular bounty (~$35k-$40k, ~48min cooldown between
// bounties), not an exact passive-hourly figure. Most Wanted bounties
// (~$120k+, once daily) and passive Agent safe deposits ($5k-$10k per agent
// per 48min, $100k safe cap once the Agents upgrade is bought) are real but
// not modeled here. A "Style" upgrade tier also exists (Criminal Patterns
// +$125k, Courtroom Teak +$145k, Penal Vintage free) and is intentionally not
// included below -- flag if it should be added.
export const BAIL_OFFICE_BUSINESSES: Business[] = [
  {
    id: 'bail_office',
    categoryId: 'bailOffice',
    name: 'Bail Office',
    description: 'Bounty hunting business. Income comes from bounty captures and Agent deposits, not a stock-sell cycle.',
    baseProfit: 37500,
    baseTime: 48,
    locations: [
      { id: 'bail_paleto', name: 'Paleto Bay', price: 1650000 },
      { id: 'bail_davis', name: 'Davis', price: 2000000, isRecommended: true },
      { id: 'bail_del_perro', name: 'Del Perro', price: 2350000 },
      { id: 'bail_mission_row', name: 'Mission Row', price: 2390000 },
      { id: 'bail_downtown_vinewood', name: 'Downtown Vinewood', price: 2620000 },
    ],
    upgrades: [
      { id: 'bail_agent_1', name: 'Bail Enforcement Agent 1', cost: 750000 },
      { id: 'bail_agent_2', name: 'Bail Enforcement Agent 2', cost: 750000 },
      { id: 'bail_quarters', name: 'Personal Quarters', cost: 295000 },
      { id: 'bail_gun_locker', name: 'Gun Locker', cost: 175000 },
      { id: 'bail_armor_plating', name: 'Armor Plating', cost: 125000 },
    ],
    recommendedLocationId: 'bail_davis',
    notes: 'Financial Workbook currently flags this as a low-priority "avoid" asset (see src/utils/financialWorkbookData.ts Section G) -- adding it to the catalog does not change that guidance.',
  },
];
