// src/components/shared/LoadingSpinner.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ message = 'Calculating...' }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  
  const steps = [
    'Analyzing your stats...',
    'Calculating income potential...',
    'Comparing to community...',
    'Building action plan...',
    'Finalizing results...'
  ];
  
  useEffect(() => {
    const stepDuration = 400; // ms per step
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStep(currentStep);
        setProgress((currentStep / steps.length) * 100);
      } else {
        setProgress(100);
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-4 min-w-[320px]">
        {/* Spinning loader */}
        <div className="relative w-16 h-16 mb-2">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"
            style={{ animationDuration: '0.8s' }}
          />
        </div>
        
        {/* Message */}
        <h3 className="text-xl font-bold text-white mb-1">{message}</h3>
        
        {/* Current step */}
        <p className="text-slate-400 text-sm mb-4 min-h-[20px]">{steps[step] || steps[steps.length - 1]}</p>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-slate-500 text-xs mt-1">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

export default LoadingSpinner;
