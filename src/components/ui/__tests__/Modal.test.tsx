import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

function Harness({ initialOpen = true }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [closedCount, setClosedCount] = useState(0);
  return (
    <div>
      <button onClick={() => setOpen(true)}>trigger</button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setClosedCount((c) => c + 1);
        }}
        title="Vehicle Details"
        footer={<button>Save</button>}
      >
        <button>first</button>
        <button>second</button>
      </Modal>
      <span data-testid="closed-count">{closedCount}</span>
    </div>
  );
}

describe('ui/Modal', () => {
  test('renders with dialog semantics when open', () => {
    render(<Harness />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Vehicle Details')).toBeInTheDocument();
  });

  test('renders nothing when closed', () => {
    render(<Harness initialOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('Escape key calls onClose', () => {
    render(<Harness />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('closed-count')).toHaveTextContent('1');
  });

  test('close button calls onClose', () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('clicking the backdrop (not the panel) closes', () => {
    render(<Harness />);
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('focus moves into the dialog on open (first focusable)', () => {
    render(<Harness />);
    // initial focus lands on the close button (first focusable in the header)
    expect(document.activeElement).toHaveAttribute('aria-label', 'Close dialog');
  });

});
