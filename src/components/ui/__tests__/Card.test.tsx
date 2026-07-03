import { render, screen, fireEvent } from '@testing-library/react';
import { Card } from '../Card';

describe('ui/Card', () => {
  test('renders children', () => {
    render(<Card>content</Card>);
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  test('as prop changes the rendered tag', () => {
    const { container } = render(<Card as="section">x</Card>);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  test('interactive variant is styled as clickable', () => {
    const { container } = render(<Card variant="interactive">x</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  test('passes through arbitrary DOM attributes like onClick and aria-label', () => {
    const onClick = jest.fn();
    render(<Card as="button" onClick={onClick} aria-label="vehicle card">x</Card>);
    const el = screen.getByRole('button', { name: 'vehicle card' });
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
