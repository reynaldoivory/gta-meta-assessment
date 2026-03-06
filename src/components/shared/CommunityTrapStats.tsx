// src/components/shared/CommunityTrapStats.jsx
// Displays community trap occurrence rates and player comparison


import { Users, TrendingUp, TrendingDown, Trophy, AlertTriangle } from 'lucide-react';
import { getTrapOccurrenceRates, getTrapAvoidanceStats } from '../../utils/communityStats';
import './TrapWarnings.css';
import './CommunityTrapStats.css';

/**
 * Community Trap Statistics Component
 * Shows what percentage of players fall for common traps
 */
const CommunityTrapStats = ({ formData, currentTraps }: any) => {
  const occurrenceRates = getTrapOccurrenceRates();
  const avoidanceStats = getTrapAvoidanceStats(formData, currentTraps);
  
  if (!occurrenceRates) {
    return null;
  }
  
  const trapRates = [
    { 
      name: 'Nightclub Trap (0 feeders)', 
      rate: Number.parseInt(occurrenceRates.nightclubTrap, 10),
      description: 'Players who bought Nightclub without feeder businesses',
    },
    { 
      name: 'Unupgraded Bunker', 
      rate: Number.parseInt(occurrenceRates.unupgradedBunker, 10),
      description: 'Bunker owners without equipment upgrade',
    },
    { 
      name: 'Cayo Burnout', 
      rate: Number.parseInt(occurrenceRates.cayoBurnout, 10),
      description: 'Kosatka owners showing efficiency decay',
    },
    { 
      name: 'Unupgraded Acid Lab', 
      rate: Number.parseInt(occurrenceRates.unupgradedAcidLab, 10),
      description: 'Acid Lab owners without equipment upgrade',
    },
    { 
      name: 'Unused Kosatka', 
      rate: Number.parseInt(occurrenceRates.unusedKosatka, 10),
      description: 'Kosatka owners who never ran Cayo Perico',
    },
  ].sort((a, b) => b.rate - a.rate);
  
  const getRateClass = (rate) => {
    if (rate >= 50) return 'high';
    if (rate >= 25) return 'medium';
    return 'low';
  };
  
  return (
    <div className="community-trap-stats">
      <h4>
        <Users className="w-4 h-4" />
        Community Trap Statistics
        {occurrenceRates.isEstimated && (
          <span className="text-xs text-slate-500 ml-2">(Estimated)</span>
        )}
      </h4>
      
      {/* Player Comparison Banner */}
      {avoidanceStats && (
        <div className={`mb-4 p-3 rounded-lg ${
          avoidanceStats.isOutperforming 
            ? 'bg-green-900/30 border border-green-500/30' 
            : 'bg-orange-900/20 border border-orange-500/30'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {avoidanceStats.isOutperforming ? (
              <>
                <Trophy className="w-5 h-5 text-green-400" />
                <span className="font-bold text-green-400">Outperforming Community!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="font-bold text-orange-400">Room for Improvement</span>
              </>
            )}
          </div>
          <p className="text-sm text-slate-300">
            {avoidanceStats.comparisonMessage}
          </p>
          
          {/* Stats Summary */}
          <div className="flex gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400">{avoidanceStats.avoidedCount} avoided</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-red-400">{avoidanceStats.fellCount} to fix</span>
            </div>
            {avoidanceStats.totalSavings > 0 && (
              <div className="text-slate-400">
                Saved: ${avoidanceStats.totalSavings.toLocaleString()}/hr
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Trap Occurrence Rates */}
      <div className="space-y-1">
        {trapRates.map((trap) => {
          const rateClass = getRateClass(trap.rate);
          
          return (
            <div key={trap.name} className="trap-rate-item group" title={trap.description}>
              <span className="trap-name">{trap.name}</span>
              <div className="trap-rate">
                <div className="rate-bar">
                  <div 
                    className={`rate-fill ${rateClass}`}
                    style={{ width: `${Math.min(trap.rate, 100)}%` }}
                  />
                </div>
                <span className={`rate-value ${rateClass}`}>
                  {trap.rate}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Aggregate Stats */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Avg Traps per Player:</span>
          <span className="text-slate-300">{occurrenceRates.averageTrapsPerPlayer}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Avg Lost Income:</span>
          <span className="text-red-400">${Number.parseInt(occurrenceRates.averageLostIncome, 10).toLocaleString()}/hr</span>
        </div>
        {occurrenceRates.sampleSize > 0 && (
          <div className="flex justify-between mt-1">
            <span>Sample Size:</span>
            <span className="text-slate-300">{occurrenceRates.sampleSize} assessments</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityTrapStats;
