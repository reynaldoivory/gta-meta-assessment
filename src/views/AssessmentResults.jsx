// src/views/AssessmentResults.jsx
import React, { Suspense, useEffect } from 'react';
import { useAssessmentResults } from '../utils/useAssessmentResults';

// Component imports
import Confetti from '../components/gamification/Confetti';
import StreakBanner from '../components/gamification/StreakBanner';
import GTA6Countdown from '../components/gamification/GTA6Countdown';
import EmpireProgressPanel from '../components/gamification/EmpireProgressPanel';
import AchievementsGallery from '../components/gamification/AchievementsGallery';
import SoundToggle from '../components/shared/SoundToggle';
import { ResultsScoreCard } from '../components/shared/ResultsScoreCard';
import { EfficiencyBenchmarks } from '../components/shared/EfficiencyBenchmarks';
import { HeistReadiness } from '../components/shared/HeistReadiness';
import { CommunityComparison } from '../components/shared/CommunityComparison';
import { IncomeComparison } from '../components/shared/IncomeComparison';
import {
  TrapSection,
  OptionalGtaPlusReminder,
  TrackersSection,
  OptionalBottlenecks,
  GoalAndStrengthSection,
} from '../components/shared/AssessmentResultsSections';
import { Target } from 'lucide-react';
import { AppShell, Button, EmptyState } from '../components/ui';

const ROICalculator = React.lazy(() => import('../components/calculators/ROICalculator'));
const SocialCardGenerator = React.lazy(() => import('../components/calculators/SocialCardGenerator'));

const AssessmentResults = () => {
  const {
    formData, results, setStep, gamification,
    setFormData, showToast,
    showConfetti, setShowConfetti,
    detectedTraps, trapSummary,
    progressHistory, streakInfo, quote, motivation,
    strengthPct, needsStrengthTraining,
    totalHours, timePartsLabel, shouldShowTimePlayed,
  } = useAssessmentResults();

  // Bounded fix: redirect out of render (was `if (!results) { setStep('form'); return null; }`,
  // a setState-during-render call). Renders an interim empty state for the one
  // frame before the effect fires. URL sync is explicitly out of scope here.
  useEffect(() => {
    if (!results) setStep('form');
  }, [results, setStep]);

  if (!results) {
    return (
      <AppShell title="Empire Report Card">
        <EmptyState title="No report yet" description="Run the assessment first to see your empire report card." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Empire Report Card"
      onBack={{ label: 'Edit Data', action: () => setStep('form') }}
      actions={(
        <div className="flex items-center gap-4">
          <SoundToggle />
          <div className="flex items-center gap-3">
            <div className="font-display text-xl font-black text-hud-blue">
              Tier {results.tier}
            </div>
            <div className="font-mono text-sm px-3 py-1 rounded-full bg-hud-pink/15 text-accent-pink-text border border-hud-pink/40">
              Score {results.score}
            </div>
          </div>
        </div>
      )}
    >
      <div className="space-y-6">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

        {/* Gamification Layer */}
        <GTA6Countdown />
        <StreakBanner />
        <EmpireProgressPanel gamification={gamification} />
        <AchievementsGallery
          unlockedIds={gamification?.unlockedAchievements || []}
          formData={formData}
          results={results}
          history={progressHistory}
          streak={streakInfo?.streak || 0}
        />

        <TrapSection detectedTraps={detectedTraps} trapSummary={trapSummary} formData={formData} />
        <OptionalGtaPlusReminder formData={formData} />
        <TrackersSection formData={formData} setFormData={setFormData} />

        {/* Core Results */}
        <ResultsScoreCard
          results={results}
          totalHours={totalHours}
          timePartsLabel={timePartsLabel}
          shouldShowTimePlayed={shouldShowTimePlayed}
        />

        {/* Efficiency & Readiness */}
        <EfficiencyBenchmarks efficiencyMetrics={results.efficiencyMetrics} />
        <HeistReadiness heistReady={results.heistReady} heistReadyPercent={results.heistReadyPercent} />

        <OptionalBottlenecks results={results} />

        {/* Community & Progress */}
        <CommunityComparison
          formData={formData}
          results={results}
          progressHistory={progressHistory}
          showToast={showToast}
        />

        <GoalAndStrengthSection
          needsStrengthTraining={needsStrengthTraining}
          strengthPct={strengthPct}
          formData={formData}
          nextGoal={results.nextGoal}
          incomePerHour={results.incomePerHour}
        />
        <IncomeComparison hasAutoShop={formData.hasAutoShop} />

        {/* ROI Calculator */}
        <Suspense fallback={<div className="text-sm text-text-muted">Loading calculator...</div>}>
          <ROICalculator formData={formData} results={results} />
        </Suspense>

        {/* Social & Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            variant="primary"
            size="lg"
            icon={Target}
            onClick={() => setStep('actionPlan')}
            className="text-xl"
          >
            View Action Plan
          </Button>
          <Suspense fallback={<div className="text-sm text-text-muted">Loading social card...</div>}>
            <SocialCardGenerator formData={formData} results={results} />
          </Suspense>
        </div>

        {/* Motivational Quote */}
        <div className="bg-bg-surface/60 border border-border rounded-2xl p-6">
          <div className="text-center">
            <div className="text-2xl mb-3">💬</div>
            <blockquote className="text-lg italic text-text-secondary mb-2">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <cite className="text-sm text-text-muted">— {quote.character}</cite>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-hud-blue font-semibold">{motivation}</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default AssessmentResults;
