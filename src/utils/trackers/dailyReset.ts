// src/utils/trackers/dailyReset.ts
// Pure 6 AM UTC daily-reset math extracted from DailyTracker.jsx. The component
// keeps its React state, effects, storage calls, and task config; only these
// clock functions move. Behavior is preserved exactly, including the existing
// reset-boundary semantics (see shouldResetTasks).

/**
 * Timestamp (ms) of the next 6:00 AM UTC boundary relative to `nowMs`.
 * If it is already past 6 AM UTC today, returns tomorrow's 6 AM UTC.
 */
export function getNextResetTime(nowMs: number = Date.now()): number {
  const now = new Date(nowMs);
  const resetTime = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    6, 0, 0, 0
  ));

  if (now.getTime() >= resetTime.getTime()) {
    resetTime.setUTCDate(resetTime.getUTCDate() + 1);
  }

  return resetTime.getTime();
}

/**
 * Whether daily tasks should reset. Preserves the original semantics exactly:
 * true when there is no prior reset time; otherwise compares `now` against the
 * NEXT reset boundary (which getNextResetTime always places in the future).
 */
export function shouldResetTasks(
  lastResetTime: number | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!lastResetTime) return true;
  const nextReset = getNextResetTime(nowMs);
  return nowMs >= nextReset;
}
