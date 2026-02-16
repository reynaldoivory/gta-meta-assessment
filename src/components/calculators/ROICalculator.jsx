// src/components/calculators/ROICalculator.jsx
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Target, TrendingUp } from 'lucide-react';

const commonGoals = [
  { label: 'Kosatka', amount: 2200000 },
  { label: 'Sparrow', amount: 1800000 },
  { label: 'Agency', amount: 2000000 },
  { label: 'Acid Lab', amount: 750000 },
  { label: 'Nightclub', amount: 1500000 },
  { label: 'Oppressor Mk II', amount: 8000000 },
  { label: 'Raiju', amount: 6800000 },
];

const formatHoursRequired = (hours) => {
  if (hours < 1) return `${(hours * 60).toFixed(0)} minutes`;
  if (hours < 24) return `${hours.toFixed(1)} hours`;
  return `${(hours / 24).toFixed(1)} days`;
};

const formatDaysRequired = (days) => {
  if (days < 7) return `${days.toFixed(1)} days`;
  if (days < 30) return `${(days / 7).toFixed(1)} weeks`;
  return `${(days / 30).toFixed(1)} months`;
};

const GoalSelector = ({ targetItem, onSelectGoal }) => (
  <div>
    <div className="block text-sm font-semibold text-slate-300 mb-2">
      Quick Select
    </div>
    <div className="flex flex-wrap gap-2">
      {commonGoals.map((goal) => (
        <button
          key={goal.label}
          onClick={() => onSelectGoal(goal)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            targetItem === goal.label
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
    <label htmlFor="targetAmount" className="block text-sm font-semibold text-slate-300 mb-2">
      Custom Amount (GTA$)
    </label>
    <div className="flex gap-2">
      <input
        id="targetAmount"
        type="number"
        value={targetAmount}
        onChange={onChangeAmount}
        placeholder="e.g. 5000000"
        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
      />
      <button
        onClick={onClear}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors"
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
      <span className="text-slate-300 text-sm">Amount Needed:</span>
      <span className="text-green-400 font-mono font-bold">
        ${(timeData.needed / 1000).toFixed(0)}k
      </span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-slate-300 text-sm">At Current Income:</span>
      <span className="text-blue-400 font-mono font-bold">
        ${(incomePerHour / 1000).toFixed(0)}k/hr
      </span>
    </div>
    <div className="pt-2 border-t border-slate-700/50">
      <div className="flex justify-between items-center mb-1">
        <span className="text-slate-300 text-sm">Hours Required:</span>
        <span className="text-white font-bold">{formatHoursRequired(timeData.hours)}</span>
      </div>
      {timeData.days >= 1 && (
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">Days Required:</span>
          <span className="text-white font-bold">{formatDaysRequired(timeData.days)}</span>
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
    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h4 className="font-bold text-white">Time to Goal</h4>
      </div>

      {timeData.hours === Infinity
        ? <p className="text-red-400 text-sm">{timeData.message}</p>
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
    const needed = Math.max(0, goal - currentCash);
    const incomePerHour = results.incomePerHour || 1;

    if (incomePerHour <= 0) {
      return { hours: Infinity, days: Infinity, message: 'No income source active' };
    }

    const hours = needed / incomePerHour;
    const days = hours / 24;

    return { hours, days, needed };
  };

  const timeData = calculateTimeToGoal();

  const hasAmount = Boolean(targetAmount);

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">ROI Calculator</h3>
        <span className="text-xs text-slate-400">What are you saving for?</span>
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
          <div className="text-slate-400 text-sm text-center py-2">
            Enter a valid amount to calculate
          </div>
        )}

        {!hasAmount && (
          <div className="text-slate-500 text-sm text-center py-4">
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
