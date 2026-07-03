import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children?: ReactNode;
}

// Arcade HUD: cyan = primary/actionable, pink = danger/caution. Dark ink on fills.
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-hud-blue text-bg-base border border-hud-blue hover:brightness-110 active:brightness-95 shadow-glow-blue',
  secondary:
    'bg-hud-blue/10 text-hud-blue border border-hud-blue/40 hover:bg-hud-blue/20 active:brightness-95',
  accent:
    'bg-hud-blue/10 text-hud-blue border border-hud-blue/40 hover:bg-hud-blue/20 active:brightness-95',
  danger:
    'bg-hud-pink text-bg-base border border-hud-pink hover:brightness-110 active:brightness-95 shadow-glow-pink',
  ghost:
    'bg-transparent text-text-secondary border border-transparent hover:bg-hud-blue/10 hover:text-text-primary',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className: string
): string {
  return [
    'inline-flex items-center justify-center rounded-xl font-semibold font-display tracking-tight',
    'transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ');
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const iconEl = Icon ? <Icon className={ICON_SIZES[size]} aria-hidden="true" /> : null;
  return (
    <button
      type={type}
      className={getButtonClassName(variant, size, fullWidth, className)}
      {...rest}
    >
      {iconPosition === 'left' && iconEl}
      {children}
      {iconPosition === 'right' && iconEl}
    </button>
  );
}
