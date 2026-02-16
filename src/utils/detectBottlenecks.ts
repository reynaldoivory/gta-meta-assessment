// src/utils/detectBottlenecks.ts
// Main bottleneck detection orchestrator.
// Each tier is implemented in a separate module to keep complexity and file size manageable.

import type { Bottleneck, DetectionParams, ActiveEvent, DetectionFormData } from './bottleneckTypes';
import { detectUrgentExpiring } from './bottleneckUrgent';
import { detectIncomeLeaks } from './bottleneckIncomeLeaks';
import { detectStatBottlenecks } from './bottleneckStats';
import { detectAssetGaps } from './bottleneckAssets';
import { detectInfrastructureGaps } from './bottleneckInfra';
import { detectQualityOfLife } from './bottleneckQoL';

// Re-export types for consumers that imported from this module
export type { Bottleneck, DetectionParams, ActiveEvent, DetectionFormData } from './bottleneckTypes';

/**
 * Detect all bottlenecks for a player based on their current state.
 *
 * Bottlenecks are returned in tier order:
 *   0 — Urgent expiring events (free claims)
 *   1 — Income leaks (weekly events, combat prep, GTA+ bonuses)
 *   2 — Stat gaps (strength, flying, rank)
 *   3 — Asset gaps (missing properties/upgrades)
 *   Infrastructure — Bunker & nightclub optimization
 *   4 — Quality-of-life improvements
 */
export const detectBottlenecks = (
  params: DetectionParams,
  now: number,
  activeEvents: ActiveEvent[],
  incomePerHour: number,
  formData: DetectionFormData,
): Bottleneck[] => {
  const tier0 = detectUrgentExpiring(params, now, formData);
  const { bottlenecks: tier1, nightclubDiscountEvent } = detectIncomeLeaks(params, now, activeEvents);
  const tier2 = detectStatBottlenecks(params, activeEvents, formData);
  const tier3 = detectAssetGaps(params, incomePerHour);
  const infra = detectInfrastructureGaps(params, formData, nightclubDiscountEvent);
  const qol = detectQualityOfLife(params, formData, incomePerHour, nightclubDiscountEvent);

  return [...tier0, ...tier1, ...tier2, ...tier3, ...infra, ...qol];
};
