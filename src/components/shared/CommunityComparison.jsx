// src/components/shared/CommunityComparison.jsx
import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { DollarSign, TrendingUp } from 'lucide-react';
import { getCommunityAverages, compareToCommunity, exportCommunityStatsCSV, getProgressOverTime } from '../../utils/communityStats';
import { downloadCSV, exportProgressHistoryCSV } from '../../utils/csvExport';
import { soundEffects } from '../../utils/soundEffects';

const ProgressChart = React.lazy(() => import('../gamification/ProgressChart'));

const ComparisonStat = ({ label, value, delta, deltaLabel, avgLabel }) => (
  <div className="bg-black/30 p-4 rounded-lg">
    <div className="text-sm text-slate-400 mb-1">{label}</div>
    <div className="flex items-baseline gap-2">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className={`text-sm font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {delta > 0 ? '+' : ''}{deltaLabel}
      </div>
    </div>
    <div className="text-xs text-slate-500 mt-1">vs. avg {avgLabel}</div>
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
            <div className="text-3xl font-bold text-cyan-400">{comparison.percentile}th</div>
            <div className="text-xs text-slate-400">percentile</div>
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

        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 italic">
            ℹ️ Community stats are stored locally in your browser only. No data is sent to any server.
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportProgress}
              className="px-4 py-2 bg-green-900/40 hover:bg-green-900/70 text-green-100 rounded-lg border border-green-500/40 text-xs transition-all"
            >
              📈 Export Progress CSV
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900/70 text-cyan-100 rounded-lg border border-cyan-500/40 text-xs transition-all"
            >
              📊 Export Community CSV
            </button>
          </div>
        </div>
      </div>

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
};

CommunityComparison.propTypes = {
  formData: PropTypes.object.isRequired,
  results: PropTypes.object.isRequired,
  progressHistory: PropTypes.array,
  showToast: PropTypes.func.isRequired,
};
