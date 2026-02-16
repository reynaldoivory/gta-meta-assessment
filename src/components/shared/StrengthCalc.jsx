// src/components/shared/StrengthCalc.jsx
import PropTypes from 'prop-types';

export const StrengthCalc = ({ currentPct, hasMansion }) => {
  if (currentPct >= 60) return null;

  const impactsNeeded = Math.ceil((60 - currentPct) * 20);
  const punchesPerMin = 30;
  const timeEst = Math.ceil(impactsNeeded / punchesPerMin);

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 mb-6">
      <h4 className="text-xl font-bold text-red-300 mb-3 flex items-center gap-2">
        <span className="text-2xl">🏋️</span> Strength Training Math
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Current', value: `${currentPct}%`, color: 'text-red-400' },
          { label: 'Target', value: '60%', color: 'text-green-400' },
          { label: 'Hits Needed', value: String(impactsNeeded), color: 'text-yellow-400' },
          { label: 'Est. Time', value: hasMansion ? '30m (Gym)' : `~${timeEst}m (Beach)`, color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-black/30 p-3 rounded-lg">
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="text-sm bg-black/20 p-3 rounded border border-red-500/20 text-slate-300">
        <p className="mb-2">
          <strong>Why Golf Failed You:</strong> Strength only increases on <em>impact</em>.
          A normal round of golf has ~2 impacts (drive + putt). You need {impactsNeeded} impacts total.
          That&apos;s why the beach (30 impacts/min) is superior to golf (~1 impact/min).
        </p>
        {hasMansion ? (
          <p className="text-green-400 font-bold mt-2">
            ✅ Best Method: Use your Mansion gym (punching bag) - fastest method at 30 minutes total.
          </p>
        ) : (
          <p className="text-green-400 font-bold mt-2">
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
