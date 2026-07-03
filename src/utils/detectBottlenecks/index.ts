// src/utils/detectBottlenecks/index.ts
// Main orchestrator for bottleneck detection

import { detectUrgentExpiring } from './urgentExpiring.js';
import { detectIncomeLeaks } from './incomeLeaks.js';
import { detectStatBottlenecks } from './statBottlenecks.js';
import { detectAssetGaps } from './assetGaps.js';
import { detectInfrastructureGaps } from './infrastructureGaps.js';
import { detectQualityOfLife } from './qualityOfLife.js';
import type { DetectionParams, ActiveEvent, DetectionFormData, Bottleneck } from '../bottleneckTypes';

/**
 * Detect all bottlenecks for a player based on their current state
 *
 * This function coordinates bottleneck detection across multiple tiers:
 * - TIER 0: Urgent expiring events (front of queue)
 * - TIER 1: Income leaks (costing money every hour)
 * - TIER 2: Context-aware stat checks
 * - TIER 3: Asset gaps
 * - TIER 4: Infrastructure investment bottlenecks
 * - TIER 5: Daily/quality of life
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
