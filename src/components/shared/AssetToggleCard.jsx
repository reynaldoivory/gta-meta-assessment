import PropTypes from 'prop-types';
import { Check } from 'lucide-react';

const getContainerClasses = (isOwned, compact, disabled) => {
  const ownershipClasses = isOwned
    ? 'border-hud-blue bg-gradient-to-r from-hud-blue/10 to-transparent'
    : 'border-border';
  const spacingClasses = compact ? 'p-3' : 'p-4';
  const interactionClasses = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer hover:border-hud-blue';

  return `bg-bg-surface border-2 ${ownershipClasses} rounded-lg transition-all ${spacingClasses} ${interactionClasses}`;
};

const getMetaTextClass = (compact) => (compact ? 'text-xs text-text-muted' : 'text-sm text-text-muted');

const renderMeta = (cost, details, compact) => {
  const textClass = getMetaTextClass(compact);

  return (
    <>
      {cost ? <div className={textClass}>{cost}</div> : null}
      {details ? <div className={textClass}>{details}</div> : null}
    </>
  );
};

export const AssetToggleCard = ({
  label,
  emoji,
  cost,
  details,
  isOwned,
  onChange,
  children,
  compact = false,
  disabled = false,
}) => {
  const containerClasses = getContainerClasses(isOwned, compact, disabled);
  const titleClass = compact ? 'font-bold flex items-center gap-2 text-sm' : 'font-bold flex items-center gap-2';

  return (
    <div className={containerClasses}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isOwned}
          onChange={onChange}
          disabled={disabled}
          className="w-5 h-5 rounded mt-1 bg-bg-raised border-hud-blue checked:bg-hud-blue focus:ring-hud-blue"
        />
        <div className="flex-1">
          <div className={titleClass}>
            <span className="text-lg">{emoji}</span> <span className="text-text-primary">{label}</span>
            {isOwned ? <Check className="w-4 h-4 text-hud-blue ml-auto" /> : null}
          </div>
          {renderMeta(cost, details, compact)}
        </div>
      </label>
      {children && isOwned ? <div className="mt-3 space-y-2">{children}</div> : null}
    </div>
  );
};

AssetToggleCard.propTypes = {
  label: PropTypes.string.isRequired,
  emoji: PropTypes.string.isRequired,
  cost: PropTypes.string,
  details: PropTypes.string,
  isOwned: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  compact: PropTypes.bool,
  disabled: PropTypes.bool,
};
