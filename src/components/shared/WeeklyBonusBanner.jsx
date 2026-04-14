// src/components/shared/WeeklyBonusBanner.jsx

import PropTypes from 'prop-types';
import { Activity, Lock } from 'lucide-react';

import { getWeeklyBonuses, WEEKLY_EVENTS } from '../../config/weeklyEvents';

const WeeklyBonusBanner = ({ hasGTAPlus = false }) => {
  const bonuses = getWeeklyBonuses({ hasGTAPlus, includeGTAPlus: true });

  return (
    <div className="mb-6 rounded-2xl border-2 border-primary-orange-500/50 bg-gradient-to-br from-primary-orange-500/20 via-primary-purple-500/10 to-surface-card p-5 shadow-float backdrop-blur-sm animate-pop-in">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-orange-500 to-accent-pink flex items-center justify-center shadow-glow-orange">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider font-display text-primary-orange-400">
              This Week&apos;s Bonuses
            </div>
            <div className="text-sm font-medium text-white">
              {WEEKLY_EVENTS.meta.displayDate} • Do these <span className="font-bold text-primary-cyan-400">before</span> Cayo
            </div>
          </div>
        </div>
        <span className="badge-orange font-mono text-xs">
          2026 META
        </span>
      </div>
      {bonuses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">
            No active bonuses this week. Check{' '}
            <a href="https://www.reddit.com/r/gtaonline" target="_blank" rel="noopener noreferrer" className="text-primary-cyan-400 underline">
              r/gtaonline
            </a>{' '}
            for the latest weekly update.
          </p>
          <p className="text-xs text-slate-500 mt-1">Event data last updated: {WEEKLY_EVENTS.meta.displayDate}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {bonuses.map((b) => (
            <div
              key={b.activity}
              className={`rounded-xl bg-surface-elevated/80 backdrop-blur-sm p-4 border-2 transition-all duration-200 ${
                b.locked
                  ? 'border-slate-600/40 opacity-60'
                  : 'border-primary-orange-500/40 hover:border-primary-orange-400 hover:shadow-glow-orange hover:scale-105'
              } relative`}
            >
              {b.locked && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-700/80 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
              )}
              <div className="text-sm font-mono font-bold text-primary-orange-400 mb-1">
                {b.multiplier}
              </div>
              <div className="text-white text-base font-bold mb-2">{b.activity}</div>
              <div className="text-xs text-slate-300">{b.note}</div>
              {b.locked && (
                <div className="mt-2 badge bg-accent-gold/20 text-accent-gold border-accent-gold/40">GTA+ Required</div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 p-3 rounded-xl bg-primary-cyan-500/10 border border-primary-cyan-500/30">
        <p className="text-xs text-primary-cyan-300 font-medium">
          💡 <span className="font-bold">Pro Tip:</span> If any of these are active for you, prioritize them over solo Cayo—they often beat the post-nerf ~700k/run average!
        </p>
      </div>
    </div>
  );
};

WeeklyBonusBanner.propTypes = {
  hasGTAPlus: PropTypes.bool,
};

export default WeeklyBonusBanner;
