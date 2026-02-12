// src/utils/soundEffects.js
// Sound effects for user feedback (using Web Audio API)
// Respects user sound preference via gamification engine toggle

import { isSoundEnabled } from './gamificationEngine';

/**
 * Play a simple beep sound using Web Audio API
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in milliseconds
 * @param {string} type - Waveform type ('sine', 'square', 'sawtooth', 'triangle')
 */
const playBeep = (frequency = 440, duration = 200, type = 'sine') => {
  if (!isSoundEnabled()) return;
  try {
    const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Fade out to avoid clicks
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug('Audio not available:', error);
  }
};

/**
 * Play a chord (multiple frequencies)
 * @param {Array<number>} frequencies - Array of frequencies
 * @param {number} duration - Duration in milliseconds
 */
const playChord = (frequencies, duration = 300) => {
  if (!isSoundEnabled()) return;
  try {
    const audioContext = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const gainNode = audioContext.createGain();

    frequencies.forEach(freq => {
      const oscillator = audioContext.createOscillator();
      oscillator.connect(gainNode);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2 / frequencies.length, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    });

    gainNode.connect(audioContext.destination);
  } catch (error) {
    console.debug('Audio not available:', error);
  }
};

/**
 * Sound effects object
 */
export const soundEffects = {
  /**
   * Play level up sound
   */
  levelUp: () => {
    // Ascending notes
    playBeep(523.25, 100, 'sine'); // C5
    setTimeout(() => playBeep(659.25, 100, 'sine'), 100); // E5
    setTimeout(() => playBeep(783.99, 150, 'sine'), 200); // G5
  },

  /**
   * Play achievement unlocked sound
   */
  achievement: () => {
    // Triumphant chord progression
    playChord([523.25, 659.25, 783.99], 400); // C major chord
    setTimeout(() => {
      playChord([587.33, 698.46, 880.00], 400); // D minor chord
    }, 200);
    setTimeout(() => {
      playChord([659.25, 783.99, 987.77], 500); // E minor chord
    }, 400);
  },

  /**
   * Play cash register sound
   */
  cashRegister: () => {
    // Quick cash register-like beeps
    playBeep(800, 50, 'square');
    setTimeout(() => playBeep(1000, 50, 'square'), 60);
    setTimeout(() => playBeep(1200, 80, 'square'), 120);
  },

  /**
   * Play error sound
   */
  error: () => {
    // Low descending tone
    playBeep(400, 200, 'sawtooth');
    setTimeout(() => playBeep(300, 200, 'sawtooth'), 100);
  },

  /**
   * Play success sound
   */
  success: () => {
    // Quick ascending notes
    playBeep(523.25, 80, 'sine');
    setTimeout(() => playBeep(659.25, 80, 'sine'), 80);
    setTimeout(() => playBeep(783.99, 120, 'sine'), 160);
  },

  /**
   * Play notification sound
   */
  notification: () => {
    playBeep(800, 150, 'sine');
  },

  /**
   * Play click sound
   */
  click: () => {
    playBeep(600, 30, 'square');
  },
};
