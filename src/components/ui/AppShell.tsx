import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './Button';

export interface AppShellNavItem {
  label: string;
  active: boolean;
  onSelect: () => void;
}

export interface AppShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional top nav (Planning Board / Report / Garage). */
  nav?: AppShellNavItem[];
  /** Optional back affordance rendered before the title. */
  onBack?: { label: string; action: () => void };
  /** Header-right actions (Save / Clear / Garage buttons). */
  actions?: ReactNode;
  width?: 'default' | 'wide';
  children: ReactNode;
}

const WIDTHS = { default: 'max-w-5xl', wide: 'max-w-7xl' } as const;

/**
 * Shared page frame that unifies the previously-divergent per-view wrappers
 * (each view used to hand-roll its own back button + base classes, and they
 * disagreed). Presentational only -- views pass step handlers in, so this never
 * imports AssessmentContext and stays trivially testable.
 */
export function AppShell({ title, subtitle, nav, onBack, actions, width = 'default', children }: AppShellProps) {
  return (
    <div className={['mx-auto w-full px-4 py-6 md:px-8 md:py-10', WIDTHS[width]].join(' ')}>
      <header className="mb-6 flex flex-col gap-4 md:mb-8">
        {onBack ? (
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack.action} className="self-start">
            {onBack.label}
          </Button>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-black tracking-tight text-text-primary md:text-5xl">
              {title}
            </h1>
            {subtitle ? <p className="mt-1 text-sm text-text-secondary md:text-base">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>

        {nav && nav.length > 0 ? (
          <nav aria-label="Primary" className="flex flex-wrap gap-2 border-b border-border-subtle pb-3">
            {nav.map((item) => (
              <Button
                key={item.label}
                variant={item.active ? 'primary' : 'ghost'}
                size="sm"
                aria-current={item.active ? 'page' : undefined}
                onClick={item.onSelect}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        ) : (
          <div className="h-px w-full bg-gradient-to-r from-hud-blue/40 via-border to-transparent" />
        )}
      </header>
      {children}
    </div>
  );
}
