// src/components/gamification/StreakBanner.jsx
import React, { useEffect, useState } from 'react';
import { checkStreak, getStreakMilestones } from '../../utils/streakTracker';

const StreakBanner = () => {
  // Initialize streak data on mount (using lazy initialization to avoid setState in effect)
  const [streakData, setStreakData] = useState(() => checkStreak());
  const [showCelebration, setShowCelebration] = useState(false);

  // Handle celebration for new day bonus (separate effect to avoid setState-in-effect)
  useEffect(() => {
    if (streakData?.isNewDay && streakData?.bonus) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [streakData?.isNewDay, streakData?.bonus]);

  if (!streakData) return null;

  const milestones = getStreakMilestones(streakData.streak);
  const nextMilestone = milestones.find(m => !m.unlocked);

  return (
    <>
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-6 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-6xl mb-2">🔥</div>
            <div className="text-3xl font-bold">
              {streakData.streak} Day Streak!
            </div>
            <div className="text-sm">Keep the momentum going!</div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/40 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔥</div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {streakData.streak} Day Streak
              </div>
              <div className="text-sm text-slate-400">
                {nextMilestone
                  ? `${nextMilestone.days - streakData.streak} days until ${nextMilestone.title}`
                  : 'Maximum streak achieved!'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {milestones.slice(0, 3).map((m, idx) => (
              <div
                key={idx}
                className={`text-2xl transition-all ${m.unlocked ? 'opacity-100 scale-110' : 'opacity-20 grayscale'}`}
                title={m.title}
              >
                {m.reward.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StreakBanner;
