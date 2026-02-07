// src/views/QuickStartGuide.jsx
import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { WEEKLY_EVENTS } from '../config/weeklyEvents';
import { Shield, DollarSign, Target, TrendingUp, Zap, CheckCircle2, X } from 'lucide-react';

const QuickStartGuide = () => {
  const { setStep, formData } = useAssessment();
  const [activeStep, setActiveStep] = useState(0);
  const hasGTAPlus = formData.hasGTAPlus;

  // Base steps for non-GTA+ players
  const baseSteps = [
    {
      title: "Hour 1-2: Stat Foundation",
      icon: <Shield className="w-6 h-6" />,
      tasks: [
        "🚫 DO NOT BUY CARS OR CLOTHES - Save every dollar",
        "✅ Complete 'Pier Pressure' mission for Strength training",
        "✅ Visit San Andreas Flight School (first 5 lessons)",
        "✅ Equip Scuba Suit from Kosatka (free, bypasses Lung stat)",
        "📊 Target: Strength 3/5, Flying 4/5, Shooting 3/5"
      ],
      time: "2 hours",
      income: "$0 (investment)",
      warning: "Without these stats, you'll die repeatedly and waste hours"
    },
    {
      title: "Hour 3-10: First $2.2M",
      icon: <DollarSign className="w-6 h-6" />,
      tasks: [
        "🏢 Register as VIP/CEO (level 1, free)",
        "💰 Do VIP Work: Sightseer ($25k) & Headhunter ($21k)",
        "📞 Complete Payphone Hits ($85k) if available",
        "🎯 Focus: $220,000/hour = $2.2M in 10 hours",
        "💡 Tip: Play in Invite-Only sessions to avoid griefers"
      ],
      time: "7 hours",
      income: "$2.2M",
      warning: "Do NOT buy apartments, facilities, or businesses yet"
    },
    {
      title: "Hour 10-12: Purchase Kosatka",
      icon: <Target className="w-6 h-6" />,
      tasks: [
        "🛒 Warstock Cache & Carry → Kosatka ($2.2M)",
        "⚓ Skip all extras (no missiles, sonar, sparrow yet)",
        "🎯 Start Cayo Perico Heist immediately",
        "🕵️ First scope: Drainage tunnel is mandatory",
        "📊 Target completion: 90-120 minutes first run"
      ],
      time: "2 hours",
      income: "$600-900k (first completion)",
      warning: "First Cayo will be slow - that's normal. Expect $630k for tequila."
    },
    {
      title: "Hour 12-20: Establish Routine",
      icon: <TrendingUp className="w-6 h-6" />,
      tasks: [
        "🚁 Buy Sparrow ($1.8M) after first Cayo",
        "🔄 Run Cayo → Payphone Hits → VIP Work loop",
        "📈 Complete 5 Cayo runs to master route",
        "🏆 Goal: $600-900k per run (avg ~$700k, RNG-dependent)",
        "💸 Target net worth: $8-10M"
      ],
      time: "8 hours",
      income: "$5.5M+",
      warning: "Cayo nerfed in 2023—tequila pays ~$630k total. Focus on weekly 2X bonuses."
    },
    {
      title: "Hour 20-40: Build Passive Engine",
      icon: <Zap className="w-6 h-6" />,
      tasks: [
        "⚗️ Buy Acid Lab ($750k) + Equipment Upgrade ($250k)",
        "🏢 Buy Agency ($2M) → Complete Dr. Dre Contract",
        "🔄 Add Payphone Hits to rotation ($85k per hit)",
        "🏪 Consider Nightclub when you own 3+ businesses",
        "📊 Target: $200k+/hr passive income",
        "⚠️ Note: Acid Lab equipment requires 10 Fooligan Jobs (48min cooldown each)"
      ],
      time: "20 hours",
      income: "$15M+ total",
      warning: "DO NOT activate MC businesses solo (Post-Op vans)"
    },
    {
      title: "Hour 40-60: Optimize & Specialize",
      icon: <CheckCircle2 className="w-6 h-6" />,
      tasks: [
        "🏍️ Purchase Oppressor Mk II (if desired)",
        "🎮 Master 3-4 mission types for variety",
        "📅 Check weekly bonuses every Thursday",
        "🏗️ Build towards full passive setup",
        "🎯 Target: $800k-1M/hour sustainable rate"
      ],
      time: "20 hours",
      income: "$25M+ total",
      warning: "This is where burnout happens - take breaks!"
    }
  ];

  // GTA+ optimized steps
  const gtaPlusSteps = [
    {
      title: "Hour 1-2: Stat Foundation",
      icon: <Shield className="w-6 h-6" />,
      tasks: [
        "🚫 DO NOT BUY CARS OR CLOTHES - Save every dollar",
        "✅ Golf or 'Pier Pressure' for Strength (aim 3/5)",
        "✅ Visit San Andreas Flight School (first 5 lessons)",
        "✅ Equip Scuba Suit from Kosatka (free, bypasses Lung stat)",
        "📊 Target: Strength 3/5, Flying 4/5, Shooting 3/5"
      ],
      time: "2 hours",
      income: "$0 (investment)",
      warning: "Without these stats, you'll die repeatedly and waste hours"
    },
    {
      title: "Hour 3-6: GTA+ Seed Money",
      icon: <DollarSign className="w-6 h-6" />,
      tasks: [
        `🏎️ Visit ${WEEKLY_EVENTS.gtaPlus?.freeCarLocation || 'Vinewood Car Club'} → Claim FREE ${WEEKLY_EVENTS.gtaPlus?.freeCar || 'GTA+ Vehicle'} (GTA+)`,
        "🏢 Register as VIP/CEO (level 1, free)",
        "💰 Run Cluckin' Bell Farm Raid (Vincent) up to 3 times",
        "💵 Each run: ~$500k + one-time $250k bonus on first clear",
        "🎯 Goal: ~$1.5M+ to buy discounted Auto Shop"
      ],
      time: "3 hours",
      income: "$1.5M+",
      warning: "Use this only while the event bonuses are active."
    },
    {
      title: "Hour 6-15: Auto Shop Loop (GTA+)",
      icon: <TrendingUp className="w-6 h-6" />,
      tasks: [
        "🏬 Buy discounted Auto Shop (Mission Row/Strawberry, -50% GTA+)",
        "🧾 Ignore Customer Cars; use the contract whiteboard only",
        "🏦 Fish for 'Union Depository Contract' when 2X is active",
        "💰 Payout: ~$540k per run (2X GTA+ bonus, 20–30 minutes)",
        "🎯 Target: ~1.0–1.1M/hour while the 2X event lasts"
      ],
      time: "9 hours",
      income: "$9M+ (during 2X weeks)",
      warning: "After event ends, this drops below Cayo in priority."
    },
    {
      title: "Hour 15-20: Transition to Kosatka",
      icon: <Target className="w-6 h-6" />,
      tasks: [
        "🛒 Buy Kosatka ($2.2M) with Auto Shop money",
        "⚓ Skip extras (no missiles/sonar yet)",
        "🎯 Start Cayo Perico Heist immediately",
        "🕵️ First scope: Drainage tunnel is mandatory",
        "📊 Target: 90–120 minutes first run (expect ~$630k tequila)"
      ],
      time: "5 hours",
      income: "$600-900k (first completion)",
      warning: "First Cayo will be slow — that's normal."
    },
    {
      title: "Hour 20-40: Build Passive Engine",
      icon: <Zap className="w-6 h-6" />,
      tasks: [
        "⚗️ Buy Acid Lab ($750k) + Equipment Upgrade ($250k)",
        "🏢 Buy Agency ($2M) → Complete Dr. Dre Contract",
        "🔄 Add Payphone Hits to rotation ($85k per hit)",
        "🏪 Consider Nightclub when you own 3+ businesses",
        "📊 Target: $200k+/hr passive income",
        "⚠️ Note: Acid Lab equipment requires 10 Fooligan Jobs (48min cooldown each)"
      ],
      time: "20 hours",
      income: "$15M+ total",
      warning: "DO NOT activate MC businesses solo (Post-Op vans)"
    },
    {
      title: "Hour 40-60: Optimize & Specialize",
      icon: <CheckCircle2 className="w-6 h-6" />,
      tasks: [
        "🏍️ Purchase Oppressor Mk II (if desired)",
        "🎮 Master 3-4 mission types for variety",
        "📅 Check weekly bonuses every Thursday",
        "🏗️ Build towards full passive setup",
        "🎯 Target: $800k-1M/hour sustainable rate"
      ],
      time: "20 hours",
      income: "$25M+ total",
      warning: "This is where burnout happens - take breaks!"
    }
  ];

  const steps = hasGTAPlus ? gtaPlusSteps : baseSteps;
  const currentStep = steps[activeStep];

  const commonMistakes = [
    "❌ Buying cars before businesses (luxury trap)",
    "❌ Running MC businesses solo (Post-Op torture)",
    "❌ Ignoring weekly 2X-4X money events",
    "❌ Playing in public sessions while grinding",
    "❌ Not maxing Strength/Flying early",
    "❌ Buying Facility before Kosatka",
    "❌ Expecting $1M+ per Cayo (2023 nerf dropped avg to ~$700k)",
    "❌ Doing low-pay Contact Missions past hour 10"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setStep('form')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" /> Close Guide
          </button>
          <div className="text-sm text-slate-500">
            {hasGTAPlus ? 'GTA+ Optimized' : 'Standard Path'}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Quick Start Guide</h1>
          <p className="text-slate-400">
            {hasGTAPlus 
              ? "Optimized path for GTA+ subscribers. Takes advantage of monthly bonuses and discounted properties."
              : "The fastest path from rank 1 to $1M+/hour. Follow these steps in order."}
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeStep === idx
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Current Step Card */}
        <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
              {currentStep.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentStep.title}</h2>
              <div className="flex gap-4 text-sm text-slate-400 mt-1">
                <span>⏱️ {currentStep.time}</span>
                <span>💰 {currentStep.income}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {currentStep.tasks.map((task, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-200">
                <span className="text-slate-500 mt-1">•</span>
                <span>{task}</span>
              </div>
            ))}
          </div>

          {currentStep.warning && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">⚠️ {currentStep.warning}</p>
            </div>
          )}
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-red-400 mb-4">🚫 Common Mistakes to Avoid</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonMistakes.map((mistake, idx) => (
              <div key={idx} className="text-sm text-slate-300">
                {mistake}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickStartGuide;
