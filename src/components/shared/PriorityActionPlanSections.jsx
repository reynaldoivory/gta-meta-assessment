import PropTypes from 'prop-types';
import { SessionCard } from './SessionCard';
import { AppShell, Button, EmptyState } from '../ui';

export const EmptyResultsState = ({ setStep }) => (
  <AppShell title="Priority Action Plan">
    <EmptyState
      title="No results yet"
      description="Head back to the Heist Planning Board and run your assessment first."
      action={<Button variant="secondary" onClick={() => setStep('results')}>Back to Results</Button>}
    />
  </AppShell>
);

EmptyResultsState.propTypes = {
  setStep: PropTypes.func.isRequired,
};

const NextGoalCard = ({ nextGoal }) => (
  <div className="bg-hud-blue/10 border border-hud-blue/40 rounded-lg p-4">
    <h3 className="text-xl font-bold text-hud-blue mb-2">
      🎯 Next Goal: {nextGoal.name}
    </h3>
    {nextGoal.canAffordNow ? (
      <p className="text-hud-blue text-lg">✅ You can buy this NOW!</p>
    ) : (
      <div className="space-y-2">
        <div className="flex justify-between text-text-secondary">
          <span>Cost:</span>
          <span className="font-mono">${nextGoal.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-hud-blue">
          <span>You have:</span>
          <span className="font-mono">${nextGoal.currentCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-accent-pink-text">
          <span>Need:</span>
          <span className="font-mono">${nextGoal.needed.toLocaleString()}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-lg text-hud-blue">
            ⏱️ <strong>{nextGoal.hoursRemaining}hrs</strong> of grinding
          </p>
          <p className="text-sm text-text-muted">
            Best method: {nextGoal.fastestGrind}
          </p>
        </div>
      </div>
    )}
  </div>
);

NextGoalCard.propTypes = {
  nextGoal: PropTypes.object.isRequired,
};

export const OptionalNextGoal = ({ nextGoal }) => {
  if (!nextGoal) {
    return null;
  }

  return <NextGoalCard nextGoal={nextGoal} />;
};

OptionalNextGoal.propTypes = {
  nextGoal: PropTypes.object,
};

const PassiveProgressStatus = ({ passiveProgress }) => (
  <div className="mt-4 text-xs text-text-muted">
    Passive systems maxed:{' '}
    <span className={passiveProgress?.allMaxed ? 'text-hud-blue font-semibold' : 'text-accent-pink-text font-semibold'}>
      {passiveProgress?.readyCount ?? 0}/{passiveProgress?.total ?? 4}
    </span>
    {!passiveProgress?.allMaxed && (
      <span className="ml-2 text-text-muted">
        (linear grinds are de-prioritized until passives are upgraded)
      </span>
    )}
  </div>
);

PassiveProgressStatus.propTypes = {
  passiveProgress: PropTypes.object,
};

const SessionConsultantCard = ({ sessionPlan, sessionMinutes, setSessionMinutes }) => (
  <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6">
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="text-xl font-bold text-text-primary">Session Consultant</h3>
        <p className="text-sm text-text-muted">
          Compound Efficiency: start passive clocks first, then bridge with best executable money, then invest in unlocks.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="session-minutes" className="text-xs text-text-muted">I have</label>
        <select
          id="session-minutes"
          value={sessionMinutes}
          onChange={(e) => setSessionMinutes(Number(e.target.value))}
          className="bg-bg-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
        >
          <option value={30}>30 minutes</option>
          <option value={60}>60 minutes</option>
          <option value={90}>90 minutes</option>
          <option value={120}>120 minutes</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SessionCard label="1) The Tax (first 5 mins)" action={sessionPlan.tax} />
      <SessionCard label="2) The Bridge (main block)" action={sessionPlan.bridge} />
      <SessionCard label="3) The Investment (final mins)" action={sessionPlan.investment} />
    </div>

    <PassiveProgressStatus passiveProgress={sessionPlan.meta?.passiveProgress} />
  </div>
);

SessionConsultantCard.propTypes = {
  sessionPlan: PropTypes.object.isRequired,
  sessionMinutes: PropTypes.number.isRequired,
  setSessionMinutes: PropTypes.func.isRequired,
};

export const OptionalSessionConsultant = ({ sessionPlan, sessionMinutes, setSessionMinutes }) => {
  if (!sessionPlan) {
    return null;
  }

  return (
    <SessionConsultantCard
      sessionPlan={sessionPlan}
      sessionMinutes={sessionMinutes}
      setSessionMinutes={setSessionMinutes}
    />
  );
};

OptionalSessionConsultant.propTypes = {
  sessionPlan: PropTypes.object,
  sessionMinutes: PropTypes.number.isRequired,
  setSessionMinutes: PropTypes.func.isRequired,
};
