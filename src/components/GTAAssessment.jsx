// src/components/GTAAssessment.jsx
// The Router - Main Entry Point
import { AssessmentProvider, useAssessment } from '../context/AssessmentContext';
import AssessmentForm from '../views/AssessmentForm';
import AssessmentResults from '../views/AssessmentResults';
import PriorityActionPlan from '../views/PriorityActionPlan';
import GarageTab from '../views/GarageTab';
import DevTools from './shared/DevTools';
import ErrorBoundary from './shared/ErrorBoundary';
import { LoadingOverlay } from './ui';

// Inner component to consume context
const AssessmentRouter = () => {
  const { step, isCalculating } = useAssessment();

  // Show loading state during calculation
  if (isCalculating) {
    return <LoadingOverlay message="Crunching the Numbers..." />;
  }

  switch (step) {
    case 'form':
      return <AssessmentForm />;
    case 'results':
      return <AssessmentResults />;
    case 'actionPlan':
      return <PriorityActionPlan />;
    case 'garage':
      return <GarageTab />;
    default:
      return <AssessmentForm />;
  }
};

// Root wrapper
const GTAAssessment = () => (
  <ErrorBoundary>
    <AssessmentProvider>
      <div className="min-h-screen bg-transparent font-body text-text-primary">
        <main className="relative z-10">
          <AssessmentRouter />
        </main>
        <DevTools />
      </div>
    </AssessmentProvider>
  </ErrorBoundary>
);

export default GTAAssessment;
