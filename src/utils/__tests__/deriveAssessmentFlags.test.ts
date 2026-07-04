import { deriveAssessmentFlags } from '../deriveAssessmentFlags';
import type { EmpireState } from '../../types/enterprise.types';

const emptyState: EmpireState = { ownedBusinesses: [], ownedVehicles: [] };

const withOwned = (...ids: string[]): EmpireState => ({
  ownedBusinesses: ids.map((businessId) => ({ businessId, locationId: '', purchasedUpgradeIds: [] })),
  ownedVehicles: [],
});

describe('deriveAssessmentFlags', () => {
  test('every mapped flag is false when nothing is owned', () => {
    const flags = deriveAssessmentFlags(emptyState);
    expect(flags.hasKosatka).toBe(false);
    expect(flags.hasNightclub).toBe(false);
    expect(flags.hasBunker).toBe(false);
    expect(flags.hasAcidLab).toBe(false);
    expect(flags.hasAgency).toBe(false);
    expect(flags.hasAutoShop).toBe(false);
    expect(flags.hasCarWash).toBe(false);
    expect(flags.hasWeedFarm).toBe(false);
    expect(flags.hasSalvageYard).toBe(false);
    expect(flags.hasHeliTours).toBe(false);
    expect(flags.hasOppressor).toBe(false);
    expect(flags.hasArmoredKuruma).toBe(false);
  });

  test('flips the matching flag true for each owned business', () => {
    const flags = deriveAssessmentFlags(withOwned('kosatka', 'nightclub', 'oppressor_mk2'));
    expect(flags.hasKosatka).toBe(true);
    expect(flags.hasNightclub).toBe(true);
    expect(flags.hasOppressor).toBe(true);
    expect(flags.hasBunker).toBe(false);
  });

  test('is unaffected by businesses with no legacy flag counterpart', () => {
    const flags = deriveAssessmentFlags(withOwned('cocaine_lockup', 'meth_lab', 'cash_factory', 'clubhouse'));
    expect(Object.values(flags).every((v) => v === false)).toBe(true);
  });

  test('does not derive hasCash/hasCoke/hasMeth from the standalone MC businesses', () => {
    const flags = deriveAssessmentFlags(withOwned('cocaine_lockup', 'meth_lab', 'cash_factory'));
    expect(flags).not.toHaveProperty('hasCoke');
    expect(flags).not.toHaveProperty('hasMeth');
    expect(flags).not.toHaveProperty('hasCash');
  });

  test('derives bunkerUpgraded/acidLabUpgraded/hasSparrow from purchased upgrade ids', () => {
    const state: EmpireState = {
      ownedBusinesses: [
        { businessId: 'bunker', locationId: '', purchasedUpgradeIds: ['bunker_equipment'] },
        { businessId: 'acid_lab', locationId: '', purchasedUpgradeIds: [] },
        { businessId: 'kosatka', locationId: '', purchasedUpgradeIds: ['kosatka_sparrow'] },
      ],
      ownedVehicles: [],
    };
    const flags = deriveAssessmentFlags(state);
    expect(flags.bunkerUpgraded).toBe(true);
    expect(flags.acidLabUpgraded).toBe(false);
    expect(flags.hasSparrow).toBe(true);
  });

  test('handles a missing/malformed empire state gracefully', () => {
    expect(() => deriveAssessmentFlags(undefined as unknown as EmpireState)).not.toThrow();
    expect(deriveAssessmentFlags(undefined as unknown as EmpireState).hasKosatka).toBe(false);
  });
});
