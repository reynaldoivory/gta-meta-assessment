import { useEffect, useState } from 'react';

/**
 * Tracks whether a CSS media query currently matches. Client-only (no SSR in
 * this app), so the initial value is read synchronously from matchMedia.
 * Used by the garage view to mount EITHER the table OR the card list for a
 * given viewport -- never both -- keeping the DOM bounded at ~800 nodes
 * instead of ~1600.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
