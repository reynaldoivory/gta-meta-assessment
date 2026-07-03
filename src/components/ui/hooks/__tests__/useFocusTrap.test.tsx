import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../useFocusTrap';

function Trap({ active, onEscape }: { active: boolean; onEscape: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(active, { onEscape });
  if (!active) return null;
  return (
    <div ref={ref} data-testid="trap">
      <button>first</button>
      <button>second</button>
      <button>last</button>
    </div>
  );
}

function Harness() {
  const [active, setActive] = useState(false);
  return (
    <div>
      <button onClick={() => setActive(true)}>open</button>
      <Trap active={active} onEscape={() => setActive(false)} />
    </div>
  );
}

describe('useFocusTrap', () => {
  test('moves focus into the trapped container on activation (first focusable)', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  test('Escape invokes the onEscape callback', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('trap')).not.toBeInTheDocument();
  });

  test('restores focus to the previously-focused element on deactivation', () => {
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'open' });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(opener).toHaveFocus();
  });

  test('Tab from the last focusable wraps to the first', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    const last = screen.getByRole('button', { name: 'last' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  test('Shift+Tab from the first focusable wraps to the last', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'open' }));
    const first = screen.getByRole('button', { name: 'first' });
    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });
});
