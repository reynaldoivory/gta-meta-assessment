// src/components/shared/TrapWarnings.jsx
// Displays detected traps with high visibility and actionable steps
// Integrates with trap history system for progress tracking

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Clock, DollarSign, CheckCircle, TrendingDown, Zap, Info } from 'lucide-react';
import { TRAP_SEVERITY, getRecentlyFixedTraps } from '../../utils/trapDetector';
import './TrapWarnings.css';

/**
 * Severity badge styling
 */
const severityConfig = {
  [TRAP_SEVERITY.CRITICAL]: {
    bg: 'bg-red-900/40',
    border: 'border-red-500',
    text: 'text-red-400',
    badge: 'bg-red-500 text-white',
    icon: AlertCircle,
    glow: 'shadow-red-500/20 shadow-lg',
  },
  [TRAP_SEVERITY.HIGH]: {
    bg: 'bg-orange-900/30',
    border: 'border-orange-500/70',
    text: 'text-orange-400',
    badge: 'bg-orange-500 text-white',
    icon: AlertTriangle,
    glow: '',
  },
  [TRAP_SEVERITY.MEDIUM]: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/80 text-black',
    icon: AlertTriangle,
    glow: '',
  },
  [TRAP_SEVERITY.LOW]: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/70 text-white',
    icon: Info,
    glow: '',
  },
};

/**
 * Individual trap card component
 */
