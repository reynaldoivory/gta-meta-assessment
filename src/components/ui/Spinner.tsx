export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZES = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' } as const;

/** Inline spinner. For a full-screen busy state use LoadingOverlay. */
export function Spinner({ size = 'md', label = 'Loading', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={[
        'inline-block animate-spin rounded-full border-hud-blue/30 border-t-hud-blue',
        SIZES[size],
        className,
      ].join(' ')}
    />
  );
}
