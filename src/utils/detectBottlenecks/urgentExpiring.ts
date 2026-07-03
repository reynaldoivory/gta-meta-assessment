// src/utils/detectBottlenecks/urgentExpiring.ts
// TIER 0: URGENT EXPIRING EVENTS (Front of queue)

import { WEEKLY_EVENTS, formatExpiry } from '../../config/weeklyEvents.js';
import type { DetectionParams, DetectionFormData, Bottleneck } from '../bottleneckTypes';

/**
 * Detect urgent expiring events (TIER 0)
 */
export const detectUrgentExpiring = (
  params: DetectionParams,
  now: number,
  formData: DetectionFormData,
): Bottleneck[] => {
  const { hasGTAPlus } = params;
  const bottlenecks: Bottleneck[] = [];

  // 1. FREE CAR WASH (expiry from WEEKLY_EVENTS config)
  if (!formData.hasCarWash) {
    const carWashBonus = WEEKLY_EVENTS.bonuses?.carWash;
    if (carWashBonus?.isActive) {
      const expiryDate = new Date(carWashBonus.validUntil).getTime();
      const hoursLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60));

      if (hoursLeft > 0) {
        bottlenecks.push({
          id: 'free_car_wash',
          label: '\u26A1 CLAIM FREE CAR WASH NOW',
          critical: true,
          urgent: true, // Sorter uses this
          impact: 'high',
          solution: 'Open Maze Bank Foreclosures \u2192 Claim Hands On Car Wash',
          actionType: 'property_claim',
          detail: `Expires in ${hoursLeft}hrs! Save $1.4M + earn 3X missions this week.`,
          timeHours: 0.1,
          expiresAt: expiryDate,
        });
      }
    }
  }

  // 1.5. FREE VEHICLE (GTA+ Only)
  // Only recommend if they have GTA+ AND haven't claimed it yet
  if (hasGTAPlus && !formData.claimedFreeCar) {
    const freeCarName = WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle';
    const freeCarValue = WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1600000;
    const freeCarLocation = WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'The Vinewood Car Club';
    bottlenecks.push({
      id: 'claim_free_car',
      label: `\uD83C\uDF81 Claim Free ${freeCarName}`,
      critical: false,
      urgent: false, // Monthly benefit (no expiry rush)
      impact: 'low', // It's just a car, not income
      solution: `Visit ${freeCarLocation}`,
      actionType: 'vehicle_claim',
      detail: `Free $${(freeCarValue / 1000000).toFixed(1)}M vehicle for GTA+ members. Claim even if you won't drive it - free garage asset.`,
      timeHours: 0.1,
      savingsPerHour: 0, // No income gain, just asset value
      savingsValue: freeCarValue, // One-time savings (used by sorter if you add that logic)
    });
  }

  return bottlenecks;
};
