import React from 'react';
import GTAAssessment from './components/GTAAssessment';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen w-full">
        <GTAAssessment />
      </div>
    </ToastProvider>
  );
}

export default App;
