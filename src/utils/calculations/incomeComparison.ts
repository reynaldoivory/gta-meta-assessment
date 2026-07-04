// src/utils/calculations/incomeComparison.ts
// Pure income-comparison math extracted from IncomeComparison.jsx.
// All rates now trace to modelConfig.js (no local constants).
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';
import { MODEL_CONFIG } from '../modelConfig.js';
import type { Income } from '../../types/branded';
import { asIncome } from '../../types/branded';

// Canonical solo Cayo $/hr (cooldown-honest). Single source: modelConfig.
export const CAYO_RATE: Income = asIncome(
  MODEL_CONFIG.income?.cayo?.solo?.effectiveHourlyRate ?? 433000
);

export interface AutoShopRate {
  rate: Income;
  isActive: boolean;
  multiplier: number;
}

export const computeAutoShopRate = (): AutoShopRate => {
  // Canonical Auto Shop $/hr from config (was a local 300000 * 60/25 formula).
  const baseRate = MODEL_CONFIG.income?.autoShop?.perHour ?? 1000000;
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const isActive = autoShopBonus?.isActive === true;
  const multiplier = isActive ? (autoShopBonus.multiplier || 2) : 1;
  return {
    rate: asIncome(baseRate * multiplier),
    isActive,
    multiplier,
  };
};
