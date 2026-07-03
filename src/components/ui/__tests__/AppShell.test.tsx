import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../AppShell';

describe('ui/AppShell', () => {
  test('renders title and children', () => {
    render(<AppShell title="Heist Planning Board">content</AppShell>);
    expect(screen.getByRole('heading', { name: 'Heist Planning Board' })).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('nav item onSelect fires when clicked', () => {
    const onSelect = jest.fn();
    render(
      <AppShell
        title="T"
        nav={[
          { label: 'Planning Board', active: true, onSelect: jest.fn() },
          { label: 'Garage', active: false, onSelect },
        ]}
      >
        x
      </AppShell>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Garage' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test('active nav item exposes aria-current="page"', () => {
    render(
      <AppShell title="T" nav={[{ label: 'Garage', active: true, onSelect: jest.fn() }]}>
        x
      </AppShell>
    );
    expect(screen.getByRole('button', { name: 'Garage' })).toHaveAttribute('aria-current', 'page');
  });

  test('onBack renders a back action that fires', () => {
    const action = jest.fn();
    render(
      <AppShell title="T" onBack={{ label: 'Back to Planning Board', action }}>
        x
      </AppShell>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back to Planning Board' }));
    expect(action).toHaveBeenCalledTimes(1);
  });

  test('does not import or require AssessmentContext (stays presentational)', () => {
    // Renders standalone with no providers -- would throw if it depended on context.
    expect(() => render(<AppShell title="T">x</AppShell>)).not.toThrow();
  });
});
