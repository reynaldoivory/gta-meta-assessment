// src/components/shared/ResultsScoreCard.jsx
import PropTypes from 'prop-types';
import { formatHours } from '../../utils/formatters';

const IncomeBar = ({ label, value, total, colorFrom }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-300">{label}</span>
        <span className={`font-mono text-sm ${colorFrom === 'green' ? 'text-green-400' : 'text-purple-400'}`}>
          ${(value / 1000).toFixed(0)}k/hr
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full bg-gradient-to-r ${
            colorFrom === 'green' ? 'from-green-500 to-emerald-500' : 'from-purple-500 to-pink-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

IncomeBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  colorFrom: PropTypes.string.isRequired,
};

export const ResultsScoreCard = ({
  results, totalHours, timePartsLabel, shouldShowTimePlayed,
}) => (
  <div className="card-enterprise animate-pop-in">
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-display text-3xl font-black heading-gradient-purple">Empire Report Card</h2>
      <div className="flex items-center gap-3">
        <div className="text-5xl font-display font-black heading-gradient-fire">
          Tier {results.tier}
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-purple-500 to-primary-orange-500 flex items-center justify-center shadow-glow-purple animate-pulse-glow">
          <span className="text-2xl">🏆</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-primary-purple-500/20 to-primary-cyan-500/10 p-5 rounded-xl border-2 border-primary-purple-500/30">
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
        <div className="text-2xl font-bold text-white">{formatHours(totalHours)}h</div>
        {timePartsLabel && (
          <div className="text-xs text-slate-500 mt-1">{timePartsLabel}</div>
        )}
        <div className="text-[11px] text-slate-500 mt-1">Rounded to the nearest hour.</div>
      </div>
    )}

    <div className="space-y-3">
      <IncomeBar
        label="Active Income"
        value={results.activeIncome}
        total={results.incomePerHour}
        colorFrom="green"
      />
      <IncomeBar
        label="Passive Income"
        value={results.passiveIncome}
        total={results.incomePerHour}
        colorFrom="purple"
      />
    </div>
  </div>
);

ResultsScoreCard.propTypes = {
  results: PropTypes.object.isRequired,
  totalHours: PropTypes.number.isRequired,
  timePartsLabel: PropTypes.string,
  shouldShowTimePlayed: PropTypes.bool,
};
