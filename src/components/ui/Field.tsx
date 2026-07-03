import type { InputHTMLAttributes, ReactNode } from 'react';

export interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a control with a properly-associated <label> (fixes the FilterPanel
 * placeholder-only inputs). Pass the control as children with a matching id.
 */
export function Field({ label, htmlFor, hint, error, hideLabel = false, className = '', children }: FieldProps) {
  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      <label
        htmlFor={htmlFor}
        className={hideLabel ? 'sr-only' : 'text-sm font-semibold text-text-secondary'}
      >
        {label}
      </label>
      {children}
      {hint && !error ? <span className="text-xs text-text-muted">{hint}</span> : null}
      {error ? (
        <span className="text-xs text-accent-pink-text" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid = false, className = '', ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={[
        'w-full rounded-xl bg-bg-raised px-4 py-2.5 text-text-primary placeholder-text-muted',
        'border-2 transition-colors focus:outline-none',
        invalid ? 'border-hud-pink/60 focus:border-hud-pink' : 'border-border focus:border-border-focus',
        className,
      ].join(' ')}
      {...rest}
    />
  );
}
