// src/utils/trackers/acidLab.ts
// Pure Acid Lab capacity/production math extracted from AcidLabTracker.jsx.
// The component keeps its setInterval, storage calls, and display helpers;
// only this arithmetic moves so output stays byte-identical.

/** Hours to fill: 4 with the equipment upgrade, 6 without. */
export function getMaxTime(acidLabUpgraded: boolean): number {
  return acidLabUpgraded ? 4 : 6;
}

export interface AcidLabStatus {
  maxCapacity: number;
  timeToFull: number;
  currentValue: number;
  percentFull: number;
  isReady: boolean;
  isNearFull: boolean;
}

export function computeAcidLabStatus(acidLabUpgraded: boolean, productionTime: number): AcidLabStatus {
  const maxCapacity = acidLabUpgraded ? 335000 : 237500;
  const timeToFull = getMaxTime(acidLabUpgraded);
  const currentValue = Math.min(maxCapacity, (productionTime / timeToFull) * maxCapacity);
  const percentFull = (productionTime / timeToFull) * 100;
  const isReady = productionTime >= timeToFull;
  const isNearFull = productionTime >= timeToFull * 0.75;

  return { maxCapacity, timeToFull, currentValue, percentFull, isReady, isNearFull };
}
