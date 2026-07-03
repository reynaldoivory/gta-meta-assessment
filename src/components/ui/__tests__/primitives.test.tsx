import { render, screen } from '@testing-library/react';
import { SectionHeader } from '../SectionHeader';
import { Stat } from '../Stat';
import { EmptyState } from '../EmptyState';
import { Field, Input } from '../Field';
import { TableWrap, Table, THead, TBody, TR, TH, TD } from '../Table';
import { Spinner } from '../Spinner';
import { LoadingOverlay } from '../LoadingOverlay';

describe('ui/SectionHeader', () => {
  test('renders title, subtitle, and actions', () => {
    render(<SectionHeader title="Property Matrix" subtitle="Expand a section" actions={<button>Expand all</button>} />);
    expect(screen.getByRole('heading', { name: 'Property Matrix' })).toBeInTheDocument();
    expect(screen.getByText('Expand a section')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand all' })).toBeInTheDocument();
  });

  test('as="h3" renders an h3', () => {
    render(<SectionHeader as="h3" title="Sub" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Sub' })).toBeInTheDocument();
  });
});

describe('ui/Stat', () => {
  test('renders label and value', () => {
    render(<Stat label="Empire Value" value="$12.4M" />);
    expect(screen.getByText('Empire Value')).toBeInTheDocument();
    expect(screen.getByText('$12.4M')).toBeInTheDocument();
  });
});

describe('ui/EmptyState', () => {
  test('renders title and description', () => {
    render(<EmptyState title="No report yet" description="Run the assessment first." />);
    expect(screen.getByRole('heading', { name: 'No report yet' })).toBeInTheDocument();
    expect(screen.getByText('Run the assessment first.')).toBeInTheDocument();
  });
});

describe('ui/Field + Input', () => {
  test('label is associated with the input via htmlFor/id', () => {
    render(
      <Field label="Search vehicles" htmlFor="vehicle-search">
        <Input id="vehicle-search" />
      </Field>
    );
    expect(screen.getByLabelText('Search vehicles')).toBeInTheDocument();
  });

  test('error message has role="alert"', () => {
    render(
      <Field label="Amount" htmlFor="amt" error="Enter a valid amount">
        <Input id="amt" />
      </Field>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid amount');
  });
});

describe('ui/Table primitives', () => {
  test('renders a full table structure', () => {
    render(
      <TableWrap>
        <Table>
          <THead>
            <TR><TH>Make</TH></TR>
          </THead>
          <TBody>
            <TR><TD>Obey</TD></TR>
          </TBody>
        </Table>
      </TableWrap>
    );
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Make')).toBeInTheDocument();
    expect(screen.getByText('Obey')).toBeInTheDocument();
  });
});

describe('ui/Spinner + LoadingOverlay', () => {
  test('Spinner exposes an accessible status role', () => {
    render(<Spinner label="Loading garage" />);
    expect(screen.getByRole('status', { name: 'Loading garage' })).toBeInTheDocument();
  });

  test('LoadingOverlay renders its message', () => {
    render(<LoadingOverlay message="Crunching the Numbers..." />);
    expect(screen.getByText('Crunching the Numbers...')).toBeInTheDocument();
  });
});
