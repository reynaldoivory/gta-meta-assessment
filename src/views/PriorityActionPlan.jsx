// src/views/PriorityActionPlan.jsx
import { useState } from 'react';
import { ActionPlanList } from '../components/shared/ActionPlanList';
import { AIAssistantTools } from '../components/shared/AIAssistantTools';
import { usePriorityPlan } from '../utils/usePriorityPlan';
import {
  EmptyResultsState,
  OptionalNextGoal,
  OptionalSessionConsultant,
} from '../components/shared/PriorityActionPlanSections';
import { AppShell } from '../components/ui';

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
    <AppShell title="Priority Action Plan" onBack={{ label: 'Back to Results', action: () => setStep('results') }}>
      <div className="space-y-6">
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
    </AppShell>
  );
};

export default PriorityActionPlan;
