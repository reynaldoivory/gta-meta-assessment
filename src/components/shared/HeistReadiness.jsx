// src/components/shared/HeistReadiness.jsx
import PropTypes from 'prop-types';
import { Target, CheckCircle2, XCircle } from 'lucide-react';

const getHeistReadyColor = (percent) => (percent === 100 ? 'text-hud-blue' : 'text-accent-pink-text');

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
    <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
          <Target className="w-6 h-6 text-hud-blue" />
          Heist Leadership Readiness
        </h3>
        <div className={`text-4xl font-bold ${getHeistReadyColor(heistReadyPercent)}`}>
          {heistReadyPercent.toFixed(0)}%
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              item.met ? 'bg-hud-blue/10 border-hud-blue/20' : 'bg-hud-pink/10 border-hud-pink/20'
            }`}
          >
            <span className="text-text-secondary font-medium text-sm">{item.label}</span>
            {item.met
              ? <CheckCircle2 className="text-hud-blue w-5 h-5" />
              : <XCircle className="text-accent-pink-text w-5 h-5" />}
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
