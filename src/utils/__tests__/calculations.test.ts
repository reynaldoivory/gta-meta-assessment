import { computeStrengthTraining, STRENGTH_TARGET_PCT, PUNCHES_PER_MIN } from '../calculations/strength';
import { computeRoi, formatHoursRequired, formatDaysRequired, commonGoals } from '../calculations/roi';
import { computeAutoShopRate, CAYO_RATE } from '../calculations/incomeComparison';

describe('calculations/strength', () => {
  test('impacts + time for a low stat', () => {
    // ceil((60-0)*20)=1200; ceil(1200/30)=40
    expect(computeStrengthTraining(0)).toEqual({ impactsNeeded: 1200, timeEst: 40, punchesPerMin: 30 });
  });
  test('near target', () => {
    // ceil((60-59)*20)=20; ceil(20/30)=1
    expect(computeStrengthTraining(59)).toEqual({ impactsNeeded: 20, timeEst: 1, punchesPerMin: 30 });
  });
  test('at target boundary (component guards >=60 separately)', () => {
    expect(computeStrengthTraining(60)).toEqual({ impactsNeeded: 0, timeEst: 0, punchesPerMin: 30 });
  });
  test('exposes canonical constants', () => {
    expect(STRENGTH_TARGET_PCT).toBe(60);
    expect(PUNCHES_PER_MIN).toBe(30);
  });
});

describe('calculations/roi', () => {
  test('needed/hours/days for a reachable goal', () => {
    expect(computeRoi({ goal: 1_000_000, currentCash: 200_000, incomePerHour: 100_000 }))
      .toEqual({ needed: 800_000, hours: 8, days: 8 / 24 });
  });
  test('already affordable -> needed clamps to 0', () => {
    expect(computeRoi({ goal: 100_000, currentCash: 500_000, incomePerHour: 50_000 }))
      .toEqual({ needed: 0, hours: 0, days: 0 });
  });
  test('zero income falls back to 1/hr (matches component || 1)', () => {
    const r = computeRoi({ goal: 100, currentCash: 0, incomePerHour: 0 });
    expect(r.needed).toBe(100);
    expect(r.hours).toBe(100);
  });
  test('formatHoursRequired thresholds', () => {
    expect(formatHoursRequired(0.5)).toBe('30 minutes');
    expect(formatHoursRequired(3.25)).toBe('3.3 hours');
    expect(formatHoursRequired(48)).toBe('2.0 days');
  });
  test('formatDaysRequired thresholds', () => {
    expect(formatDaysRequired(3)).toBe('3.0 days');
    expect(formatDaysRequired(14)).toBe('2.0 weeks');
    expect(formatDaysRequired(60)).toBe('2.0 months');
  });
  test('commonGoals preset list is intact', () => {
    expect(commonGoals).toHaveLength(7);
    expect(commonGoals[0]).toEqual({ label: 'Kosatka', amount: 2200000 });
  });
});

describe('calculations/incomeComparison', () => {
  test('CAYO_RATE constant', () => {
    expect(CAYO_RATE).toBe(466000);
  });
  test('auto shop rate is a positive number with a valid multiplier', () => {
    const { rate, isActive, multiplier } = computeAutoShopRate();
    expect(rate).toBeGreaterThan(0);
    expect(typeof isActive).toBe('boolean');
    expect(multiplier).toBeGreaterThanOrEqual(1);
    // base 300000 * (60/25) contracts/hr * multiplier
    expect(rate).toBe(300000 * (60 / 25) * multiplier);
  });
});
