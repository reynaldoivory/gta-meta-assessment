import { render, screen, fireEvent } from '@testing-library/react';
import { EmpireProvider, useEmpire } from '../EmpireContext';
import { STORAGE_KEYS } from '../../utils/storage/appStorage';

function Harness() {
  const { state, setBusinessOwned, updateBusinessLocation, toggleBusinessUpgrade, setBunkerStaffAllocation, clearOwnedBusinesses } = useEmpire();
  const bunker = state.ownedBusinesses.find((b) => b.businessId === 'bunker');

  return (
    <div>
      <button onClick={() => setBusinessOwned('bunker', true, 'bunker_paleto')}>own bunker</button>
      <button onClick={() => setBusinessOwned('bunker', false)}>disown bunker</button>
      <button onClick={() => updateBusinessLocation('bunker', 'bunker_chumash')}>move bunker</button>
      <button onClick={() => toggleBusinessUpgrade('bunker', 'bunker_equipment')}>toggle upgrade</button>
      <button onClick={() => setBunkerStaffAllocation('bunker', 'research')}>set research</button>
      <button onClick={() => setBunkerStaffAllocation('bunker', 'both')}>set both</button>
      <button onClick={clearOwnedBusinesses}>clear all</button>
      <div data-testid="owned-count">{state.ownedBusinesses.length}</div>
      <div data-testid="location">{bunker?.locationId ?? 'none'}</div>
      <div data-testid="upgrades">{bunker?.purchasedUpgradeIds.join(',') ?? 'none'}</div>
      <div data-testid="staff-allocation">{bunker?.staffAllocation ?? 'unset'}</div>
    </div>
  );
}

const renderHarness = () => render(<EmpireProvider><Harness /></EmpireProvider>);

describe('EmpireContext', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.EMPIRE_STATE);
  });

  test('starts with no owned businesses', () => {
    renderHarness();
    expect(screen.getByTestId('owned-count')).toHaveTextContent('0');
  });

  test('setBusinessOwned adds then removes an entry', () => {
    renderHarness();
    fireEvent.click(screen.getByText('own bunker'));
    expect(screen.getByTestId('owned-count')).toHaveTextContent('1');
    expect(screen.getByTestId('location')).toHaveTextContent('bunker_paleto');

    fireEvent.click(screen.getByText('disown bunker'));
    expect(screen.getByTestId('owned-count')).toHaveTextContent('0');
  });

  test('updateBusinessLocation changes only the matching entry', () => {
    renderHarness();
    fireEvent.click(screen.getByText('own bunker'));
    fireEvent.click(screen.getByText('move bunker'));
    expect(screen.getByTestId('location')).toHaveTextContent('bunker_chumash');
  });

  test('toggleBusinessUpgrade adds then removes an upgrade id', () => {
    renderHarness();
    fireEvent.click(screen.getByText('own bunker'));
    fireEvent.click(screen.getByText('toggle upgrade'));
    expect(screen.getByTestId('upgrades')).toHaveTextContent('bunker_equipment');

    fireEvent.click(screen.getByText('toggle upgrade'));
    expect(screen.getByTestId('upgrades')).toBeEmptyDOMElement();
  });

  test('setBunkerStaffAllocation sets and can be changed to any of the three values', () => {
    renderHarness();
    fireEvent.click(screen.getByText('own bunker'));
    expect(screen.getByTestId('staff-allocation')).toHaveTextContent('unset');

    fireEvent.click(screen.getByText('set research'));
    expect(screen.getByTestId('staff-allocation')).toHaveTextContent('research');

    fireEvent.click(screen.getByText('set both'));
    expect(screen.getByTestId('staff-allocation')).toHaveTextContent('both');
  });

  test('setBunkerStaffAllocation is a no-op when the business is not owned', () => {
    renderHarness();
    fireEvent.click(screen.getByText('set research'));
    expect(screen.getByTestId('owned-count')).toHaveTextContent('0');
    expect(screen.getByTestId('staff-allocation')).toHaveTextContent('unset');
  });

  test('clearOwnedBusinesses empties the list', () => {
    renderHarness();
    fireEvent.click(screen.getByText('own bunker'));
    fireEvent.click(screen.getByText('clear all'));
    expect(screen.getByTestId('owned-count')).toHaveTextContent('0');
  });

  test('persists to localStorage under STORAGE_KEYS.EMPIRE_STATE', () => {
    renderHarness();
    fireEvent.click(screen.getByText('own bunker'));
    const raw = localStorage.getItem(STORAGE_KEYS.EMPIRE_STATE);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).ownedBusinesses).toHaveLength(1);
  });
});
