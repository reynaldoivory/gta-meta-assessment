// src/components/shared/SessionCard.jsx
import PropTypes from 'prop-types';
import { Clock, AlertTriangle } from 'lucide-react';

/**
 * Renders a single session plan card (Tax / Bridge / Investment slot).
 */
export const SessionCard = ({ label, action }) => {
  if (!action) {
    return (
      <div className="p-4 rounded-xl border border-border bg-bg-base/40">
        <div className="text-xs font-bold text-text-muted mb-2">{label}</div>
        <div className="text-text-muted text-sm">Nothing to recommend for this slot yet. Add more businesses or upgrades to unlock options.</div>
      </div>
    );
  }

  const blocked = action.blockedBy && action.blockedBy.length > 0;
  const multiplier = action.launchesPassiveTimer ? '3× Passive Multiplier' : null;
  const velocity = typeof action.unlockVelocity === 'number' ? `Unlock Velocity: ${action.unlockVelocity}` : null;

  return (
    <div className={`p-4 rounded-xl border ${blocked ? 'border-hud-pink/40 bg-hud-pink/10' : 'border-border bg-bg-base/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-text-muted">{label}</div>
        <div className="flex items-center gap-2">
          {action.estimatedMinutes != null && (
            <span className="text-xs text-text-secondary bg-bg-raised px-2 py-1 rounded inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {action.estimatedMinutes}m
            </span>
          )}
          {multiplier && (
            <span className="text-xs text-hud-blue bg-hud-blue/10 border border-hud-blue/20 px-2 py-1 rounded">
              {multiplier}
            </span>
          )}
          {velocity && (
            <span className="text-xs text-hud-blue bg-hud-blue/10 border border-hud-blue/20 px-2 py-1 rounded">
              {velocity}
            </span>
          )}
        </div>
      </div>

      <div className="text-text-primary font-bold">{action.title}</div>
      <div className="text-text-secondary text-sm mt-1">{action.why}</div>

      {blocked && (
        <div className="mt-3 p-3 rounded-lg border border-hud-pink/30 bg-hud-pink/10">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-hud-pink flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-accent-pink-text font-bold mb-1">GATEKEEPER BLOCK</div>
              <div className="text-xs text-accent-pink-text">{action.blockedBy.join(', ')}</div>
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
