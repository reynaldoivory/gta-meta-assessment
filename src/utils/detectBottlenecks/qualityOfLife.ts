// src/utils/detectBottlenecks/qualityOfLife.ts
// TIER 4: DAILY/QUALITY OF LIFE

import { validateStat } from '../assessmentHelpers.js';
import type { DetectionParams, ActiveEvent, DetectionFormData, Bottleneck } from '../bottleneckTypes';

/**
 * Detect quality of life bottlenecks (TIER 4)
 */
export const detectQualityOfLife = (
  params: DetectionParams,
  formData: DetectionFormData,
  incomePerHour: number,
  _nightclubDiscountEvent: ActiveEvent | undefined,
): Bottleneck[] => {
  const { hasGTAPlus, hasKosatka } = params;
  const bottlenecks: Bottleneck[] = [];

  // Suggest GTA+ only when it clearly pays off
  if (!hasGTAPlus && hasKosatka && incomePerHour >= 500000) {
    bottlenecks.push({
      id: 'consider_gta_plus',
      label: 'Consider GTA+ for extra bonuses',
      critical: false,
      impact: 'medium',
      solution: 'Subscribe to GTA+ via Rockstar Games Launcher or console store',
      actionType: 'subscription',
      detail:
        'At your income level, the $500k monthly bonus + event boosts pay for the sub in <1 hour.',
      timeHours: 0,
    });
  }

  // Optional: Stamina Check (Quality of Life)
  const stamina = validateStat(formData.stamina); // Already returns percentage (0-100)
  if (stamina < 100) {
    bottlenecks.push({
      id: 'stamina_low',
      label: 'Maximize Stamina',
      solution: 'Run, bike, or swim regularly to build stamina',
      actionType: 'activity',
      detail: 'Allows unlimited sprinting. Required for Mansion Yoga buff (+15% run speed).',
      critical: false,
      impact: 'low',
      timeHours: 0.5,
    });
  }

  // Casino Wheel (GTA+ gets 2 spins) - Only if not claimed/opted out
  const claimedWheelSpin = !!formData.claimedWheelSpin;
  if (hasGTAPlus && !claimedWheelSpin) {
    bottlenecks.push({
      id: 'casino_spin',
      label: '\uD83C\uDFB0 Spin Lucky Wheel (2X Daily)',
      critical: false,
      impact: 'low',
      solution: 'Go to Casino. Spin. Wait 5s. Spin again.',
      actionType: 'daily',
      detail: 'GTA+ gets 2 spins per day. Target: Podium Vehicle (Rebla GTS) or RP.',
      timeHours: 0.1,
    });
  }

  return bottlenecks;
};
