// src/components/shared/ActionCard.jsx
// Expandable action card with step-by-step instructions
import { useState } from 'react';
import PropTypes from 'prop-types';
import { ACTION_INSTRUCTIONS, getPropertyRecommendation } from '../../utils/actionInstructions';
import { useAssessment } from '../../context/AssessmentContext';

const getActionInstructions = (action) => {
  const mappedId = action.actionType === 'cayo_slow' ? 'cayo_optimization' : action.id;
  return ACTION_INSTRUCTIONS[action.id] || ACTION_INSTRUCTIONS[mappedId];
};

const getBudgetRecommendation = (action, formData) => {
  const isPurchase = action.actionType === 'property_purchase' || action.type === 'PURCHASE';
  if (!isPurchase) return null;
  return getPropertyRecommendation(action.id, Number(formData.liquidCash) || 0, formData.hasGTAPlus);
};

const getCardTheme = (isUrgent, isCritical) => {
  if (isUrgent) return { borderColor: 'border-accent-pink', bgColor: 'bg-gradient-to-br from-accent-pink/20 to-primary-orange-500/20', shadow: 'shadow-glow-orange' };
  if (isCritical) return { borderColor: 'border-primary-orange-500', bgColor: 'bg-gradient-to-br from-primary-orange-500/15 to-primary-purple-500/10', shadow: 'shadow-float' };
  return { borderColor: 'border-primary-cyan-500', bgColor: 'bg-gradient-to-br from-primary-cyan-500/10 to-primary-purple-500/10', shadow: 'shadow-float' };
};

const ActionBadges = ({ rank, title, isUrgent, isCritical }) => (
  <h3 className="text-xl font-display font-bold text-white flex items-center gap-2 flex-wrap">
    {rank && <span className="badge-purple font-mono text-sm">#{rank}</span>}
    {title}
    {isUrgent && (
      <span className="badge bg-accent-pink/30 text-accent-pink border-accent-pink animate-pulse font-mono text-[10px]">
        🔥 URGENT
      </span>
    )}
    {isCritical && !isUrgent && (
      <span className="badge-orange font-mono text-[10px]">
        ⚡ CRITICAL
      </span>
    )}
  </h3>
);

ActionBadges.propTypes = {
  rank: PropTypes.number,
  title: PropTypes.string,
  isUrgent: PropTypes.bool.isRequired,
  isCritical: PropTypes.bool.isRequired,
};

const ActionMeta = ({ action }) => {
  const hasTime = Boolean(action.timeHours || action.timeToComplete);
  const hasSavings = action.savingsPerHour > 0;
  const hasCost = action.cost !== undefined && action.cost > 0;
  if (!hasTime && !hasSavings && !hasCost) return null;

  return (
    <div className="flex gap-3 mt-3 text-sm flex-wrap">
      {hasTime && (
        <span className="badge-cyan font-mono text-xs">⏱️ {action.timeHours ? `${action.timeHours} hrs` : action.timeToComplete}</span>
      )}
      {hasSavings && (
        <span className="badge bg-accent-green/20 text-accent-green border-accent-green/40 font-mono text-xs">💰 +${action.savingsPerHour.toLocaleString()}/hr</span>
      )}
      {hasCost && (
        <span className="badge-orange font-mono text-xs">💵 ${(action.cost / 1000000).toFixed(2)}M</span>
      )}
    </div>
  );
};

ActionMeta.propTypes = {
  action: PropTypes.shape({
    timeHours: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    timeToComplete: PropTypes.string,
    savingsPerHour: PropTypes.number,
    cost: PropTypes.number,
  }).isRequired,
};

const BudgetRecommendation = ({ budgetRec, expanded }) => {
  if (!budgetRec || expanded) return null;

  return (
    <div className={`mt-2 p-2 text-sm rounded ${
      budgetRec.canAfford
        ? 'bg-green-900/30 text-green-300'
        : 'bg-red-900/30 text-red-300'
    }`}>
      {budgetRec.recommendation}
    </div>
  );
};

BudgetRecommendation.propTypes = {
  budgetRec: PropTypes.shape({
    canAfford: PropTypes.bool,
    recommendation: PropTypes.string,
  }),
  expanded: PropTypes.bool.isRequired,
};

const LocationMap = ({ locationMap }) => (
  <div className="mt-3 grid gap-2">
    {Object.entries(locationMap).map(([name, info]) => (
      <div key={name} className="bg-slate-800 p-2 rounded text-xs">
        <span className="font-bold text-slate-200">{name}</span>
        {info.price && <span className="text-green-400 ml-2">${(info.price / 1000000).toFixed(2)}M</span>}
        {info.pros && <div className="text-slate-400 mt-1">✅ {info.pros}</div>}
        {info.cons && <div className="text-slate-500 mt-1">⚠️ {info.cons}</div>}
      </div>
    ))}
  </div>
);

LocationMap.propTypes = {
  locationMap: PropTypes.objectOf(
    PropTypes.shape({
      price: PropTypes.number,
      pros: PropTypes.string,
      cons: PropTypes.string,
    })
  ).isRequired,
};

const InstructionsPanel = ({ expanded, instructions }) => {
  if (!expanded || !instructions) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700">
      <h4 className="font-bold text-slate-200 mb-2">{instructions.title}</h4>
      <ul className="list-decimal ml-5 space-y-1 text-sm text-slate-300">
        {instructions.steps.map((step) => (
          <li key={step} className="whitespace-pre-line">{step}</li>
        ))}
      </ul>
      {instructions.warnings && instructions.warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {instructions.warnings.map((warning) => (
            <div key={warning} className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
              {warning}
            </div>
          ))}
        </div>
      )}
      {instructions.locationMap && <LocationMap locationMap={instructions.locationMap} />}
      {instructions.videoGuide && (
        <div className="mt-3 text-xs text-blue-400 italic">
          📹 {instructions.videoGuide}
        </div>
      )}
    </div>
  );
};

