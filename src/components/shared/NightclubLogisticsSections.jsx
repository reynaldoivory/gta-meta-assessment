import PropTypes from 'prop-types';
import { TrendingUp, AlertTriangle, CheckCircle, Zap, DollarSign } from 'lucide-react';

const SOURCE_RANKING = [
  { id: 'imports', label: 'Cocaine Lockup', product: 'S. American Imports', rate: 10000, emoji: '🧊' },
  { id: 'cargo', label: 'Hangar / Warehouse', product: 'Cargo & Shipments', rate: 8570, emoji: '📦' },
  { id: 'pharma', label: 'Meth Lab', product: 'Pharm. Research', rate: 8500, emoji: '💎' },
  { id: 'sporting', label: 'Bunker', product: 'Sporting Goods', rate: 7500, emoji: '🔫' },
  { id: 'cash', label: 'Counterfeit Cash', product: 'Cash Creation', rate: 7000, emoji: '💵' },
  { id: 'organic', label: 'Weed Farm', product: 'Organic Produce', rate: 4500, emoji: '🌿', warning: true },
  { id: 'printing', label: 'Document Forgery', product: 'Printing & Copying', rate: 1500, emoji: '📄', warning: true },
];

const TECH_PRICES = [0, 0, 141050, 141050, 141050, 141050];

const getSourceStyles = (isOwned, isAssigned) => {
  if (isOwned && isAssigned) return 'bg-purple-900/30 border-purple-500/50 ring-1 ring-purple-500/30';
  if (isOwned) return 'bg-slate-800 border-slate-600';
  return 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700';
};

const getTechButtonStyles = (num, currentTechs, ownedCount) => {
  if (currentTechs === num) return 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50';
  if (num <= ownedCount) return 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700';
  return 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed';
};

const getTechTitle = (num, ownedCount, cumulativeCost) => {
  if (num === 0) return 'No technicians';
  if (num === 1) return '1 technician (free with nightclub)';
  if (num > ownedCount) return `Need ${num} linked businesses first`;
  return `${num} technicians (total hire cost: $${cumulativeCost.toLocaleString()})`;
};

