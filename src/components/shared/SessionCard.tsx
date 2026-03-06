// src/components/shared/SessionCard.jsx

import { Clock, AlertTriangle } from 'lucide-react';

/**
 * Renders a single session plan card (Tax / Bridge / Investment slot).
 */
export const SessionCard = ({ label, action }: any) => {
  if (!action) {
    return (
      <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/40">
        <div className="text-xs font-bold text-slate-400 mb-2">{label}</div>
        <div className="text-slate-400 text-sm">No recommendation found for this slot.</div>
      </div>
    );
  }

  const blocked = action.blockedBy && action.blockedBy.length > 0;
  const multiplier = action.launchesPassiveTimer ? '3× Passive Multiplier' : null;
  const velocity = typeof action.unlockVelocity === 'number' ? `Unlock Velocity: ${action.unlockVelocity}` : null;

  return (
    <div className={`p-4 rounded-xl border ${blocked ? 'border-red-500/40 bg-red-950/10' : 'border-slate-700 bg-slate-900/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-slate-400">{label}</div>
        <div className="flex items-center gap-2">
          {action.estimatedMinutes != null && (
            <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {action.estimatedMinutes}m
            </span>
          )}
          {multiplier && (
            <span className="text-xs text-cyan-300 bg-cyan-900/20 border border-cyan-500/20 px-2 py-1 rounded">
              {multiplier}
            </span>
          )}
          {velocity && (
            <span className="text-xs text-purple-300 bg-purple-900/20 border border-purple-500/20 px-2 py-1 rounded">
              {velocity}
            </span>
          )}
        </div>
      </div>

      <div className="text-white font-bold">{action.title}</div>
      <div className="text-slate-300 text-sm mt-1">{action.why}</div>

      {blocked && (
        <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-900/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-red-400 font-bold mb-1">GATEKEEPER BLOCK</div>
              <div className="text-xs text-red-300">{action.blockedBy.join(', ')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

SessionCard.propTypes = {
  label: PropTypes.string.isRequired,
  action: PropTypes.shape({
    title: PropTypes.string,
    why: PropTypes.string,
    estimatedMinutes: PropTypes.number,
    launchesPassiveTimer: PropTypes.bool,
    unlockVelocity: PropTypes.number,
    blockedBy: PropTypes.arrayOf(PropTypes.string),
  }),
};
