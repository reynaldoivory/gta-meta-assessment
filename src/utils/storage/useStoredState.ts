import { useCallback, useEffect, useRef, useState } from 'react';
import { getJSON, setJSON } from './appStorage';

/**
 * useState that persists to localStorage through the central appStorage service.
 * UI components use this (or the service directly) instead of touching
 * localStorage themselves.
 *
 * @param key      storage key (use a STORAGE_KEYS constant)
 * @param initial  default when nothing valid is stored
 * @param validate optional shape guard applied to the parsed value on load;
 *                 return null to reject stored data and use `initial`
 */
export function useStoredState<T>(
  key: string,
  initial: T,
  validate?: (parsed: unknown) => T | null | undefined
): [T, (next: T | ((prev: T) => T)) => void] {
  // Load once, lazily, on mount.
  const [state, setState] = useState<T>(() => getJSON<T>(key, initial, validate));

  // Skip the write on the very first render so mount doesn't immediately
  // re-persist the just-loaded value.
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    setJSON(key, state);
  }, [key, state]);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState(next);
  }, []);

  return [state, set];
}
