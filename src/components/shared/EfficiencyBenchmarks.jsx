// src/components/shared/EfficiencyBenchmarks.jsx
import PropTypes from 'prop-types';
import { TrendingUp } from 'lucide-react';

const MetricCard = ({ label, grade, value, unit, efficiency, benchmarkValue, benchmarkUnit }) => (
  <div className="bg-bg-raised/50 p-5 rounded-xl border border-hud-blue/20">
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-text-secondary">{label}</span>
        <span className="text-xl font-bold px-2 py-1 rounded bg-hud-blue/20 text-hud-blue">
          {grade}
        </span>
      </div>
      <div className="text-2xl font-mono font-bold mb-1 text-hud-blue">
        {value}{unit}
      </div>
      <div className="text-xs text-text-muted mb-2">{efficiency}% of benchmark</div>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-border-subtle mb-3">
      <div className="h-full bg-hud-blue" style={{ width: `${Math.min(efficiency, 200)}%` }} />
    </div>
    <div className="text-2xs text-text-muted">Benchmark: {benchmarkValue}{benchmarkUnit}</div>
  </div>
);

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  grade: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  efficiency: PropTypes.number.isRequired,
  benchmarkValue: PropTypes.string.isRequired,
  benchmarkUnit: PropTypes.string.isRequired,
};

export const EfficiencyBenchmarks = ({ efficiencyMetrics }) => {
  if (!efficiencyMetrics) return null;
  if (efficiencyMetrics.incomePerHour <= 0 && efficiencyMetrics.rpPerHour <= 0) return null;

  return (
    <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-hud-blue w-6 h-6" />
        <h3 className="text-xl font-bold text-text-primary">Efficiency vs Feb 2026 Benchmarks</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          label="Income Efficiency"
          grade={efficiencyMetrics.incomeGrade}
          value={`$${(efficiencyMetrics.incomePerHour / 1000).toFixed(0)}k`}
          unit="/hr"
          efficiency={efficiencyMetrics.incomeEfficiency}
          benchmarkValue={`$${(efficiencyMetrics.benchmarks.incomePerHour / 1000).toFixed(0)}k`}
          benchmarkUnit="/hr"
        />
        <MetricCard
          label="RP Efficiency"
          grade={efficiencyMetrics.rpGrade}
          value={efficiencyMetrics.rpPerHour.toLocaleString()}
          unit=" RP/hr"
          efficiency={efficiencyMetrics.rpEfficiency}
          benchmarkValue={efficiencyMetrics.benchmarks.rpPerHour.toLocaleString()}
          benchmarkUnit=" RP/hr"
        />
      </div>

      <div className="mt-4 text-xs text-text-muted bg-bg-base/50 p-3 rounded border border-border-subtle">
        <p>💡 Benchmarks are based on realistic Feb 2026 meta: post-Cayo nerf grinds (~750k/hr income) and standard RP rates (~4.5k/hr). Hardcore players with 2X events can exceed 1.2M/hr.</p>
      </div>
    </div>
  );
};

EfficiencyBenchmarks.propTypes = {
  efficiencyMetrics: PropTypes.object,
};
