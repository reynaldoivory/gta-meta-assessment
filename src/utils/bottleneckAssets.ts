// src/utils/bottleneckAssets.ts
// Tier 3: Asset gap detection (missing properties/vehicles/upgrades).

import type { Bottleneck, DetectionParams } from './bottleneckTypes';
import { MODEL_CONFIG } from './modelConfig.js';

// Pre-compute config values to avoid repeated ?./??  in functions
const AGENCY_PURCHASE_THRESHOLD: number =
  MODEL_CONFIG.thresholds?.recommendations?.agencyPurchase ?? 400000;
const AGENCY_SETUP_HOURS: number = MODEL_CONFIG.time?.assets?.agencySetup ?? 3;
const DRE_CONTRACT_HOURS: number = MODEL_CONFIG.time?.assets?.dreContract ?? 3;

// ============================================
// Car Wash Feeder Gaps (extracted for complexity)
// ============================================

const detectCarWashFeederGaps = (params: DetectionParams): Bottleneck[] => {
  if (!params.hasCarWash) return [];

  const gaps: Bottleneck[] = [];

  if (!params.hasWeedFarm) {
    gaps.push({
      id: 'no_weed_farm',
      label: 'Car Wash missing Weed Farm feeder',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Weed Farm ($715K) to boost Car Wash passive income by ~$10K/hr',
      actionType: 'purchase',
      detail: 'Weed Farm feeds product to Car Wash, boosting its passive earnings significantly.',
      timeHours: 0.5,
      savingsPerHour: 10000,
    });
  }

  if (!params.hasHeliTours) {
    gaps.push({
      id: 'no_heli_tours',
      label: 'Car Wash missing Heli Tours feeder',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Helicopter Tours ($750K) to boost Car Wash passive income by ~$8K/hr',
      actionType: 'purchase',
      detail: 'Helicopter Tours bring tourists to Car Wash, boosting passive earnings.',
      timeHours: 0.5,
      savingsPerHour: 8000,
    });
  }

  return gaps;
};

// ============================================
// Income Diversification
// ============================================

const detectIncomeDiversificationGaps = (params: DetectionParams): Bottleneck[] => {
  const bottlenecks: Bottleneck[] = [];

  if (!params.hasKosatka) {
    bottlenecks.push({
      id: 'no_kosatka',
      label: 'No Kosatka Submarine',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Kosatka ($2.2M) from Warstock for Cayo Perico access (~$560k/hr solo)',
      actionType: 'purchase',
      detail: 'Unlocks Cayo Perico Heist \u2014 a solid solo active income source (~$700k avg per run).',
      timeHours: 5,
    });
  }

  if (params.hasKosatka && !params.hasSparrow) {
    bottlenecks.push({
      id: 'no_sparrow',
      label: 'No Sparrow for fast travel',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Sparrow helicopter ($1.8M) from Kosatka interaction menu',
      actionType: 'purchase',
      detail: 'Sparrow cuts Cayo prep time in half and is useful for many freeroam missions.',
      timeHours: 2,
    });
  }

  bottlenecks.push(...detectCarWashFeederGaps(params));

  if (!params.sellsToStreetDealers) {
    bottlenecks.push({
      id: 'not_selling_street_dealers',
      label: '\uD83D\uDC8A Not selling to Street Dealers',
      critical: false,
      impact: 'high',
      solution: 'Visit 3 Street Dealers daily (~15 min for ~$202-250K). Requires MC businesses + Acid Lab stocked.',
      actionType: 'daily_routine',
      detail: 'Street Dealers refresh daily at 07:00 UTC. Sell Cocaine, Meth, Weed & Acid for ~$250K/day average with premiums. Best $/minute ratio in the game.',
      timeHours: 0.25,
      savingsPerHour: 250000,
    });
  }

  if (!params.hasAutoShop) {
    bottlenecks.push({
      id: 'no_auto_shop',
      label: 'No Auto Shop',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Auto Shop ($1.8M) for robbery contracts (~$400-600K/hr solo)',
      actionType: 'purchase',
      detail: 'Union Depository contract pays ~$300K for 30 min work. Great solo active income.',
      timeHours: 1,
    });
  }

  if (!params.hasCarWash) {
    bottlenecks.push({
      id: 'no_car_wash',
      label: 'No Car Wash (passive income)',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Car Wash ($1.5M) + feeders for up to ~$23K/hr passive income',
      actionType: 'purchase',
      detail: 'Car Wash generates passive income. Add Weed Farm ($715K) and Heli Tours ($750K) as feeders to maximize earnings.',
      timeHours: 1,
    });
  }

  return bottlenecks;
};

// ============================================
// Main Export
// ============================================

/**
 * Tier 3: Detect missing assets and upgrade opportunities.
 */
export const detectAssetGaps = (params: DetectionParams, incomePerHour: number): Bottleneck[] => {
  const { hasAgency, hasAcidLab, acidLabUpgraded, dreContractDone } = params;
  const bottlenecks = detectIncomeDiversificationGaps(params);

  if (!hasAgency && incomePerHour >= AGENCY_PURCHASE_THRESHOLD) {
    bottlenecks.push({
      id: 'no_agency',
      label: 'No Agency for Dre/Payphone',
      critical: false,
      impact: 'medium',
      solution: 'Purchase Agency ($2M+) and complete setup missions',
      actionType: 'purchase',
      detail: 'Agency unlocks Dr. Dre ($1M) and Payphone Hits (~250k/hr filler).',
      timeHours: AGENCY_SETUP_HOURS,
    });
  }

  if (hasAgency && !dreContractDone) {
    bottlenecks.push({
      id: 'dre_contract',
      label: 'Dr. Dre Contract not completed',
      critical: false,
      impact: 'medium',
      solution: 'Complete Dr. Dre Contract from Agency computer (unlocks Payphone Hits)',
      actionType: 'contract',
      detail: 'Finishing this unlocks Payphone Hits and a one-time $1M payout.',
      timeHours: DRE_CONTRACT_HOURS,
    });
  }

  if (hasAcidLab && !acidLabUpgraded) {
    bottlenecks.push({
      id: 'acid_upgrade',
      label: 'Acid Lab not upgraded',
      critical: false,
      impact: 'medium',
      detail: 'You lose ~40% of potential Acid Lab profit every cycle without this upgrade.',
      solution: 'Purchase Acid Lab equipment upgrade',
      timeHours: 0.5,
    });
  }

  return bottlenecks;
};
