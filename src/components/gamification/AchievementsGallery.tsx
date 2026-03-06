// src/components/gamification/AchievementsGallery.jsx
import { useState, useMemo } from 'react';

import { Trophy, Filter, Lock, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementProgress } from '../../utils/achievements';

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];
const TIER_COLORS = {
  bronze: { border: 'border-amber-700/40', bg: 'bg-amber-900/15', text: 'text-amber-400', badge: 'bg-amber-700/30 text-amber-300' },
  silver: { border: 'border-slate-400/40', bg: 'bg-slate-700/15', text: 'text-slate-300', badge: 'bg-slate-600/30 text-slate-200' },
  gold: { border: 'border-yellow-500/40', bg: 'bg-yellow-900/15', text: 'text-yellow-400', badge: 'bg-yellow-600/30 text-yellow-200' },
  platinum: { border: 'border-cyan-400/40', bg: 'bg-cyan-900/15', text: 'text-cyan-300', badge: 'bg-cyan-600/30 text-cyan-200' },
};

const AchievementsGallery = ({ unlockedIds = [], formData, results, history, streak }: any) => {
  const [expanded, setExpanded] = useState(false);
  const [tierFilter, setTierFilter] = useState('all');

  const unlockedSet = useMemo(() => new Set(unlockedIds), [unlockedIds]);

  const progress = useMemo(
    () => getAchievementProgress({ formData, results }, history, streak),
    [formData, results, history, streak]
  );

  const allAchievements = useMemo(() => Object.values(ACHIEVEMENTS), []);

  const filtered = useMemo(() => {
    const list = tierFilter === 'all' ? allAchievements : allAchievements.filter((a) => a.tier === tierFilter);
    // Sort: unlocked first, then by tier weight
    return [...list].sort((a, b) => {
      const aUnlocked = unlockedSet.has(a.id) ? 0 : 1;
      const bUnlocked = unlockedSet.has(b.id) ? 0 : 1;
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
      return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    });
  }, [allAchievements, tierFilter, unlockedSet]);

  const percentComplete = progress.total > 0 ? Math.round((progress.unlocked / progress.total) * 100) : 0;

  return (
    <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-950 via-slate-900/90 to-amber-950/30 p-6 shadow-[0_0_40px_rgba(245,158,11,0.06)]">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="text-xs uppercase tracking-[0.2em] text-amber-300">Achievements</div>
            <div className="font-display text-xl font-bold text-slate-100">
              {progress.unlocked}/{progress.total}
              <span className="ml-2 text-sm font-normal text-slate-400">({percentComplete}%)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tier summary pills */}
          <div className="hidden gap-1.5 sm:flex">
            {TIER_ORDER.map((tier) => (
              <span key={tier} className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${TIER_COLORS[tier].badge}`}>
                {progress.byTier[tier]}
              </span>
            ))}
          </div>

          {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-700"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-5">
          {/* Tier filter */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            {['all', ...TIER_ORDER].map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  tierFilter === tier
                    ? 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
                }`}
              >
                {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
              </button>
            ))}
          </div>

          {/* Achievement grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((achievement) => {
              const isUnlocked = unlockedSet.has(achievement.id);
              const colors = TIER_COLORS[achievement.tier] || TIER_COLORS.bronze;
              return (
                <div
                  key={achievement.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
                    isUnlocked
                      ? `${colors.border} ${colors.bg}`
                      : 'border-slate-800/60 bg-slate-950/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{achievement.icon}</span>
                      <div>
                        <div className={`text-sm font-bold ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                          {achievement.title}
                        </div>
                        <div className="text-xs text-slate-400">{achievement.description}</div>
                      </div>
                    </div>
                    {isUnlocked ? (
                      <Star className={`h-4 w-4 flex-shrink-0 ${colors.text}`} />
                    ) : (
                      <Lock className="h-4 w-4 flex-shrink-0 text-slate-600" />
                    )}
                  </div>
                  <div className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${colors.badge}`}>
                    {achievement.tier}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default AchievementsGallery;
