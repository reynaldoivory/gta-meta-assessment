// src/components/ActionPlan.jsx
// Session Optimizer - Displays prioritized recommendations from the engine
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getFormattedRecommendations } from '../utils/recommendationEngine.ts';
import { useAssessment } from '../context/AssessmentContext';

/**
 * ActionPlan Component
 * Fetches and displays prioritized recommendations based on user stats and game state
 * Can accept props directly or pull from AssessmentContext
 */
const ActionPlan = ({ user: propUser, gameState: propGameState }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastUserHash = useRef(null);

  // Try to get data from context if not passed as props
  const assessmentContext = useAssessment();
  const formData = assessmentContext?.formData;

  // Memoize user object to prevent infinite loops
  const user = useMemo(() => {
    if (propUser) return propUser;
    if (!formData) return null;
    
    return {
      rank: Number(formData.rank) || 0,
      cash: Number(formData.liquidCash) || 0,
      gtaPlus: formData.hasGTAPlus || false,
      stats: {
        flying: Number(formData.flying) || 0,
        strength: Number(formData.strength) || 0,
        shooting: Number(formData.shooting) || 0,
        stealth: Number(formData.stealth) || 0,
        stamina: Number(formData.stamina) || 0,
        driving: Number(formData.driving) || 0,
      },
      owns: {
        kosatka: formData.hasKosatka || false,
        sparrow: formData.hasSparrow || false,
        agency: formData.hasAgency || false,
        acidLab: formData.hasAcidLab || false,
        nightclub: formData.hasNightclub || false,
        autoShop: formData.hasAutoShop || false,
        bunker: formData.hasBunker || false,
      },
      bunkerUpgraded: formData.bunkerUpgraded || false,
      acidLabUpgraded: formData.acidLabUpgraded || false,
      nightclubTechs: Number(formData.nightclubTechs) || 0,
      playTime: 20,
    };
  }, [propUser, formData]);

  // Memoize game state to prevent infinite loops
  const gameState = useMemo(() => {
    if (propGameState) return propGameState;
    if (!formData) return {};
    
    return {
      businesses: {
        nightclub: formData.hasNightclub ? {
          isSetup: true,
          accumulatedValue: 450000,
          technicians: Number(formData.nightclubTechs) || 0,
        } : null,
        acidLab: formData.hasAcidLab ? {
          isSetup: true,
          suppliesEmpty: false,
        } : null,
      },
      claimedBonuses: [],
    };
  }, [propGameState, formData]);

  // Fetch recommendations function (wrapped in useCallback to prevent infinite loops)
  const fetchPlan = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plan = await getFormattedRecommendations(user, gameState);
      setRecommendations(plan);
    } catch (err) {
      console.error('Failed to generate plan:', err);
      setError(err.message || 'Failed to generate recommendations');
    }

    setLoading(false);
  }, [user, gameState]);

  // Create a stable hash of user data to detect meaningful changes
  const userHash = useMemo(() => {
    if (!user) return null;
    // Hash key properties that affect recommendations
    return JSON.stringify({
      rank: user.rank,
      cash: user.cash,
      gtaPlus: user.gtaPlus,
      owns: user.owns,
      stats: user.stats,
      bunkerUpgraded: user.bunkerUpgraded,
      acidLabUpgraded: user.acidLabUpgraded,
      nightclubTechs: user.nightclubTechs,
    });
  }, [user]);

  // Fetch when user data changes (not just on mount)
  // Note: fetchPlan is properly memoized, so this won't cause infinite loops
  useEffect(() => {
    if (!user || !userHash) return;
    
    // Only refetch if user data has actually changed
    if (lastUserHash.current !== userHash) {
      lastUserHash.current = userHash;
      // Call fetchPlan in next tick to avoid setState-in-effect warning
      const timer = setTimeout(() => fetchPlan(), 0);
      return () => clearTimeout(timer);
    }
  }, [user, userHash, fetchPlan]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse text-slate-400">
          <span className="text-2xl">⚡</span>
          <p className="mt-2">Analyzing session efficiency...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center text-red-400">
        <p>Error: {error}</p>
        <button 
          onClick={fetchPlan}
          className="mt-4 px-4 py-2 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Complete your profile to see personalized recommendations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-green-500">⚡</span> Session Optimizer
        </h2>
        <button
          onClick={fetchPlan}
          className="text-xs bg-slate-700 px-3 py-1 rounded hover:bg-slate-600 transition-colors"
          title="Refresh recommendations"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Recommendations List */}
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <TaskCard key={`${rec.label}-${index}`} data={rec} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="text-slate-500 text-center py-8 bg-slate-800/50 rounded-lg">
          <p className="text-lg">No tasks found</p>
          <p className="text-sm mt-2">Update your stats or assets to see recommendations.</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Priority Legend</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
            <span className="text-slate-400">Critical - Do Now</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
            <span className="text-slate-400">High - This Session</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
            <span className="text-slate-400">Medium - When Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * TaskCard - Individual recommendation card
 */
