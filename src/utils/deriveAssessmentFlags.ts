// Adapter between the two business-ownership state shapes in this app:
//
//   - EmpireContext / gtaEmpireState_v1: a rich `OwnedBusiness[]` array (id +
//     location + purchased upgrade ids), written by BusinessMatrixPanel /
//     BusinessCard ("Property Matrix" section of the form).
//   - AssessmentContext / gta_assessment_data: the flat `hasX` boolean flags
//     the scoring engine (computeAssessment / calculateIncome) actually reads.
//
// These were never connected: toggling ownership in Property Matrix updated
// EmpireContext only, so it had zero effect on the score. This derives the
// subset of legacy flags that have an unambiguous, verified 1:1 business-id
// match and merges them in at assessment time.
//
// Deliberately NOT covered (left to their existing flat-flag source, usually
// AssetToggleCard, or currently unset):
//   - hasCash / hasCoke / hasMeth: these read `formData.nightclubSources`,
//     a distinct Nightclub-goods mechanic, not the standalone MC businesses
//     (cocaine_lockup / meth_lab / cash_factory). Mapping them by name
//     similarity would conflate two different game mechanics and silently
//     miscalculate income for anyone who owns both a Nightclub and these
//     businesses.
//   - hasMansion, hasTowTruck, hasSafehouse, hasPounder, hasMule, hasRaiju,
//     hasGTAPlus: no corresponding business exists in verifiedProperty data.
import type { EmpireState } from '../types/enterprise.types';
import type { AssessmentFormData } from '../types/domain.types';

interface BusinessFlagMapping {
  businessId: string;
  flag: keyof AssessmentFormData;
}

const BUSINESS_FLAG_MAP: BusinessFlagMapping[] = [
  { businessId: 'kosatka', flag: 'hasKosatka' },
  { businessId: 'nightclub', flag: 'hasNightclub' },
  { businessId: 'bunker', flag: 'hasBunker' },
  { businessId: 'acid_lab', flag: 'hasAcidLab' },
  { businessId: 'agency', flag: 'hasAgency' },
  { businessId: 'auto_shop', flag: 'hasAutoShop' },
  { businessId: 'car_wash', flag: 'hasCarWash' },
  { businessId: 'weed_farm', flag: 'hasWeedFarm' },
  { businessId: 'salvage_yard', flag: 'hasSalvageYard' },
  { businessId: 'higgins_helitours', flag: 'hasHeliTours' },
  { businessId: 'oppressor_mk2', flag: 'hasOppressor' },
  { businessId: 'armored_kuruma', flag: 'hasArmoredKuruma' },
];

// Upgrade-level derivations: whether a specific purchased upgrade on an owned
// business should flip a legacy "X is upgraded" multiplier flag.
const UPGRADE_FLAG_MAP: Array<{ businessId: string; upgradeId: string; flag: keyof AssessmentFormData }> = [
  { businessId: 'bunker', upgradeId: 'bunker_equipment', flag: 'bunkerUpgraded' },
  { businessId: 'acid_lab', upgradeId: 'acid_equipment', flag: 'acidLabUpgraded' },
  { businessId: 'kosatka', upgradeId: 'kosatka_sparrow', flag: 'hasSparrow' },
];

/**
 * Derives the legacy scoring-engine boolean flags from EmpireContext's rich
 * OwnedBusiness[] state. Returns only the flags it can derive with
 * confidence -- callers should merge this into formData, not replace it.
 */
export function deriveAssessmentFlags(empireState: EmpireState): Partial<AssessmentFormData> {
  const owned = empireState?.ownedBusinesses ?? [];
  const ownedById = new Map(owned.map((item) => [item.businessId, item]));

  const flags: Partial<AssessmentFormData> = {};

  for (const { businessId, flag } of BUSINESS_FLAG_MAP) {
    flags[flag] = ownedById.has(businessId);
  }

  for (const { businessId, upgradeId, flag } of UPGRADE_FLAG_MAP) {
    const entry = ownedById.get(businessId);
    flags[flag] = Boolean(entry?.purchasedUpgradeIds?.includes(upgradeId));
  }

  return flags;
}
