import GTAAssessment from './components/GTAAssessment';
import { ToastProvider } from './context/ToastContext';
import { EmpireProvider } from './context/EmpireContext';

function App() {
  return (
    <ToastProvider>
      <EmpireProvider>
        <div className="min-h-screen w-full">
          <GTAAssessment />
        </div>
      </EmpireProvider>
    </ToastProvider>
  );
}

export default App;
