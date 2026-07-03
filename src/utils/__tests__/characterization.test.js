/**
 * Characterization tests -- refactor safety net for the 2026-07 UX overhaul.
 *
 * Captures the full assessment-engine output (computeAssessment + the two
 * action-plan builders) for six fixed player profiles and asserts it never
 * drifts while UI code is restructured. These are NOT behavior specs; they
 * pin whatever the engine produced when the goldens were captured.
 *
 * The system clock is frozen at 2026-07-05T12:00:00Z -- inside the Jul 2-13
 * Independence Day event window -- so weekly-event math is exercised and
 * date-dependent output stays stable.
 *
 * If the DATA in src/config/weeklyEvents.ts legitimately changes (Thursday
 * refresh), the goldens will diff. Verify via `git diff src/config/weeklyEvents.ts`
 * that the change is data-only, then re-capture and say so in the commit:
 *
 *   CHAR_CAPTURE=1 npm test -- characterization
 *
 * Goldens: docs/ux-overhaul/characterization/<profile>.json
 */
import fs from 'fs';
import path from 'path';
import { computeAssessment } from '../computeAssessment.js';
import { buildCompactActionPlan, buildSessionPlan } from '../actionPlanBuilder.js';

const FROZEN_NOW = new Date('2026-07-05T12:00:00Z');
const GOLDEN_DIR = path.join(process.cwd(), 'docs', 'ux-overhaul', 'characterization');
const CAPTURE = process.env.CHAR_CAPTURE === '1';

const createBaseFormData = (overrides = {}) => ({
  rank: '1',
  timePlayed: '1',
  liquidCash: '0',
  strength: 0,
  flying: 0,
  shooting: 0,
  stealth: 0,
  stamina: 0,
  driving: 0,
  hasKosatka: false,
  hasSparrow: false,
  hasRaiju: false,
  hasOppressor: false,
  hasAgency: false,
  dreContractDone: false,
  payphoneUnlocked: false,
  securityContracts: '',
  hasAcidLab: false,
  acidLabUpgraded: false,
  hasSalvageYard: false,
  hasTowTruck: false,
  hasBunker: false,
  bunkerUpgraded: false,
  hasAutoShop: false,
  hasNightclub: false,
  nightclubTechs: '',
  nightclubFeeders: '',
  hasCarWash: false,
  hasWeedFarm: false,
  hasHeliTours: false,
  sellsToStreetDealers: false,
  claimedWheelSpin: false,
  claimedFreeCar: false,
  hasGTAPlus: false,
  playMode: 'solo',
  ...overrides,
});

const PROFILES = {
  'fresh-start': createBaseFormData(),
  beginner: createBaseFormData({
    rank: '25',
    timePlayed: '40',
    liquidCash: '500000',
    strength: 2,
    shooting: 2,
    hasAcidLab: true,
  }),
  intermediate: createBaseFormData({
    rank: '80',
    timePlayed: '250',
    liquidCash: '2000000',
    strength: 3,
    flying: 3,
    shooting: 4,
    driving: 3,
    hasKosatka: true,
    hasSparrow: true,
    hasNightclub: true,
    nightclubTechs: '3',
    hasAcidLab: true,
    acidLabUpgraded: true,
  }),
  'veteran-maxed': createBaseFormData({
    rank: '350',
    timePlayed: '2000',
    liquidCash: '25000000',
    strength: 5,
    flying: 5,
    shooting: 5,
    stealth: 5,
    stamina: 5,
    driving: 5,
    hasKosatka: true,
    hasSparrow: true,
    hasRaiju: true,
    hasOppressor: true,
    hasAgency: true,
    dreContractDone: true,
    payphoneUnlocked: true,
    securityContracts: '201',
    hasAcidLab: true,
    acidLabUpgraded: true,
    hasSalvageYard: true,
    hasTowTruck: true,
    hasBunker: true,
    bunkerUpgraded: true,
    hasAutoShop: true,
    hasNightclub: true,
    nightclubTechs: '5',
    nightclubFeeders: '5',
    hasGTAPlus: true,
    claimedWheelSpin: true,
    claimedFreeCar: true,
  }),
  'gtaplus-mogul': createBaseFormData({
    rank: '120',
    timePlayed: '400',
    liquidCash: '5000000',
    strength: 4,
    shooting: 3,
    hasGTAPlus: true,
    hasAutoShop: true,
    hasAgency: true,
    dreContractDone: true,
    hasSalvageYard: true,
    hasNightclub: true,
    nightclubTechs: '2',
  }),
  'event-flags-edge': createBaseFormData({
    rank: '500',
    timePlayed: '5000',
    liquidCash: '100000000',
    hasCarWash: true,
    hasWeedFarm: true,
    hasHeliTours: true,
    sellsToStreetDealers: true,
    playMode: 'crew',
  }),
};

const snapshot = (profile) => {
  const result = computeAssessment(profile);
  const compactPlan = buildCompactActionPlan(result.bottlenecks, undefined, profile, result);
  const sessionPlan = buildSessionPlan({ formData: profile, results: result, sessionMinutes: 60 });
  // JSON round-trip: goldens are JSON, so normalize undefined/functions the same way
  return JSON.parse(JSON.stringify({ result, compactPlan, sessionPlan }));
};

describe('characterization (engine output pinned during UX overhaul)', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FROZEN_NOW);
    if (CAPTURE) fs.mkdirSync(GOLDEN_DIR, { recursive: true });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  Object.entries(PROFILES).forEach(([name, profile]) => {
    test(`${name} output matches golden`, () => {
      const actual = snapshot(profile);
      const goldenPath = path.join(GOLDEN_DIR, `${name}.json`);

      if (CAPTURE) {
        fs.writeFileSync(goldenPath, JSON.stringify(actual, null, 2) + '\n');
        return;
      }

      if (!fs.existsSync(goldenPath)) {
        throw new Error(
          `Missing golden ${goldenPath}. Capture with: CHAR_CAPTURE=1 npm test -- characterization`
        );
      }
      const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
      expect(actual).toEqual(golden);
    });
  });
});
