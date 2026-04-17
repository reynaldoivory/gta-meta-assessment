import { prioritizeActions } from '../actionPriority';

const make = (overrides = {}) => ({
  id: overrides.id || 'action',
  urgent: false,
  critical: false,
  impact: 'low',
  savingsPerHour: 0,
  timeHours: 1,
  ...overrides,
});

describe('prioritizeActions', () => {
  it('returns a new array without mutating the input', () => {
    const input = [make({ id: 'a' }), make({ id: 'b' })];
    const snapshot = [...input];
    const result = prioritizeActions(input, 0, 0);
    expect(result).not.toBe(input);
    expect(input).toEqual(snapshot);
  });

  it('puts urgent items before non-urgent regardless of ROI', () => {
    const items = [
      make({ id: 'roi', savingsPerHour: 999999 }),
      make({ id: 'exp', urgent: true, expiresAt: 100 }),
    ];
    const [first] = prioritizeActions(items, 0, 0);
    expect(first.id).toBe('exp');
  });

  it('orders multiple urgent items by expiresAt ascending', () => {
    const items = [
      make({ id: 'late', urgent: true, expiresAt: 500 }),
      make({ id: 'soon', urgent: true, expiresAt: 100 }),
      make({ id: 'mid', urgent: true, expiresAt: 250 }),
    ];
    expect(prioritizeActions(items, 0, 0).map((x) => x.id)).toEqual([
      'soon',
      'mid',
      'late',
    ]);
  });

  it('prefers critical-blocker (critical + high impact) over plain high ROI', () => {
    const items = [
      make({ id: 'roi', savingsPerHour: 10000 }),
      make({ id: 'block', critical: true, impact: 'high' }),
    ];
    const [first] = prioritizeActions(items, 0, 0);
    expect(first.id).toBe('block');
  });

  it('uses savingsPerHour (descending) as the ROI tiebreaker', () => {
    const items = [
      make({ id: 'low', savingsPerHour: 100 }),
      make({ id: 'high', savingsPerHour: 5000 }),
      make({ id: 'mid', savingsPerHour: 1000 }),
    ];
    expect(prioritizeActions(items, 0, 0).map((x) => x.id)).toEqual([
      'high',
      'mid',
      'low',
    ]);
  });

  it('prefers shorter timeHours when ROI is tied', () => {
    const items = [
      make({ id: 'slow', timeHours: 10 }),
      make({ id: 'quick', timeHours: 0.5 }),
    ];
    expect(prioritizeActions(items, 0, 0).map((x) => x.id)).toEqual([
      'quick',
      'slow',
    ]);
  });

  it('uses impact rank (high > medium > low) as final tiebreaker', () => {
    const items = [
      make({ id: 'low', impact: 'low' }),
      make({ id: 'hi', impact: 'high' }),
      make({ id: 'med', impact: 'medium' }),
    ];
    expect(prioritizeActions(items, 0, 0).map((x) => x.id)).toEqual([
      'hi',
      'med',
      'low',
    ]);
  });

  it('handles empty input', () => {
    expect(prioritizeActions([], 0, 0)).toEqual([]);
  });

  it('defaults expiresAt to Infinity when missing', () => {
    const items = [
      make({ id: 'no-exp', urgent: true }),
      make({ id: 'has-exp', urgent: true, expiresAt: 1 }),
    ];
    expect(prioritizeActions(items, 0, 0).map((x) => x.id)).toEqual([
      'has-exp',
      'no-exp',
    ]);
  });
});
