import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Target } from 'lucide-react';

describe('ui/Button', () => {
  test('renders children and responds to click', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Run Assessment</Button>);
    const btn = screen.getByRole('button', { name: 'Run Assessment' });
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('defaults to type="button" (never submits a form by accident)', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  test('disabled button does not fire onClick', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick} disabled>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test.each(['primary', 'secondary', 'accent', 'ghost', 'danger'] as const)(
    'renders the %s variant without throwing',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button', { name: variant })).toBeInTheDocument();
    }
  );

  test('renders an icon when provided', () => {
    render(<Button icon={Target}>Goal</Button>);
    const btn = screen.getByRole('button', { name: 'Goal' });
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });

  test('fullWidth applies w-full', () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});
