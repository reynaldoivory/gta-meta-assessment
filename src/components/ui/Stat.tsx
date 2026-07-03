import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { BadgeTone } from './Badge';

export type StatSize = 'sm' | 'md' | 'lg';

export interface StatProps {
  label: string;
  value: ReactNode;
  sublabel?: string;
  tone?: BadgeTone;
  icon?: LucideIcon;
  size?: StatSize;
  className?: string;
}

const VALUE_TONE: Record<BadgeTone, string> = {
  success: 'text-hud-blue',
  info: 'text-hud-blue',
  accent: 'text-hud-blue',
  warning: 'text-accent-pink-text',
  danger: 'text-accent-pink-text',
  neutral: 'text-text-primary',
};

const VALUE_SIZE: Record<StatSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

/**
 * Read-only label/value tile used across results, banners, and progress panels.
 * Numbers render in the mono (Fira Code) face with tabular figures.
 */
export function Stat({ label, value, sublabel, tone = 'neutral', icon: Icon, size = 'md', className = '' }: StatProps) {
  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-text-muted">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </span>
      <span className={['font-mono font-bold tabular-nums', VALUE_SIZE[size], VALUE_TONE[tone]].join(' ')}>
        {value}
      </span>
      {sublabel ? <span className="text-xs text-text-muted">{sublabel}</span> : null}
    </div>
  );
}
