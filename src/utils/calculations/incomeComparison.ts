// src/utils/calculations/incomeComparison.ts
// Pure income-comparison math extracted from IncomeComparison.jsx.
// computeAutoShopRate is moved verbatim; CAYO_RATE was the inline cayoRate.
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';

export const CAYO_RATE = 466000;

export const computeAutoShopRate = () => {
  const baseContractPayout = 300000;
  const contractsPerHour = 60 / 25; // ~2.4 contracts/hour
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const isActive = autoShopBonus?.isActive === true;
  const multiplier = isActive ? (autoShopBonus.multiplier || 2) : 1;
  return {
    rate: baseContractPayout * contractsPerHour * multiplier,
    isActive,
    multiplier,
  };
};
