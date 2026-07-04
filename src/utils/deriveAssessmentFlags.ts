// Adapter between the two business-ownership state shapes in this app:
//
//   - EmpireContext / gtaEmpireState_v1: a rich `OwnedBusiness[]` array (id +
//     location + purchased upgrade ids), written by BusinessMatrixPanel /
//     BusinessCard ("Property Matrix" section of the form).
//   - AssessmentContext / gta_assessment_data: the flat `hasX` boolean flags
//     (and the `nightclubSources` map) the scoring engine (computeAssessment /
//     calculateIncome) actually reads.
//
// These were never connected: toggling ownership in Property Matrix updated
// EmpireContext only, so it had zero effect on the score. This derives the
// subset of legacy flags/sources that have an unambiguous, verified match
// and merges them in at assessment time.
//
// nightclubSources correction (2026-07-04): an earlier version of this file
// deliberately left hasCash/hasCoke/hasMeth undedrived, reasoning that
// formData.nightclubSources was a distinct mechanic from owning the
// standalone MC businesses. That was wrong -- calculateNightclubIncome's
// NC_RATES table (calculateIncome.ts) documents exactly which owned business
// unlocks which Nightclub warehouse tech slot (imports=Cocaine Lockup,
// pharma=Meth Lab, cash=Cash Factory, organic=Weed Farm, printing=Document
// Forgery, sporting=Bunker) -- owning the business IS the real-game
// prerequisite for that slot being assignable. MC_TO_NIGHTCLUB below derives
// nightclubSources from ownership of those businesses. NC_RATES has a 7th
// slot, "cargo" (CEO Warehouse/Hangar), which has no corresponding business
// in this app's verifiedProperty data at all -- not derivable, left out.
//
// Still NOT covered (no corresponding business in verifiedProperty data):
//   - hasMansion, hasTowTruck, hasSafehouse, hasPounder, hasMule, hasRaiju,
//     hasGTAPlus.
import type { EmpireState, OwnedBusiness } from '../types/enterprise.types';
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

// businessId -> the NC_RATES / nightclubSources key it unlocks. Keys must
// match calculateIncome.ts's NC_RATES exactly ("cargo" intentionally absent,
// see file header).
export const MC_TO_NIGHTCLUB: Record<string, string> = {
  cocaine_lockup: 'imports',
  meth_lab: 'pharma',
  cash_factory: 'cash',
  weed_farm: 'organic',
  document_forgery: 'printing',
  bunker: 'sporting',
};

/**
 * Derives the legacy scoring-engine boolean flags (and nightclubSources map)
 * from EmpireContext's rich OwnedBusiness[] state. Returns only what it can
 * derive with confidence -- callers should merge this into formData, not
 * replace it.
 */
export function deriveAssessmentFlags(empireState: EmpireState): Partial<AssessmentFormData> {
  const owned: OwnedBusiness[] = empireState?.ownedBusinesses ?? [];
  const ownedById = new Map(owned.map((item) => [item.businessId, item]));

  const flags: Partial<AssessmentFormData> = {};

  for (const { businessId, flag } of BUSINESS_FLAG_MAP) {
    flags[flag] = ownedById.has(businessId);
  }

  for (const { businessId, upgradeId, flag } of UPGRADE_FLAG_MAP) {
    const entry = ownedById.get(businessId);
    flags[flag] = Boolean(entry?.purchasedUpgradeIds?.includes(upgradeId));
  }

  const nightclubSources: Record<string, boolean> = {};
  for (const [businessId, sourceKey] of Object.entries(MC_TO_NIGHTCLUB)) {
    if (ownedById.has(businessId)) {
      nightclubSources[sourceKey] = true;
    }
  }
  if (Object.keys(nightclubSources).length > 0) {
    flags.nightclubSources = nightclubSources;
  }

  return flags;
}

/**
 * Merges derived flags into a copy of formData. nightclubSources is an
 * object, not a boolean -- its keys are unioned rather than OR'd, since
 * Boolean({...}) is always true and would otherwise corrupt the map. Every
 * other key is OR'd: Property Matrix (EmpireContext) and the older
 * AssetToggleCard checkboxes both mark a handful of the same businesses
 * (Oppressor, Armored Kuruma, Agency, Auto Shop, Car Wash) owned -- either
 * path counts as owned, so neither regresses the other.
 */
export function mergeDerivedFlags(
  formData: AssessmentFormData,
  derivedFlags: Partial<AssessmentFormData>
): AssessmentFormData {
  const merged: AssessmentFormData = { ...formData };

  for (const key of Object.keys(derivedFlags) as (keyof AssessmentFormData)[]) {
    if (key === 'nightclubSources') {
      merged.nightclubSources = {
        ...(formData.nightclubSources || {}),
        ...(derivedFlags.nightclubSources || {}),
      };
      continue;
    }
    merged[key] = Boolean(derivedFlags[key]) || Boolean(formData[key]);
  }

  return merged;
}
