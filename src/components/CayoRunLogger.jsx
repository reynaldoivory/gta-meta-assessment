// src/components/CayoRunLogger.jsx
import React, { useState, useMemo } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { 
  Clock, TrendingUp, TrendingDown, Minus, CheckCircle, Plus, Target,
  AlertTriangle, Flame, Battery, BatteryLow, Zap, BarChart3, Calendar
} from 'lucide-react';

const CayoRunLogger = () => {
  const { formData, updateCayoHistory } = useAssessment();
  const [runTime, setRunTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const time = parseFloat(runTime);
    
    if (isNaN(time) || time < 5 || time > 120) {
      return; // Invalid time
    }
    
    updateCayoHistory(time);
    setRunTime('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Enhanced analytics with burnout detection
  const analytics = useMemo(() => {
    const history = formData.cayoHistory || [];
    const totalRuns = Number(formData.cayoCompletions) || 0;
    const avgTime = Number(formData.cayoAvgTime) || 0;
    
    // Not enough data
    if (history.length < 3) {
      return {
        trend: { status: 'neutral', label: 'Need more data', icon: Minus },
        burnout: null,
        efficiency: null,
        recentAvg: null,
        bestTime: null,
        worstTime: null,
      };
    }

    // Calculate recent vs historical performance
    const recentRuns = history.slice(-5);
    const olderRuns = history.slice(-15, -5);
    const recentAvg = recentRuns.reduce((sum, r) => sum + r.time, 0) / recentRuns.length;
    const olderAvg = olderRuns.length > 0 
      ? olderRuns.reduce((sum, r) => sum + r.time, 0) / olderRuns.length
      : avgTime;

    // Best/worst times
    const allTimes = history.map(r => r.time);
    const bestTime = Math.min(...allTimes);
    const worstTime = Math.max(...allTimes);

    // Trend calculation
    const diff = recentAvg - olderAvg;
    let trend;
    if (diff < -2) {
      trend = { status: 'improving', label: 'Getting faster!', icon: TrendingUp };
    } else if (diff > 2) {
      trend = { status: 'declining', label: 'Slowing down', icon: TrendingDown };
    } else {
      trend = { status: 'stable', label: 'Consistent', icon: Minus };
    }

    // Efficiency decay detection (20%+ slowdown)
    let efficiency = null;
    if (olderAvg > 0 && recentAvg > olderAvg * 1.15) {
      const decayPct = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
      efficiency = {
        detected: true,
        decayPct,
        recentAvg: recentAvg.toFixed(1),
        historicalAvg: olderAvg.toFixed(1),
      };
    }

    // Burnout detection (high volume + slow times)
    let burnout = null;
    if (totalRuns >= 30 && avgTime >= 60) {
      // Classic burnout pattern
      burnout = {
        level: totalRuns >= 75 ? 'high' : 'moderate',
        message: totalRuns >= 75 
          ? 'High burnout risk - consider diversifying income'
          : 'Moderate burnout signs - watch for declining times',
      };
    } else if (efficiency?.detected && efficiency.decayPct >= 20) {
      // Efficiency-based burnout
      burnout = {
        level: 'high',
        message: `${efficiency.decayPct}% slower than your baseline - take a break!`,
      };
    }

    // Calculate runs today
    const today = new Date().setHours(0, 0, 0, 0);
    const runsToday = history.filter(r => r.timestamp >= today).length;

    return {
      trend,
      burnout,
      efficiency,
      recentAvg: recentAvg.toFixed(1),
      bestTime: bestTime.toFixed(1),
      worstTime: worstTime.toFixed(1),
      runsToday,
    };
  }, [formData.cayoHistory, formData.cayoCompletions, formData.cayoAvgTime]);

  const totalRuns = Number(formData.cayoCompletions) || 0;
  const avgTime = formData.cayoAvgTime || '—';
  const lastRun = formData.lastCayoRun 
    ? new Date(formData.lastCayoRun).toLocaleDateString()
    : 'Never';

  const TrendIcon = analytics.trend.icon;
  const trendColor = analytics.trend.status === 'improving' ? 'text-green-400' 
    : analytics.trend.status === 'declining' ? 'text-red-400' 
    : 'text-yellow-400';

  return (
    <div className="bg-white/5 rounded-lg p-4 mt-4 border border-white/10">
      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Cayo Performance Tracker
      </h4>

      {/* Burnout Warning */}
      {analytics.burnout && (
        <div className={`mb-4 p-3 rounded-lg border flex items-start gap-3 ${
          analytics.burnout.level === 'high' 
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
        }`}>
          {analytics.burnout.level === 'high' ? (
            <Flame className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="font-medium text-sm">
              {analytics.burnout.level === 'high' ? '🔥 Burnout Detected' : '⚠️ Burnout Warning'}
            </p>
            <p className="text-xs mt-1 opacity-80">{analytics.burnout.message}</p>
            <p className="text-xs mt-2 text-white/60">
              💡 Tip: Try Auto Shop contracts or Payphone Hits for variety
            </p>
          </div>
        </div>
      )}

      {/* Efficiency Decay Warning */}
      {analytics.efficiency?.detected && !analytics.burnout && (
        <div className="mb-4 p-3 rounded-lg border bg-orange-500/10 border-orange-500/30 text-orange-400 flex items-start gap-3">
          <BatteryLow className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">📉 Efficiency Decay Detected</p>
            <p className="text-xs mt-1 opacity-80">
              Recent runs: {analytics.efficiency.recentAvg}min avg vs {analytics.efficiency.historicalAvg}min baseline
            </p>
          </div>
        </div>
      )}

      {/* Run Logger Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="number"
          value={runTime}
          onChange={(e) => setRunTime(e.target.value)}
          placeholder="Run time (minutes)"
          min="5"
          max="120"
          step="0.5"
          className="flex-1 px-3 py-2 rounded-md border border-white/20 bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <button
          type="submit"
          disabled={!runTime || parseFloat(runTime) < 5 || parseFloat(runTime) > 120}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-900 font-semibold transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Log
        </button>
      </form>

      {/* Success Toast */}
      {showSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-md text-center mb-4 flex items-center justify-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4" />
          Run logged! Stats updated.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center gap-1">
            <Target className="w-3 h-3" /> Total Runs
          </span>
          <span className="text-white font-medium">{totalRuns}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" /> Avg Time
          </span>
          <span className="text-white font-medium">{avgTime} min</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center gap-1">
            <TrendIcon className="w-3 h-3" /> Trend
          </span>
          <span className={`font-medium flex items-center gap-1 ${trendColor}`}>
            {analytics.trend.label}
          </span>
        </div>

        {analytics.bestTime && (
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center gap-1">
              <Zap className="w-3 h-3" /> Best Time
            </span>
            <span className="text-green-400 font-medium">{analytics.bestTime} min</span>
          </div>
        )}

        {analytics.recentAvg && (
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Recent Avg
            </span>
            <span className={`font-medium ${
              analytics.efficiency?.detected ? 'text-orange-400' : 'text-white'
            }`}>
              {analytics.recentAvg} min
            </span>
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Last Run
          </span>
          <span className="text-white font-medium text-sm">{lastRun}</span>
        </div>
      </div>

      {/* Today's Progress */}
      {analytics.runsToday > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Today's runs:</span>
            <span className="text-cyan-400 font-medium">{analytics.runsToday}</span>
          </div>
          {analytics.runsToday >= 5 && (
            <p className="text-xs text-yellow-400 mt-1">
              ⚠️ {analytics.runsToday} runs today - consider taking a break!
            </p>
          )}
        </div>
      )}

      {/* Performance Tip */}
      {totalRuns === 0 && (
        <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
          <p className="text-cyan-400 text-xs">
            💡 <strong>Tip:</strong> Log your Cayo run times to track performance and detect burnout early. 
            Optimal solo time is 45-50 minutes.
          </p>
        </div>
      )}
    </div>
  );
};

export default CayoRunLogger;
