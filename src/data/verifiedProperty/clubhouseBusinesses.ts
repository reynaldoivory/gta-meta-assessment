import type { Business } from '../../types/enterprise.types';

export const CLUBHOUSE_BUSINESSES: Business[] = [
  {
    id: 'clubhouse',
    categoryId: 'clubhouse',
    name: 'Motorcycle Clubhouse',
    description: 'Required for MC businesses. All locations functionally identical.',
    baseProfit: 0,
    baseTime: 0,
    locations: [
      { id: 'clubhouse_great_chaparral', name: 'Great Chaparral', price: 200000, isRecommended: true },
      { id: 'clubhouse_paleto', name: 'Paleto Bay', price: 235000 },
      { id: 'clubhouse_grapeseed', name: 'Grapeseed', price: 265000 },
      { id: 'clubhouse_harmony', name: 'Harmony', price: 285000 },
      { id: 'clubhouse_sandy', name: 'Sandy Shores', price: 315000 },
      { id: 'clubhouse_senora', name: 'Grand Senora Desert', price: 345000 },
      { id: 'clubhouse_la_mesa', name: 'La Mesa', price: 375000 },
      { id: 'clubhouse_vespucci', name: 'Vespucci', price: 395000 },
      { id: 'clubhouse_hawick', name: 'Hawick', price: 425000 },
      { id: 'clubhouse_downtown', name: 'Downtown Vinewood', price: 455000 },
      { id: 'clubhouse_pillbox', name: 'Pillbox Hill', price: 465000 },
      { id: 'clubhouse_alta', name: 'Alta', price: 475000 },
      { id: 'clubhouse_burton', name: 'Burton', price: 485000 },
      { id: 'clubhouse_rockford', name: 'Rockford Hills', price: 495000 },
    ],
    upgrades: [
      { id: 'clubhouse_customization', name: 'Customization Options', cost: 0 },
    ],
    recommendedLocationId: 'clubhouse_great_chaparral',
  },
];
