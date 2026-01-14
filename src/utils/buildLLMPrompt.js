// src/utils/buildLLMPrompt.js
export const buildLLMPrompt = ({ formData, assessmentResults, weeklyBonuses = [] }) => {
  if (!assessmentResults) return '';

  const {
    tier,
    score,
    incomePerHour,
    activeIncome,
    passiveIncome,
    bottlenecks = [],
    heistReady,
    heistReadyPercent,
  } = assessmentResults;

  const ownedAssets = [
    formData.hasKosatka && 'Kosatka',
    formData.hasSparrow && 'Sparrow',
    formData.hasAgency && 'Agency',
    formData.hasAcidLab && `Acid Lab${formData.acidLabUpgraded ? ' (upgraded)' : ''}`,
    formData.hasNightclub && 'Nightclub',
    formData.hasBunker && `Bunker${formData.bunkerUpgraded ? ' (upgraded)' : ''}`,
    formData.hasSalvageYard && formData.hasTowTruck && 'Salvage Yard + Tow Truck',
    formData.hasAutoShop && 'Auto Shop',
    formData.hasMansion && 'Mansion',
    formData.hasRaiju && 'F-160 Raiju',
    formData.hasOppressor && 'Oppressor Mk II',
  ].filter(Boolean);

  const gtaPlusStatus = formData.hasGTAPlus
    ? 'Yes (optimize for current GTA+ monthly benefits and weekly event bonuses).'
    : 'No (ignore GTA+‑only recommendations).';

  const bottleneckLines =
    bottlenecks.length === 0
      ? 'None detected by the app.'
      : bottlenecks
          .map(
            (b, idx) =>
              `${idx + 1}. ${b.label} – critical: ${b.critical ? 'yes' : 'no'}; impact: ${
                b.impact || 'unknown'
              }.`
          )
          .join('\n');

  // Cayo completion info
  const cayoInfo = formData.hasKosatka
    ? `Cayo Perico completions: ${formData.cayoCompletions || 0}; average run time: ${formData.cayoAvgTime || 'N/A'} minutes.`
    : 'No Kosatka owned yet.';

  return [
    'You are an expert GTA Online money/meta coach.',
    'Your job is to compare this player state against current 2026 online guides and recommend the best next 3–5 actions.',
    '',
    '--- PLAYER SNAPSHOT ---',
    `Rank: ${formData.rank || 0}`,
    `Total hours played (self-reported): ${formData.timePlayed || 0}`,
    `Current liquid cash: $${Number(formData.liquidCash) || 0}`,
    `Tier: ${tier} (score ${score}/100)`,
    `Estimated income per hour: $${incomePerHour.toLocaleString()} (active: $${activeIncome.toLocaleString()}/hr, passive: $${passiveIncome.toLocaleString()}/hr)`,
    '',
    `GTA+ subscriber: ${gtaPlusStatus}`,
    `Play mode preference: ${formData.playMode || 'invite'}`,
    '',
    `Owned key assets: ${ownedAssets.length ? ownedAssets.join(', ') : 'None yet'}`,
    cayoInfo,
    '',
    'Stats (0–5 bars, each bar ~20%):',
    `- Strength: ${formData.strength}/5`,
    `- Flying: ${formData.flying}/5`,
    `- Shooting: ${formData.shooting}/5`,
    `- Stealth: ${formData.stealth}/5`,
    `- Stamina: ${formData.stamina}/5`,
    `- Driving: ${formData.driving}/5`,
    '',
    'Heist Leadership Readiness:',
    `- Overall: ${heistReadyPercent.toFixed(0)}%`,
    `- Rank >= 50: ${heistReady.rank50 ? 'yes' : 'no'}`,
    `- Strength >= 80: ${heistReady.strength80 ? 'yes' : 'no'}`,
    `- Flying >= 80: ${heistReady.flying80 ? 'yes' : 'no'}`,
    `- 10+ Cayo runs: ${heistReady.cayo10 ? 'yes' : 'no'}`,
    `- Travel optimized (Sparrow/Raiju/Oppressor): ${heistReady.travelOptimized ? 'yes' : 'no'}`,
    `- Core businesses (Agency + Acid Lab + Nightclub): ${heistReady.bizCore ? 'yes' : 'no'}`,
    '',
    'Bottlenecks detected by the app:',
    bottleneckLines,
    '',
    '--- TASK ---',
    'Using this snapshot and up-to-date GTA Online 2026 information, do the following:',
    '1. Confirm whether the app\'s detected bottlenecks and priorities align with current best practices.',
    '2. Suggest the best next 3–5 actions for this player, ordered by priority.',
    '3. For each action, include: a short label, why it matters in 1–2 sentences, and rough time/cash expectations.',
    '4. If the app is recommending anything outdated or suboptimal (for example, ignoring current weekly bonuses or GTA+ benefits), call that out and correct it.',
    '',
    'Respond in plain text, bullet points allowed, no roleplay.',
  ].join('\n');
};

