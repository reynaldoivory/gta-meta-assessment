// src/utils/usePriorityPlan.ts
// Custom hook: extracts all data computation from PriorityActionPlan view
import { useMemo } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { buildCompactActionPlan, buildSessionPlan } from './actionPlanBuilder.ts';
import type { Action, Bottleneck, FormData, Results } from './actionPlanTypes';
import { prioritizeActions } from './actionPriority';
import { buildLLMPrompt, buildPlanCritiquePrompt, buildLLMJsonPayload } from './buildLLMPrompt';
import { getWeeklyBonuses } from '../config/weeklyEvents';

type RecordLike = Record<string, unknown>;

type PriorityPlanResult = {
  formData: FormData;
  results: Results | null;
  setStep: (step: string) => void;
  whatIfText: string;
  setWhatIfText: (text: string) => void;
  sessionPlan: RecordLike | null;
  actionPlan: Action[];
  weeklyBonuses: unknown[];
  llmPrompt: string;
  planPrompt: string;
  jsonPayload: RecordLike;
};

/**
 * Computes the full priority action plan from assessment context.
 * Returns all derived data needed by the PriorityActionPlan view.
 */
export const usePriorityPlan = (sessionMinutes: number): PriorityPlanResult => {
  const { formData, results, setStep, whatIfText, setWhatIfText } = useAssessment() as any;

  const sessionPlan = useMemo(() => {
    if (!results) return null;
    try {
      return buildSessionPlan({ formData, results, sessionMinutes }) as RecordLike;
    } catch (e) {
      console.error('Error building session plan:', import.meta.env.DEV ? e : (e instanceof Error ? e.message : 'unknown error'));
      return null;
    }
  }, [formData, results, sessionMinutes]);

  // Prioritize bottlenecks and build action plan
  let prioritizedBottlenecks: Bottleneck[] = [];
  let actionPlan: Action[] = [];
  let weeklyBonuses: unknown[] = [];

  if (results) {
    try {
      prioritizedBottlenecks = prioritizeActions(
        results.bottlenecks || [],
        Number(formData.liquidCash) || 0,
        Number(results.incomePerHour) || 0
      );
      actionPlan = buildCompactActionPlan(prioritizedBottlenecks, results.heistReady, formData, results);
      weeklyBonuses = getWeeklyBonuses() as unknown[];
    } catch (error) {
      console.error('Error building action plan:', import.meta.env.DEV ? error : (error instanceof Error ? error.message : 'unknown error'));
    }
  }

  // Build LLM prompts
  let llmPrompt = '';
  let planPrompt = '';
  let jsonPayload: RecordLike = {};

  if (results) {
    try {
      llmPrompt = buildLLMPrompt({ formData, assessmentResults: results, weeklyBonuses });
      planPrompt = buildPlanCritiquePrompt({
        formData,
        assessmentResults: results,
        actionPlan,
        weeklyBonuses,
      });
      jsonPayload = buildLLMJsonPayload({ formData, assessmentResults: results });
    } catch (error) {
      console.error('Error building LLM prompts:', import.meta.env.DEV ? error : (error instanceof Error ? error.message : 'unknown error'));
    }
  }

  return {
    formData,
    results,
    setStep,
    whatIfText,
    setWhatIfText,
    sessionPlan,
    actionPlan,
    weeklyBonuses,
    llmPrompt,
    planPrompt,
    jsonPayload,
  };
};
