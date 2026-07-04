// src/components/shared/StrengthCalc.jsx
import PropTypes from 'prop-types';
import { computeStrengthTraining } from '../../utils/calculations/strength';

export const StrengthCalc = ({ currentPct, hasMansion }) => {
  if (currentPct >= 60) return null;

  const { impactsNeeded, timeEst } = computeStrengthTraining(currentPct);

  return (
    <div className="bg-hud-pink/10 border border-hud-pink/50 rounded-xl p-5 mb-6">
      <h2 className="text-xl font-bold text-accent-pink-text mb-3 flex items-center gap-2">
        <span className="text-2xl">🏋️</span> Strength Training Math
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Current', value: `${currentPct}%` },
          { label: 'Target', value: '60%' },
          { label: 'Hits Needed', value: String(impactsNeeded) },
          { label: 'Est. Time', value: hasMansion ? '30m (Gym)' : `~${timeEst}m (Beach)` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg-base/30 p-3 rounded-lg">
            <div className="text-xs text-text-muted mb-1">{label}</div>
            <div className="text-2xl font-bold text-hud-blue">{value}</div>
          </div>
        ))}
      </div>

      <div className="text-sm bg-bg-base/20 p-3 rounded border border-hud-pink/20 text-text-secondary">
        <p className="mb-2">
          <strong>Why Golf Failed You:</strong> Strength only increases on <em>impact</em>.
          A normal round of golf has ~2 impacts (drive + putt). You need {impactsNeeded} impacts total.
          That&apos;s why the beach (30 impacts/min) is superior to golf (~1 impact/min).
        </p>
        {hasMansion ? (
          <p className="text-hud-blue font-bold mt-2">
            ✅ Best Method: Use your Mansion gym (punching bag) - fastest method at 30 minutes total.
          </p>
        ) : (
          <p className="text-hud-blue font-bold mt-2">
            ✅ Recommendation: Launch &quot;Pier Pressure&quot; → Go to Beach → Start Punching.
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
