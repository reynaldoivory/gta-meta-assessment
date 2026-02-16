// src/utils/bottleneckUrgent.ts
// Tier 0: Urgent expiring event detection (free claims, time-limited offers).

import type { Bottleneck, DetectionParams, DetectionFormData } from './bottleneckTypes';
import { WEEKLY_EVENTS } from '../config/weeklyEvents.js';

// ============================================
// Helpers
// ============================================

/** Check for free car wash claim opportunity. */
const buildFreeCarWashBottleneck = (
  formData: DetectionFormData,
  now: number,
): Bottleneck | null => {
  if (formData.hasCarWash) return null;

  const carWashBonus = WEEKLY_EVENTS.bonuses?.carWash;
  if (!carWashBonus?.isActive) return null;

  const expiryDate = new Date(carWashBonus.validUntil).getTime();
  const hoursLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60));
  if (hoursLeft <= 0) return null;

  return {
    id: 'free_car_wash',
    label: '\u26A1 CLAIM FREE CAR WASH NOW',
    critical: true,
    urgent: true,
    impact: 'high',
    solution: 'Open Maze Bank Foreclosures \u2192 Claim Hands On Car Wash',
    actionType: 'property_claim',
    detail: `Expires in ${hoursLeft}hrs! Save $1.4M + earn 3X missions this week.`,
    timeHours: 0.1,
    expiresAt: expiryDate,
  };
};

/** Check for free GTA+ vehicle claim. */
const buildFreeVehicleBottleneck = (
  hasGTAPlus: boolean,
  formData: DetectionFormData,
): Bottleneck | null => {
  if (!hasGTAPlus || formData.claimedFreeCar) return null;

  const gtaPlusConfig = WEEKLY_EVENTS.gtaPlus;
  if (!gtaPlusConfig) return null;

  const freeCarName = gtaPlusConfig.freeCar || 'GTA+ Vehicle';
  const freeCarValue: number = gtaPlusConfig.freeCarValue || 1600000;
  const freeCarLocation = gtaPlusConfig.freeCarLocation || 'The Vinewood Car Club';

  return {
    id: 'claim_free_car',
    label: `\uD83C\uDF81 Claim Free ${freeCarName}`,
    critical: false,
    urgent: false,
    impact: 'low',
    solution: `Visit ${freeCarLocation}`,
    actionType: 'vehicle_claim',
    detail: `Free $${(freeCarValue / 1000000).toFixed(1)}M vehicle for GTA+ members. Claim even if you won't drive it - free garage asset.`,
    timeHours: 0.1,
    savingsPerHour: 0,
    savingsValue: freeCarValue,
  };
};

// ============================================
// Main Export
// ============================================

/**
 * Tier 0: Detect urgent expiring events that should be claimed immediately.
 */
export const detectUrgentExpiring = (
  params: DetectionParams,
  now: number,
  formData: DetectionFormData,
): Bottleneck[] => {
  return [
    buildFreeCarWashBottleneck(formData, now),
    buildFreeVehicleBottleneck(params.hasGTAPlus, formData),
  ].filter((b): b is Bottleneck => b !== null);
};
