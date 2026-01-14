// src/components/shared/ActionCard.jsx
// Expandable action card with step-by-step instructions
import React, { useState } from 'react';
import { ACTION_INSTRUCTIONS, getPropertyRecommendation } from '../../utils/actionInstructions';
import { useAssessment } from '../../context/AssessmentContext';

const ActionCard = ({ action, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const { formData } = useAssessment();
  
  // Fallback if specific instruction ID missing, check actionType or alias
  const instructions = ACTION_INSTRUCTIONS[action.id] || 
    ACTION_INSTRUCTIONS[action.actionType === 'cayo_slow' ? 'cayo_optimization' : action.id];
  
  const budgetRec = action.actionType === 'property_purchase' || action.type === 'PURCHASE'
    ? getPropertyRecommendation(action.id, Number(formData.liquidCash) || 0, formData.hasGTAPlus) 
    : null;

  const isUrgent = action.urgent || action.urgency === 'URGENT';
  const isCritical = action.critical || action.impact === 'high';
  const borderColor = isUrgent ? 'border-red-500' : isCritical ? 'border-orange-500' : 'border-blue-500';
  const bgColor = isUrgent ? 'bg-red-900/20' : isCritical ? 'bg-orange-900/20' : 'bg-blue-900/20';

  return (
    <div className={`border-l-4 ${borderColor} ${bgColor} rounded-lg p-4 mb-4 transition-all`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 flex-wrap">
            {rank && <span className="text-slate-400">#{rank}</span>}
            {action.label || action.title}
            {isUrgent && (
              <span className="text-xs bg-red-500 text-white px-2 py-1 rounded animate-pulse">
                URGENT
              </span>
            )}
            {isCritical && !isUrgent && (
              <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                CRITICAL
              </span>
            )}
          </h3>
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

      <div className="flex gap-4 mt-2 text-sm text-slate-400">
        {(action.timeHours || action.timeToComplete) && (
          <span>⏱️ {action.timeHours ? `${action.timeHours} hrs` : action.timeToComplete}</span>
        )}
        {action.savingsPerHour > 0 && (
          <span className="text-green-400">💰 +${action.savingsPerHour.toLocaleString()}/hr</span>
        )}
        {action.cost !== undefined && action.cost > 0 && (
          <span className="text-yellow-400">💵 ${(action.cost / 1000000).toFixed(2)}M</span>
        )}
      </div>

      {budgetRec && !expanded && (
        <div className={`mt-2 p-2 text-sm rounded ${
          budgetRec.canAfford 
            ? 'bg-green-900/30 text-green-300' 
            : 'bg-red-900/30 text-red-300'
        }`}>
          {budgetRec.recommendation}
        </div>
      )}

      {expanded && instructions && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h4 className="font-bold text-slate-200 mb-2">{instructions.title}</h4>
          <ul className="list-decimal ml-5 space-y-1 text-sm text-slate-300">
            {instructions.steps.map((step, i) => (
              <li key={i} className="whitespace-pre-line">{step}</li>
            ))}
          </ul>
          {instructions.warnings && instructions.warnings.length > 0 && (
            <div className="mt-3 space-y-1">
              {instructions.warnings.map((warning, i) => (
                <div key={i} className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                  {warning}
                </div>
              ))}
            </div>
          )}
          {instructions.locationMap && (
            <div className="mt-3 grid gap-2">
              {Object.entries(instructions.locationMap).map(([name, info]) => (
                <div key={name} className="bg-slate-800 p-2 rounded text-xs">
                  <span className="font-bold text-slate-200">{name}</span>
                  {info.price && <span className="text-green-400 ml-2">${(info.price / 1000000).toFixed(2)}M</span>}
                  {info.pros && <div className="text-slate-400 mt-1">✅ {info.pros}</div>}
                  {info.cons && <div className="text-slate-500 mt-1">⚠️ {info.cons}</div>}
                </div>
              ))}
            </div>
          )}
          {instructions.videoGuide && (
            <div className="mt-3 text-xs text-blue-400 italic">
              📹 {instructions.videoGuide}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActionCard;