export const buildGoogleDocExport = ({ formData, assessmentResults, actionPlan }) => {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const ownedAssets = [
    formData.hasKosatka && 'Kosatka',
    formData.hasSparrow && 'Sparrow',
    formData.hasAgency && 'Agency',
    formData.dreContractDone && '  └─ Dr. Dre Contract Complete',
    formData.payphoneUnlocked && '  └─ Payphone Hits Unlocked',
    formData.hasAcidLab && 'Acid Lab',
    formData.acidLabUpgraded && '  └─ Equipment Upgraded',
    formData.hasNightclub && 'Nightclub',
    formData.nightclubTechs > 0 && `  └─ ${formData.nightclubTechs}/5 Technicians`,
    formData.hasBunker && 'Bunker',
    formData.bunkerUpgraded && '  └─ Upgraded',
    formData.hasSalvageYard && 'Salvage Yard',
    formData.hasTowTruck && '  └─ Tow Truck',
    formData.hasAutoShop && 'Auto Shop',
    formData.hasMansion && 'Mansion',
    formData.hasRaiju && 'F-160 Raiju',
    formData.hasOppressor && 'Oppressor Mk II',
    formData.hasArmoredKuruma && 'Armored Kuruma',
  ].filter(Boolean);

  const bottlenecksList = assessmentResults.bottlenecks.length
    ? assessmentResults.bottlenecks
        .map((b, idx) => `${idx + 1}. ${b.label} (${b.critical ? 'CRITICAL' : b.impact})`)
        .join('\n')
    : 'None detected';

  const actionsList = actionPlan.length
    ? actionPlan
        .map((a, idx) => `${idx + 1}. ${a.title}\n   Why: ${a.why || a.reason}\n   Time: ${a.timeEstimate || a.timeHours || 'varies'}`)
        .join('\n\n')
    : 'No actions generated';

  return [
    '═══════════════════════════════════════════════════',
    '          GTA ONLINE GRIND ASSESSMENT REPORT',
    '═══════════════════════════════════════════════════',
    '',
    `Date: ${date}`,
    `Assessment Version: v5`,
    '',
    '───────────────────────────────────────────────────',
    '📊 CURRENT STATE SNAPSHOT',
    '───────────────────────────────────────────────────',
    '',
    `Rank:                    ${formData.rank || 0}`,
    `Total Hours Played:      ${formData.timePlayed || 0}`,
    `Liquid Cash:             $${Number(formData.liquidCash || 0).toLocaleString()}`,
    `GTA+ Subscriber:         ${formData.hasGTAPlus ? 'Yes' : 'No'}`,
    `Play Mode:               ${formData.playMode === 'invite' ? 'Invite-Only' : formData.playMode === 'public' ? 'Public Sessions' : 'Solo'}`,
    '',
    '───────────────────────────────────────────────────',
    '🎯 ASSESSMENT RESULTS',
    '───────────────────────────────────────────────────',
    '',
    `Overall Score:           ${assessmentResults.score}/100`,
    `Tier:                    ${assessmentResults.tier}`,
    `Income Per Hour:         $${assessmentResults.incomePerHour.toLocaleString()}/hr`,
    `  ├─ Active Income:      $${assessmentResults.activeIncome.toLocaleString()}/hr`,
    `  └─ Passive Income:     $${assessmentResults.passiveIncome.toLocaleString()}/hr`,
    '',
    `Heist Leadership Ready:  ${assessmentResults.heistReadyPercent.toFixed(0)}%`,
    `  ├─ Rank >= 50:         ${assessmentResults.heistReady.rank50 ? '✓' : '✗'}`,
    `  ├─ Strength >= 80:     ${assessmentResults.heistReady.strength80 ? '✓' : '✗'}`,
    `  ├─ Flying >= 80:       ${assessmentResults.heistReady.flying80 ? '✓' : '✗'}`,
    `  ├─ 10+ Cayo Runs:      ${assessmentResults.heistReady.cayo10 ? '✓' : '✗'}`,
    `  ├─ Travel Optimized:   ${assessmentResults.heistReady.travelOptimized ? '✓' : '✗'}`,
    `  └─ Core Businesses:    ${assessmentResults.heistReady.bizCore ? '✓' : '✗'}`,
    '',
    '───────────────────────────────────────────────────',
    '📈 STATS BREAKDOWN',
    '───────────────────────────────────────────────────',
    '',
    `Strength:    ${formData.strength}/5 bars (${formData.strength * 20}%)`,
    `Flying:      ${formData.flying}/5 bars (${formData.flying * 20}%)`,
    `Shooting:    ${formData.shooting}/5 bars (${formData.shooting * 20}%)`,
    `Stealth:     ${formData.stealth}/5 bars (${formData.stealth * 20}%)`,
    `Stamina:     ${formData.stamina}/5 bars (${formData.stamina * 20}%)`,
    `Driving:     ${formData.driving}/5 bars (${formData.driving * 20}%)`,
    '',
    '───────────────────────────────────────────────────',
    '🏢 OWNED ASSETS',
    '───────────────────────────────────────────────────',
    '',
    ownedAssets.length ? ownedAssets.join('\n') : 'None yet',
    '',
    '───────────────────────────────────────────────────',
    '⚠️ DETECTED BOTTLENECKS',
    '───────────────────────────────────────────────────',
    '',
    bottlenecksList,
    '',
    '───────────────────────────────────────────────────',
    '🎯 RECOMMENDED ACTION PLAN',
    '───────────────────────────────────────────────────',
    '',
    actionsList,
    '',
    '───────────────────────────────────────────────────',
    '💭 AI ASSISTANT NOTES',
    '───────────────────────────────────────────────────',
    '',
    '(Paste LLM response here after querying with the exported prompt)',
    '',
    '',
    '',
    '───────────────────────────────────────────────────',
    '📝 SESSION NOTES & DECISIONS',
    '───────────────────────────────────────────────────',
    '',
    'What I decided to do:',
    '',
    '',
    '',
    'Why:',
    '',
    '',
    '',
    'Expected outcome:',
    '',
    '',
    '',
    '───────────────────────────────────────────────────',
    '✅ PROGRESS TRACKER (Next Session)',
    '───────────────────────────────────────────────────',
    '',
    'Completed:',
    '[ ] ',
    '[ ] ',
    '[ ] ',
    '',
    'Cash earned: $',
    'New assets: ',
    'Next assessment date: ',
    '',
    '═══════════════════════════════════════════════════',
    'Generated by GTA Assessment Tool v5',
    `${date}`,
    '═══════════════════════════════════════════════════',
  ].join('\n');
};

