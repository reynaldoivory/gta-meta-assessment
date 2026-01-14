// src/components/shared/WeeklyBonusBanner.jsx
import React from 'react';
import { Activity } from 'lucide-react';
import { getWeeklyBonuses, WEEKLY_EVENTS } from '../../config/weeklyEvents';

const WeeklyBonusBanner = () => {
  const bonuses = getWeeklyBonuses();

  return (
    <div className="mb-4 rounded-2xl border border-orange-500/40 bg-gradient-to-r from-orange-900/40 to-yellow-900/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-400" />
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-orange-300">
              This Week&apos;s Bonuses
            </div>
            <div className="text-sm text-slate-200">
              {WEEKLY_EVENTS.meta.displayDate} • Do these **before** Cayo
            </div>
          </div>
        </div>
        <span className="rounded-full border border-orange-400/40 bg-black/30 px-2 py-0.5 text-[10px] font-mono uppercase text-orange-300">
          2026 META
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {bonuses.map((b, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-black/30 p-3 text-xs border border-orange-500/20"
          >
            <div className="text-[11px] font-semibold text-orange-300">
              {b.multiplier}
            </div>
            <div className="text-slate-100 text-sm">{b.activity}</div>
            <div className="mt-1 text-[11px] text-slate-400">{b.note}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-yellow-200/80">
        Tip: If any of these are active for you, prioritize them over solo Cayo;
        they often beat the post-nerf ~700k/run average.
      </p>
    </div>
  );
};

export default WeeklyBonusBanner;
