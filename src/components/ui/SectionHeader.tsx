import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
}

const TITLE_SIZE = { h2: 'text-xl', h3: 'text-lg' } as const;

export function SectionHeader({ title, subtitle, icon: Icon, actions, as = 'h2', className = '' }: SectionHeaderProps) {
  const Heading = as;
  return (
    <div className={['flex items-start justify-between gap-4', className].join(' ')}>
      <div className="flex items-center gap-3">
        {Icon ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-hud-blue/10 text-hud-blue">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
        <div>
          <Heading className={['font-display font-bold text-text-primary', TITLE_SIZE[as]].join(' ')}>
            {title}
          </Heading>
          {subtitle ? <p className="text-sm text-text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
