import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes, HTMLAttributes } from 'react';

// Styled table primitives. Row/sort logic stays in the consumer (e.g. VehicleTable);
// this only owns the Arcade HUD styling + a horizontal-scroll wrapper.

export function TableWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['overflow-x-auto rounded-xl border border-border-subtle', className].join(' ')}>{children}</div>;
}

export function Table({ children, className = '', ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table className={['w-full border-collapse text-sm', className].join(' ')} {...rest}>
      {children}
    </table>
  );
}

export function THead({ children, className = '', ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={['bg-bg-raised/60', className].join(' ')} {...rest}>
      {children}
    </thead>
  );
}

export function TBody({ children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...rest}>{children}</tbody>;
}

export function TR({ children, className = '', ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={['border-b border-border-subtle last:border-0', className].join(' ')} {...rest}>
      {children}
    </tr>
  );
}

export function TH({ children, className = '', ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={[
        'px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wider text-text-muted',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </th>
  );
}

export function TD({ children, className = '', ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={['px-3 py-2 text-text-secondary', className].join(' ')} {...rest}>
      {children}
    </td>
  );
}
