import { computeAssessment } from '../computeAssessment.js';

describe('computeAssessment', () => {
  // Helper to create base form data
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
    cayoCompletions: '',
    cayoAvgTime: '',
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
    playMode: 'solo',
    ...overrides
  });

  describe('Beginner Profile', () => {
    const beginnerProfile = createBaseFormData({
      rank: '25',
      liquidCash: '500000',
      strength: 2,
      shooting: 2,
      hasAcidLab: true,
      acidLabUpgraded: false
    });

    test('should return Street Hustler tier for beginner', () => {
      const result = computeAssessment(beginnerProfile);
      expect(result.tier).toBe('Street Hustler');
    });

    test('should have low score for beginner', () => {
      const result = computeAssessment(beginnerProfile);
      expect(result.score).toBeLessThan(40);
    });

    test('should have income in expected range for beginner', () => {
      const result = computeAssessment(beginnerProfile);
      // Beginner with unupgraded Acid Lab should have ~$62k/hr
      expect(result.incomePerHour).toBeGreaterThan(50000);
      expect(result.incomePerHour).toBeLessThan(200000);
    });

    test('should identify critical bottlenecks', () => {
      const result = computeAssessment(beginnerProfile);
      const criticalBottlenecks = result.bottlenecks.filter(b => b.critical);
      expect(criticalBottlenecks.length).toBeGreaterThan(0);
      expect(criticalBottlenecks.some(b => b.id === 'no_kosatka')).toBe(true);
    });
  });

  describe('Intermediate Profile', () => {
    const intermediateProfile = createBaseFormData({
      rank: '80',
      liquidCash: '5000000',
      strength: 3,
      shooting: 4,
      flying: 3,
      stealth: 3,
      hasKosatka: true,
      hasSparrow: true,
      cayoCompletions: '12',
      cayoAvgTime: '60',
      hasAcidLab: true,
      acidLabUpgraded: true,
      hasAgency: true,
      securityContracts: '20',
      hasBunker: true,
      bunkerUpgraded: true,
      playMode: 'solo'
    });

    test('should return Established or Crime Boss tier for intermediate', () => {
      const result = computeAssessment(intermediateProfile);
      expect(['Established', 'Crime Boss']).toContain(result.tier);
    });

    test('should have moderate score for intermediate', () => {
      const result = computeAssessment(intermediateProfile);
      expect(result.score).toBeGreaterThanOrEqual(40);
      expect(result.score).toBeLessThan(90);
    });

    test('should have income in expected range for intermediate', () => {
      const result = computeAssessment(intermediateProfile);
      // Intermediate with Cayo, Acid Lab, Bunker should have $400k-$800k/hr
      expect(result.incomePerHour).toBeGreaterThan(300000);
      expect(result.incomePerHour).toBeLessThan(1000000);
    });

    test('should have fewer bottlenecks than beginner', () => {
      const result = computeAssessment(intermediateProfile);
      const criticalBottlenecks = result.bottlenecks.filter(b => b.critical);
      expect(criticalBottlenecks.length).toBeLessThan(3);
    });
  });

  describe('Veteran Profile', () => {
    const veteranProfile = createBaseFormData({
      rank: '300',
      liquidCash: '50000000',
      strength: 5,
      shooting: 5,
      flying: 5,
      stealth: 5,
      driving: 5,
      hasKosatka: true,
      hasSparrow: true,
      cayoCompletions: '100',
      cayoAvgTime: '45',
      hasAgency: true,
      dreContractDone: true,
      payphoneUnlocked: true,
      securityContracts: '250',
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
      hasRaiju: true,
      playMode: 'solo'
    });

    test('should return Kingpin tier for veteran', () => {
      const result = computeAssessment(veteranProfile);
      expect(result.tier).toBe('Kingpin (God Tier)');
    });

    test('should have high score for veteran', () => {
      const result = computeAssessment(veteranProfile);
      expect(result.score).toBeGreaterThanOrEqual(90);
    });

    test('should have high income for veteran', () => {
      const result = computeAssessment(veteranProfile);
      // Veteran with all assets and elite Cayo should have $1M+/hr
      expect(result.incomePerHour).toBeGreaterThan(800000);
      expect(result.incomePerHour).toBeLessThan(2000000);
    });

    test('should have high heist readiness', () => {
      const result = computeAssessment(veteranProfile);
      expect(result.heistReadyPercent).toBeGreaterThanOrEqual(80);
    });

    test('should have minimal bottlenecks', () => {
      const result = computeAssessment(veteranProfile);
      const criticalBottlenecks = result.bottlenecks.filter(b => b.critical);
      expect(criticalBottlenecks.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing rank gracefully', () => {
      const profile = createBaseFormData({ rank: '' });
      const result = computeAssessment(profile);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.tier).toBeDefined();
    });

    test('should handle zero stats', () => {
      const profile = createBaseFormData({
        strength: 0,
        flying: 0,
        shooting: 0
      });
      const result = computeAssessment(profile);
      expect(result.bottlenecks.some(b => b.id === 'strength_low')).toBe(true);
      expect(result.bottlenecks.some(b => b.id === 'flying_low')).toBe(true);
    });

    test('should calculate Cayo income correctly', () => {
      const profile = createBaseFormData({
        hasKosatka: true,
        hasSparrow: true,
        cayoCompletions: '10',
        cayoAvgTime: '50',
        playMode: 'solo'
      });
      const result = computeAssessment(profile);
      // Solo Cayo with 50min runs: $1.1M / (50 + 144) min * 60 = ~$339k/hr
      expect(result.incomePerHour).toBeGreaterThan(300000);
      expect(result.incomePerHour).toBeLessThan(400000);
    });
  });
});

