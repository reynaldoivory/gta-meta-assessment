// src/components/shared/ActionPlanList.jsx
import PropTypes from 'prop-types';
import { Target, Clock, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';

const ActionBadges = ({ action }) => {
  const isUrgent = action.urgency === 'URGENT' || action.urgency === 'BUY NOW' || action.urgency === 'GRIND NOW';
  const isBlocker = action.urgency === 'BLOCKER';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isUrgent && (
        <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded flex items-center gap-1">
          ⚡ URGENT
        </span>
      )}
      {isBlocker && (
        <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-bold rounded flex items-center gap-1">
          🚨 BLOCKER
        </span>
      )}
      {action.timeRemaining && (
        <span className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {action.timeRemaining} left
        </span>
      )}
    </div>
  );
};

ActionBadges.propTypes = {
  action: PropTypes.object.isRequired,
};

const ActionStats = ({ action }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
    {action.cost !== undefined && (
      <div className="flex items-center gap-1">
        <DollarSign className="w-3 h-3 text-green-400" />
        <span className="text-slate-400">Cost:</span>
        <span className="text-white font-semibold">${(action.cost / 1000000).toFixed(2)}M</span>
      </div>
    )}
    {(action.timeToComplete || action.timeEstimate) && (
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-blue-400" />
        <span className="text-slate-400">Time:</span>
        <span className="text-white font-semibold">{action.timeToComplete || action.timeEstimate}</span>
      </div>
    )}
    {action.earnings && (
      <div className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3 text-green-400" />
        <span className="text-slate-400">Earns:</span>
        <span className="text-green-400 font-semibold">{action.earnings}</span>
      </div>
    )}
    {action.potentialEarnings && (
      <div className="flex items-center gap-1 col-span-2">
        <TrendingUp className="w-3 h-3 text-yellow-400" />
        <span className="text-slate-400">Potential:</span>
        <span className="text-yellow-400 font-bold">{action.potentialEarnings}</span>
      </div>
    )}
  </div>
);

ActionStats.propTypes = {
  action: PropTypes.object.isRequired,
};

const hasMethodNotes = (action) =>
  action.method || action.timing || action.methodDetails || action.alternativeMethod || action.avoidMethod;

const ActionMethodNotes = ({ action }) => {
  if (!hasMethodNotes(action)) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      {action.method && (
        <div className="text-xs text-slate-400">
          <span className="font-semibold">Method:</span> {action.method}
        </div>
      )}
      {action.methodDetails && (
        <div className="text-xs text-slate-400 mt-1 ml-4 whitespace-pre-line">{action.methodDetails}</div>
      )}
      {action.alternativeMethod && (
        <div className="text-xs text-slate-500 mt-1 italic">{action.alternativeMethod}</div>
      )}
      {action.avoidMethod && (
        <div className="text-xs text-red-400 mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
          {action.avoidMethod}
        </div>
      )}
      {action.timing && (
        <div className="text-xs text-slate-400 mt-1">
          <span className="font-semibold">Timing:</span> {action.timing}
        </div>
      )}
    </div>
  );
};

ActionMethodNotes.propTypes = {
  action: PropTypes.object.isRequired,
};

const ActionProgressCalc = ({ action }) => {
  if (!action.impactsNeeded || !action.currentStat) return null;
  return (
    <div className="mt-3 pt-3 border-t border-slate-700">
      <div className="text-xs font-semibold text-slate-400 mb-2">Progress Calculator:</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-slate-500">Current</div>
          <div className="text-red-400 font-bold">{action.currentStat}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-slate-500">Target</div>
          <div className="text-green-400 font-bold">{action.targetStat}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-slate-500">Punches Needed</div>
          <div className="text-yellow-400 font-bold">{action.impactsNeeded}</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <div className="text-slate-500">Est. Time</div>
          <div className="text-blue-400 font-bold">{action.timeToComplete}</div>
        </div>
      </div>
    </div>
  );
};

ActionProgressCalc.propTypes = {
  action: PropTypes.object.isRequired,
};

const getTitleColor = (isUrgent, isBlocker) => {
  if (isUrgent) return 'text-yellow-300';
  if (isBlocker) return 'text-red-300';
  return 'text-white';
};

const getCardStyle = (isUrgent, isBlocker) => {
  if (isUrgent) return 'bg-yellow-900/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20';
  if (isBlocker) return 'bg-red-900/20 border-red-500/50 shadow-lg shadow-red-500/20';
  return 'bg-slate-900/60 border-slate-700';
};

const ActionBlockedWarning = ({ blockedBy }) => (
  <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
    <div className="flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-xs text-red-400 font-bold mb-1">BLOCKED BY:</div>
        <div className="text-xs text-red-300">{blockedBy.join(', ')}</div>
      </div>
    </div>
  </div>
);

ActionBlockedWarning.propTypes = {
  blockedBy: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ActionPrereqs = ({ prerequisites }) => (
  <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-slate-700">
    <span className="text-xs text-slate-500">Requires:</span>
    {prerequisites.map((prereq) => (
      <span key={prereq} className="text-xs bg-slate-900/50 text-slate-400 px-2 py-0.5 rounded border border-slate-700/50">
        {prereq}
      </span>
    ))}
  </div>
);

ActionPrereqs.propTypes = {
  prerequisites: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const ActionCard = ({ action }) => {
  const isUrgent = action.urgency === 'URGENT' || action.urgency === 'BUY NOW' || action.urgency === 'GRIND NOW';
  const isBlocker = action.urgency === 'BLOCKER';

  return (
    <div className={`p-5 rounded-xl border-2 transition-all ${getCardStyle(isUrgent, isBlocker)}`}>
      <div className="flex items-start justify-between mb-3">
        <ActionBadges action={action} />
        {typeof action.priority === 'number' && (
          <span className="text-xs font-bold text-slate-500">#{action.priority + 1}</span>
        )}
      </div>

      <h4 className={`text-lg font-bold mb-2 ${getTitleColor(isUrgent, isBlocker)}`}>
        {action.title}
      </h4>

      <p className="text-slate-300 text-sm mb-3">{action.why}</p>
      <ActionStats action={action} />

      {action.blockedBy && action.blockedBy.length > 0 && (
        <ActionBlockedWarning blockedBy={action.blockedBy} />
      )}

      <ActionMethodNotes action={action} />
      <ActionProgressCalc action={action} />

      {action.prerequisites && action.prerequisites.length > 0 && (
        <ActionPrereqs prerequisites={action.prerequisites} />
      )}
    </div>
  );
};

ActionCard.propTypes = {
  action: PropTypes.object.isRequired,
};

/**
 * Renders the full prioritized action plan list, or an empty-state message.
 */
export const ActionPlanList = ({ actionPlan }) => {
  if (!actionPlan || actionPlan.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 text-center">
        <p className="text-slate-400">No specific actions needed. You&apos;re doing great!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-blue-900/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Target className="text-blue-400 w-6 h-6" />
        <h3 className="text-xl font-bold text-white">Action Plan</h3>
        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
          {actionPlan.length} steps
        </span>
      </div>
      <div className="space-y-3">
        {actionPlan.map((action, idx) => (
          <ActionCard key={action.title || idx} action={action} />
        ))}
      </div>
    </div>
  );
};

ActionPlanList.propTypes = {
  actionPlan: PropTypes.array,
};
