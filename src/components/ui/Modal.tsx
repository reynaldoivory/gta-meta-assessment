import { useEffect, useId } from 'react';
import type { ReactNode, RefObject } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from './hooks/useFocusTrap';
import { Button } from './Button';

export type ModalSize = 'md' | 'lg' | 'full-mobile';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  size?: ModalSize;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement>;
  children: ReactNode;
}

const SIZES: Record<ModalSize, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  'full-mobile': 'max-w-2xl max-sm:max-w-none max-sm:h-full max-sm:rounded-none',
};

/**
 * Accessible dialog: role="dialog" + aria-modal, labelled by its title, focus
 * trapped (via useFocusTrap: Escape closes, focus restores on unmount), body
 * scroll locked while open. Backdrop click closes.
 */
export function Modal({ open, onClose, title, size = 'lg', footer, initialFocusRef, children }: ModalProps) {
  const titleId = useId();
  const containerRef = useFocusTrap<HTMLDivElement>(open, { onEscape: onClose, initialFocusRef });

  useEffect(() => {
    if (!open) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-overlay backdrop-blur-sm max-sm:p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-float-lg',
          SIZES[size],
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-6 py-4">
          <h2 id={titleId} className="font-display text-lg font-bold text-text-primary">
            {title}
          </h2>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close dialog" />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-3 border-t border-border-subtle px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
