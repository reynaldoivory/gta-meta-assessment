// src/utils/calculations/strength.ts
// Pure strength-training math extracted from StrengthCalc.jsx.
// The currentPct >= 60 early-return guard stays in the component; this module
// only owns the arithmetic so the component renders byte-identical output.

export const STRENGTH_TARGET_PCT = 60;
export const PUNCHES_PER_MIN = 30;

export interface StrengthTraining {
  impactsNeeded: number;
  timeEst: number;
  punchesPerMin: number;
}

export function computeStrengthTraining(currentPct: number): StrengthTraining {
  const impactsNeeded = Math.ceil((STRENGTH_TARGET_PCT - currentPct) * 20);
  const timeEst = Math.ceil(impactsNeeded / PUNCHES_PER_MIN);
  return { impactsNeeded, timeEst, punchesPerMin: PUNCHES_PER_MIN };
}
