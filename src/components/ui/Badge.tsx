import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  tone?: BadgeTone;
  size?: BadgeSize;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}

// Two-channel HUD: success/info/accent = cyan; warning/danger = pink; neutral = slate-ish.
const TONES: Record<BadgeTone, string> = {
  success: 'bg-hud-blue/15 text-hud-blue border-hud-blue/40',
  info: 'bg-hud-blue/15 text-hud-blue border-hud-blue/40',
  accent: 'bg-hud-blue/15 text-hud-blue border-hud-blue/40',
  warning: 'bg-hud-pink/15 text-accent-pink-text border-hud-pink/40',
  danger: 'bg-hud-pink/15 text-accent-pink-text border-hud-pink/40',
  neutral: 'bg-bg-raised text-text-secondary border-border',
};

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-2xs gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
};

const ICON_SIZES: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

export function Badge({ tone = 'neutral', size = 'md', icon: Icon, className = '', children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide border',
        TONES[tone],
        SIZES[size],
        className,
      ].join(' ')}
    >
      {Icon ? <Icon className={ICON_SIZES[size]} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
