import type { Business } from '../../types/enterprise.types';

export const SPECIALIZED_BUSINESSES: Business[] = [
  {
    id: 'vehicle_warehouse',
    categoryId: 'specialized',
    name: 'Vehicle Warehouse',
    description: 'Import and Export. Best with top range sourcing method.',
    baseProfit: 80000,
    baseTime: 0,
    locations: [
      { id: 'veh_wh_el_burro', name: 'El Burro Heights', price: 2380000 },
      { id: 'veh_wh_la_mesa', name: 'La Mesa', price: 2495000 },
      { id: 'veh_wh_elysian', name: 'Elysian Island', price: 2570000 },
      { id: 'veh_wh_murrieta', name: 'Murrieta Heights', price: 2640000 },
      { id: 'veh_wh_davis', name: 'Davis', price: 2700000 },
      { id: 'veh_wh_la_puerta', name: 'La Puerta', price: 2745000 },
    ],
    upgrades: [],
  },
  {
    id: 'cargo_warehouse_large',
    categoryId: 'specialized',
    name: 'Large Special Cargo Warehouse',
    description: '111 crate capacity with high full sale value.',
    baseProfit: 2200000,
    baseTime: 0,
    locations: [
      { id: 'cargo_cypress', name: 'Cypress Warehouses', price: 2300000 },
      { id: 'cargo_west_vinewood', name: 'West Vinewood', price: 2500000 },
      { id: 'cargo_bilgeco', name: 'Bilgeco', price: 2600000 },
      { id: 'cargo_logistics', name: 'Logistics Depot', price: 2700000 },
      { id: 'cargo_xero', name: 'Xero Gas Factory', price: 2800000 },
      { id: 'cargo_darnell', name: 'Darnell Bros', price: 3000000 },
    ],
    upgrades: [],
  },
  {
    id: 'salvage_yard',
    categoryId: 'specialized',
    name: 'Salvage Yard',
    description: 'Weekly robberies and tow truck passive income.',
    baseProfit: 40000,
    baseTime: 48,
    locations: [
      { id: 'salvage_murrieta', name: 'Murrieta Heights', price: 2380000 },
      { id: 'salvage_la_puerta', name: 'La Puerta', price: 2420000 },
      { id: 'salvage_cypress', name: 'Cypress Flats', price: 2560000 },
    ],
    upgrades: [],
  },
];
