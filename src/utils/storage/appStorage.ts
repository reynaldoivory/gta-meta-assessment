// Centralized localStorage access for the whole app.
//
// Rationale: before this module, 11 files called `localStorage.*` directly with
// 15 differently-named keys and duplicated try/catch + JSON handling. UI
// components are now forbidden from touching localStorage; everything routes
// through here (or the `useStoredState` hook). The domain-specific validation
// each caller needs (allowlist merges, size caps, shape filters) is passed in
// as a `validate` callback so this module stays generic while behavior is
// preserved exactly.

/**
 * Single source of truth for every localStorage key the app uses.
 * Values are the VERBATIM historical key strings -- do not rename without a
 * migration in assessmentDataMigration.js, or existing users lose their data.
 *
 * Naming in the wild is inconsistent (`gtaXxx_v1` vs `gta_snake` vs bare
 * `dailyTracker`); we keep the exact strings and only centralize them.
 */
export const STORAGE_KEYS = {
  // Assessment + empire state
  ASSESSMENT_DATA: 'gta_assessment_data',
  EMPIRE_STATE: 'gtaEmpireState_v1',

  // Streak (plain-string values, not JSON)
  STREAK_COUNT: 'gtaAssessmentStreak_v1',
  STREAK_LAST_DATE: 'gtaAssessmentLastDate_v1',

  // Community pools (JSON arrays, capped)
  COMMUNITY_STATS_POOL: 'gta_community_stats_pool',
  COMMUNITY_TRAP_STATS: 'gta_community_trap_stats',

  // Trap detector (JSON arrays, capped)
  TRAP_HISTORY: 'gta_trap_history',
  TRAP_FIXES: 'gta_trap_fixes',

  // Gamification
  GAMIFICATION: 'gtaAssessmentGamification_v1',
  SOUND_PREF: 'gtaSoundEnabled', // plain-string 'true'/'false'

  // Progress history (JSON array, capped)
  PROGRESS_HISTORY: 'gtaAssessmentProgress_v1',

  // Component trackers
  DAILY_TRACKER: 'dailyTracker',
  ACID_LAB_TRACKER: 'acidLabTracker',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Legacy/broken keys retained ONLY so read-side call sites keep their exact
 * historical behavior while being routed through this module. Both are read in
 * the codebase but never written by any current writer, so reads always miss.
 * Documented here instead of fixed to avoid changing export/DevTools behavior
 * during the UX overhaul (see docs/ux-overhaul/AUDIT.md section 9b).
 */
export const LEGACY_READ_KEYS = {
  PROGRESS_HISTORY_BROKEN: 'gta_progress_history', // csvExport + DevTools read; never written
  DRAFT_V5_BROKEN: 'gtaAssessmentDraft_v5', // DevTools reads; never written
} as const;

const isBrowser = (): boolean => typeof localStorage !== 'undefined';

const warn = (message: string, error: unknown): void => {
  // eslint-disable-next-line no-console
  console.warn(message, error instanceof Error ? error.message : error);
};

/** Raw string read. Returns `fallback` (default null) on any failure. */
export function getRaw(key: string, fallback: string | null = null): string | null {
  if (!isBrowser()) return fallback;
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch (error) {
    warn(`storage: getRaw(${key}) failed`, error);
    return fallback;
  }
}

/** Raw string write. Returns true on success. */
export function setRaw(key: string, value: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    warn(`storage: setRaw(${key}) failed`, error);
    return false;
  }
}

/**
 * JSON read with optional validation.
 * - Missing/unparseable value -> `fallback`.
 * - If `validate` is supplied, its return value is used; returning `null`/`undefined`
 *   from validate falls back. Without `validate`, the parsed value is returned as-is.
 */
export function getJSON<T>(
  key: string,
  fallback: T,
  validate?: (parsed: unknown) => T | null | undefined
): T {
  if (!isBrowser()) return fallback;
  let parsed: unknown;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    parsed = JSON.parse(raw);
  } catch (error) {
    warn(`storage: getJSON(${key}) parse failed`, error);
    return fallback;
  }
  if (!validate) return parsed as T;
  const validated = validate(parsed);
  return validated === null || validated === undefined ? fallback : validated;
}

/** JSON write. Returns true on success. */
export function setJSON(key: string, value: unknown): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    warn(`storage: setJSON(${key}) failed`, error);
    return false;
  }
}

/** Remove a single key. */
export function remove(key: string): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    warn(`storage: remove(${key}) failed`, error);
    return false;
  }
}

/** Clear ALL localStorage (used by DevTools "Clear All Storage"). */
export function clearAll(): boolean {
  if (!isBrowser()) return false;
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    warn('storage: clearAll failed', error);
    return false;
  }
}

/** True if localStorage is present and writable (probe). */
export function isStorageAvailable(): boolean {
  if (!isBrowser()) return false;
  try {
    const probe = '__gta_storage_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}
