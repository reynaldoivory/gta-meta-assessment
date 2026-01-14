// src/components/CayoRunLogger.jsx
import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { Clock, TrendingUp, TrendingDown, Minus, CheckCircle, Plus, Target } from 'lucide-react';

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

  // Calculate trend from history
  const getTrend = () => {
    const history = formData.cayoHistory || [];
    if (history.length < 3) return { status: 'stable', label: 'Not enough data' };
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    if (older.length === 0) return { status: 'stable', label: 'Building baseline' };
    
    const recentAvg = recent.reduce((sum, r) => sum + r.time, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.time, 0) / older.length;
    const diff = recentAvg - olderAvg;
    
    if (diff < -1) return { status: 'improving', label: 'Getting faster!' };
    if (diff > 1) return { status: 'declining', label: 'Slowing down' };
    return { status: 'stable', label: 'Consistent' };
  };

  const trend = getTrend();
  const totalRuns = Number(formData.cayoCompletions) || 0;
  const avgTime = formData.cayoAvgTime || '—';
  const lastRun = formData.lastCayoRun 
    ? new Date(formData.lastCayoRun).toLocaleDateString()
    : 'Never';

  const TrendIcon = trend.status === 'improving' ? TrendingUp 
    : trend.status === 'declining' ? TrendingDown 
    : Minus;

  const trendColor = trend.status === 'improving' ? 'text-green-400' 
    : trend.status === 'declining' ? 'text-red-400' 
    : 'text-yellow-400';

  return (
    <div className="bg-white/5 rounded-lg p-4 mt-4 border border-white/10">
      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Log Cayo Run
      </h4>

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

      {showSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-2 rounded-md text-center mb-4 flex items-center justify-center gap-2 animate-pulse">
          <CheckCircle className="w-4 h-4" />
          Run logged! Stats updated.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Total Runs</span>
          <span className="text-white font-medium flex items-center gap-1">
            <Target className="w-3 h-3 text-cyan-400" />
            {totalRuns}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Avg Time</span>
          <span className="text-white font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            {avgTime} min
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Last Run</span>
          <span className="text-white font-medium text-sm">{lastRun}</span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs uppercase tracking-wide">Trend</span>
          <span className={`font-medium flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {trend.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CayoRunLogger;
