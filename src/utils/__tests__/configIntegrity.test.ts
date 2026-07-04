import { MODEL_CONFIG } from '../modelConfig.js';
import {
  WEEKLY_EVENTS,
  WEEKLY_DATA_STALE_AFTER_DAYS,
  weeklyDataAgeDays,
  isWeeklyDataStale,
  warnIfWeeklyDataStale,
} from '../../config/weeklyEvents';

describe('scoring weights are config-driven (calculateScore reads MODEL_CONFIG.scoring.weights)', () => {
  test('MODEL_CONFIG.scoring.weights exists with the keys calculateScore reads', () => {
    const w = MODEL_CONFIG.scoring.weights;
    expect(w).toBeDefined();
    // Values match calculateScore's old ?? fallbacks, so grades are unchanged
    // (characterization.test.js is the guard). The point is the path now EXISTS.
    expect(w.activeIncome).toBe(40);
    expect(w.passiveIncome).toBe(25);
    expect(w.assets).toBe(20);
    expect(w.stats).toBe(15);
  });
});

describe('weeklyEvents staleness guard', () => {
  const lastUpdated = new Date(WEEKLY_EVENTS.meta.lastUpdated);
  const daysAfterLastUpdate = (n: number) => new Date(lastUpdated.getTime() + n * 86_400_000);

  test('weeklyDataAgeDays measures whole days since meta.lastUpdated', () => {
    expect(weeklyDataAgeDays(daysAfterLastUpdate(0))).toBe(0);
    expect(weeklyDataAgeDays(daysAfterLastUpdate(3))).toBe(3);
    expect(weeklyDataAgeDays(daysAfterLastUpdate(20))).toBe(20);
  });

  test('not stale at or under the threshold, stale past it', () => {
    expect(isWeeklyDataStale(daysAfterLastUpdate(WEEKLY_DATA_STALE_AFTER_DAYS))).toBe(false);
    expect(isWeeklyDataStale(daysAfterLastUpdate(WEEKLY_DATA_STALE_AFTER_DAYS + 1))).toBe(true);
  });

  test('warnIfWeeklyDataStale returns false and stays silent when fresh', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(warnIfWeeklyDataStale(daysAfterLastUpdate(1))).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('warnIfWeeklyDataStale returns true and warns once when stale', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(warnIfWeeklyDataStale(daysAfterLastUpdate(30))).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
