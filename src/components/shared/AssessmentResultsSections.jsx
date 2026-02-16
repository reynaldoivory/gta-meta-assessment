import PropTypes from 'prop-types';
import { AlertCircle } from 'lucide-react';
import AcidLabTracker from './AcidLabTracker';
import DailyTracker from './DailyTracker';
import TrapWarnings from './TrapWarnings';
import CommunityTrapStats from './CommunityTrapStats';
import { StrengthCalc } from './StrengthCalc';
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';

export const TrapSection = ({ detectedTraps, trapSummary, formData }) => (
  <>
    {detectedTraps.length > 0 && (
      <TrapWarnings traps={detectedTraps} showCelebration defaultExpanded={trapSummary.criticalCount > 0} />
    )}
    <CommunityTrapStats formData={formData} currentTraps={detectedTraps} />
  </>
);

TrapSection.propTypes = {
  detectedTraps: PropTypes.arrayOf(PropTypes.object).isRequired,
  trapSummary: PropTypes.object.isRequired,
  formData: PropTypes.object.isRequired,
};

const GtaPlusReminder = () => (
  <div className="mb-6 p-4 bg-purple-900/30 border border-purple-500/50 rounded-xl flex items-center gap-4">
    <div className="text-3xl">🏎️</div>
    <div className="flex-1">
      <div className="font-bold text-white mb-1">
        Don&apos;t Forget: Free {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}
      </div>
      <div className="text-sm text-slate-300">
        Claim it at {WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'The Vinewood Car Club'}.
        Worth ${((WEEKLY_EVENTS.gtaPlus?.freeCarValue || 1850000) / 1000000).toFixed(1)}M for free.
        Perfect for early-game transport.
      </div>
    </div>
  </div>
);

export const OptionalGtaPlusReminder = ({ formData }) => {
  const shouldShowReminder = formData.hasGTAPlus
    && !formData.claimedFreeCar
    && !formData.hasRaiju
    && !formData.hasOppressor;

  if (!shouldShowReminder) {
    return null;
  }

  return <GtaPlusReminder />;
};

OptionalGtaPlusReminder.propTypes = {
  formData: PropTypes.object.isRequired,
};

export const TrackersSection = ({ formData, setFormData }) => (
  <>
    <DailyTracker
      hasNightclub={formData.hasNightclub}
      hasAgency={formData.hasAgency}
      formData={formData}
      setFormData={setFormData}
    />
    {formData.hasAcidLab && (
      <AcidLabTracker hasAcidLab={formData.hasAcidLab} acidLabUpgraded={formData.acidLabUpgraded} />
    )}
  </>
);

TrackersSection.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};

const BottlenecksList = ({ bottlenecks }) => (
  <div className="bg-slate-900/60 border border-red-900/30 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <AlertCircle className="text-red-400 w-6 h-6" />
      <h3 className="text-xl font-bold text-white">Bottlenecks</h3>
    </div>
    <div className="space-y-3">
      {bottlenecks.map((b) => (
        <div
          key={b.id || b.label}
          className={`p-4 rounded-xl ${
            b.critical
              ? 'bg-red-950/20 border-2 border-red-500/40'
              : 'bg-orange-950/10 border border-orange-500/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {b.critical && (
              <span className="text-red-400 font-bold text-xs uppercase bg-red-900/30 px-2 py-0.5 rounded">
                CRITICAL
              </span>
            )}
            <span className="text-slate-200 font-semibold">{b.label}</span>
          </div>
          {b.detail && <p className="text-slate-400 text-sm">{b.detail}</p>}
        </div>
      ))}
    </div>
  </div>
);

BottlenecksList.propTypes = {
  bottlenecks: PropTypes.array.isRequired,
};

export const OptionalBottlenecks = ({ results }) => {
  if (!results.bottlenecks?.length) {
    return null;
  }

  return <BottlenecksList bottlenecks={results.bottlenecks} />;
};

OptionalBottlenecks.propTypes = {
  results: PropTypes.object.isRequired,
};

const NextGoalCard = ({ nextGoal, incomePerHour }) => (
  <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500 rounded-lg p-4">
    <h3 className="text-xl font-bold text-green-400 mb-2">
      🎯 Next Major Goal: {nextGoal.name}
    </h3>
    {nextGoal.canAffordNow ? (
      <p className="text-green-300 text-lg">✅ You can afford this now! Go buy it.</p>
    ) : (
      <div className="space-y-2">
        <div className="flex justify-between text-slate-300">
          <span>Cost:</span>
          <span className="font-mono">${nextGoal.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>You have:</span>
          <span className="font-mono text-yellow-400">${nextGoal.currentCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>Still need:</span>
          <span className="font-mono text-red-400">${nextGoal.needed.toLocaleString()}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-lg text-green-300">
            ⏱️ <strong>{nextGoal.hoursRemaining} hours</strong> of grinding
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Best method: {nextGoal.fastestGrind} @ ${incomePerHour.toLocaleString()}/hr
          </p>
        </div>
      </div>
    )}
  </div>
);

NextGoalCard.propTypes = {
  nextGoal: PropTypes.object.isRequired,
  incomePerHour: PropTypes.number.isRequired,
};

export const GoalAndStrengthSection = ({
  needsStrengthTraining,
  strengthPct,
  formData,
  nextGoal,
  incomePerHour,
}) => (
  <>
    {needsStrengthTraining && (
      <StrengthCalc currentPct={strengthPct} hasMansion={formData.hasMansion} />
    )}
    {nextGoal && <NextGoalCard nextGoal={nextGoal} incomePerHour={incomePerHour} />}
  </>
);

GoalAndStrengthSection.propTypes = {
  needsStrengthTraining: PropTypes.bool.isRequired,
  strengthPct: PropTypes.number.isRequired,
  formData: PropTypes.object.isRequired,
  nextGoal: PropTypes.object,
  incomePerHour: PropTypes.number.isRequired,
};
