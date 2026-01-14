// src/components/GTA6Countdown.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Zap, AlertCircle } from 'lucide-react';

const GTA6Countdown = () => {
  // OFFICIAL: November 19, 2026 release date
  const releaseDate = new Date('2026-11-19T00:00:00');
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const difference = releaseDate - now;

    if (difference <= 0) {
      return { released: true };
    }

    return {
      released: false,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/40 rounded-2xl p-6 mb-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-3xl font-bold text-green-400 mb-2">GTA 6 IS OUT!</h2>
          <p className="text-slate-300">Time to put these grinding skills to use in the new game!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-orange-900/30 border border-purple-500/40 rounded-2xl p-6 mb-6 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-2xl font-bold text-white">GTA VI Countdown</h3>
              <p className="text-slate-400 text-sm">Official Release: November 19, 2026</p>
              <p className="text-slate-500 text-xs mt-1">PS5 & Xbox Series X|S</p>
            </div>
          </div>
          <div className="text-4xl animate-bounce">🎯</div>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((unit, idx) => (
            <div
              key={idx}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-4 text-center border border-purple-500/20"
            >
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        {/* Fun Fact Rotator */}
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20 mb-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">
                Did You Know?
              </div>
              <div className="text-sm text-slate-200 transition-all duration-500">
                {funFacts[currentFact]}
              </div>
            </div>
          </div>
        </div>

        {/* Delay Warning */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-200">
              Note: Some insiders report the game is "not content complete." Possible slip to early 2027, but November 2026 remains official.
            </p>
          </div>
        </div>

        {/* Grind Goals */}
        <div className="pt-4 border-t border-purple-500/20">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
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
