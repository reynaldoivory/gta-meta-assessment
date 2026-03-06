// src/components/shared/TrapWarnings.jsx
// Displays detected traps with high visibility and actionable steps
// Integrates with trap history system for progress tracking

import React, { useState } from 'react';

import { AlertCircle } from 'lucide-react';
import { TRAP_SEVERITY, getRecentlyFixedTraps } from '../../utils/trapDetector';
import { severityConfig } from './trapWarningSeverity';
import { FixedTrapsCelebration, TrapSummary, NoActiveTrapsState } from './TrapWarningsSummary';
import { TrapCard } from './TrapCard';
import './TrapWarnings.css';

const trapIsCritical = (trap) => trap.severity === TRAP_SEVERITY.CRITICAL;

const getInitialExpandedId = (defaultExpanded, traps) => {
  if (!defaultExpanded || traps.length === 0) {
    return null;
  }
  return traps[0].id;
};

const getEmptyTrapContent = (traps, recentFixes) => {
  if (traps.length > 0) {
    return null;
  }
  return recentFixes.length > 0
    ? <NoActiveTrapsState recentFixes={recentFixes} />
    : null;
};

/**
 * Main TrapWarnings Component
 */
const TrapWarnings = ({ traps, showCelebration = true, defaultExpanded = false }: any) => {
  const [expandedId, setExpandedId] = useState(getInitialExpandedId(defaultExpanded, traps));

  React.useEffect(() => {
    const criticalTrap = traps.find(trapIsCritical);
    if (criticalTrap && !expandedId) {
      setExpandedId(criticalTrap.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when traps change, not when expandedId changes
  }, [traps]);

  const recentFixes = showCelebration ? getRecentlyFixedTraps() : [];

  const emptyStateContent = getEmptyTrapContent(traps, recentFixes);
  if (emptyStateContent) {
    return emptyStateContent;
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

export default TrapWarnings;