const TrapCard = ({ trap, isExpanded, onToggle }) => {
  const config = severityConfig[trap.severity] || severityConfig[TRAP_SEVERITY.MEDIUM];
  const Icon = config.icon;
  
  return (
    <div 
      className={`${config.bg} border-2 ${config.border} rounded-xl overflow-hidden transition-all duration-300 ${config.glow} ${
        trap.isCascadeTrap ? 'ring-2 ring-red-500/50 animate-pulse-subtle' : ''
      }`}
    >
      {/* Header - Always visible */}
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
          
          {/* Cost/Impact - Always show */}
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
        </div>
        
        <div className={`${config.text}`}>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50">
          {/* Why This Matters */}
          <div className="bg-black/30 rounded-lg p-3 mb-3">
            <h5 className="text-sm font-bold text-slate-300 mb-1 flex items-center gap-1">
              <Info className="w-4 h-4" /> Why This Matters
            </h5>
            <p className="text-sm text-slate-400">{trap.reasoning}</p>
          </div>
          
          {/* Solution */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mb-3">
            <h5 className="text-sm font-bold text-green-400 mb-1 flex items-center gap-1">
              <Zap className="w-4 h-4" /> Solution
            </h5>
            <p className="text-sm text-green-300">{trap.solution}</p>
          </div>
          
          {/* Required Steps with WHY explanations */}
          {trap.requiredSteps && trap.requiredSteps.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-bold text-slate-300">Step-by-Step Fix:</h5>
              <ol className="space-y-2">
                {trap.requiredSteps.map((stepItem, idx) => {
                  // Handle both old format (string) and new format (object with step + reason)
                  const step = typeof stepItem === 'string' ? stepItem : stepItem.step;
                  const reason = typeof stepItem === 'object' ? stepItem.reason : null;
                  
                  return (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
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
          )}
          
          {/* Recovery Calculation for Cascade Traps */}
          {trap.recoveryCalculation && (
            <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <h5 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Recovery Timeline
              </h5>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">Current Income:</span>
                  <span className="text-red-400 font-bold ml-2">
                    ${trap.recoveryCalculation.currentIncome.toLocaleString()}/hr
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Potential Income:</span>
                  <span className="text-green-400 font-bold ml-2">
                    ${trap.recoveryCalculation.potentialIncome.toLocaleString()}/hr
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm">
                <span className="text-slate-400">Time to recover investment:</span>
                <span className="text-purple-300 font-bold ml-2">
                  ~{trap.recoveryCalculation.hoursToRecoverWaste} hours
                </span>
              </div>
            </div>
          )}
          
          {/* Efficiency Decay Data */}
          {trap.efficiencyData && (
            <div className="mt-3 bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <h5 className="text-sm font-bold text-purple-300 mb-2">Performance Metrics</h5>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-black/30 p-2 rounded">
                  <div className="text-xs text-slate-400">Historical Avg</div>
                  <div className="text-lg font-bold text-green-400">{trap.efficiencyData.historicalAvg}min</div>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <div className="text-xs text-slate-400">Recent Avg</div>
                  <div className="text-lg font-bold text-red-400">{trap.efficiencyData.recentAvg}min</div>
                </div>
                <div className="bg-black/30 p-2 rounded">
                  <div className="text-xs text-slate-400">Decay</div>
                  <div className="text-lg font-bold text-red-400">+{trap.efficiencyData.decayPct}%</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Recovery Tips for Burnout */}
          {trap.recoveryTips && (
            <div className="mt-3 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <h5 className="text-sm font-bold text-blue-300 mb-2">Recovery Tips</h5>
              <ul className="text-sm text-slate-300 space-y-1">
                {trap.recoveryTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Time to Fix */}
          {trap.timeToFix && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Estimated fix time: {trap.timeToFix}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Recently Fixed Traps Celebration
 */
const FixedTrapsCelebration = ({ fixes }) => {
  if (!fixes || fixes.length === 0) return null;
  
  return (
    <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-4">
      <h4 className="font-bold text-green-400 flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5" />
        Recently Fixed Traps! 🎉
      </h4>
      <div className="space-y-2">
        {fixes.map((fix, idx) => (
          <div key={idx} className="flex items-center justify-between bg-black/20 rounded-lg p-2 text-sm">
            <span className="text-green-300">✅ {fix.trapTitle || fix.trapId}</span>
            <span className="text-slate-400">
              {new Date(fix.fixedAt).toLocaleDateString()}
              {fix.scoreAfter && fix.scoreBefore && (
                <span className="ml-2 text-green-400">
                  Score: {fix.scoreBefore} → {fix.scoreAfter}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Trap Summary Header
 */
const TrapSummary = ({ traps }) => {
  const criticalCount = traps.filter(t => t.severity === TRAP_SEVERITY.CRITICAL).length;
  const totalLost = traps.reduce((sum, t) => sum + (t.lostPerHour || 0), 0);
  const totalFixCost = traps.reduce((sum, t) => sum + (t.fixCost || 0), 0);
  
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          {traps.length} Trap{traps.length !== 1 ? 's' : ''} Detected
        </h3>
        {criticalCount > 0 && (
          <p className="text-sm text-red-400 mt-1">
            ⚠️ {criticalCount} critical issue{criticalCount !== 1 ? 's' : ''} requiring immediate attention
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

/**
 * Main TrapWarnings Component
 */
const TrapWarnings = ({ traps, showCelebration = true, defaultExpanded = false }) => {
  const [expandedId, setExpandedId] = useState(
    defaultExpanded && traps.length > 0 ? traps[0].id : null
  );
  
  // Auto-expand critical traps
  React.useEffect(() => {
    const criticalTrap = traps.find(t => t.severity === TRAP_SEVERITY.CRITICAL);
    if (criticalTrap && !expandedId) {
      setExpandedId(criticalTrap.id);
    }
  }, [traps]);
  
  const recentFixes = showCelebration ? getRecentlyFixedTraps() : [];
  
  if (traps.length === 0 && recentFixes.length === 0) {
    return null;
  }
  
  // Show "all clear" if no traps but recently fixed some
  if (traps.length === 0 && recentFixes.length > 0) {
    return (
      <div className="bg-slate-900/60 border border-green-500/30 rounded-2xl p-6">
        <FixedTrapsCelebration fixes={recentFixes} />
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-green-400">No Active Traps!</h3>
          <p className="text-slate-400 text-sm">Your setup is optimized. Keep grinding! 💰</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-slate-900/60 border border-red-900/30 rounded-2xl p-6">
      {recentFixes.length > 0 && <FixedTrapsCelebration fixes={recentFixes} />}
      
      <TrapSummary traps={traps} />
      
      <div className="space-y-3">
        {traps.map((trap) => (
          <TrapCard
            key={trap.id}
            trap={trap}
            isExpanded={expandedId === trap.id}
            onToggle={() => setExpandedId(expandedId === trap.id ? null : trap.id)}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Blocking Warning for AssessmentForm (prevents submission)
 */
export const TrapBlockingWarning = ({ trap, onAcknowledge }) => {
  if (!trap) return null;
  
  const config = severityConfig[trap.severity];
  
  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-xl p-4 ${config.glow}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-6 h-6 ${config.text} flex-shrink-0`} />
        <div className="flex-1">
          <h4 className="font-bold text-white">{trap.title}</h4>
          <p className="text-sm text-slate-300 mt-1">{trap.problem}</p>
          <p className="text-sm text-slate-400 mt-2">{trap.solution}</p>
          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
            >
              I understand, continue anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes
const trapShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(Object.values(TRAP_SEVERITY)).isRequired,
  title: PropTypes.string.isRequired,
  problem: PropTypes.string.isRequired,
  solution: PropTypes.string,
  reasoning: PropTypes.string,
  lostPerHour: PropTypes.number,
  fixCost: PropTypes.number,
  wastedInvestment: PropTypes.number,
  timeToFix: PropTypes.string,
  isCascadeTrap: PropTypes.bool,
  isEfficiencyDecay: PropTypes.bool,
  requiredSteps: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        step: PropTypes.string,
        reason: PropTypes.string,
      }),
    ])
  ),
  recoveryCalculation: PropTypes.shape({
    currentIncome: PropTypes.number,
    potentialIncome: PropTypes.number,
    hoursToRecoverWaste: PropTypes.number,
  }),
  efficiencyData: PropTypes.shape({
    detected: PropTypes.bool,
    recentAvg: PropTypes.number,
    historicalAvg: PropTypes.number,
    decayPct: PropTypes.number,
  }),
  recoveryTips: PropTypes.arrayOf(PropTypes.string),
});

TrapWarnings.propTypes = {
  traps: PropTypes.arrayOf(trapShape).isRequired,
  showCelebration: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
};

TrapWarnings.defaultProps = {
  showCelebration: true,
  defaultExpanded: false,
};

TrapBlockingWarning.propTypes = {
  trap: trapShape,
  onAcknowledge: PropTypes.func,
};

export default TrapWarnings;
