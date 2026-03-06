// src/utils/motivationalQuotes.js
// Motivational quotes from GTA characters and general gaming motivation

const QUOTES = [
  {
    text: "The only way to get ahead is to keep moving forward.",
    character: "Franklin Clinton",
  },
  {
    text: "Money isn't everything, but it's a close second.",
    character: "Michael De Santa",
  },
  {
    text: "You don't get rich by playing it safe.",
    character: "Trevor Phillips",
  },
  {
    text: "Every heist is a learning experience. Master the basics, then optimize.",
    character: "Lester Crest",
  },
  {
    text: "Time is money. Every minute you waste is money you're not making.",
    character: "GTA Grinder Wisdom",
  },
  {
    text: "The best investment is in yourself. Upgrade your skills, upgrade your income.",
    character: "Business Philosophy",
  },
  {
    text: "Consistency beats intensity. A steady grind beats sporadic bursts.",
    character: "Grinding Mantra",
  },
  {
    text: "You don't need to be the best, you just need to be better than yesterday.",
    character: "Progress Mindset",
  },
  {
    text: "The grind never stops, but neither do the rewards.",
    character: "Los Santos Legend",
  },
  {
    text: "Every million starts with a single dollar. Keep stacking.",
    character: "Wealth Builder",
  },
  {
    text: "Efficiency is the difference between grinding and suffering.",
    character: "Meta Player",
  },
  {
    text: "Your setup determines your income. Optimize your setup, maximize your gains.",
    character: "Strategic Grinder",
  },
  {
    text: "Passive income is the key to freedom. Build it, then enjoy it.",
    character: "Business Owner",
  },
  {
    text: "The only bad grind is the one you're not doing.",
    character: "Motivational Speaker",
  },
  {
    text: "Rank doesn't mean skill, but skill means rank.",
    character: "Veteran Player",
  },
];

/**
 * Get a random quote
 * @returns {Object} Quote object with text and character
 */
export const getRandomQuote = () => {
  const randomIndex = Math.floor(Math.random() * QUOTES.length);
  return QUOTES[randomIndex];
};

/**
 * Get a motivational message based on score and tier
 * @param {number} score - Assessment score
 * @param {string} tier - Tier (S, A+, A, B, C, D)
 * @returns {string} Motivational message
 */
export const getMotivationalMessage = (score, _tier) => {
  if (score >= 90) {
    return "🏆 You're in the top tier! You've mastered the meta. Keep optimizing!";
  } else if (score >= 80) {
    return "⭐ Excellent progress! You're close to elite status. Push for that S-tier!";
  } else if (score >= 75) {
    return "💪 Great foundation! You're on the right track. Focus on the bottlenecks.";
  } else if (score >= 60) {
    return "📈 Good start! You have the basics. Time to level up your income sources.";
  } else if (score >= 40) {
    return "🎯 You're building your empire. Follow the action plan to accelerate growth.";
  } else {
    return "🚀 Every journey starts with a single step. Use the Quick Start Guide to get on track!";
  }
};

/**
 * Get tier-specific encouragement
 * @param {string} tier - Tier level
 * @returns {string} Encouragement message
 */
export const getTierEncouragement = (tier) => {
  const messages = {
    S: "You're a Los Santos legend! Share your knowledge with others.",
    'A+': "Elite status achieved! You're in the top 10% of players.",
    A: "Strong performance! You're well above average.",
    B: "Solid foundation! You're on the right path to greatness.",
    C: "Good progress! Focus on the action plan to level up.",
    D: "Starting strong! Every expert was once a beginner.",
  };

  return messages[tier] || messages.D;
};
