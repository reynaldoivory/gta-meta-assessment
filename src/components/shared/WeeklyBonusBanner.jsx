// src/components/shared/WeeklyBonusBanner.jsx

import PropTypes from 'prop-types';
import { Activity, Lock } from 'lucide-react';

import { getWeeklyBonuses, WEEKLY_EVENTS } from '../../config/weeklyEvents';
import { Badge } from '../ui';

const WeeklyBonusBanner = ({ hasGTAPlus = false }) => {
  const bonuses = getWeeklyBonuses({ hasGTAPlus, includeGTAPlus: true });

  return (
    <div className="mb-6 rounded-2xl border-2 border-hud-pink/40 bg-gradient-to-br from-hud-pink/10 via-hud-blue/5 to-bg-surface p-5 shadow-float backdrop-blur-sm animate-pop-in">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-hud-pink flex items-center justify-center shadow-glow-pink">
            <Activity className="h-5 w-5 text-text-on-accent" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider font-display text-accent-pink-text">
              This Week&apos;s Bonuses
            </div>
            <div className="text-sm font-medium text-text-primary">
              {WEEKLY_EVENTS.meta.displayDate} • Do these <span className="font-bold text-hud-blue">before</span> Cayo
            </div>
          </div>
        </div>
        <Badge tone="warning">2026 META</Badge>
      </div>
      {bonuses.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-text-secondary">
            No active bonuses this week. Check{' '}
            <a href="https://www.reddit.com/r/gtaonline" target="_blank" rel="noopener noreferrer" className="text-hud-blue underline">
              r/gtaonline
            </a>{' '}
            for the latest weekly update.
          </p>
          <p className="text-xs text-text-muted mt-1">Event data last updated: {WEEKLY_EVENTS.meta.displayDate}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {bonuses.map((b) => (
            <div
              key={b.activity}
              // No opacity dimming for locked tiles: it multiplies the whole
              // subtree (including text), pushing already-tight-contrast text
              // below WCAG AA. "Locked" is instead conveyed via the lock icon
              // overlay + swapping text to the muted token (still AA-passing
              // on its own) + a dimmer border.
              className={`rounded-xl bg-bg-raised/80 backdrop-blur-sm p-4 border-2 transition-all duration-200 ${
                b.locked
                  ? 'border-border/60'
                  : 'border-hud-pink/40 hover:border-hud-pink hover:shadow-glow-pink hover:scale-105'
              } relative`}
            >
              {b.locked && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bg-surface/80 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-text-muted" />
                </div>
              )}
              <div className={`text-sm font-mono font-bold mb-1 ${b.locked ? 'text-text-muted' : 'text-accent-pink-text'}`}>
                {b.multiplier}
              </div>
              <div className={`text-base font-bold mb-2 ${b.locked ? 'text-text-muted' : 'text-text-primary'}`}>{b.activity}</div>
              <div className="text-xs text-text-secondary">{b.note}</div>
              {b.locked && (
                <Badge tone="warning" size="sm" className="mt-2">GTA+ Required</Badge>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 p-3 rounded-xl bg-hud-blue/10 border border-hud-blue/30">
        <p className="text-xs text-hud-blue font-medium">
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