InstructionsPanel.propTypes = {
  expanded: PropTypes.bool.isRequired,
  instructions: PropTypes.shape({
    title: PropTypes.string,
    steps: PropTypes.arrayOf(PropTypes.string),
    warnings: PropTypes.arrayOf(PropTypes.string),
    locationMap: PropTypes.object,
    videoGuide: PropTypes.string,
  }),
};

const ActionCard = ({ action, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const { formData } = useAssessment();
  
  const instructions = getActionInstructions(action);
  const budgetRec = getBudgetRecommendation(action, formData);

  const isUrgent = action.urgent || action.urgency === 'URGENT';
  const isCritical = action.critical || action.impact === 'high';
  const { borderColor, bgColor } = getCardTheme(isUrgent, isCritical);
  const actionTitle = action.label || action.title;

  return (
    <div className={`border-l-4 ${borderColor} ${bgColor} rounded-lg p-4 mb-4 transition-all`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <ActionBadges rank={rank} title={actionTitle} isUrgent={isUrgent} isCritical={isCritical} />
          {(action.detail || action.why) && (
            <p className="text-slate-300 text-sm mt-1">{action.detail || action.why}</p>
          )}
          {action.solution && (
            <p className="text-slate-400 text-xs mt-1 italic">💡 {action.solution}</p>
          )}
        </div>
        {instructions && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-sm bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition-colors ml-4 flex-shrink-0"
          >
            {expanded ? '▲ Hide' : '▼ Show How'}
          </button>
        )}
      </div>

      <ActionMeta action={action} />

      <BudgetRecommendation budgetRec={budgetRec} expanded={expanded} />

      <InstructionsPanel expanded={expanded} instructions={instructions} />
    </div>
  );
};

ActionCard.propTypes = {
  action: PropTypes.shape({
    id: PropTypes.string,
    actionType: PropTypes.string,
    type: PropTypes.string,
    urgent: PropTypes.bool,
    urgency: PropTypes.string,
    critical: PropTypes.bool,
    impact: PropTypes.string,
    label: PropTypes.string,
    title: PropTypes.string,
    detail: PropTypes.string,
    why: PropTypes.string,
    solution: PropTypes.string,
    timeHours: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    timeToComplete: PropTypes.string,
    savingsPerHour: PropTypes.number,
    cost: PropTypes.number,
  }).isRequired,
  rank: PropTypes.number,
};

export default ActionCard;
