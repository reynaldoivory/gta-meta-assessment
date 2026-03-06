// src/utils/confettiEffects.js
// Centralized confetti trigger system

export const fireConfetti = (type = 'default') => {
  // This can be extended to trigger different confetti patterns
  // For now, it's a simple trigger that components can listen to
  const event = new CustomEvent('confetti', { detail: { type } });
  globalThis.dispatchEvent(event);
};

export const confettiTypes = {
  'tier-up': { colors: ['#fbbf24', '#f59e0b'], intensity: 'high' },
  'achievement': { colors: ['#10b981', '#34d399'], intensity: 'medium' },
  'default': { colors: ['#3b82f6', '#8b5cf6', '#ec4899'], intensity: 'medium' },
};
