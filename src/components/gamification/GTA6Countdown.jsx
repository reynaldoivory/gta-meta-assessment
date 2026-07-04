// src/components/GTA6Countdown.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { GTA6_RELEASE_ISO, calculateTimeLeft as computeTimeLeft } from '../../utils/trackers/gta6Countdown';

const GTA6Countdown = () => {
  // OFFICIAL: November 19, 2026 release date (memoized to prevent recreating on every render)
  const releaseDate = useMemo(() => new Date(GTA6_RELEASE_ISO), []);

  const calculateTimeLeft = useCallback(
    () => computeTimeLeft(releaseDate, new Date()),
    [releaseDate]
  );

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const funFacts = [
    "GTA 6 releases November 19, 2026 for PS5 and Xbox Series X|S!",
    "Vice City returns with a modern twist after 20+ years.",
    "Rockstar has been working on GTA 6 since 2014.",
    "GTA 5 generated over $8 billion in revenue since 2013.",
    "GTA 6's map could be the biggest Rockstar has ever created.",
    "Leaks suggest dual protagonists: Lucia and Jason.",
    "Weather systems may feature realistic hurricanes.",
    "Some insiders worry about a slip to early 2027, but Nov 2026 is official.",
  ];

  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const factTimer = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % funFacts.length);
    }, 8000);
    return () => clearInterval(factTimer);
  }, [funFacts.length]);

  if (timeLeft.released) {
    return (
      <div className="bg-hud-blue/10 border border-hud-blue/40 rounded-2xl p-6 mb-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-3xl font-bold text-hud-blue mb-2">GTA 6 IS OUT!</h2>
          <p className="text-text-secondary">Time to put these grinding skills to use in the new game!</p>
        </div>
      </div>
    );
  }

  return (
    // contain-paint contain-layout: this card re-renders every second
    // (countdown timer) -- containment keeps that tick isolated from the rest
    // of the results view.
    <div className="contain-paint contain-layout bg-bg-surface border border-hud-blue/40 rounded-2xl p-6 mb-6 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-hud-blue rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-hud-pink rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-hud-blue" />
            <div>
              <h2 className="text-2xl font-bold text-text-primary">GTA VI Countdown</h2>
              <p className="text-text-muted text-sm">Official Release: November 19, 2026</p>
              <p className="text-text-muted text-xs mt-1">PS5 & Xbox Series X|S</p>
            </div>
          </div>
          <div className="text-4xl animate-bounce">🎯</div>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((unit) => (
            <div
              key={unit.label}
              className="bg-bg-base/40 backdrop-blur-sm rounded-xl p-4 text-center border border-hud-blue/20"
            >
              <div className="text-3xl md:text-4xl font-bold text-hud-blue font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-text-muted uppercase tracking-wider mt-1">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        {/* Fun Fact Rotator */}
        <div className="bg-bg-base/40 backdrop-blur-sm rounded-lg p-4 border border-hud-blue/20 mb-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-hud-blue flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-hud-blue font-bold uppercase tracking-wider mb-1">
                Did You Know?
              </div>
              <div className="text-sm text-text-secondary transition-all duration-500">
                {funFacts[currentFact]}
              </div>
            </div>
          </div>
        </div>

        {/* Delay Warning */}
        <div className="bg-hud-pink/10 border border-hud-pink/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-hud-pink flex-shrink-0 mt-0.5" />
            <p className="text-xs text-accent-pink-text">
              Note: Some insiders report the game is "not content complete." Possible slip to early 2027, but November 2026 remains official.
            </p>
          </div>
        </div>

        {/* Grind Goals */}
        <div className="pt-4 border-t border-hud-blue/20">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <TrendingUp className="w-4 h-4 text-hud-blue" />
            <span>
              Optimize your GTA Online empire before GTA 6 drops. Transfer that wealth mindset!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GTA6Countdown;
