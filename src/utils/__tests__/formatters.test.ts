import {
  formatCurrency,
  formatDollars,
  formatPriceShort,
  formatHours,
  formatHoursShort,
} from '../formatters';

describe('formatCurrency', () => {
  it('returns empty string for empty input', () => {
    expect(formatCurrency('')).toBe('');
    expect(formatCurrency(null as unknown as string)).toBe('');
    expect(formatCurrency(undefined as unknown as string)).toBe('');
  });

  it('returns the original value for NaN', () => {
    expect(formatCurrency('abc')).toBe('abc');
  });

  it('formats a number with locale separators', () => {
    expect(formatCurrency(1000)).toBe('1,000');
    expect(formatCurrency(1234567)).toBe('1,234,567');
  });

  it('formats numeric strings', () => {
    expect(formatCurrency('5000')).toBe('5,000');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('0');
  });
});

describe('formatDollars', () => {
  it('prefixes the dollar sign', () => {
    expect(formatDollars(100)).toBe('$100');
    expect(formatDollars(2500000)).toBe('$2,500,000');
  });

  it('falls back to $0 for falsy or NaN', () => {
    expect(formatDollars(0)).toBe('$0');
    expect(formatDollars('')).toBe('$0');
    expect(formatDollars('not a number')).toBe('$0');
  });
});

describe('formatPriceShort', () => {
  it('returns dash for zero or non-finite', () => {
    expect(formatPriceShort(0)).toBe('—');
    expect(formatPriceShort('')).toBe('—');
    expect(formatPriceShort('abc')).toBe('—');
    expect(formatPriceShort(NaN)).toBe('—');
  });

  it('formats millions with two decimal places', () => {
    expect(formatPriceShort(1_250_000)).toBe('$1.25M');
    expect(formatPriceShort(10_000_000)).toBe('$10.00M');
  });

  it('formats thousands with no decimals', () => {
    expect(formatPriceShort(450_000)).toBe('$450K');
    expect(formatPriceShort(1_000)).toBe('$1K');
  });

  it('formats under 1000 as a raw dollar amount', () => {
    expect(formatPriceShort(999)).toBe('$999');
    expect(formatPriceShort(1)).toBe('$1');
  });
});

describe('formatHours', () => {
  it('returns 0 for non-finite values', () => {
    expect(formatHours(NaN)).toBe('0');
    expect(formatHours(Infinity)).toBe('0');
  });

  it('keeps integers whole', () => {
    expect(formatHours(5)).toBe('5');
    expect(formatHours(0)).toBe('0');
  });

  it('shows two decimal places for fractional values', () => {
    expect(formatHours(1.5)).toBe('1.50');
    expect(formatHours(2.345)).toBe('2.35');
  });
});

describe('formatHoursShort', () => {
  it('always renders one decimal place', () => {
    expect(formatHoursShort(5)).toBe('5.0');
    expect(formatHoursShort(1.25)).toBe('1.3');
    expect(formatHoursShort(0)).toBe('0.0');
  });
});
