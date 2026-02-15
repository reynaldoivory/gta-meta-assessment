// src/components/shared/HeistReadiness.jsx
import PropTypes from 'prop-types';
import { Target, CheckCircle2, XCircle } from 'lucide-react';

const getHeistReadyColor = (percent) => {
  if (percent === 100) return 'text-emerald-400';
  if (percent > 50) return 'text-yellow-400';
  return 'text-red-400';
};

const HEIST_CHECKLIST = [
  { key: 'rank50', label: 'Rank 50+' },
  { key: 'strength80', label: 'Strength 80/100' },
  { key: 'flying80', label: 'Flying 80/100' },
  { key: 'travelOptimized', label: 'Travel Optimized' },
  { key: 'bizCore', label: 'Core Businesses' },
];

export const HeistReadiness = ({ heistReady, heistReadyPercent }) => {
  const diversifiedLabel = `Diversified Income (${heistReady.diversifiedIncomeTier} - ${heistReady.diversifiedIncomePoints} pts, ${heistReady.diversifiedIncomeLabel})`;

  const items = [
    ...HEIST_CHECKLIST.map(c => ({ ...c, met: heistReady[c.key] })),
    { key: 'diversifiedIncome', label: diversifiedLabel, met: heistReady.diversifiedIncome },
  ];

  return (
    <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-400" />
          Heist Leadership Readiness
        </h3>
        <div className={`text-4xl font-bold ${getHeistReadyColor(heistReadyPercent)}`}>
          {heistReadyPercent.toFixed(0)}%
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              item.met ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20'
            }`}
          >
            <span className="text-slate-300 font-medium text-sm">{item.label}</span>
            {item.met
              ? <CheckCircle2 className="text-emerald-400 w-5 h-5" />
              : <XCircle className="text-red-400 w-5 h-5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

HeistReadiness.propTypes = {
  heistReady: PropTypes.object.isRequired,
  heistReadyPercent: PropTypes.number.isRequired,
};
