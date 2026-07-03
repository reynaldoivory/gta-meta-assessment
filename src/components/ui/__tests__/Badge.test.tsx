import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('ui/Badge', () => {
  test('renders label text', () => {
    render(<Badge>GTA+ Required</Badge>);
    expect(screen.getByText('GTA+ Required')).toBeInTheDocument();
  });

  test.each(['success', 'warning', 'danger', 'info', 'neutral', 'accent'] as const)(
    'renders the %s tone without throwing',
    (tone) => {
      render(<Badge tone={tone}>{tone}</Badge>);
      expect(screen.getByText(tone)).toBeInTheDocument();
    }
  );

  test('danger/warning tones use the pink channel, success/info/accent use the blue channel', () => {
    const { container: pinkContainer } = render(<Badge tone="danger">x</Badge>);
    expect(pinkContainer.firstChild).toHaveClass('bg-hud-pink/15');
    const { container: blueContainer } = render(<Badge tone="success">x</Badge>);
    expect(blueContainer.firstChild).toHaveClass('bg-hud-blue/15');
  });
});
