import { useEffect, useRef, useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { useToast } from '../context/ToastContext';
import { fireConfetti } from './confettiEffects';
import { MILESTONE_LEVELS, getMilestoneLabel } from './gamificationEngine';
import { getRandomQuote, getMotivationalMessage } from './motivationalQuotes';
import { getProgressHistory } from './progressTracker';
import { soundEffects } from './soundEffects';
import { checkStreak } from './streakTracker';
import { checkForFixedTraps, detectTraps, getTrapSummary } from './trapDetector';

type FormData = {
  strength?: number | string;
  timePlayed?: number | string;
  timePlayedDays?: number | string;
  timePlayedHours?: number | string;
  timePlayedMinutes?: number | string;
  [key: string]: unknown;
};

type Results = {
  score?: number;
  tier?: string;
  [key: string]: unknown;
};

type GamificationSummary = {
  levelBefore: number;
  levelAfter: number;
  newAchievements?: unknown[];
};

const hasAnyTimeParts = (formData: FormData) =>
  [formData.timePlayedDays, formData.timePlayedHours].some(
    (value) => value !== '' && value !== undefined && value !== null
  );

const calculateTotalHours = (days: number, hours: number, minutes = 0) => {
  const total = days * 24 + hours + minutes / 60;
  return Math.round(total);
};

const formatTimeParts = (days: number, hours: number) => {
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  return parts.length ? parts.join(' ') : '0h';
};

const toNumber = (value: unknown) => Number(value) || 0;

const getDetectedTraps = (formData: FormData, results: Results | null) => {
  if (!results) return [];
  return detectTraps(formData, results);
};

const getNewlyFixedTraps = (detectedTraps: unknown[], formData: FormData, results: Results | null) => {
  if (!results) return [];
  return checkForFixedTraps(detectedTraps, formData, results);
};

const getStrengthSummary = (formData: FormData) => {
  const strengthPct = toNumber(formData.strength) * 20;
  return {
    strengthPct,
    needsStrengthTraining: strengthPct < 60,
  };
};

const getTimePlayedSummary = (formData: FormData) => {
  const timePartsPresent = hasAnyTimeParts(formData);
  const timeDays = toNumber(formData.timePlayedDays);
  const timeHours = toNumber(formData.timePlayedHours);
  const timeMinutes = toNumber(formData.timePlayedMinutes);

  const totalHours = timePartsPresent
    ? calculateTotalHours(timeDays, timeHours, timeMinutes)
    : Math.round(toNumber(formData.timePlayed));

  return {
    totalHours,
    timePartsLabel: timePartsPresent ? formatTimeParts(timeDays, timeHours) : '',
    shouldShowTimePlayed: timePartsPresent || totalHours > 0,
  };
};

export const useAssessmentResults = () => {
  const { formData, results, setStep, gamification, gamificationSummary, setFormData } = useAssessment();
  const { showToast } = useToast();

  const typedFormData = (formData || {}) as FormData;
  const typedResults = results as Results | null;

  const [dismissedConfettiResult, setDismissedConfettiResult] = useState<Results | null>(null);
  const trapFixCelebratedRef = useRef(false);

  const showConfetti = Boolean(typedResults && toNumber(typedResults.score) >= 90 && dismissedConfettiResult !== typedResults);
  const setShowConfetti = (visible: boolean) => {
    if (!visible) {
      setDismissedConfettiResult(typedResults);
      return;
    }
    setDismissedConfettiResult(null);
  };

  const detectedTraps = getDetectedTraps(typedFormData, typedResults);
  const trapSummary = getTrapSummary(detectedTraps);
  const newlyFixedTraps = getNewlyFixedTraps(detectedTraps, typedFormData, typedResults);

  useEffect(() => {
    if (!typedResults) {
      setStep('form');
      return;
    }

    if (toNumber(typedResults.score) >= 90) {
      soundEffects.achievement();
      fireConfetti('tier-up');
    } else {
      soundEffects.levelUp();
    }
  }, [typedResults, setStep]);

  useEffect(() => {
    if (newlyFixedTraps.length > 0 && !trapFixCelebratedRef.current) {
      trapFixCelebratedRef.current = true;
      soundEffects.achievement();
      fireConfetti('default');
    }
  }, [newlyFixedTraps.length]);

  useEffect(() => {
    const summary = gamificationSummary as GamificationSummary | null;
    if (!summary) return;

    const hitMilestone = summary.levelAfter > summary.levelBefore && MILESTONE_LEVELS.includes(summary.levelAfter);

    if (hitMilestone) {
      soundEffects.achievement();
      fireConfetti('tier-up');
      const label = getMilestoneLabel(summary.levelAfter);
      if (label) {
        setTimeout(() => fireConfetti('achievement'), 600);
      }
    } else if (summary.levelAfter > summary.levelBefore) {
      soundEffects.achievement();
      fireConfetti('achievement');
    }

    if (summary.newAchievements?.length > 0) {
      soundEffects.achievement();
      fireConfetti('achievement');
    }
  }, [gamificationSummary]);

  const progressHistory = getProgressHistory();
  const streakInfo = checkStreak();
  const quote = getRandomQuote();
  const motivation = getMotivationalMessage(typedResults?.score, typedResults?.tier);

  const { strengthPct, needsStrengthTraining } = getStrengthSummary(typedFormData);
  const { totalHours, timePartsLabel, shouldShowTimePlayed } = getTimePlayedSummary(typedFormData);

  return {
    formData,
    results,
    setStep,
    gamification,
    setFormData,
    showToast,
    showConfetti,
    setShowConfetti,
    detectedTraps,
    trapSummary,
    progressHistory,
    streakInfo,
    quote,
    motivation,
    strengthPct,
    needsStrengthTraining,
    totalHours,
    timePartsLabel,
    shouldShowTimePlayed,
  };
};
