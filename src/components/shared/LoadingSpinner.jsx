// src/components/shared/LoadingSpinner.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const STEPS = [
  'Analyzing your stats...',
  'Calculating income potential...',
  'Comparing to community...',
  'Building action plan...',
  'Finalizing results...'
];

const LoadingSpinner = ({ message = 'Calculating...' }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const stepDuration = 400; // ms per step
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < STEPS.length) {
        setStep(currentStep);
        setProgress((currentStep / STEPS.length) * 100);
      } else {
        setProgress(100);
        clearInterval(interval);
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-surface-dark/90 backdrop-blur-md flex items-center justify-center z-50">
      <div className="card-enterprise max-w-md w-full animate-pop-in">
        {/* Triple-ring spinning loader with 3 colors */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer ring - Purple */}
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-primary-purple-500 rounded-full animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
          {/* Middle ring - Cyan */}
          <div 
            className="absolute inset-2 border-4 border-transparent border-t-primary-cyan-500 rounded-full animate-spin"
            style={{ animationDuration: '0.9s', animationDirection: 'reverse' }}
          />
          {/* Inner ring - Orange */}
          <div 
            className="absolute inset-4 border-4 border-transparent border-t-primary-orange-500 rounded-full animate-spin"
            style={{ animationDuration: '0.6s' }}
          />
          {/* Center glow dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-gradient-to-r from-primary-purple-500 via-primary-cyan-500 to-primary-orange-500 rounded-full animate-pulse-glow shadow-glow-purple" />
          </div>
        </div>
        
        {/* Message */}
        <h3 className="text-2xl font-display font-bold text-center mb-4 heading-gradient-purple">{message}</h3>
        
        {/* Current step */}
        <p className="text-slate-300 text-sm mb-4 min-h-[20px] font-medium">{STEPS[step] || STEPS[STEPS.length - 1]}</p>
        
        {/* Progress bar - Rounded shape with gradient */}
        <div className="w-full h-3 bg-surface-elevated rounded-full overflow-hidden border border-primary-purple-500/30">
          <div 
            className="h-full bg-gradient-to-r from-primary-purple-500 via-primary-cyan-500 to-primary-orange-500 transition-all duration-500 ease-out rounded-full shadow-glow-purple"
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
