import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { TRAP_SEVERITY } from '../../utils/trapDetector';

export const FixedTrapsCelebration = ({ fixes }) => {
  if (!fixes || fixes.length === 0) return null;

  return (
    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-4">
      <h4 className="font-bold text-green-400 flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5" />
        Recently Fixed Traps! 🎉
      </h4>
      <div className="space-y-2">
        {fixes.map((fix, idx) => (
          <div key={`${fix.trapId || fix.trapTitle}-${idx}`} className="flex items-center justify-between bg-black/20 rounded-lg p-2 text-sm">
            <span className="text-green-300">✅ {fix.trapTitle || fix.trapId}</span>
            <span className="text-slate-400">
              {new Date(fix.fixedAt).toLocaleDateString()}
              {fix.scoreAfter && fix.scoreBefore && (
                <span className="ml-2 text-green-400">Score: {fix.scoreBefore} → {fix.scoreAfter}</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

FixedTrapsCelebration.propTypes = {
  fixes: PropTypes.arrayOf(PropTypes.object),
};

export const TrapSummary = ({ traps }) => {
  const criticalCount = traps.filter((trap) => trap.severity === TRAP_SEVERITY.CRITICAL).length;
  const totalLost = traps.reduce((sum, trap) => sum + (trap.lostPerHour || 0), 0);
  const totalFixCost = traps.reduce((sum, trap) => sum + (trap.fixCost || 0), 0);

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          {traps.length} Trap{traps.length === 1 ? '' : 's'} Detected
        </h3>
        {criticalCount > 0 && (
          <p className="text-sm text-red-400 mt-1">
            ⚠️ {criticalCount} critical issue{criticalCount === 1 ? '' : 's'} requiring immediate attention
          </p>
        )}
      </div>
      <div className="flex gap-4 text-sm">
        {totalLost > 0 && (
          <div className="bg-red-900/30 px-3 py-2 rounded-lg border border-red-500/30">
            <div className="text-red-400 font-bold">-${totalLost.toLocaleString()}/hr</div>
            <div className="text-xs text-slate-400">Income Lost</div>
          </div>
        )}
        {totalFixCost > 0 && (
          <div className="bg-green-900/30 px-3 py-2 rounded-lg border border-green-500/30">
            <div className="text-green-400 font-bold">${totalFixCost.toLocaleString()}</div>
            <div className="text-xs text-slate-400">To Fix All</div>
          </div>
        )}
      </div>
    </div>
  );
};

TrapSummary.propTypes = {
  traps: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export const NoActiveTrapsState = ({ recentFixes }) => (
  <div className="bg-slate-900/60 border border-green-500/30 rounded-2xl p-6">
    <FixedTrapsCelebration fixes={recentFixes} />
    <div className="text-center py-4">
      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
      <h3 className="text-xl font-bold text-green-400">No Active Traps!</h3>
      <p className="text-slate-400 text-sm">Your setup is optimized. Keep grinding! 💰</p>
    </div>
  </div>
);

NoActiveTrapsState.propTypes = {
  recentFixes: PropTypes.arrayOf(PropTypes.object).isRequired,
};
