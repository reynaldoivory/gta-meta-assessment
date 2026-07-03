import {
  STORAGE_KEYS,
  getRaw,
  setRaw,
  getJSON,
  setJSON,
  remove,
  clearAll,
  isStorageAvailable,
} from '../storage/appStorage';

describe('appStorage', () => {
  beforeEach(() => localStorage.clear());

  describe('raw string I/O', () => {
    test('setRaw/getRaw round-trips a plain string', () => {
      expect(setRaw('k', 'hello')).toBe(true);
      expect(getRaw('k')).toBe('hello');
    });

    test('getRaw returns fallback on miss', () => {
      expect(getRaw('missing')).toBeNull();
      expect(getRaw('missing', 'fallback')).toBe('fallback');
    });

    test('does not JSON-encode raw values (streak/sound-pref use plain strings)', () => {
      setRaw(STORAGE_KEYS.SOUND_PREF, 'false');
      expect(localStorage.getItem(STORAGE_KEYS.SOUND_PREF)).toBe('false');
      expect(getRaw(STORAGE_KEYS.SOUND_PREF)).toBe('false');
    });
  });

  describe('JSON I/O', () => {
    test('setJSON/getJSON round-trips an object', () => {
      const value = { a: 1, b: [2, 3], c: 'x' };
      expect(setJSON('obj', value)).toBe(true);
      expect(getJSON('obj', null)).toEqual(value);
    });

    test('getJSON returns fallback on miss', () => {
      expect(getJSON('nope', [])).toEqual([]);
      expect(getJSON('nope', { d: 1 })).toEqual({ d: 1 });
    });

    test('getJSON returns fallback on corrupt JSON without throwing', () => {
      localStorage.setItem('bad', '{not valid json');
      expect(getJSON('bad', 'fallback')).toBe('fallback');
    });

    test('validate transforms the parsed value', () => {
      setJSON('nums', [1, 2, 3]);
      const doubled = getJSON<number[]>('nums', [], (p) =>
        Array.isArray(p) ? (p as number[]).map((n) => n * 2) : null
      );
      expect(doubled).toEqual([2, 4, 6]);
    });

    test('validate returning null falls back (rejects bad shape)', () => {
      setJSON('obj', { wrong: true });
      const result = getJSON<string>('obj', 'DEFAULT', (p) =>
        p && typeof p === 'object' && 'right' in (p as object) ? 'ACCEPTED' : null
      );
      expect(result).toBe('DEFAULT');
    });

    test('allowlist-merge pattern (prototype-pollution guard) works through validate', () => {
      const defaults = { xp: 0, name: 'anon' };
      // Attacker injects an extra key + __proto__
      setJSON('gam', { xp: 50, evil: 'x', __proto__: { polluted: true } });
      const loaded = getJSON('gam', defaults, (parsed) => {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
        const src = parsed as Record<string, unknown>;
        const safe: Record<string, unknown> = {};
        for (const key of Object.keys(defaults)) {
          if (Object.prototype.hasOwnProperty.call(src, key)) safe[key] = src[key];
        }
        return { ...defaults, ...safe };
      });
      expect(loaded).toEqual({ xp: 50, name: 'anon' });
      expect((loaded as Record<string, unknown>).evil).toBeUndefined();
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('remove + clearAll', () => {
    test('remove deletes a single key', () => {
      setRaw('a', '1');
      setRaw('b', '2');
      remove('a');
      expect(getRaw('a')).toBeNull();
      expect(getRaw('b')).toBe('2');
    });

    test('clearAll empties storage', () => {
      setRaw('a', '1');
      setJSON('b', { x: 1 });
      clearAll();
      expect(localStorage.length).toBe(0);
    });
  });

  test('isStorageAvailable is true in jsdom', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  test('STORAGE_KEYS values match the historical literals (no drift)', () => {
    expect(STORAGE_KEYS.ASSESSMENT_DATA).toBe('gta_assessment_data');
    expect(STORAGE_KEYS.EMPIRE_STATE).toBe('gtaEmpireState_v1');
    expect(STORAGE_KEYS.STREAK_COUNT).toBe('gtaAssessmentStreak_v1');
    expect(STORAGE_KEYS.GAMIFICATION).toBe('gtaAssessmentGamification_v1');
    expect(STORAGE_KEYS.SOUND_PREF).toBe('gtaSoundEnabled');
    expect(STORAGE_KEYS.PROGRESS_HISTORY).toBe('gtaAssessmentProgress_v1');
    expect(STORAGE_KEYS.DAILY_TRACKER).toBe('dailyTracker');
    expect(STORAGE_KEYS.ACID_LAB_TRACKER).toBe('acidLabTracker');
  });
});
