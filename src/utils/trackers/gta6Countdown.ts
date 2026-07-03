// src/utils/trackers/gta6Countdown.ts
// Pure countdown math extracted from GTA6Countdown.jsx. The component keeps its
// setInterval/useState; only the release constant and the time-diff calculation
// live here so the countdown renders identically.

export const GTA6_RELEASE_ISO = '2026-11-19T00:00:00';

export interface TimeLeft {
  released: boolean;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

/**
 * Time remaining until `releaseDate` measured from `now`.
 * Returns `{ released: true }` (no d/h/m/s) once the date has passed --
 * this exact shape is what the component renders against.
 */
export function calculateTimeLeft(releaseDate: Date, now: Date): TimeLeft {
  const difference = releaseDate.getTime() - now.getTime();

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
