// src/components/calculators/ROICalculator.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Target, TrendingUp } from 'lucide-react';
import { commonGoals, formatHoursRequired, formatDaysRequired, computeRoi } from '../../utils/calculations/roi';

const GoalSelector = ({ targetItem, onSelectGoal }) => (
  <div>
    <div className="block text-sm font-semibold text-text-secondary mb-2">
      Quick Select
    </div>
    <div className="flex flex-wrap gap-2">
      {commonGoals.map((goal) => (
        <button
          type="button"
          key={goal.label}
          onClick={() => onSelectGoal(goal)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            targetItem === goal.label
              ? 'bg-hud-blue text-text-on-accent'
              : 'bg-bg-raised text-text-secondary hover:bg-border-subtle'
          }`}
        >
          {goal.label}
        </button>
      ))}
    </div>
  </div>
);

GoalSelector.propTypes = {
  targetItem: PropTypes.string,
  onSelectGoal: PropTypes.func.isRequired,
};

const GoalInput = ({ targetAmount, onChangeAmount, onClear }) => (
  <div>
    <label htmlFor="targetAmount" className="block text-sm font-semibold text-text-secondary mb-2">
      Custom Amount (GTA$)
    </label>
    <div className="flex gap-2">
      <input
        id="targetAmount"
        type="number"
        value={targetAmount}
        onChange={onChangeAmount}
        placeholder="e.g. 5000000"
        className="flex-1 bg-bg-raised border border-border rounded-lg p-3 text-text-primary focus:border-hud-blue focus:outline-none"
      />
      <button
        type="button"
        onClick={onClear}
        className="px-4 py-2 bg-bg-raised hover:bg-border-subtle text-text-secondary rounded-lg text-sm transition-colors"
      >
        Clear
      </button>
    </div>
  </div>
);

GoalInput.propTypes = {
  targetAmount: PropTypes.string,
  onChangeAmount: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

const GoalTimeDetails = ({ timeData, incomePerHour }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-text-secondary text-sm">Amount Needed:</span>
      <span className="text-hud-blue font-mono font-bold">
        ${(timeData.needed / 1000).toFixed(0)}k
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-text-secondary text-sm">At Current Income:</span>
      <span className="text-hud-blue font-mono font-bold">
        ${(incomePerHour / 1000).toFixed(0)}k/hr
      </span>
    </div>
    <div className="pt-2 border-t border-border">
      <div className="flex justify-between items-center mb-1">
        <span className="text-text-secondary text-sm">Hours Required:</span>
        <span className="text-text-primary font-bold">{formatHoursRequired(timeData.hours)}</span>
      </div>
      {timeData.days >= 1 && (
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Days Required:</span>
          <span className="text-text-primary font-bold">{formatDaysRequired(timeData.days)}</span>
        </div>
      )}
    </div>
  </div>
);

GoalTimeDetails.propTypes = {
  timeData: PropTypes.shape({
    needed: PropTypes.number,
    hours: PropTypes.number,
    days: PropTypes.number,
  }).isRequired,
  incomePerHour: PropTypes.number.isRequired,
};

const TimeToGoalPanel = ({ timeData, incomePerHour }) => {
  if (!timeData) {
    return null;
  }

  return (
    <div className="bg-hud-blue/10 border border-hud-blue/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-hud-blue" />
        <h3 className="font-bold text-text-primary">Time to Goal</h3>
      </div>

      {timeData.hours === Infinity
        ? <p className="text-accent-pink-text text-sm">{timeData.message}</p>
        : <GoalTimeDetails timeData={timeData} incomePerHour={incomePerHour} />}
    </div>
  );
};

TimeToGoalPanel.propTypes = {
  timeData: PropTypes.shape({
    needed: PropTypes.number,
    hours: PropTypes.number,
    days: PropTypes.number,
    message: PropTypes.string,
  }),
  incomePerHour: PropTypes.number,
};

const ROICalculator = ({ formData, results }) => {
  const [targetAmount, setTargetAmount] = useState('');
  const [targetItem, setTargetItem] = useState('');

  if (!results) return null;

  const calculateTimeToGoal = () => {
    if (!targetAmount || Number.isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      return null;
    }

    const goal = Number(targetAmount);
    const currentCash = Number(formData.liquidCash) || 0;
    const incomePerHour = results.incomePerHour || 1;

    if (incomePerHour <= 0) {
      return { hours: Infinity, days: Infinity, message: 'No income source active' };
    }

    const { needed, hours, days } = computeRoi({ goal, currentCash, incomePerHour });

    return { hours, days, needed };
  };

  const timeData = calculateTimeToGoal();

  const hasAmount = Boolean(targetAmount);

  return (
    <div className="bg-bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-hud-blue" />
        <h2 className="text-xl font-bold text-text-primary">ROI Calculator</h2>
        <span className="text-xs text-text-muted">What are you saving for?</span>
      </div>

      <div className="space-y-4">
        <GoalSelector
          targetItem={targetItem}
          onSelectGoal={(goal) => {
            setTargetAmount(goal.amount.toString());
            setTargetItem(goal.label);
          }}
        />

        <GoalInput
          targetAmount={targetAmount}
          onChangeAmount={(e) => {
            setTargetAmount(e.target.value);
            setTargetItem('');
          }}
          onClear={() => {
            setTargetAmount('');
            setTargetItem('');
          }}
        />

        <TimeToGoalPanel timeData={timeData} incomePerHour={results.incomePerHour} />

        {!timeData && hasAmount && (
          <div className="text-text-muted text-sm text-center py-2">
            Enter a valid amount to calculate
          </div>
        )}

        {!hasAmount && (
          <div className="text-text-muted text-sm text-center py-4">
            Select a goal or enter a custom amount to see how long it will take
          </div>
        )}
      </div>
    </div>
  );
};

ROICalculator.propTypes = {
  formData: PropTypes.shape({
    liquidCash: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  results: PropTypes.shape({
    incomePerHour: PropTypes.number,
  }),
};

export default ROICalculator;
