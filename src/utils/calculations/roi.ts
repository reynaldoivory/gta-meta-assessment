// src/utils/calculations/roi.ts
// Pure ROI math + goal presets + time formatters extracted from ROICalculator.jsx.
// The component keeps its useState/handlers, validity guards, and JSX; only the
// pure arithmetic and these helpers move here so rendering stays byte-identical.

export interface RoiResult {
  needed: number;
  hours: number;
  days: number;
}

export const commonGoals = [
  { label: 'Kosatka', amount: 2200000 },
  { label: 'Sparrow', amount: 1800000 },
  { label: 'Agency', amount: 2000000 },
  { label: 'Acid Lab', amount: 750000 },
  { label: 'Nightclub', amount: 1500000 },
  { label: 'Oppressor Mk II', amount: 8000000 },
  { label: 'Raiju', amount: 6800000 },
];

export const formatHoursRequired = (hours: number): string => {
  if (hours < 1) return `${(hours * 60).toFixed(0)} minutes`;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
};

export const formatDaysRequired = (days: number): string => {
  if (days < 7) return `${days.toFixed(1)} days`;
  if (days < 30) return `${(days / 7).toFixed(1)} weeks`;
  return `${(days / 30).toFixed(1)} months`;
};

export function computeRoi(params: {
  goal: number;
  currentCash: number;
  incomePerHour: number;
}): RoiResult {
  const { goal, currentCash, incomePerHour } = params;
  const needed = Math.max(0, goal - currentCash);
  const perHour = incomePerHour || 1;
  const hours = needed / perHour;
  const days = hours / 24;
  return { needed, hours, days };
}
