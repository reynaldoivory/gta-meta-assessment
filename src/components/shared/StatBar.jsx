import PropTypes from 'prop-types';

const StatBar = ({ label, value, onChange }) => {
  const bars = [1, 2, 3, 4, 5];

  const handleBarClick = (bar) => {
    onChange(bar === value ? Math.max(0, bar - 1) : bar);
  };

  return (
    <div className="mb-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs font-bold uppercase text-text-muted tracking-wider">{label}</span>
        <span className="text-xs text-text-muted font-mono">{value}/5</span>
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
                ? 'bg-hud-blue shadow-[0_0_10px_rgba(41,210,227,0.35)] hover:brightness-110'
                : 'bg-bg-raised hover:bg-border-subtle'
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
