import { render, screen } from '@testing-library/react';
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
});