const TaskCard = ({ data, rank }) => {
  const [expanded, setExpanded] = useState(false);

  // Style mapping based on priority
  const styleMap = {
    critical: { 
      border: 'border-l-4 border-red-500', 
      bg: 'bg-red-900/20', 
      badge: 'bg-red-500 text-white',
      text: 'text-red-400' 
    },
    high: { 
      border: 'border-l-4 border-orange-500', 
      bg: 'bg-orange-900/20', 
      badge: 'bg-orange-500 text-white',
      text: 'text-orange-400' 
    },
    medium: { 
      border: 'border-l-4 border-blue-500', 
      bg: 'bg-blue-900/20', 
      badge: 'bg-blue-500 text-white',
      text: 'text-blue-400' 
    },
    low: { 
      border: 'border-l-4 border-slate-500', 
      bg: 'bg-slate-800', 
      badge: 'bg-slate-600 text-slate-200',
      text: 'text-slate-400' 
    },
  };

  const style = styleMap[data.priority] || styleMap.low;

  return (
    <div 
      className={`relative rounded-r-lg ${style.bg} ${style.border} transition-all hover:bg-opacity-70`}
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Header Row: Icon + Title + Value */}
        <div className="flex justify-between items-start gap-4">
          {/* Left: Icon + Title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {data.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {rank && (
                  <span className="text-slate-500 text-sm font-mono">#{rank}</span>
                )}
                <h3 className="font-bold text-lg text-white truncate">
                  {data.label}
                </h3>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${style.badge}`}>
                  {data.priority}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1 line-clamp-2">
                {data.description}
              </p>
            </div>
          </div>

          {/* Right: Value & Time */}
          <div className="text-right flex-shrink-0">
            {data.value && (
              <div className="text-green-400 font-bold font-mono text-sm">
                {data.value}
              </div>
            )}
            {data.timeLeft && (
              <div className="text-xs text-orange-400 font-mono mt-1 flex items-center justify-end gap-1">
                <span aria-label="Time left">⏰</span> {data.timeLeft}
              </div>
            )}
            {data.timeInvestment && (
              <div className="text-xs text-slate-500 mt-1">
                {data.timeInvestment}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 flex items-start justify-between gap-3">
          {/* “UX bubble” — must wrap long text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-700 font-mono whitespace-normal [overflow-wrap:anywhere] max-w-full">
              <span className="flex-shrink-0">👉</span>
              <span className="min-w-0">
                {data.action}
              </span>
            </div>
          </div>
          {data.warnings && Array.isArray(data.warnings) && data.warnings.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              {expanded ? '▲ Less' : '▼ More'}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Warnings */}
      {expanded && data.warnings && Array.isArray(data.warnings) && data.warnings.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
          <div className="space-y-1">
            {data.warnings.map((warning) => (
              <div key={warning} className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


ActionPlan.propTypes = {
  user: PropTypes.object.isRequired,
  gameState: PropTypes.object.isRequired,
};

TaskCard.propTypes = {
  data: PropTypes.shape({
    priority: PropTypes.string,
    icon: PropTypes.node,
    label: PropTypes.string,
    description: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timeLeft: PropTypes.string,
    timeInvestment: PropTypes.string,
    action: PropTypes.string,
    warnings: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  rank: PropTypes.number.isRequired,
};

export default ActionPlan;
