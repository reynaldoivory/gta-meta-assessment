import PropTypes from 'prop-types';
import { ArrowLeft } from 'lucide-react';
import { SessionCard } from './SessionCard';

export const EmptyResultsState = ({ setStep }) => (
  <div className="min-h-screen bg-slate-950 p-4 md:p-6">
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => setStep('results')}
        className="mb-4 text-slate-400 hover:text-white"
      >
        ← Back to Results
      </button>
      <p className="text-slate-400">No results yet. Head back to the Heist Planning Board and run your assessment first.</p>
    </div>
  </div>
);

EmptyResultsState.propTypes = {
  setStep: PropTypes.func.isRequired,
};

export const ActionPlanHeader = ({ setStep }) => (
  <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-700">
    <button
      onClick={() => setStep('results')}
      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
    >
      <ArrowLeft className="w-4 h-4" /> Back to Results
    </button>
    <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
      Priority Action Plan
    </div>
  </div>
);

ActionPlanHeader.propTypes = {
  setStep: PropTypes.func.isRequired,
};

const NextGoalCard = ({ nextGoal }) => (
  <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500 rounded-lg p-4">
    <h3 className="text-xl font-bold text-green-400 mb-2">
      🎯 Next Goal: {nextGoal.name}
    </h3>
    {nextGoal.canAffordNow ? (
      <p className="text-green-300 text-lg">✅ You can buy this NOW!</p>
    ) : (
      <div className="space-y-2">
        <div className="flex justify-between text-slate-300">
          <span>Cost:</span>
          <span className="font-mono">${nextGoal.cost.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-yellow-400">
          <span>You have:</span>
          <span className="font-mono">${nextGoal.currentCash.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-red-400">
          <span>Need:</span>
          <span className="font-mono">${nextGoal.needed.toLocaleString()}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-lg text-green-300">
            ⏱️ <strong>{nextGoal.hoursRemaining}hrs</strong> of grinding
          </p>
          <p className="text-sm text-slate-400">
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
  <div className="mt-4 text-xs text-slate-400">
    Passive systems maxed:{' '}
    <span className={passiveProgress?.allMaxed ? 'text-emerald-400 font-semibold' : 'text-yellow-400 font-semibold'}>
      {passiveProgress?.readyCount ?? 0}/{passiveProgress?.total ?? 4}
    </span>
    {!passiveProgress?.allMaxed && (
      <span className="ml-2 text-slate-500">
        (linear grinds are de-prioritized until passives are upgraded)
      </span>
    )}
  </div>
);

PassiveProgressStatus.propTypes = {
  passiveProgress: PropTypes.object,
};

const SessionConsultantCard = ({ sessionPlan, sessionMinutes, setSessionMinutes }) => (
  <div className="bg-slate-900/60 border border-emerald-900/30 rounded-2xl p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        <h3 className="text-xl font-bold text-white">Session Consultant</h3>
        <p className="text-sm text-slate-400">
          Compound Efficiency: start passive clocks first, then bridge with best executable money, then invest in unlocks.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">I have</span>
        <select
          value={sessionMinutes}
          onChange={(e) => setSessionMinutes(Number(e.target.value))}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
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
