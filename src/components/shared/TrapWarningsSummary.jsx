import PropTypes from 'prop-types';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { TRAP_SEVERITY } from '../../utils/trapDetector';

export const FixedTrapsCelebration = ({ fixes }) => {
  if (!fixes || fixes.length === 0) return null;

  return (
    <div className="bg-hud-blue/10 border border-hud-blue/40 rounded-xl p-4 mb-4">
      <h3 className="font-bold text-hud-blue flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5" />
        Recently Fixed Traps! 🎉
      </h3>
      <div className="space-y-2">
        {fixes.map((fix, idx) => (
          <div key={`${fix.trapId || fix.trapTitle}-${idx}`} className="flex items-center justify-between bg-bg-base/30 rounded-lg p-2 text-sm">
            <span className="text-hud-blue">✅ {fix.trapTitle || fix.trapId}</span>
            <span className="text-text-muted">
              {new Date(fix.fixedAt).toLocaleDateString()}
              {fix.scoreAfter && fix.scoreBefore && (
                <span className="ml-2 text-hud-blue">Score: {fix.scoreBefore} → {fix.scoreAfter}</span>
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
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-hud-pink" />
          {traps.length} Trap{traps.length === 1 ? '' : 's'} Detected
        </h2>
        {criticalCount > 0 && (
          <p className="text-sm text-accent-pink-text mt-1">
            ⚠️ {criticalCount} critical issue{criticalCount === 1 ? '' : 's'} requiring immediate attention
          </p>
        )}
      </div>
      <div className="flex gap-4 text-sm">
        {totalLost > 0 && (
          <div className="bg-hud-pink/10 px-3 py-2 rounded-lg border border-hud-pink/30">
            <div className="text-accent-pink-text font-bold">-${totalLost.toLocaleString()}/hr</div>
            <div className="text-xs text-text-muted">Income Lost</div>
          </div>
        )}
        {totalFixCost > 0 && (
          <div className="bg-hud-blue/10 px-3 py-2 rounded-lg border border-hud-blue/30">
            <div className="text-hud-blue font-bold">${totalFixCost.toLocaleString()}</div>
            <div className="text-xs text-text-muted">To Fix All</div>
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
  <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6">
    <FixedTrapsCelebration fixes={recentFixes} />
    <div className="text-center py-4">
      <CheckCircle className="w-12 h-12 text-hud-blue mx-auto mb-2" />
      <h2 className="text-xl font-bold text-hud-blue">No Active Traps!</h2>
      <p className="text-text-muted text-sm">Your setup is optimized. Keep grinding! 💰</p>
    </div>
  </div>
);

NoActiveTrapsState.propTypes = {
  recentFixes: PropTypes.arrayOf(PropTypes.object).isRequired,
};
