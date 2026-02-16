// src/views/PriorityActionPlan.jsx
import { useState } from 'react';
import { ActionPlanList } from '../components/shared/ActionPlanList';
import { AIAssistantTools } from '../components/shared/AIAssistantTools';
import { usePriorityPlan } from '../utils/usePriorityPlan';
import {
  EmptyResultsState,
  ActionPlanHeader,
  OptionalNextGoal,
  OptionalSessionConsultant,
} from '../components/shared/PriorityActionPlanSections';

const PriorityActionPlan = () => {
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const {
    formData, results, setStep,
    whatIfText, setWhatIfText,
    sessionPlan, actionPlan, weeklyBonuses,
    llmPrompt, planPrompt, jsonPayload,
  } = usePriorityPlan(sessionMinutes);

  if (!results) {
    return <EmptyResultsState setStep={setStep} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <ActionPlanHeader setStep={setStep} />

        {/* Time to Goal Card */}
        <OptionalNextGoal nextGoal={results.nextGoal} />

        {/* Session Consultant */}
        <OptionalSessionConsultant
          sessionPlan={sessionPlan}
          sessionMinutes={sessionMinutes}
          setSessionMinutes={setSessionMinutes}
        />

        {/* Action Plan */}
        <ActionPlanList actionPlan={actionPlan} />

        {/* AI Assistant Tools */}
        <AIAssistantTools
          formData={formData}
          results={results}
          actionPlan={actionPlan}
          weeklyBonuses={weeklyBonuses}
          llmPrompt={llmPrompt}
          planPrompt={planPrompt}
          jsonPayload={jsonPayload}
          whatIfText={whatIfText}
          setWhatIfText={setWhatIfText}
        />
      </div>
    </div>
  );
};

export default PriorityActionPlan;
