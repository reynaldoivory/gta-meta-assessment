import { MC_BUSINESSES } from './mcBusinesses';
import { MONEY_FRONT_BUSINESSES } from './moneyFrontBusinesses';
import { CORE_BUSINESSES } from './coreBusinesses';
import { SPECIALIZED_BUSINESSES } from './specializedBusinesses';
import { CLUBHOUSE_BUSINESSES } from './clubhouseBusinesses';
import { VEHICLE_BUSINESSES } from './vehicleBusinesses';
import { BAIL_OFFICE_BUSINESSES } from './bailOfficeBusinesses';

export const BUSINESSES = [
  ...MC_BUSINESSES,
  ...MONEY_FRONT_BUSINESSES,
  ...CORE_BUSINESSES,
  ...SPECIALIZED_BUSINESSES,
  ...CLUBHOUSE_BUSINESSES,
  ...VEHICLE_BUSINESSES,
  ...BAIL_OFFICE_BUSINESSES,
];

export { BUSINESS_CATEGORIES } from './businessCategories';
