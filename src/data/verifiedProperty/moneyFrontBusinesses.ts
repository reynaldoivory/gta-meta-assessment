import type { Business } from '../../types/enterprise.types';

export const MONEY_FRONT_BUSINESSES: Business[] = [
  {
    id: 'car_wash',
    categoryId: 'moneyFront',
    name: 'Hands On Car Wash',
    description: 'Money laundering hub and safe income.',
    baseProfit: 8500,
    baseTime: 48,
    locations: [
      { id: 'car_wash_la_mesa', name: 'La Mesa', price: 1000000 },
      { id: 'car_wash_burton', name: 'Burton', price: 1000000 },
      { id: 'car_wash_strawberry', name: 'Strawberry (Historic Free Option)', price: 0, isRecommended: true },
    ],
    upgrades: [],
    notes: 'All locations functionally identical. Strawberry was free during Jan 8-14 2026 event.',
  },
  {
    id: 'smoke_on_the_water',
    categoryId: 'moneyFront',
    name: 'Smoke on the Water Dispensary',
    description: 'Boosts Weed Farm production and safe income.',
    baseProfit: 5000,
    baseTime: 48,
    locations: [
      { id: 'smoke_vinewood', name: 'Vinewood', price: 850000 },
      { id: 'smoke_rockford', name: 'Rockford Hills', price: 850000 },
      { id: 'smoke_delperro', name: 'Del Perro', price: 850000 },
    ],
    upgrades: [],
    synergyBonuses: [
      {
        requiredBusinessId: 'weed_farm',
        profitMultiplier: 1.2,
        description: '+20% Weed Farm output.',
      },
    ],
  },
  {
    id: 'higgins_helitours',
    categoryId: 'moneyFront',
    name: 'Higgins Helitours',
    description: 'Boosts hangar and cargo business output.',
    baseProfit: 5000,
    baseTime: 48,
    locations: [
      { id: 'helitours_lsia', name: 'LSIA', price: 900000 },
      { id: 'helitours_sandy', name: 'Sandy Shores', price: 900000 },
    ],
    upgrades: [],
  },
];
