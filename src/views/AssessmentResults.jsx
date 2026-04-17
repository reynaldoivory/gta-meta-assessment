// src/views/AssessmentResults.jsx
import React, { Suspense } from 'react';
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
import { ArrowLeft, Target } from 'lucide-react';

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

  if (!results) return null;

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 text-slate-50 font-body">
      <div className="max-w-5xl mx-auto space-y-6">
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

        {/* Top Navigation */}
        <div className="card-enterprise flex justify-between items-center animate-pop-in">
          <button
            type="button"
            onClick={() => setStep('form')}
            className="btn-secondary text-sm py-2 px-4"
          >
            <ArrowLeft className="w-4 h-4 inline-block mr-2" />
            {' '}
            Edit Data
          </button>
          <div className="flex items-center gap-4">
            <SoundToggle />
            <div className="flex items-center gap-3">
              <div className="font-display text-xl font-black heading-gradient-purple">
                Tier {results.tier}
              </div>
              <div className="badge-orange font-mono text-sm">
                Score {results.score}
              </div>
            </div>
          </div>
        </div>

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
        <Suspense fallback={<div className="text-sm text-slate-400">Loading calculator...</div>}>
          <ROICalculator formData={formData} results={results} />
        </Suspense>

        {/* Social & Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setStep('actionPlan')}
            className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center gap-3 text-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-blue-900/20"
          >
            <Target className="w-6 h-6" /> View Action Plan
          </button>
          <Suspense fallback={<div className="text-sm text-slate-400">Loading social card...</div>}>
            <SocialCardGenerator formData={formData} results={results} />
          </Suspense>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-slate-900/60 to-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <div className="text-center">
            <div className="text-2xl mb-3">💬</div>
            <blockquote className="text-lg italic text-slate-300 mb-2">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            <cite className="text-sm text-slate-500">— {quote.character}</cite>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="text-green-400 font-semibold">{motivation}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
