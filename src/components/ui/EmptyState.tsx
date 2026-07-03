import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Token-based rewrite of the old shared/EmptyState (which used raw slate). */
export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={['flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className].join(' ')}>
      {Icon ? <Icon className="h-12 w-12 text-text-muted/60" aria-hidden="true" /> : null}
      <h3 className="font-display text-lg font-bold text-text-secondary">{title}</h3>
      {description ? <p className="max-w-md text-sm text-text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