// Stub functions for compatibility
export const buildWhatIfPrompt = ({ formData, assessmentResults, whatIf, weeklyBonuses = [] }) => {
  const basePrompt = buildLLMPrompt({ formData, assessmentResults, weeklyBonuses });
  return `${basePrompt}\n\n--- WHAT-IF SCENARIO ---\n${whatIf}\n\nPlease analyze how this change would affect the recommendations above.`;
};

export const buildPlanCritiquePrompt = ({ formData, assessmentResults, actionPlan, weeklyBonuses = [] }) => {
  const basePrompt = buildLLMPrompt({ formData, assessmentResults, weeklyBonuses });
  const planText = actionPlan.map((a, idx) => `${idx + 1}. ${a.title}: ${a.why || a.reason}`).join('\n');
  return `${basePrompt}\n\n--- APP'S RECOMMENDED ACTION PLAN ---\n${planText}\n\nPlease critique this plan and suggest improvements or corrections.`;
};

export const buildLLMJsonPayload = ({ formData, assessmentResults }) => {
  return {
    rank: Number(formData.rank) || 0,
    timePlayed: Number(formData.timePlayed) || 0,
    liquidCash: Number(formData.liquidCash) || 0,
    score: assessmentResults.score,
    tier: assessmentResults.tier,
    incomePerHour: assessmentResults.incomePerHour,
    activeIncome: assessmentResults.activeIncome,
    passiveIncome: assessmentResults.passiveIncome,
    heistReadyPercent: assessmentResults.heistReadyPercent,
    bottlenecks: assessmentResults.bottlenecks,
  };
};
