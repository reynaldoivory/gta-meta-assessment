
import { ChevronDown, ChevronUp, Clock, DollarSign, TrendingDown, Zap, Info } from 'lucide-react';
import { TRAP_SEVERITY } from '../../utils/trapDetector';
import { severityConfig } from './trapWarningSeverity';

const getStepDetails = (stepItem) => {
  if (typeof stepItem === 'string') {
    return { step: stepItem, reason: null };
  }
  return { step: stepItem.step, reason: stepItem.reason };
};

const TrapImpactMetrics = ({ trap }) => (
  <div className="flex items-center gap-4 mt-2 text-sm">
    {trap.lostPerHour > 0 && (
      <span className="flex items-center gap-1 text-red-400">
        <TrendingDown className="w-4 h-4" />
        -${trap.lostPerHour.toLocaleString()}/hr
      </span>
    )}
    {trap.wastedInvestment > 0 && (
      <span className="flex items-center gap-1 text-red-300">
        <DollarSign className="w-4 h-4" />
        ${trap.wastedInvestment.toLocaleString()} wasted
      </span>
    )}
    {trap.fixCost > 0 && (
      <span className="flex items-center gap-1 text-green-400">
        <DollarSign className="w-4 h-4" />
        ${trap.fixCost.toLocaleString()} to fix
      </span>
    )}
  </div>
);

TrapImpactMetrics.propTypes = {
  trap: PropTypes.object.isRequired,
};

const TrapFixSteps = ({ requiredSteps }) => {
  if (!requiredSteps || requiredSteps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h5 className="text-sm font-bold text-slate-300">Step-by-Step Fix:</h5>
      <ol className="space-y-2">
        {requiredSteps.map((stepItem) => {
          const { step, reason } = getStepDetails(stepItem);
          const stepKey = `${step}-${reason || 'no-reason'}`;
          return (
            <li key={stepKey} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                {requiredSteps.indexOf(stepItem) + 1}
              </span>
              <div className="flex-1">
                <span className="text-slate-200 text-sm">{step}</span>
                {reason && (
                  <p className="text-xs text-slate-500 mt-0.5 italic">
                    Why: {reason}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

TrapFixSteps.propTypes = {
  requiredSteps: PropTypes.array,
};

const RecoveryTimelinePanel = ({ recoveryCalculation }) => {
  if (!recoveryCalculation) {
    return null;
  }

  return (
    <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
      <h5 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-1">
        <Clock className="w-4 h-4" /> Recovery Timeline
      </h5>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-slate-400">Current Income:</span>
          <span className="text-red-400 font-bold ml-2">
            ${recoveryCalculation.currentIncome.toLocaleString()}/hr
          </span>
        </div>
        <div>
          <span className="text-slate-400">Potential Income:</span>
          <span className="text-green-400 font-bold ml-2">
            ${recoveryCalculation.potentialIncome.toLocaleString()}/hr
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <span className="text-slate-400">Time to recover investment:</span>
        <span className="text-purple-300 font-bold ml-2">
          ~{recoveryCalculation.hoursToRecoverWaste} hours
        </span>
      </div>
    </div>
  );
};

RecoveryTimelinePanel.propTypes = {
  recoveryCalculation: PropTypes.object,
};

const EfficiencyMetricsPanel = ({ efficiencyData }) => {
  if (!efficiencyData) {
    return null;
  }

  return (
    <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
      <h5 className="text-sm font-bold text-purple-300 mb-2">Performance Metrics</h5>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-black/30 p-2 rounded">
          <div className="text-xs text-slate-400">Historical Avg</div>
          <div className="text-lg font-bold text-green-400">{efficiencyData.historicalAvg}min</div>
        </div>
        <div className="bg-black/30 p-2 rounded">
          <div className="text-xs text-slate-400">Recent Avg</div>
          <div className="text-lg font-bold text-red-400">{efficiencyData.recentAvg}min</div>
        </div>
        <div className="bg-black/30 p-2 rounded">
          <div className="text-xs text-slate-400">Decay</div>
          <div className="text-lg font-bold text-red-400">+{efficiencyData.decayPct}%</div>
        </div>
      </div>
    </div>
  );
};

EfficiencyMetricsPanel.propTypes = {
  efficiencyData: PropTypes.object,
};

const RecoveryTipsPanel = ({ recoveryTips }) => {
  if (!recoveryTips) {
    return null;
  }

  return (
    <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
      <h5 className="text-sm font-bold text-blue-300 mb-2">Recovery Tips</h5>
      <ul className="text-sm text-slate-300 space-y-1">
        {recoveryTips.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <span className="text-blue-400">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

RecoveryTipsPanel.propTypes = {
  recoveryTips: PropTypes.array,
};

const TrapFixTime = ({ timeToFix }) => {
  if (!timeToFix) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
      <Clock className="w-4 h-4" />
      <span>Estimated fix time: {timeToFix}</span>
    </div>
  );
};

TrapFixTime.propTypes = {
  timeToFix: PropTypes.string,
};

const TrapExpandedDetails = ({ trap }) => (
  <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
    <div className="bg-black/30 rounded-lg p-3 mb-3">
      <h5 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-1">
        <Info className="w-4 h-4" /> Why This Matters
      </h5>
      <p className="text-sm text-slate-400">{trap.reasoning}</p>
    </div>

    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-3">
      <h5 className="text-sm font-bold text-green-400 mb-1 flex items-center gap-1">
        <Zap className="w-4 h-4" /> Solution
      </h5>
      <p className="text-sm text-green-300">{trap.solution}</p>
    </div>

    <TrapFixSteps requiredSteps={trap.requiredSteps} />
    <RecoveryTimelinePanel recoveryCalculation={trap.recoveryCalculation} />
    <EfficiencyMetricsPanel efficiencyData={trap.efficiencyData} />
    <RecoveryTipsPanel recoveryTips={trap.recoveryTips} />
    <TrapFixTime timeToFix={trap.timeToFix} />
  </div>
);

TrapExpandedDetails.propTypes = {
  trap: PropTypes.object.isRequired,
};

export const TrapCard = ({ trap, isExpanded, onToggle }: any) => {
  const config = severityConfig[trap.severity] || severityConfig[TRAP_SEVERITY.MEDIUM];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border-2 ${config.border} rounded-xl overflow-hidden transition-all duration-300 ${config.glow} ${
        trap.isCascadeTrap ? 'ring-2 ring-red-500/50 animate-pulse-subtle' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-white/5 transition-colors"
      >
        <Icon className={`w-6 h-6 ${config.text} flex-shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${config.badge}`}>
              {trap.severity}
            </span>
            {trap.isCascadeTrap && (
              <span className="px-2 py-0.5 bg-red-600 text-white rounded text-xs font-bold animate-pulse">
                CASCADE
              </span>
            )}
            {trap.isEfficiencyDecay && (
              <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-bold">
                EFFICIENCY DECAY
              </span>
            )}
          </div>

          <h4 className="font-bold text-white text-lg leading-tight">
            {trap.title}
          </h4>

          <p className={`text-sm ${config.text} mt-1`}>
            {trap.problem}
          </p>

          <TrapImpactMetrics trap={trap} />
        </div>

        <div className={`${config.text}`}>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && <TrapExpandedDetails trap={trap} />}
    </div>
  );
};

TrapCard.propTypes = {
  trap: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
