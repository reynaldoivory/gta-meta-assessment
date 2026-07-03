import { calculateTimeLeft, GTA6_RELEASE_ISO } from '../trackers/gta6Countdown';
import { getMaxTime, computeAcidLabStatus } from '../trackers/acidLab';
import { getNextResetTime, shouldResetTasks } from '../trackers/dailyReset';

describe('trackers/gta6Countdown', () => {
  const release = new Date(GTA6_RELEASE_ISO);

  test('exact remainder for a fixed now', () => {
    // 2 days, 3 hours, 4 minutes, 5 seconds before release
    const now = new Date(release.getTime() - ((2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000));
    expect(calculateTimeLeft(release, now)).toEqual({
      released: false, days: 2, hours: 3, minutes: 4, seconds: 5,
    });
  });

  test('released shape once the date passes (no d/h/m/s)', () => {
    const after = new Date(release.getTime() + 1000);
    expect(calculateTimeLeft(release, after)).toEqual({ released: true });
  });

  test('exactly at release is treated as released', () => {
    expect(calculateTimeLeft(release, new Date(release.getTime()))).toEqual({ released: true });
  });
});

describe('trackers/acidLab', () => {
  test('getMaxTime by upgrade', () => {
    expect(getMaxTime(true)).toBe(4);
    expect(getMaxTime(false)).toBe(6);
  });

  test('empty lab (upgraded)', () => {
    expect(computeAcidLabStatus(true, 0)).toEqual({
      maxCapacity: 335000, timeToFull: 4, currentValue: 0, percentFull: 0, isReady: false, isNearFull: false,
    });
  });

  test('near-full threshold at 75% of time (not upgraded)', () => {
    // timeToFull 6, 75% = 4.5h
    const s = computeAcidLabStatus(false, 4.5);
    expect(s.isNearFull).toBe(true);
    expect(s.isReady).toBe(false);
    expect(s.percentFull).toBe(75);
  });

  test('over-full clamps currentValue to maxCapacity and flags ready', () => {
    const s = computeAcidLabStatus(true, 10);
    expect(s.currentValue).toBe(335000);
    expect(s.isReady).toBe(true);
  });
});

describe('trackers/dailyReset', () => {
  // Fixed instants in UTC.
  const beforeSixAmUtc = Date.UTC(2026, 6, 3, 5, 0, 0); // 05:00 UTC
  const afterSixAmUtc = Date.UTC(2026, 6, 3, 7, 0, 0); // 07:00 UTC

  test('getNextResetTime returns today 6AM UTC when before 6AM', () => {
    expect(getNextResetTime(beforeSixAmUtc)).toBe(Date.UTC(2026, 6, 3, 6, 0, 0));
  });

  test('getNextResetTime returns tomorrow 6AM UTC when at/after 6AM', () => {
    expect(getNextResetTime(afterSixAmUtc)).toBe(Date.UTC(2026, 6, 4, 6, 0, 0));
  });

  test('shouldResetTasks is true only when there is no prior reset time (preserved behavior)', () => {
    expect(shouldResetTasks(null, beforeSixAmUtc)).toBe(true);
    expect(shouldResetTasks(undefined, afterSixAmUtc)).toBe(true);
    // With a prior time, next reset is always in the future -> false
    expect(shouldResetTasks(beforeSixAmUtc - 100000, beforeSixAmUtc)).toBe(false);
    expect(shouldResetTasks(afterSixAmUtc - 100000, afterSixAmUtc)).toBe(false);
  });
});
