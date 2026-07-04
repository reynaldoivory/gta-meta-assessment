// src/components/shared/CommunityComparison.jsx
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { DollarSign, TrendingUp } from 'lucide-react';
import { getCommunityAverages, compareToCommunity, exportCommunityStatsCSV, getProgressOverTime } from '../../utils/communityStats';
import { downloadCSV, exportProgressHistoryCSV } from '../../utils/csvExport';
import { soundEffects } from '../../utils/soundEffects';

const ProgressChart = React.lazy(() => import('../gamification/ProgressChart'));

const ComparisonStat = ({ label, value, delta, deltaLabel, avgLabel }) => (
  <div className="bg-bg-base/40 p-4 rounded-lg">
    <div className="text-sm text-text-muted mb-1">{label}</div>
    <div className="flex items-baseline gap-2">
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className={`text-sm font-bold ${delta > 0 ? 'text-hud-blue' : 'text-accent-pink-text'}`}>
        {delta > 0 ? '+' : ''}{deltaLabel}
      </div>
    </div>
    <div className="text-xs text-text-muted mt-1">vs. avg {avgLabel}</div>
  </div>
);

ComparisonStat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  delta: PropTypes.number.isRequired,
  deltaLabel: PropTypes.string.isRequired,
  avgLabel: PropTypes.string.isRequired,
};

export const CommunityComparison = ({ formData, results, progressHistory, showToast }) => {
  const communityAvg = getCommunityAverages();
  const comparison = communityAvg ? compareToCommunity(formData, results) : null;
  const progressData = getProgressOverTime();

  if (!communityAvg || !comparison) {
    return (
      // contain-paint contain-layout: isolates this card's paint/layout from
      // the rest of the results view (perf hygiene for a card that re-renders
      // whenever the community stats pool changes).
      <div className="contain-paint contain-layout bg-bg-surface/60 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-6 h-6 text-hud-blue" />
          <h2 className="text-xl font-bold text-text-primary">Community Comparison</h2>
        </div>
        <p className="text-sm text-text-muted">
          Run at least two assessments to see how your empire stacks up against the community average. All stats stay in your browser -- nothing leaves your machine.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    const csv = exportCommunityStatsCSV();
    if (csv) {
      downloadCSV(csv, `gta-community-stats-${new Date().toISOString().split('T')[0]}.csv`);
      soundEffects.cashRegister();
      showToast('Community stats exported successfully!', 'success');
    } else {
      showToast('No community data to export yet', 'warning');
    }
  };

  const handleExportProgress = () => {
    const csv = exportProgressHistoryCSV();
    if (csv) {
      downloadCSV(csv, `gta-progress-history-${new Date().toISOString().split('T')[0]}.csv`);
      soundEffects.cashRegister();
      showToast('Progress history exported successfully!', 'success');
    } else {
      showToast('No progress history to export yet', 'warning');
    }
  };

  return (
    // contain-paint contain-layout: this subtree hosts a Chart.js canvas
    // (ProgressChart) that repaints independently of the rest of the results
    // view -- containment keeps its layout/paint work from cascading out.
    <div className="contain-paint contain-layout space-y-6">
      <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-hud-blue" />
              Community Comparison
            </h2>
            <p className="text-text-muted text-sm">
              Based on {communityAvg.sampleSize} assessments (last 30 days)
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-hud-blue">{comparison.percentile}th</div>
            <div className="text-xs text-text-muted">percentile</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <ComparisonStat
            label="Score"
            value={results.score}
            delta={comparison.scoreDelta}
            deltaLabel={`${comparison.scoreDelta > 0 ? '+' : ''}${comparison.scoreDelta.toFixed(1)}`}
            avgLabel={String(communityAvg.averageScore)}
          />
          <ComparisonStat
            label="Income/Hr"
            value={`$${(results.incomePerHour / 1000).toFixed(0)}k`}
            delta={comparison.incomeDelta}
            deltaLabel={`${comparison.incomeDelta > 0 ? '+' : ''}$${(comparison.incomeDelta / 1000).toFixed(0)}k`}
            avgLabel={`$${(Number(communityAvg.averageIncome) / 1000).toFixed(0)}k`}
          />
          <ComparisonStat
            label="Heist Ready"
            value={`${results.heistReadyPercent.toFixed(0)}%`}
            delta={comparison.heistReadyDelta}
            deltaLabel={`${comparison.heistReadyDelta > 0 ? '+' : ''}${comparison.heistReadyDelta.toFixed(0)}%`}
            avgLabel={`${communityAvg.averageHeistReady}%`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="text-xs text-text-muted italic">
            ℹ️ Community stats are stored locally in your browser only. No data is sent to any server.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportProgress}
              className="px-4 py-2 bg-hud-blue/10 hover:bg-hud-blue/20 text-hud-blue rounded-lg border border-hud-blue/40 text-xs transition-all"
            >
              📈 Export Progress CSV
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-hud-blue/10 hover:bg-hud-blue/20 text-hud-blue rounded-lg border border-hud-blue/40 text-xs transition-all"
            >
              📊 Export Community CSV
            </button>
          </div>
        </div>
      </div>

      {progressData && progressData.timestamps.length > 1 && (
        <div className="bg-bg-surface/60 border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-hud-blue" />
            Progress Over Time
          </h2>
          <Suspense fallback={<div className="text-sm text-text-muted">Loading charts...</div>}>
            <ProgressChart history={progressHistory} />
          </Suspense>
        </div>
      )}
    </div>
  );
};

CommunityComparison.propTypes = {
  formData: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  progressHistory: PropTypes.array,
  showToast: PropTypes.func.isRequired,
};
