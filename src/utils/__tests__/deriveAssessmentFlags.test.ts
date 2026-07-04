import { deriveAssessmentFlags, mergeDerivedFlags } from '../deriveAssessmentFlags';
import type { EmpireState } from '../../types/enterprise.types';
import type { AssessmentFormData } from '../../types/domain.types';

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

  test('clubhouse has no legacy flag or nightclubSources counterpart', () => {
    const flags = deriveAssessmentFlags(withOwned('clubhouse'));
    expect(Object.entries(flags).filter(([k]) => k !== 'nightclubSources').every(([, v]) => v === false)).toBe(true);
    expect(flags.nightclubSources).toBeUndefined();
  });

  test('derives nightclubSources from the MC businesses that unlock a Nightclub tech slot', () => {
    const flags = deriveAssessmentFlags(withOwned('cocaine_lockup', 'meth_lab', 'cash_factory', 'weed_farm', 'document_forgery', 'bunker'));
    expect(flags.nightclubSources).toEqual({
      imports: true,
      pharma: true,
      cash: true,
      organic: true,
      printing: true,
      sporting: true,
    });
    // weed_farm also has its own direct legacy flag (hasWeedFarm) -- both are
    // legitimately true at once, they're not mutually exclusive.
    expect(flags.hasWeedFarm).toBe(true);
  });

  test('omits nightclubSources entirely when no unlocking business is owned', () => {
    const flags = deriveAssessmentFlags(withOwned('kosatka', 'agency'));
    expect(flags.nightclubSources).toBeUndefined();
  });

  test('does not invent a "cargo" nightclubSources key -- no CEO Warehouse/Hangar business exists in this app\'s data to derive it from', () => {
    const flags = deriveAssessmentFlags(withOwned('cocaine_lockup'));
    expect(flags.nightclubSources).toEqual({ imports: true });
    expect(flags.nightclubSources).not.toHaveProperty('cargo');
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

describe('mergeDerivedFlags', () => {
  test('OR-merges boolean flags -- either path marking a business owned counts', () => {
    const formData = { hasOppressor: true, hasAgency: false } as AssessmentFormData;
    const merged = mergeDerivedFlags(formData, { hasOppressor: false, hasAgency: true });
    expect(merged.hasOppressor).toBe(true);
    expect(merged.hasAgency).toBe(true);
  });

  test('unions nightclubSources keys instead of collapsing the object to a boolean', () => {
    const formData = { nightclubSources: { printing: true } } as AssessmentFormData;
    const merged = mergeDerivedFlags(formData, { nightclubSources: { imports: true, sporting: true } });
    expect(merged.nightclubSources).toEqual({ printing: true, imports: true, sporting: true });
  });

  test('does not mutate the original formData object', () => {
    const formData = { hasKosatka: false } as AssessmentFormData;
    mergeDerivedFlags(formData, { hasKosatka: true });
    expect(formData.hasKosatka).toBe(false);
  });
});
