// src/utils/calculations/incomeComparison.ts
// Pure income-comparison math extracted from IncomeComparison.jsx.
// computeAutoShopRate is moved verbatim; CAYO_RATE was the inline cayoRate.
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';
import type { Income } from '../../types/branded';
import { asIncome } from '../../types/branded';

export const CAYO_RATE: Income = asIncome(466000);

export interface AutoShopRate {
  rate: Income;
  isActive: boolean;
  multiplier: number;
}

export const computeAutoShopRate = (): AutoShopRate => {
  const baseContractPayout = 300000;
  const contractsPerHour = 60 / 25; // ~2.4 contracts/hour
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const isActive = autoShopBonus?.isActive === true;
  const multiplier = isActive ? (autoShopBonus.multiplier || 2) : 1;
  return {
    rate: asIncome(baseContractPayout * contractsPerHour * multiplier),
    isActive,
    multiplier,
  };
};
