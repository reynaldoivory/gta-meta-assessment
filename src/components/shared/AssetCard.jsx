// src/components/shared/AssetCard.jsx
import PropTypes from 'prop-types';
import { CheckCircle2 } from 'lucide-react';

const AssetCard = ({ label, emoji, isOwned, onToggle, children, cost }) => {
  if (!isOwned) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Select ${label}`}
        // No opacity-based dimming here: opacity multiplies the WHOLE subtree
        // (including text-muted), silently pushing already-muted text below
        // the WCAG AA contrast floor (axe caught this at 3.69:1/4.29:1).
        // "Unselected" is instead conveyed via fully-opaque, deliberately
        // muted colors that pass AA on their own.
        className="w-full rounded-xl border transition-all duration-300 bg-bg-surface border-border-subtle hover:border-border cursor-pointer text-left"
      >
        <div className="p-3 md:p-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors bg-bg-raised text-text-muted">
              {emoji}
            </div>
            <div>
              <div className="font-bold transition-colors text-text-secondary">{label}</div>
              {cost && (
                <div className="text-xs text-text-muted font-mono">Est. Cost: {cost}</div>
              )}
              <div className="text-2xs text-text-muted mt-1">Click anywhere on this card to select and configure.</div>
            </div>
          </div>
          <div className="w-6 h-6 rounded border flex items-center justify-center transition-all border-border hover:border-border-strong" />
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border transition-all duration-300 bg-bg-surface border-hud-blue/30 shadow-lg shadow-hud-blue/10">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${label}`}
        className="w-full p-3 md:p-4 flex items-center justify-between cursor-pointer select-none text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors bg-hud-blue/20 text-hud-blue">
            {emoji}
          </div>
          <div>
            <div className="font-bold transition-colors text-text-primary">{label}</div>
          </div>
        </div>
        <div className="w-6 h-6 rounded border flex items-center justify-center transition-all bg-hud-blue border-hud-blue text-bg-base">
          <CheckCircle2 size={16} />
        </div>
      </button>

      {/* Nested Options - Auto-expand when owned */}
      {children && (
        <div className="px-4 pb-4 pt-0 border-t border-border-subtle">
          <div className="mt-4 space-y-3 pl-2 border-l-2 border-border-subtle ml-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

AssetCard.propTypes = {
  label: PropTypes.string.isRequired,
  emoji: PropTypes.string.isRequired,
  isOwned: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node,
  cost: PropTypes.string,
};

export default AssetCard;
