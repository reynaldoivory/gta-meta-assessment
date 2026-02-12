// src/components/GTAAssessment.jsx
// The Router - Main Entry Point
import React from 'react';
import { AssessmentProvider, useAssessment } from '../context/AssessmentContext';
import AssessmentForm from '../views/AssessmentForm';
import AssessmentResults from '../views/AssessmentResults';
import QuickStartGuide from '../views/QuickStartGuide';
import PriorityActionPlan from '../views/PriorityActionPlan';
import DevTools from './shared/DevTools';
import LoadingSpinner from './shared/LoadingSpinner';
import ErrorBoundary from './shared/ErrorBoundary';

// Inner component to consume context
const AssessmentRouter = () => {
  const { step, isCalculating } = useAssessment();

  // Show loading state during calculation
  if (isCalculating) {
    return <LoadingSpinner message="Running Assessment..." />;
  }

  switch (step) {
    case 'form':
      return <AssessmentForm />;
    case 'results':
      return <AssessmentResults />;
    case 'guide':
      return <QuickStartGuide />;
    case 'actionPlan':
      return <PriorityActionPlan />;
    default:
      return <AssessmentForm />;
  }
};

// Root wrapper
const GTAAssessment = () => (
  <ErrorBoundary>
    <AssessmentProvider>
      <div className="min-h-screen bg-transparent font-body text-slate-100">
        <AssessmentRouter />
        <DevTools />
      </div>
    </AssessmentProvider>
  </ErrorBoundary>
);

export default GTAAssessment;
