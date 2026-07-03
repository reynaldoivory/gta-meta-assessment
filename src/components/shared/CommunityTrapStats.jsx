// src/components/shared/CommunityTrapStats.jsx
// Displays community trap occurrence rates and player comparison

import PropTypes from 'prop-types';
import { Users, TrendingUp, TrendingDown, Trophy, AlertTriangle } from 'lucide-react';
import { getTrapOccurrenceRates, getTrapAvoidanceStats } from '../../utils/communityStats';

const RATE_TONE = {
  high: { bar: 'bg-hud-pink', text: 'text-accent-pink-text' },
  medium: { bar: 'bg-hud-pink/60', text: 'text-accent-pink-text' },
  low: { bar: 'bg-hud-blue', text: 'text-hud-blue' },
};

const getRateClass = (rate) => {
  if (rate >= 50) return 'high';
  if (rate >= 25) return 'medium';
  return 'low';
};

/**
 * Community Trap Statistics Component
 * Shows what percentage of players fall for common traps
 */
const CommunityTrapStats = ({ formData, currentTraps }) => {
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

  return (
    <div className="my-6 p-6 rounded-xl border border-hud-blue/30 bg-gradient-to-br from-hud-blue/10 to-bg-surface shadow-float animate-pop-in">
      <h4 className="text-hud-blue text-base font-semibold mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Community Trap Statistics
        {occurrenceRates.isEstimated && (
          <span className="text-xs text-text-muted ml-2">(Estimated)</span>
        )}
      </h4>

      {/* Player Comparison Banner */}
      {avoidanceStats && (
        <div className={`mb-4 p-3 rounded-lg ${
          avoidanceStats.isOutperforming
            ? 'bg-hud-blue/10 border border-hud-blue/40'
            : 'bg-hud-pink/10 border border-hud-pink/40'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            {avoidanceStats.isOutperforming ? (
              <>
                <Trophy className="w-5 h-5 text-hud-blue" />
                <span className="font-bold text-hud-blue">Outperforming Community!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-hud-pink" />
                <span className="font-bold text-accent-pink-text">Room for Improvement</span>
              </>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {avoidanceStats.comparisonMessage}
          </p>

          {/* Stats Summary */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-hud-blue" />
              <span className="text-hud-blue">{avoidanceStats.avoidedCount} avoided</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-hud-pink" />
              <span className="text-accent-pink-text">{avoidanceStats.fellCount} to fix</span>
            </div>
            {avoidanceStats.totalSavings > 0 && (
              <div className="text-text-muted">
                Saved: ${avoidanceStats.totalSavings.toLocaleString()}/hr
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trap Occurrence Rates */}
      <div className="flex flex-col gap-1">
        {trapRates.map((trap) => {
          const tone = RATE_TONE[getRateClass(trap.rate)];

          return (
            <div
              key={trap.name}
              title={trap.description}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b border-border-subtle last:border-0"
            >
              <span className="text-text-secondary text-sm flex-1">{trap.name}</span>
              <div className="flex items-center gap-2 sm:w-auto w-full">
                <div className="h-2 w-full sm:w-20 rounded-full bg-bg-base/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
                    style={{ width: `${Math.min(trap.rate, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold min-w-[2.25rem] text-right ${tone.text}`}>
                  {trap.rate}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregate Stats */}
      <div className="mt-4 pt-3 border-t border-border-subtle text-xs text-text-muted space-y-1">
        <div className="flex justify-between">
          <span>Avg Traps per Player:</span>
          <span className="text-text-secondary">{occurrenceRates.averageTrapsPerPlayer}</span>
        </div>
        <div className="flex justify-between">
          <span>Avg Lost Income:</span>
          <span className="text-accent-pink-text">${Number.parseInt(occurrenceRates.averageLostIncome, 10).toLocaleString()}/hr</span>
        </div>
        {occurrenceRates.sampleSize > 0 && (
          <div className="flex justify-between">
            <span>Sample Size:</span>
            <span className="text-text-secondary">{occurrenceRates.sampleSize} assessments</span>
          </div>
        )}
      </div>
    </div>
  );
};

CommunityTrapStats.propTypes = {
  formData: PropTypes.object.isRequired,
  currentTraps: PropTypes.array,
};

CommunityTrapStats.defaultProps = {
  currentTraps: [],
};

export default CommunityTrapStats;
