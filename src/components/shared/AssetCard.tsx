// src/components/shared/AssetCard.jsx

import { CheckCircle2 } from 'lucide-react';

const AssetCard = ({ label, emoji, isOwned, onToggle, children, cost }: any) => {
  if (!isOwned) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Select ${label}`}
        className="w-full rounded-xl border transition-all duration-300 bg-slate-900/40 border-slate-800 opacity-80 hover:opacity-100 cursor-pointer text-left"
      >
        <div className="p-3 md:p-4 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors bg-slate-800 text-slate-600">
              {emoji}
            </div>
            <div>
              <div className="font-bold transition-colors text-slate-400">{label}</div>
              {cost && (
                <div className="text-xs text-slate-500 font-mono">Est. Cost: {cost}</div>
              )}
              <div className="text-[11px] text-slate-500 mt-1">Click anywhere on this card to select and configure.</div>
            </div>
          </div>
          <div className="w-6 h-6 rounded border flex items-center justify-center transition-all border-slate-600 hover:border-slate-500" />
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-xl border transition-all duration-300 bg-slate-900/80 border-blue-500/30 shadow-lg shadow-blue-900/10">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Toggle ${label}`}
        className="w-full p-3 md:p-4 flex items-center justify-between cursor-pointer select-none text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors bg-blue-600/20 text-blue-400">
            {emoji}
          </div>
          <div>
            <div className="font-bold transition-colors text-white">{label}</div>
          </div>
        </div>
        <div className="w-6 h-6 rounded border flex items-center justify-center transition-all bg-blue-500 border-blue-500 text-white">
          <CheckCircle2 size={16} />
        </div>
      </button>
      
      {/* Nested Options - Auto-expand when owned */}
      {children && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-800/50">
          <div className="mt-4 space-y-3 pl-2 border-l-2 border-slate-800 ml-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCard;
