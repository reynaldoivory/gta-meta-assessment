import type { Business } from '../../types/enterprise.types';

export const VEHICLE_BUSINESSES: Business[] = [
  {
    id: 'kosatka',
    categoryId: 'vehicle',
    name: 'Kosatka Submarine',
    description: 'Access to Cayo Perico Heist.',
    baseProfit: 0,
    baseTime: 0,
    locations: [
      { id: 'kosatka_base', name: 'Base Vehicle', price: 2200000, isRecommended: true },
    ],
    upgrades: [
      { id: 'kosatka_sparrow', name: 'Sparrow Helicopter', cost: 1815000, required: true },
      { id: 'kosatka_missile_bay', name: 'Missile Bay', cost: 500000 },
      { id: 'kosatka_sonar', name: 'Sonar Station', cost: 500000 },
      { id: 'kosatka_guided', name: 'Guided Missiles', cost: 250000 },
    ],
    recommendedLocationId: 'kosatka_base',
  },
   {
     id: 'terrorbyte',
     categoryId: 'vehicle',
     name: 'Terrorbyte',
     description: 'Enables Oppressor Mk II upgrades and client jobs.',
     baseProfit: 0,
     baseTime: 0,
     locations: [
       { id: 'terrorbyte_base', name: 'Base Vehicle', price: 1375000, isRecommended: true },
     ],
     upgrades: [
       { id: 'terrorbyte_workshop', name: 'Specialized Workshop', cost: 495000, required: true },
       { id: 'terrorbyte_drone', name: 'Drone Station', cost: 860000 },
    ],
    recommendedLocationId: 'terrorbyte_base',
  },
   {
     id: 'oppressor_mk2',
     categoryId: 'vehicle',
     name: 'Oppressor Mk II',
     description: 'Grinding efficiency. Requires Terrorbyte workshop for upgrades.',
     baseProfit: 0,
     baseTime: 0,
     locations: [
       { id: 'oppressor_base', name: 'Base Vehicle', price: 8000000, isRecommended: true },
     ],
     upgrades: [
       { id: 'oppressor_armor', name: 'Armor Upgrade (100%)', cost: 50000 },
       { id: 'oppressor_countermeasures', name: 'Countermeasures (Flare)', cost: 110000 },
       { id: 'oppressor_engine', name: 'Engine/Handling Upgrades', cost: 150000 },
    ],
    recommendedLocationId: 'oppressor_base',
  },
   {
     id: 'armored_kuruma',
     categoryId: 'vehicle',
     name: 'Armored Kuruma',
     description: 'Mission essential with strong protection.',
     baseProfit: 0,
     baseTime: 0,
     locations: [
       { id: 'kuruma_base', name: 'Base Vehicle', price: 698000, isRecommended: true },
     ],
     upgrades: [
       { id: 'kuruma_performance', name: 'Performance Upgrades', cost: 258150 },
    ],
    recommendedLocationId: 'kuruma_base',
  },
   {
     id: 'ocelot_virtue',
     categoryId: 'vehicle',
     name: 'Ocelot Virtue',
     description: 'Imani Tech compatible. Free from Last Dose missions.',
     baseProfit: 0,
     baseTime: 0,
     locations: [
       { id: 'virtue_base', name: 'Base Vehicle', price: 0, isRecommended: true },
     ],
     upgrades: [
       { id: 'virtue_jammer', name: 'Missile Lock-On Jammer', cost: 240000 },
       { id: 'virtue_remote', name: 'Remote Control Unit', cost: 160000 },
    ],
    recommendedLocationId: 'virtue_base',
  },
 ];
