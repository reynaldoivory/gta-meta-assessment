// src/utils/usePriorityPlan.ts
// Custom hook: extracts all data computation from PriorityActionPlan view
import { useMemo } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import { buildCompactActionPlan, buildSessionPlan } from './actionPlanBuilder';
import type { Action, Bottleneck } from './actionPlanTypes';
import type { AssessmentFormData, AssessmentResult } from '../types/domain.types';
import { prioritizeActions } from './actionPriority';
import { buildLLMPrompt, buildPlanCritiquePrompt, buildLLMJsonPayload } from './buildLLMPrompt';
import { getWeeklyBonuses } from '../config/weeklyEvents';

type RecordLike = Record<string, unknown>;

type PriorityPlanResult = {
  formData: AssessmentFormData;
  results: AssessmentResult | null;
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
  const { formData, results, setStep, whatIfText, setWhatIfText } = useAssessment() as {
    formData: unknown;
    results: unknown;
    setStep: (step: string) => void;
    whatIfText: string;
    setWhatIfText: (text: string) => void;
  };

  const typedFormData = formData as AssessmentFormData;
  const typedResults = results as AssessmentResult | null;

  const sessionPlan = useMemo(() => {
    if (!typedResults) return null;
    try {
      return buildSessionPlan({ formData: typedFormData, results: typedResults, sessionMinutes }) as RecordLike;
    } catch (e) {
      console.error('Error building session plan:', e);
      return null;
    }
  }, [typedFormData, typedResults, sessionMinutes]);

  // Prioritize bottlenecks and build action plan
  let prioritizedBottlenecks: Bottleneck[] = [];
  let actionPlan: Action[] = [];
  let weeklyBonuses: unknown[] = [];

  if (typedResults) {
    try {
      prioritizedBottlenecks = prioritizeActions(
        typedResults.bottlenecks || [],
        Number(typedFormData.liquidCash) || 0,
        Number(typedResults.incomePerHour) || 0
      );
      actionPlan = buildCompactActionPlan(prioritizedBottlenecks, typedResults.heistReady, typedFormData, typedResults);
      weeklyBonuses = getWeeklyBonuses() as unknown[];
    } catch (error) {
      console.error('Error building action plan:', error);
    }
  }

  // Build LLM prompts
  let llmPrompt = '';
  let planPrompt = '';
  let jsonPayload: RecordLike = {};

  if (typedResults) {
    try {
      llmPrompt = buildLLMPrompt({ formData: typedFormData, assessmentResults: typedResults, weeklyBonuses });
      planPrompt = buildPlanCritiquePrompt({
        formData: typedFormData,
        assessmentResults: typedResults,
        actionPlan,
        weeklyBonuses,
      });
      jsonPayload = buildLLMJsonPayload({ formData: typedFormData, assessmentResults: typedResults });
    } catch (error) {
      console.error('Error building LLM prompts:', error);
    }
  }

  return {
    formData: typedFormData,
    results: typedResults,
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
