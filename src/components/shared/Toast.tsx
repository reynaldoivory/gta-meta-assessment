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

// Two-channel: success/info are "good" (cyan), warning/error are "bad" (pink).
const toastColors = {
  success: 'bg-hud-blue/90 border-hud-blue shadow-glow-blue text-text-on-accent',
  info: 'bg-hud-blue/90 border-hud-blue shadow-glow-blue text-text-on-accent',
  warning: 'bg-hud-pink/90 border-hud-pink shadow-glow-pink text-text-on-accent',
  error: 'bg-hud-pink/90 border-hud-pink shadow-glow-pink text-text-on-accent',
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
