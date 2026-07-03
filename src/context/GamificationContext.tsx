// src/context/GamificationContext.tsx
// Focused context for gamification state: XP, streaks, achievements.
import { createContext, useContext, useState, type ReactNode } from 'react';

// ── Gamification types ──────────────────────────────────────────────
export interface GamificationState {
  xp: number;
  level: number;
  achievements: string[];
}

export interface GamificationSummaryState {
  levelBefore: number;
  levelAfter: number;
  newAchievements: string[];
}

// ── Public value shape ──────────────────────────────────────────────
export interface GamificationContextValue {
  gamification: GamificationState | null;
  gamificationSummary: GamificationSummaryState | null;
  streaks: number;
  xp: number;
}

// ── Context ─────────────────────────────────────────────────────────
const GamificationContext = createContext<GamificationContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────
export const GamificationProvider = ({ children }: { children: ReactNode }) => {
  const [gamification] = useState<GamificationState | null>(null);
  const [gamificationSummary] = useState<GamificationSummaryState | null>(null);
  const [streaks] = useState(0);
  const [xp] = useState(0);

  const value: GamificationContextValue = {
    gamification,
    gamificationSummary,
    streaks,
    xp,
  };

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

// ── Hook ────────────────────────────────────────────────────────────
export const useGamification = (): GamificationContextValue => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within a GamificationProvider');
  return ctx;
};
