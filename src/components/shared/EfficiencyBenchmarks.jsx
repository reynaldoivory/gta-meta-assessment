// src/components/shared/EfficiencyBenchmarks.jsx
import PropTypes from 'prop-types';
import { TrendingUp } from 'lucide-react';

const getGradeStyle = (grade) => {
  if (grade === 'S+' || grade === 'A+') return 'bg-emerald-500/30 text-emerald-300';
  if (grade.startsWith('A') || grade.startsWith('B')) return 'bg-blue-500/30 text-blue-300';
  return 'bg-yellow-500/30 text-yellow-300';
};

const MetricCard = ({ label, grade, value, unit, efficiency, benchmarkValue, benchmarkUnit, barColor }) => (
  <div className={`bg-slate-800/30 p-5 rounded-xl border ${barColor === 'green' ? 'border-green-500/20' : 'border-purple-500/20'}`}>
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-slate-200">{label}</span>
        <span className={`text-xl font-bold px-2 py-1 rounded ${getGradeStyle(grade)}`}>
          {grade}
        </span>
      </div>
      <div className={`text-2xl font-mono font-bold mb-1 ${barColor === 'green' ? 'text-green-400' : 'text-purple-400'}`}>
        {value}{unit}
      </div>
      <div className="text-xs text-slate-400 mb-2">{efficiency}% of benchmark</div>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700 mb-3">
      <div
        className={`h-full bg-gradient-to-r ${barColor === 'green' ? 'from-green-500 to-emerald-500' : 'from-purple-500 to-pink-500'}`}
        style={{ width: `${Math.min(efficiency, 200)}%` }}
      />
    </div>
    <div className="text-[11px] text-slate-400">Benchmark: {benchmarkValue}{benchmarkUnit}</div>
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
  barColor: PropTypes.string.isRequired,
};

export const EfficiencyBenchmarks = ({ efficiencyMetrics }) => {
  if (!efficiencyMetrics) return null;
  if (efficiencyMetrics.incomePerHour <= 0 && efficiencyMetrics.rpPerHour <= 0) return null;

  return (
    <div className="bg-slate-900/60 border border-amber-500/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-amber-400 w-6 h-6" />
        <h3 className="text-xl font-bold text-white">Efficiency vs Feb 2026 Benchmarks</h3>
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
          barColor="green"
        />
        <MetricCard
          label="RP Efficiency"
          grade={efficiencyMetrics.rpGrade}
          value={efficiencyMetrics.rpPerHour.toLocaleString()}
          unit=" RP/hr"
          efficiency={efficiencyMetrics.rpEfficiency}
          benchmarkValue={efficiencyMetrics.benchmarks.rpPerHour.toLocaleString()}
          benchmarkUnit=" RP/hr"
          barColor="purple"
        />
      </div>

      <div className="mt-4 text-xs text-slate-400 bg-slate-900/50 p-3 rounded border border-slate-700/50">
        <p>💡 Benchmarks are based on realistic Feb 2026 meta: post-Cayo nerf grinds (~750k/hr income) and standard RP rates (~4.5k/hr). Hardcore players with 2X events can exceed 1.2M/hr.</p>
      </div>
    </div>
  );
};

EfficiencyBenchmarks.propTypes = {
  efficiencyMetrics: PropTypes.object,
};
