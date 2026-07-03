import { useCallback, useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** True when focus is at the given edge of the trap, or has escaped it entirely. */
function isAtEdgeOrEscaped(
  edge: HTMLElement,
  activeEl: HTMLElement | null,
  container: HTMLElement | null
): boolean {
  return activeEl === edge || !container?.contains(activeEl);
}

interface FocusTrapOptions {
  onEscape?: () => void;
  initialFocusRef?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean; // default true
}

/**
 * Ref-based focus trap for modal dialogs. Fixes the two weaknesses of the old
 * garage DetailModal trap: (1) it uses a container ref rather than
 * getElementById, and (2) it re-queries focusable elements on every Tab keydown
 * so dynamically added/removed content stays trappable.
 *
 * Returns a ref to attach to the dialog container. Only active while `active`.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  { onEscape, initialFocusRef, restoreFocus = true }: FocusTrapOptions = {}
): React.RefObject<T> {
  const containerRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const getFocusable = useCallback((): HTMLElement[] => {
    const container = containerRef.current;
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;
      const edge = event.shiftKey ? first : last;
      const target = event.shiftKey ? last : first;

      if (isAtEdgeOrEscaped(edge, activeEl, containerRef.current)) {
        event.preventDefault();
        target.focus();
      }
    },
    [getFocusable, onEscape]
  );

  useEffect(() => {
    if (!active) return undefined;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Focus the requested element, else the first focusable, else the container.
    const focusTarget =
      initialFocusRef?.current ?? getFocusable()[0] ?? containerRef.current;
    focusTarget?.focus();

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (restoreFocus) previouslyFocused.current?.focus?.();
    };
  }, [active, onKeyDown, getFocusable, initialFocusRef, restoreFocus]);

  return containerRef;
}
