// src/components/shared/StatBar.jsx
import PropTypes from 'prop-types';

const StatBar = ({ label, value, onChange }) => {
  const bars = [1, 2, 3, 4, 5];
  
  const handleBarClick = (bar) => {
    onChange(bar === value ? Math.max(0, bar - 1) : bar);
  };

  return (
    <div className="mb-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</span>
        <span className="text-xs text-slate-500 font-mono">{value}/5</span>
      </div>
      <div className="flex gap-1 h-3 cursor-pointer group" aria-label={`${label} stat bar`}>
        {bars.map((bar) => (
          <button
            type="button"
            key={bar}
            onClick={() => handleBarClick(bar)}
            aria-label={`Set ${label} to ${bar} bars`}
            className={`flex-1 rounded-sm transition-all duration-200 ${
              bar <= value 
                ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)] hover:bg-yellow-400' 
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

StatBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StatBar;
