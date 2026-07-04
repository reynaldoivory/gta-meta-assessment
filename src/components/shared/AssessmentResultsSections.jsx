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
  <div className="mb-6 p-4 bg-hud-blue/10 border border-hud-blue/40 rounded-xl flex items-center gap-4">
    <div className="text-3xl">🏎️</div>
    <div className="flex-1">
      <div className="font-bold text-text-primary mb-1">
        Don&apos;t Forget: Free {WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'}
      </div>
      <div className="text-sm text-text-secondary">
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
  <div className="bg-bg-surface border border-hud-pink/30 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <AlertCircle className="text-hud-pink w-6 h-6" />
      <h2 className="text-xl font-bold text-text-primary">Bottlenecks</h2>
    </div>
    <div className="space-y-3">
      {bottlenecks.map((b) => (
        <div
          key={b.id || b.label}
          className={`p-4 rounded-xl ${
            b.critical
              ? 'bg-hud-pink/10 border-2 border-hud-pink/40'
              : 'bg-hud-pink/5 border border-hud-pink/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            {b.critical && (
              <span className="text-accent-pink-text font-bold text-xs uppercase bg-hud-pink/20 px-2 py-0.5 rounded">
                CRITICAL
              </span>
            )}
            <span className="text-text-secondary font-semibold">{b.label}</span>
          </div>
          {b.detail && <p className="text-text-muted text-sm">{b.detail}</p>}
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
  <div className="bg-hud-blue/10 border border-hud-blue/40 rounded-lg p-4">
    <h2 className="text-xl font-bold text-hud-blue mb-2">
      🎯 Next Major Goal: {nextGoal.name}
    </h2>
    {nextGoal.canAffordNow ? (
      <p className="text-hud-blue text-lg">✅ You can afford this now! Go buy it.</p>
    ) : (
      <div className="space-y-2">
        <div className="flex justify-between text-text-secondary">
          <span>Cost:</span>
          <span className="font-mono">${nextGoal.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>You have:</span>
          <span className="font-mono text-hud-blue">${nextGoal.currentCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Still need:</span>
          <span className="font-mono text-accent-pink-text">${nextGoal.needed.toLocaleString()}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-lg text-hud-blue">
            ⏱️ <strong>{nextGoal.hoursRemaining} hours</strong> of grinding
          </p>
          <p className="text-sm text-text-muted mt-1">
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
