import PropTypes from 'prop-types';
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
      <span className="flex items-center gap-1 text-accent-pink-text">
        <TrendingDown className="w-4 h-4" />
        -${trap.lostPerHour.toLocaleString()}/hr
      </span>
    )}
    {trap.wastedInvestment > 0 && (
      <span className="flex items-center gap-1 text-accent-pink-text">
        <DollarSign className="w-4 h-4" />
        ${trap.wastedInvestment.toLocaleString()} wasted
      </span>
    )}
    {trap.fixCost > 0 && (
      <span className="flex items-center gap-1 text-hud-blue">
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
      <h4 className="text-sm font-bold text-text-secondary">Step-by-Step Fix:</h4>
      <ol className="space-y-2">
        {requiredSteps.map((stepItem) => {
          const { step, reason } = getStepDetails(stepItem);
          const stepKey = `${step}-${reason || 'no-reason'}`;
          return (
            <li key={stepKey} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-bg-raised text-text-secondary flex items-center justify-center text-xs font-bold">
                {requiredSteps.indexOf(stepItem) + 1}
              </span>
              <div className="flex-1">
                <span className="text-text-primary text-sm">{step}</span>
                {reason && (
                  <p className="text-xs text-text-muted mt-0.5 italic">
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
    <div className="mt-3 bg-hud-blue/10 border border-hud-blue/30 rounded-lg p-3">
      <h4 className="text-sm font-bold text-hud-blue mb-2 flex items-center gap-1">
        <Clock className="w-4 h-4" /> Recovery Timeline
      </h4>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-text-muted">Current Income:</span>
          <span className="text-accent-pink-text font-bold ml-2">
            ${recoveryCalculation.currentIncome.toLocaleString()}/hr
          </span>
        </div>
        <div>
          <span className="text-text-muted">Potential Income:</span>
          <span className="text-hud-blue font-bold ml-2">
            ${recoveryCalculation.potentialIncome.toLocaleString()}/hr
          </span>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <span className="text-text-muted">Time to recover investment:</span>
        <span className="text-hud-blue font-bold ml-2">
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
    <div className="mt-3 bg-hud-blue/10 border border-hud-blue/30 rounded-lg p-3">
      <h4 className="text-sm font-bold text-hud-blue mb-2">Performance Metrics</h4>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-bg-base/30 p-2 rounded">
          <div className="text-xs text-text-muted">Historical Avg</div>
          <div className="text-lg font-bold text-hud-blue">{efficiencyData.historicalAvg}min</div>
        </div>
        <div className="bg-bg-base/30 p-2 rounded">
          <div className="text-xs text-text-muted">Recent Avg</div>
          <div className="text-lg font-bold text-accent-pink-text">{efficiencyData.recentAvg}min</div>
        </div>
        <div className="bg-bg-base/30 p-2 rounded">
          <div className="text-xs text-text-muted">Decay</div>
          <div className="text-lg font-bold text-accent-pink-text">+{efficiencyData.decayPct}%</div>
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
    <div className="mt-3 bg-hud-blue/10 border border-hud-blue/30 rounded-lg p-3">
      <h4 className="text-sm font-bold text-hud-blue mb-2">Recovery Tips</h4>
      <ul className="text-sm text-text-secondary space-y-1">
        {recoveryTips.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <span className="text-hud-blue">•</span>
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
    <div className="mt-3 flex items-center gap-2 text-sm text-text-muted">
      <Clock className="w-4 h-4" />
      <span>Estimated fix time: {timeToFix}</span>
    </div>
  );
};

TrapFixTime.propTypes = {
  timeToFix: PropTypes.string,
};

const TrapExpandedDetails = ({ trap }) => (
  <div className="px-4 pb-4 pt-0 border-t border-border-subtle">
    <div className="bg-bg-base/30 rounded-lg p-3 mb-3">
      <h4 className="text-sm font-bold text-text-secondary mb-1 flex items-center gap-1">
        <Info className="w-4 h-4" /> Why This Matters
      </h4>
      <p className="text-sm text-text-muted">{trap.reasoning}</p>
    </div>

    <div className="bg-hud-blue/10 border border-hud-blue/30 rounded-lg p-3 mb-3">
      <h4 className="text-sm font-bold text-hud-blue mb-1 flex items-center gap-1">
        <Zap className="w-4 h-4" /> Solution
      </h4>
      <p className="text-sm text-hud-blue">{trap.solution}</p>
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

export const TrapCard = ({ trap, isExpanded, onToggle }) => {
  const config = severityConfig[trap.severity] || severityConfig[TRAP_SEVERITY.MEDIUM];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border-2 ${config.border} rounded-xl overflow-hidden transition-all duration-300 ${config.glow} ${
        trap.isCascadeTrap ? 'ring-2 ring-hud-pink/50 animate-pulse-subtle' : ''
      }`}
    >
      <button
        type="button"
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
              <span className="px-2 py-0.5 bg-hud-pink text-text-on-accent rounded text-xs font-bold animate-pulse">
                CASCADE
              </span>
            )}
            {trap.isEfficiencyDecay && (
              <span className="px-2 py-0.5 bg-hud-blue text-text-on-accent rounded text-xs font-bold">
                EFFICIENCY DECAY
              </span>
            )}
          </div>

          <h3 className="font-bold text-text-primary text-lg leading-tight">
            {trap.title}
          </h3>

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
