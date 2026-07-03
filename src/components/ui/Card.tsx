import type { ElementType, ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md';

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

const VARIANTS: Record<CardVariant, string> = {
  default: 'bg-bg-surface border border-border-subtle',
  elevated: 'bg-bg-raised border border-border shadow-float',
  interactive:
    'bg-bg-surface border border-border-subtle transition-colors hover:border-border cursor-pointer',
};

const PADDING: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  as: Tag = 'div',
  className = '',
  children,
}: CardProps) {
  return (
    <Tag className={['rounded-2xl', VARIANTS[variant], PADDING[padding], className].join(' ')}>
      {children}
    </Tag>
  );
}
