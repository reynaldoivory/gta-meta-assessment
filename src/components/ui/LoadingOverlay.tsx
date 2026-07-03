import { Spinner } from './Spinner';

export interface LoadingOverlayProps {
  message?: string;
}

/** Full-screen busy overlay (replaces the elaborate old LoadingSpinner). */
export function LoadingOverlay({ message = 'Crunching the numbers...' }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg-overlay backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" label={message} />
      <p className="font-display text-lg font-semibold text-text-primary">{message}</p>
    </div>
  );
}
