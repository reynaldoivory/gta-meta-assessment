// src/components/gamification/StreakBanner.jsx
import { useEffect, useState } from 'react';
import { checkStreak, getStreakMilestones } from '../../utils/streakTracker';

const StreakBanner = () => {
  const [streakData] = useState(() => checkStreak());
  const [showCelebration, setShowCelebration] = useState(
    () => !!(streakData?.isNewDay && streakData?.bonus)
  );

  // Auto-dismiss celebration after 3 seconds
  useEffect(() => {
    if (!showCelebration) return;
    const timer = setTimeout(() => setShowCelebration(false), 3000);
    return () => clearTimeout(timer);
  }, [showCelebration]);

  if (!streakData) return null;

  const milestones = getStreakMilestones(streakData.streak);
  const nextMilestone = milestones.find(m => !m.unlocked);

  return (
    <>
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-hud-blue text-text-on-accent px-8 py-6 rounded-2xl shadow-glow-blue animate-bounce">
            <div className="text-6xl mb-2">🔥</div>
            <div className="text-3xl font-bold">
              {streakData.streak} Day Streak!
            </div>
            <div className="text-sm">Keep the momentum going!</div>
          </div>
        </div>
      )}

      <div className="bg-hud-blue/10 border border-hud-blue/40 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🔥</div>
            <div>
              <div className="text-2xl font-bold text-hud-blue">
                {streakData.streak} Day Streak
              </div>
              <div className="text-sm text-text-muted">
                {nextMilestone
                  ? `${nextMilestone.days - streakData.streak} days until ${nextMilestone.title}`
                  : 'Maximum streak achieved!'}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {milestones.slice(0, 3).map((m) => (
              <div
                key={m.days}
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
