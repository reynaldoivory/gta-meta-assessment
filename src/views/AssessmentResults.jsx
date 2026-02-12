// src/views/AssessmentResults.jsx
import React, { useState, useEffect, useRef, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useAssessment } from '../context/AssessmentContext';
import { useToast } from '../context/ToastContext';
import { soundEffects } from '../utils/soundEffects';
import { fireConfetti } from '../utils/confettiEffects';
import { getRandomQuote, getMotivationalMessage } from '../utils/motivationalQuotes';
import { getProgressHistory } from '../utils/progressTracker';
import { checkStreak } from '../utils/streakTracker';

// Component Imports
import Confetti from '../components/gamification/Confetti';
import StreakBanner from '../components/gamification/StreakBanner';
import GTA6Countdown from '../components/gamification/GTA6Countdown';
import EmpireProgressPanel from '../components/gamification/EmpireProgressPanel';
import AchievementsGallery from '../components/gamification/AchievementsGallery';
import SoundToggle from '../components/shared/SoundToggle';
import { MILESTONE_LEVELS, getMilestoneLabel } from '../utils/gamificationEngine';
const ProgressChart = React.lazy(() => import('../components/gamification/ProgressChart'));
const ROICalculator = React.lazy(() => import('../components/calculators/ROICalculator'));
const SocialCardGenerator = React.lazy(() => import('../components/calculators/SocialCardGenerator'));
import AcidLabTracker from '../components/shared/AcidLabTracker';
import DailyTracker from '../components/shared/DailyTracker';
import TrapWarnings from '../components/shared/TrapWarnings';
import CommunityTrapStats from '../components/shared/CommunityTrapStats';
import { ArrowLeft, Target, DollarSign, AlertCircle, CheckCircle2, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { getCommunityAverages, compareToCommunity, exportCommunityStatsCSV, getProgressOverTime } from '../utils/communityStats';
import { downloadCSV } from '../utils/csvExport';
import { WEEKLY_EVENTS } from '../config/weeklyEvents';
import { detectTraps, checkForFixedTraps, getTrapSummary } from '../utils/trapDetector';

/** Helper: map heist readiness percent to Tailwind color class */
const getHeistReadyColor = (percent) => {
  if (percent === 100) return 'text-emerald-400';
  if (percent > 50) return 'text-yellow-400';
  return 'text-red-400';
};

const hasAnyTimeParts = (formData) => (
  [formData.timePlayedDays, formData.timePlayedHours]
    .some(value => value !== '' && value !== undefined && value !== null)
);

const calculateTotalHours = (days, hours, minutes = 0) => {
  const total = days * 24 + hours + minutes / 60;
  return Math.round(total);
};

const formatHours = (value) => {
  if (!Number.isFinite(value)) return '0';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

const formatTimeParts = (days, hours) => {
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  return parts.length ? parts.join(' ') : '0h';
};

const AssessmentResults = () => {
  const { formData, results, setStep, gamification, gamificationSummary } = useAssessment();
  const { showToast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  const trapFixCelebratedRef = useRef(false);

  // Detect traps and check for fixed traps (must be before hooks that depend on them)
  const detectedTraps = results ? detectTraps(formData, results) : [];
  const trapSummary = getTrapSummary(detectedTraps);
  const newlyFixedTraps = results ? checkForFixedTraps(detectedTraps, formData, results) : [];

  // Trigger Effects on Mount - main results effect
  useEffect(() => {
    if (!results) {
      setStep('form');
      return;
    }

    if (results.score >= 90) {
      soundEffects.achievement();
      setShowConfetti(true);
      fireConfetti('tier-up');
    } else {
      soundEffects.levelUp();
    }
  }, [results, setStep]);
  
  // Show celebration if traps were fixed (separate effect with ref to prevent double-fire)
  useEffect(() => {
    if (newlyFixedTraps.length > 0 && !trapFixCelebratedRef.current) {
      trapFixCelebratedRef.current = true;
      soundEffects.achievement();
      fireConfetti('default');
    }
  }, [newlyFixedTraps.length]);

  useEffect(() => {
    if (!gamificationSummary) return;

    const hitMilestone =
      gamificationSummary.levelAfter > gamificationSummary.levelBefore &&
      MILESTONE_LEVELS.includes(gamificationSummary.levelAfter);

    if (hitMilestone) {
      // Extra dramatic celebration for milestones
      soundEffects.achievement();
      fireConfetti('tier-up');
      const label = getMilestoneLabel(gamificationSummary.levelAfter);
      if (label) {
        setTimeout(() => fireConfetti('achievement'), 600);
      }
    } else if (gamificationSummary.levelAfter > gamificationSummary.levelBefore) {
      soundEffects.achievement();
      fireConfetti('achievement');
    }

    if (gamificationSummary.newAchievements?.length > 0) {
      soundEffects.achievement();
      fireConfetti('achievement');
    }
  }, [gamificationSummary]);

  if (!results) {
    return null;
  }

  const progressHistory = getProgressHistory();
  const streakInfo = checkStreak();
  const quote = getRandomQuote();
  const motivation = getMotivationalMessage(results.score, results.tier);
  
  // Calculate strength training needs
  const strengthPct = (Number(formData.strength) || 0) * 20;
  const needsStrengthTraining = strengthPct < 60;

  const timePartsPresent = hasAnyTimeParts(formData);
  const timeDays = Number(formData.timePlayedDays) || 0;
  const timeHours = Number(formData.timePlayedHours) || 0;
  const timeMinutes = Number(formData.timePlayedMinutes) || 0;
  const timePlayedTotal = timePartsPresent
    ? calculateTotalHours(timeDays, timeHours, timeMinutes)
    : Math.round(Number(formData.timePlayed) || 0);
  const timePartsLabel = timePartsPresent
    ? formatTimeParts(timeDays, timeHours)
    : '';
  const shouldShowTimePlayed = timePartsPresent || timePlayedTotal > 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Global Effects */}
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700">
          <button 
            onClick={() => setStep('form')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Edit Data
          </button>
          <div className="flex items-center gap-3">
            <SoundToggle />
            <div className="font-display text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Tier {results.tier} • Score {results.score}
            </div>
          </div>
        </div>

        {/* Gamification Layer */}
        <GTA6Countdown />
        <StreakBanner />
        <EmpireProgressPanel gamification={gamification} />

        {/* Full Achievements Gallery */}
        <AchievementsGallery
          unlockedIds={gamification?.unlockedAchievements || []}
          formData={formData}
          results={results}
          history={progressHistory}
          streak={streakInfo?.streak || 0}
        />

        {/* TRAP WARNINGS - Highest Priority Display */}
        {detectedTraps.length > 0 && (
          <TrapWarnings 
            traps={detectedTraps} 
            showCelebration={true}
            defaultExpanded={trapSummary.criticalCount > 0}
          />
        )}
        
        {/* Community Trap Statistics - Shows how player compares */}
        <CommunityTrapStats 
          formData={formData}
          currentTraps={detectedTraps}
        />

        {/* Free GTA+ Vehicle Reminder */}
        {formData.hasGTAPlus && !formData.claimedFreeCar && !formData.hasRaiju && !formData.hasOppressor && (
          <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center gap-4">
            <div className="text-3xl">🏎️</div>
            <div className="flex-1">
              <div className="font-bold text-white mb-1">Don't Forget: Free {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}</div>
              <div className="text-sm text-slate-300">
                Claim it at {WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'The Vinewood Car Club'}. Worth ${((WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1850000) / 1000000).toFixed(1)}M for free. Perfect for early-game transport.
              </div>
            </div>
          </div>
        )}

        {/* Daily Cash Loop Tracker */}
        <DailyTracker 
          hasNightclub={formData.hasNightclub}
          hasAgency={formData.hasAgency}
        />

        {/* Acid Lab Tracker */}
        {formData.hasAcidLab && (
          <AcidLabTracker 
            hasAcidLab={formData.hasAcidLab}
            acidLabUpgraded={formData.acidLabUpgraded}
          />
        )}

        {/* Core Results */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-white">Assessment Results</h2>
            <div className={`text-3xl font-bold ${results.tierColor || 'text-yellow-400'}`}>
              Tier {results.tier}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Score</div>
              <div className="text-3xl font-bold text-white">{results.score}/100</div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Income Per Hour</div>
              <div className="text-3xl font-bold text-green-400">
                ${(results.incomePerHour / 1000).toFixed(0)}k/hr
              </div>
            </div>
            <div className="bg-black/30 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Heist Ready</div>
              <div className="text-3xl font-bold text-blue-400">
                {results.heistReadyPercent.toFixed(0)}%
              </div>
            </div>
          </div>
          {shouldShowTimePlayed && (
            <div className="bg-black/30 p-4 rounded-lg mb-6">
              <div className="text-sm text-slate-400 mb-1">Total Hours Played</div>
              <div className="text-2xl font-bold text-white">{formatHours(timePlayedTotal)}h</div>
              {timePartsLabel && (
                <div className="text-xs text-slate-500 mt-1">{timePartsLabel}</div>
              )}
              <div className="text-[11px] text-slate-500 mt-1">Rounded to the nearest hour.</div>
            </div>
          )}

          {/* Income Breakdown */}
          <div className="space-y-3">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Active Income</span>
                <span className="font-mono text-sm text-green-400">
                  ${(results.activeIncome / 1000).toFixed(0)}k/hr
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{
                    width: `${results.incomePerHour > 0 ? (results.activeIncome / results.incomePerHour) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-300">Passive Income</span>
                <span className="font-mono text-sm text-purple-400">
                  ${(results.passiveIncome / 1000).toFixed(0)}k/hr
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{
                    width: `${results.incomePerHour > 0 ? (results.passiveIncome / results.incomePerHour) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics vs Feb 2026 Benchmarks */}
        {results.efficiencyMetrics && (results.efficiencyMetrics.incomePerHour > 0 || results.efficiencyMetrics.rpPerHour > 0) && (
          <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-amber-400 w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Efficiency vs Feb 2026 Benchmarks</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income Efficiency */}
              <div className="bg-slate-800/30 p-5 rounded-xl border border-green-500/20">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200">Income Efficiency</span>
                    <span className={`text-xl font-bold px-2 py-1 rounded ${
                      results.efficiencyMetrics.incomeGrade === 'S+' || results.efficiencyMetrics.incomeGrade === 'A+' ? 'bg-emerald-500/30 text-emerald-300' :
                      results.efficiencyMetrics.incomeGrade.startsWith('A') || results.efficiencyMetrics.incomeGrade.startsWith('B') ? 'bg-blue-500/30 text-blue-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {results.efficiencyMetrics.incomeGrade}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-green-400 mb-1">
                    ${(results.efficiencyMetrics.incomePerHour / 1000).toFixed(0)}k/hr
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {results.efficiencyMetrics.incomeEfficiency}% of benchmark
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700 mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    style={{
                      width: `${Math.min(results.efficiencyMetrics.incomeEfficiency, 200)}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Benchmark: ${(results.efficiencyMetrics.benchmarks.incomePerHour / 1000).toFixed(0)}k/hr
                </div>
              </div>

              {/* RP Efficiency */}
              <div className="bg-slate-800/30 p-5 rounded-xl border border-purple-500/20">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-200">RP Efficiency</span>
                    <span className={`text-xl font-bold px-2 py-1 rounded ${
                      results.efficiencyMetrics.rpGrade === 'S+' || results.efficiencyMetrics.rpGrade === 'A+' ? 'bg-emerald-500/30 text-emerald-300' :
                      results.efficiencyMetrics.rpGrade.startsWith('A') || results.efficiencyMetrics.rpGrade.startsWith('B') ? 'bg-blue-500/30 text-blue-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {results.efficiencyMetrics.rpGrade}
                    </span>
                  </div>
                  <div className="text-2xl font-mono font-bold text-purple-400 mb-1">
                    {results.efficiencyMetrics.rpPerHour.toLocaleString()} RP/hr
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    {results.efficiencyMetrics.rpEfficiency}% of benchmark
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700 mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{
                      width: `${Math.min(results.efficiencyMetrics.rpEfficiency, 200)}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  Benchmark: {results.efficiencyMetrics.benchmarks.rpPerHour.toLocaleString()} RP/hr
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700/50">
              <p>💡 Benchmarks are based on realistic Feb 2026 meta: post-Cayo nerf grinds (~750k/hr income) and standard RP rates (~4.5k/hr). Hardcore players with 2X events can exceed 1.2M/hr.</p>
            </div>
          </div>
        )}

        {/* Heist Leadership Readiness */}
        <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-400" />
              Heist Leadership Readiness
            </h3>
            <div className={`text-4xl font-bold ${getHeistReadyColor(results.heistReadyPercent)}`}>
              {results.heistReadyPercent.toFixed(0)}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'rank50', label: 'Rank 50+', met: results.heistReady.rank50 },
              { key: 'strength80', label: 'Strength 80/100', met: results.heistReady.strength80 },
              { key: 'flying80', label: 'Flying 80/100', met: results.heistReady.flying80 },
              {
                key: 'diversifiedIncome',
                label: `Diversified Income (${results.heistReady.diversifiedIncomeTier} - ${results.heistReady.diversifiedIncomePoints} pts, ${results.heistReady.diversifiedIncomeLabel})`,
                met: results.heistReady.diversifiedIncome,
              },
              { key: 'travelOptimized', label: 'Travel Optimized', met: results.heistReady.travelOptimized },
              { key: 'bizCore', label: 'Core Businesses', met: results.heistReady.bizCore }
            ].map((item) => (
              <div key={item.key} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                item.met ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'
              }`}>
                <span className="text-slate-300 font-medium text-sm">{item.label}</span>
                {item.met ? <CheckCircle2 className="text-emerald-400 w-5 h-5"/> : <XCircle className="text-red-400 w-5 h-5"/>}
              </div>
            ))}
          </div>
        </div>

        {/* Bottlenecks */}
        {results.bottlenecks && results.bottlenecks.length > 0 && (
          <div className="bg-slate-900/60 border border-red-900/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400 w-6 h-6" />
              <h3 className="text-xl font-bold text-white">Bottlenecks</h3>
            </div>
            <div className="space-y-3">
              {results.bottlenecks.map((b) => (
                <div 
                  key={b.id || b.label} 
                  className={`p-4 rounded-xl ${
                    b.critical 
                      ? 'bg-red-950/20 border-2 border-red-500/40' 
                      : 'bg-orange-950/10 border border-orange-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {b.critical && (
                      <span className="text-red-400 font-bold text-xs uppercase bg-red-900/30 px-2 py-0.5 rounded">
                        CRITICAL
                      </span>
                    )}
                    <span className="text-slate-200 font-semibold">{b.label}</span>
                  </div>
                  {b.detail && <p className="text-slate-400 text-sm">{b.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Comparison */}
        {(() => {
          const communityAvg = getCommunityAverages();
          const comparison = communityAvg ? compareToCommunity(formData, results) : null;
          const progressData = getProgressOverTime();
          
          if (!communityAvg || !comparison) {
            return (
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">Community Comparison</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Run more assessments to see how you compare to the community average. Stats are stored locally in your browser.
                </p>
              </div>
            );
          }

          return (
            <>
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-cyan-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-cyan-400" />
                      Community Comparison
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Based on {communityAvg.sampleSize} assessments (last 30 days)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-400">
                      {comparison.percentile}th
                    </div>
                    <div className="text-xs text-slate-400">percentile</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Score</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-white">{results.score}</div>
                      <div className={`text-sm font-bold ${
                        comparison.scoreDelta > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {comparison.scoreDelta > 0 ? '+' : ''}{comparison.scoreDelta.toFixed(1)}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      vs. avg {communityAvg.averageScore}
                    </div>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Income/Hr</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-white">
                        ${(results.incomePerHour / 1000).toFixed(0)}k
                      </div>
                      <div className={`text-sm font-bold ${
                        comparison.incomeDelta > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {comparison.incomeDelta > 0 ? '+' : ''}
                        ${(comparison.incomeDelta / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      vs. avg ${(Number(communityAvg.averageIncome) / 1000).toFixed(0)}k
                    </div>
                  </div>

                  <div className="bg-black/30 p-4 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Heist Ready</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-white">
                        {results.heistReadyPercent.toFixed(0)}%
                      </div>
                      <div className={`text-sm font-bold ${
                        comparison.heistReadyDelta > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {comparison.heistReadyDelta > 0 ? '+' : ''}
                        {comparison.heistReadyDelta.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      vs. avg {communityAvg.averageHeistReady}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="text-xs text-slate-500 italic">
                    ℹ️ Community stats are stored locally in your browser only. No data is sent to any server.
                  </div>
                  <button
                    onClick={() => {
                      const csv = exportCommunityStatsCSV();
                      if (csv) {
                        downloadCSV(csv, `gta-community-stats-${new Date().toISOString().split('T')[0]}.csv`);
                        soundEffects.cashRegister();
                        showToast('Community stats exported successfully!', 'success');
                      } else {
                        showToast('No community data to export yet', 'warning');
                      }
                    }}
                    className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 text-cyan-100 rounded-lg border border-cyan-500/40 text-xs transition-all"
                  >
                    📊 Export CSV
                  </button>
                </div>
              </div>

              {/* Progress Over Time Charts */}
              {progressData && progressData.timestamps.length > 1 && (
                <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    Progress Over Time
                  </h3>
                  <Suspense fallback={<div className="text-sm text-slate-400">Loading charts...</div>}>
                    <ProgressChart history={progressHistory} />
                  </Suspense>
                </div>
              )}
            </>
          );
        })()}

        {/* Strength Training Calculator */}
        {needsStrengthTraining && (
          <StrengthCalc currentPct={strengthPct} hasMansion={formData.hasMansion} />
        )}

        {/* Income Comparison Card */}
        <IncomeComparison hasAutoShop={formData.hasAutoShop} />

        {/* Time to Goal Calculator */}
        {results.nextGoal && (
          <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500 rounded-lg p-4">
            <h3 className="text-xl font-bold text-green-400 mb-2">
              🎯 Next Major Goal: {results.nextGoal.name}
            </h3>
            
            {results.nextGoal.canAffordNow ? (
              <p className="text-green-300 text-lg">
                ✅ You can afford this now! Go buy it.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Cost:</span>
                  <span className="font-mono">${results.nextGoal.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>You have:</span>
                  <span className="font-mono text-yellow-400">${results.nextGoal.currentCash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Still need:</span>
                  <span className="font-mono text-red-400">${results.nextGoal.needed.toLocaleString()}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-lg text-green-300">
                    ⏱️ <strong>{results.nextGoal.hoursRemaining} hours</strong> of grinding
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Best method: {results.nextGoal.fastestGrind} 
                    @ ${results.incomePerHour.toLocaleString()}/hr
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tools & Calculators */}
        <Suspense fallback={<div className="text-sm text-slate-400">Loading calculator...</div>}>
          <ROICalculator formData={formData} results={results} />
        </Suspense>
        

        {/* Social & Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
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
              "{quote.text}"
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

// Income Comparison Component - Clean, focused on meta opportunities
const IncomeComparison = ({ hasAutoShop }) => {
  // Calculate Auto Shop income: $300k base * 2.4 contracts/hr * multiplier
  const baseContractPayout = 300000;
  const contractsPerHour = 60 / 25; // ~2.4 contracts/hour
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const isAutoShopEvent = autoShopBonus?.isActive === true;
  const autoShopMultiplier = isAutoShopEvent ? (autoShopBonus.multiplier || 2) : 1;
  const autoShopRate = baseContractPayout * contractsPerHour * autoShopMultiplier;
  const cayoRate = 466000; // Nerfed solo rate/hr

  return (
    <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" /> Income Options This Week
      </h3>
      <div className="space-y-3">
        {/* Auto Shop Card */}
        <div className={`p-4 rounded-lg border-2 flex justify-between items-center ${
          hasAutoShop ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700 opacity-75'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Auto Shop{isAutoShopEvent ? ' (Event)' : ''}</span>
              {isAutoShopEvent && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">{autoShopMultiplier}X BONUS</span>
              )}
            </div>
            <div className="text-xs text-slate-400">No Cooldown{isAutoShopEvent ? ` • Expires ${WEEKLY_EVENTS.meta.displayDate}` : ''}</div>
          </div>
          <div className="text-xl font-bold text-green-400">${(autoShopRate/1000).toFixed(0)}k/hr</div>
        </div>

        {/* Cayo Card */}
        <div className="p-4 rounded-lg border-2 border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div>
            <div className="font-bold text-slate-300">Cayo Perico</div>
            <div className="text-xs text-slate-500">2.5h Cooldown • Standard Rate</div>
          </div>
          <div className="text-xl font-bold text-slate-400">${(cayoRate/1000).toFixed(0)}k/hr</div>
        </div>
      </div>
      
      {!hasAutoShop && isAutoShopEvent && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-yellow-300 mb-1">
                You're missing the best income option this week!
              </div>
              <div className="text-sm text-yellow-200">
                Auto Shop {autoShopMultiplier}X event earns ${((autoShopRate - cayoRate) / 1000).toFixed(0)}k/hr MORE than Cayo. 
                Buy it now before the event ends.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

IncomeComparison.propTypes = {
  hasAutoShop: PropTypes.bool,
};

// Strength Training Calculator Component
const StrengthCalc = ({ currentPct, hasMansion }) => {
  const impactsNeeded = Math.ceil((60 - currentPct) * 20);
  const punchesPerMin = 30; // Beach punching rate
  const timeEst = Math.ceil(impactsNeeded / punchesPerMin);

  if (currentPct >= 60) return null;

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 mb-6">
      <h4 className="text-xl font-bold text-red-300 mb-3 flex items-center gap-2">
        <span className="text-2xl">🏋️</span> Strength Training Math
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Current</div>
          <div className="text-2xl font-bold text-red-400">{currentPct}%</div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Target</div>
          <div className="text-2xl font-bold text-green-400">60%</div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Hits Needed</div>
          <div className="text-2xl font-bold text-yellow-400">{impactsNeeded}</div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Est. Time</div>
          <div className="text-2xl font-bold text-blue-400">
            {hasMansion ? '30m (Gym)' : `~${timeEst}m (Beach)`}
          </div>
        </div>
      </div>

      <div className="text-sm bg-black/20 p-3 rounded border border-red-500/20 text-slate-300">
        <p className="mb-2">
          <strong>Why Golf Failed You:</strong> Strength only increases on <em>impact</em>. A normal round of golf has ~2 impacts (drive + putt). You need {impactsNeeded} impacts total. That's why the beach (30 impacts/min) is superior to golf (~1 impact/min).
        </p>
        {!hasMansion && (
          <p className="text-green-400 font-bold mt-2">
            ✅ Recommendation: Launch "Pier Pressure" → Go to Beach → Start Punching.
          </p>
        )}
        {hasMansion && (
          <p className="text-green-400 font-bold mt-2">
            ✅ Best Method: Use your Mansion gym (punching bag) - fastest method at 30 minutes total.
          </p>
        )}
      </div>
    </div>
  );
};

StrengthCalc.propTypes = {
  currentPct: PropTypes.number.isRequired,
  hasMansion: PropTypes.bool,
};

export default AssessmentResults;
