import {
  getPlayerPhase,
  getActivityRequirements,
  checkStatRequirements,
} from '../dynamicIncome';

describe('getPlayerPhase', () => {
  it('returns SURVIVAL for liquidCash below 500k', () => {
    expect(getPlayerPhase(0)).toBe('SURVIVAL');
    expect(getPlayerPhase(499_999)).toBe('SURVIVAL');
  });

  it('returns GROWTH between 500k and 2M', () => {
    expect(getPlayerPhase(500_000)).toBe('GROWTH');
    expect(getPlayerPhase(1_999_999)).toBe('GROWTH');
  });

  it('returns OPTIMIZATION at or above 2M', () => {
    expect(getPlayerPhase(2_000_000)).toBe('OPTIMIZATION');
    expect(getPlayerPhase(100_000_000)).toBe('OPTIMIZATION');
  });
});

describe('getActivityRequirements', () => {
  it('matches Auto Shop Contracts on first-word prefix', () => {
    expect(getActivityRequirements('Auto Shop Contracts')).toEqual({
      strength: 60,
      flying: 40,
      shooting: 50,
    });
  });

  it('matches Cayo Perico', () => {
    expect(getActivityRequirements('Cayo Perico')).toEqual({
      strength: 50,
      flying: 50,
    });
  });

  it('is case-insensitive on the activity prefix', () => {
    expect(getActivityRequirements('bunker sales tonight')).toEqual({
      driving: 60,
    });
  });

  it('returns null when nothing matches', () => {
    expect(getActivityRequirements('Something Else Entirely')).toBeNull();
  });
});

describe('checkStatRequirements', () => {
  const fullStats = {
    strength: 5,
    flying: 5,
    shooting: 5,
    driving: 5,
    stealth: 5,
    stamina: 5,
  };

  it('returns meets=true when requirements are null', () => {
    expect(checkStatRequirements(fullStats, null)).toEqual({
      meets: true,
      missing: [],
    });
  });

  it('returns meets=true when all stats are maxed', () => {
    expect(
      checkStatRequirements(fullStats, { strength: 60, shooting: 60 })
    ).toEqual({ meets: true, missing: [] });
  });

  it('returns meets=false and lists missing stats with percent labels', () => {
    const weak = { ...fullStats, strength: 1 };
    const result = checkStatRequirements(weak, {
      strength: 60,
      shooting: 60,
    });
    expect(result.meets).toBe(false);
    expect(result.missing).toContain('Strength 60%');
    expect(result.missing).not.toContain('Shooting 60%');
  });

  it('converts stat bars to percent by multiplying by 20', () => {
    const barely = { ...fullStats, strength: 3 };
    expect(
      checkStatRequirements(barely, { strength: 60 }).meets
    ).toBe(true);
    expect(
      checkStatRequirements(barely, { strength: 61 }).meets
    ).toBe(false);
  });
});
