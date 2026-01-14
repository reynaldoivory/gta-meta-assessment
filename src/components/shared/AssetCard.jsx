// src/components/shared/AssetCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2 } from 'lucide-react';

const AssetCard = ({ label, emoji, isOwned, onToggle, children, cost }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={`rounded-xl border transition-all duration-300 ${
      isOwned 
        ? 'bg-slate-900/80 border-blue-500/30 shadow-lg shadow-blue-900/10' 
        : 'bg-slate-900/40 border-slate-800 opacity-80 hover:opacity-100'
    }`}>
      <div 
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Toggle ${label}`}
        className="p-3 md:p-4 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
            isOwned ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-800 text-slate-600'
          }`}>
            {emoji}
          </div>
          <div>
            <div className={`font-bold transition-colors ${isOwned ? 'text-white' : 'text-slate-400'}`}>
              {label}
            </div>
            {!isOwned && cost && (
              <div className="text-xs text-slate-500 font-mono">Est. Cost: {cost}</div>
            )}
          </div>
        </div>
        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
          isOwned 
            ? 'bg-blue-500 border-blue-500 text-white' 
            : 'border-slate-600 hover:border-slate-500'
        }`}>
          {isOwned && <CheckCircle2 size={16} />}
        </div>
      </div>
      
      {/* Nested Options - Auto-expand when owned */}
      {isOwned && children && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-800/50">
          <div className="mt-4 space-y-3 pl-2 border-l-2 border-slate-800 ml-4">
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
