// src/components/shared/ResultsScoreCard.jsx
import PropTypes from 'prop-types';
import { formatHours } from '../../utils/formatters';

const IncomeBar = ({ label, value, total }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="bg-bg-raised/60 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-text-secondary">{label}</span>
        <span className="font-mono text-sm text-hud-blue">
          ${(value / 1000).toFixed(0)}k/hr
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle">
        <div className="h-full bg-hud-blue" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

IncomeBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export const ResultsScoreCard = ({
  results, totalHours, timePartsLabel, shouldShowTimePlayed,
}) => (
  <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6 shadow-float animate-pop-in">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h2 className="font-display text-3xl font-black text-text-primary">Score Breakdown</h2>
      <div className="flex items-center gap-3">
        <div className="text-5xl font-display font-black text-hud-blue">
          Tier {results.tier}
        </div>
        <div className="w-16 h-16 rounded-full bg-hud-blue/15 border border-hud-blue/40 flex items-center justify-center shadow-glow-blue animate-pulse-glow">
          <span className="text-2xl">🏆</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-hud-blue/10 p-5 rounded-xl border-2 border-hud-blue/30">
        <div className="text-sm text-text-muted mb-1">Score</div>
        <div className="text-3xl font-bold text-text-primary">{results.score}/100</div>
      </div>
      <div className="bg-bg-base/50 p-4 rounded-lg">
        <div className="text-sm text-text-muted mb-1">Income Per Hour</div>
        <div className="text-3xl font-bold text-hud-blue">
          ${(results.incomePerHour / 1000).toFixed(0)}k/hr
        </div>
      </div>
      <div className="bg-bg-base/50 p-4 rounded-lg">
        <div className="text-sm text-text-muted mb-1">Heist Ready</div>
        <div className="text-3xl font-bold text-hud-blue">
          {results.heistReadyPercent.toFixed(0)}%
        </div>
      </div>
    </div>

    {shouldShowTimePlayed && (
      <div className="bg-bg-base/50 p-4 rounded-lg mb-6">
        <div className="text-sm text-text-muted mb-1">Total Hours Played</div>
        <div className="text-2xl font-bold text-text-primary">{formatHours(totalHours)}h</div>
        {timePartsLabel && (
          <div className="text-xs text-text-muted mt-1">{timePartsLabel}</div>
        )}
        <div className="text-2xs text-text-muted mt-1">Rounded to the nearest hour.</div>
      </div>
    )}

    <div className="space-y-3">
      <IncomeBar
        label="Active Income"
        value={results.activeIncome}
        total={results.incomePerHour}
      />
      <IncomeBar
        label="Passive Income"
        value={results.passiveIncome}
        total={results.incomePerHour}
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