const SourceCard = ({ source, index, isOwned, isAssigned, currentTechs, onToggle }) => {
  const marker = isOwned
    ? <CheckCircle className="w-3 h-3 text-white" />
    : <span className="text-slate-500">{index + 1}</span>;

  let statusBadge = null;
  if (isAssigned) {
    statusBadge = <div className="px-1.5 py-0.5 bg-green-900/50 text-green-400 text-[10px] rounded border border-green-800 font-bold animate-pulse">ACTIVE</div>;
  } else if (isOwned && currentTechs > 0) {
    statusBadge = <div className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded border border-slate-700">IDLE</div>;
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative p-3 rounded-lg border cursor-pointer transition-all select-none ${getSourceStyles(isOwned, isAssigned)}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${isOwned ? 'bg-purple-500 border-purple-500' : 'border-slate-600 bg-slate-800'}`}>
            {marker}
          </div>
          <div>
            <div className={`text-sm font-medium flex items-center gap-1.5 ${isOwned ? 'text-white' : 'text-slate-500'}`}>
              <span>{source.emoji}</span>
              <span>{source.label}</span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-2">
              <span>{source.product}</span>
              <span className={`font-mono ${isAssigned ? 'text-green-400' : 'text-slate-600'}`}>
                ${source.rate.toLocaleString()}/hr
              </span>
            </div>
          </div>
        </div>
        {statusBadge}
      </div>

      {isOwned && source.warning && (
        <div className="mt-2 text-[10px] text-orange-400 flex items-center gap-1 bg-orange-900/20 px-2 py-1 rounded">
          <AlertTriangle className="w-3 h-3" />
          Low-value earner - assign last
        </div>
      )}
    </button>
  );
};

SourceCard.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    product: PropTypes.string.isRequired,
    rate: PropTypes.number.isRequired,
    emoji: PropTypes.string.isRequired,
    warning: PropTypes.bool,
  }).isRequired,
  index: PropTypes.number.isRequired,
  isOwned: PropTypes.bool,
  isAssigned: PropTypes.bool,
  currentTechs: PropTypes.number.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export const SourceSelectorGrid = ({ formData, currentTechs, techAssignments, onToggleSource }) => (
  <div>
    <div className="text-xs text-slate-500 font-bold uppercase mb-2 flex justify-between items-center">
      <span>Linked Businesses (Check what you own)</span>
      <span className="text-purple-400 text-[10px] normal-case font-normal flex items-center gap-1">
        <Zap className="w-3 h-3" /> Auto-assigns best earners
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {SOURCE_RANKING.map((source, index) => (
        <SourceCard
          key={source.id}
          source={source}
          index={index}
          isOwned={Boolean(formData.nightclubSources?.[source.id])}
          isAssigned={techAssignments.includes(source.id)}
          currentTechs={currentTechs}
          onToggle={() => onToggleSource(source.id)}
        />
      ))}
    </div>
  </div>
);

SourceSelectorGrid.propTypes = {
  formData: PropTypes.shape({ nightclubSources: PropTypes.object }).isRequired,
  currentTechs: PropTypes.number.isRequired,
  techAssignments: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleSource: PropTypes.func.isRequired,
};

const TechCountButton = ({ num, currentTechs, ownedCount, onSelect }) => {
  const price = TECH_PRICES[num];
  const cumulativeCost = TECH_PRICES.slice(2, num + 1).reduce((sum, value) => sum + value, 0);
  const labelClass = currentTechs === num ? 'text-purple-200' : 'text-slate-600';

  return (
    <button
      type="button"
      onClick={() => onSelect(num)}
      className={`flex-1 py-2 rounded font-bold text-sm transition-all border flex flex-col items-center ${getTechButtonStyles(num, currentTechs, ownedCount)}`}
      disabled={num > ownedCount && num > 0}
      title={getTechTitle(num, ownedCount, cumulativeCost)}
    >
      <span>{num}</span>
      {num >= 2 && <span className={`text-[8px] font-normal leading-tight ${labelClass}`}>${(price / 1000).toFixed(0)}k</span>}
      {num === 1 && <span className={`text-[8px] font-normal leading-tight ${labelClass}`}>free</span>}
    </button>
  );
};

TechCountButton.propTypes = {
  num: PropTypes.number.isRequired,
  currentTechs: PropTypes.number.isRequired,
  ownedCount: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export const TechnicianSelector = ({ currentTechs, ownedCount, onSetTechs }) => (
  <div>
    <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">
      Technicians Hired ({currentTechs}/5)
      {ownedCount > 0 && currentTechs === 0 && (
        <span className="text-orange-400 normal-case font-normal ml-2">← hire techs to start earning</span>
      )}
    </label>
    <div className="flex gap-2">
      {[0, 1, 2, 3, 4, 5].map((num) => (
        <TechCountButton key={num} num={num} currentTechs={currentTechs} ownedCount={ownedCount} onSelect={onSetTechs} />
      ))}
    </div>
    {currentTechs > ownedCount && ownedCount > 0 && (
      <div className="text-xs text-orange-400 mt-1 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        You have {currentTechs} techs but only {ownedCount} businesses. {currentTechs - ownedCount} tech(s) idle.
      </div>
    )}
    {currentTechs >= 2 && (
      <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
        <DollarSign className="w-3 h-3" />
        Total hire cost: ${TECH_PRICES.slice(2, currentTechs + 1).reduce((sum, value) => sum + value, 0).toLocaleString()} (1st tech free with nightclub)
      </div>
    )}
  </div>
);

TechnicianSelector.propTypes = {
  currentTechs: PropTypes.number.isRequired,
  ownedCount: PropTypes.number.isRequired,
  onSetTechs: PropTypes.func.isRequired,
};

export const InsightsPanel = ({ optimizedIncome, ownedCount, currentTechs, missedIncome }) => (
  <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 border border-slate-700">
    <div className="flex justify-between items-center">
      <div>
        <div className="text-xs text-slate-500 uppercase font-bold mb-1">Projected Passive Income</div>
        <div className="text-2xl font-mono text-green-400 flex items-baseline gap-1">
          ${optimizedIncome.toLocaleString()}
          <span className="text-sm text-slate-500">/hr</span>
        </div>
        {ownedCount > 0 && currentTechs === 0 && <div className="text-xs text-red-400 mt-1">Hire technicians to start earning!</div>}
      </div>

      {missedIncome > 0 && currentTechs < 5 && (
        <div className="text-right">
          <div className="text-xs text-orange-400 font-bold flex items-center justify-end gap-1">
            <TrendingUp className="w-3 h-3" /> Unclaimed Value
          </div>
          <div className="text-xs text-slate-400">
            Hire 1 more tech: <span className="text-green-400 font-mono">+${missedIncome.toLocaleString()}/hr</span>
          </div>
        </div>
      )}

      {currentTechs === 5 && ownedCount >= 5 && (
        <div className="text-right">
          <div className="text-xs text-green-400 font-bold flex items-center justify-end gap-1">
            <CheckCircle className="w-3 h-3" /> Fully Optimized
          </div>
          <div className="text-xs text-slate-400">All 5 techs assigned</div>
        </div>
      )}
    </div>

    <div className="mt-3 pt-3 border-t border-slate-700 flex gap-4 text-xs">
      <div>
        <span className="text-slate-500">Businesses: </span>
        <span className="text-white font-mono">{ownedCount}/7</span>
      </div>
      <div>
        <span className="text-slate-500">Techs Active: </span>
        <span className="text-white font-mono">{Math.min(currentTechs, ownedCount)}/{currentTechs}</span>
      </div>
      <div>
        <span className="text-slate-500">Daily: </span>
        <span className="text-green-400 font-mono">${(optimizedIncome * 24).toLocaleString()}</span>
      </div>
    </div>
  </div>
);

InsightsPanel.propTypes = {
  optimizedIncome: PropTypes.number.isRequired,
  ownedCount: PropTypes.number.isRequired,
  currentTechs: PropTypes.number.isRequired,
  missedIncome: PropTypes.number.isRequired,
};
