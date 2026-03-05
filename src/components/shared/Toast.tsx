// src/components/shared/Toast.tsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import type { ToastType } from '../../context/ToastContext';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'bg-gradient-to-r from-accent-green/90 to-primary-cyan-600/90 border-accent-green shadow-glow-cyan text-white',
  error: 'bg-gradient-to-r from-accent-pink/90 to-primary-orange-600/90 border-accent-pink shadow-glow-orange text-white',
  warning: 'bg-gradient-to-r from-primary-orange-500/90 to-accent-gold/90 border-primary-orange-500 shadow-glow-orange text-white',
  info: 'bg-gradient-to-r from-primary-purple-600/90 to-primary-cyan-600/90 border-primary-purple-500 shadow-glow-purple text-white',
};

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast = ({ message, type = 'info', onClose, duration = 3000 }: ToastProps) => {
  const Icon = toastIcons[type];
  
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div className={
      "flex items-center gap-3 px-5 py-4 rounded-2xl border-2 backdrop-blur-md animate-pop-in font-bold " + toastColors[type]
    }>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button 
        onClick={onClose} 
        className="hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
