import { computeStrengthTraining, STRENGTH_TARGET_PCT, PUNCHES_PER_MIN } from '../calculations/strength';
import { computeRoi, formatHoursRequired, formatDaysRequired, commonGoals } from '../calculations/roi';
import { computeAutoShopRate, CAYO_RATE } from '../calculations/incomeComparison';
import { asDollars, asIncome, asHours, asDays } from '../../types/branded';

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
    const result = computeRoi({ goal: asDollars(1_000_000), currentCash: asDollars(200_000), incomePerHour: asIncome(100_000) });
    expect(Number(result.needed)).toBe(800_000);
    expect(Number(result.hours)).toBe(8);
    expect(Number(result.days)).toBe(8 / 24);
  });
  test('already affordable -> needed clamps to 0', () => {
    const result = computeRoi({ goal: asDollars(100_000), currentCash: asDollars(500_000), incomePerHour: asIncome(50_000) });
    expect(Number(result.needed)).toBe(0);
    expect(Number(result.hours)).toBe(0);
    expect(Number(result.days)).toBe(0);
  });
  test('zero income falls back to 1/hr (matches component || 1)', () => {
    const r = computeRoi({ goal: asDollars(100), currentCash: asDollars(0), incomePerHour: asIncome(0) });
    expect(Number(r.needed)).toBe(100);
    expect(Number(r.hours)).toBe(100);
  });
  test('formatHoursRequired thresholds', () => {
    expect(formatHoursRequired(asHours(0.5))).toBe('30 minutes');
    expect(formatHoursRequired(asHours(3.25))).toBe('3.3 hours');
    expect(formatHoursRequired(asHours(48))).toBe('2.0 days');
  });
  test('formatDaysRequired thresholds', () => {
    expect(formatDaysRequired(asDays(3))).toBe('3.0 days');
    expect(formatDaysRequired(asDays(14))).toBe('2.0 weeks');
    expect(formatDaysRequired(asDays(60))).toBe('2.0 months');
  });
  test('commonGoals preset list is intact', () => {
    expect(commonGoals).toHaveLength(7);
    expect(commonGoals[0]).toEqual({ label: 'Kosatka', amount: 2200000 });
  });
});

describe('calculations/incomeComparison', () => {
  test('CAYO_RATE constant', () => {
    expect(Number(CAYO_RATE)).toBe(466000);
  });
  test('auto shop rate is a positive number with a valid multiplier', () => {
    const { rate, isActive, multiplier } = computeAutoShopRate();
    expect(Number(rate)).toBeGreaterThan(0);
    expect(typeof isActive).toBe('boolean');
    expect(multiplier).toBeGreaterThanOrEqual(1);
    // base 300000 * (60/25) contracts/hr * multiplier
    expect(Number(rate)).toBe(300000 * (60 / 25) * multiplier);
  });
});
