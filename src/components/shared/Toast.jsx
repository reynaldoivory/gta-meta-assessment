// src/components/shared/Toast.jsx
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import PropTypes from 'prop-types';

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const toastColors = {
  success: 'bg-green-900/90 border-green-500/50 text-green-100',
  error: 'bg-red-900/90 border-red-500/50 text-red-100',
  warning: 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100',
  info: 'bg-blue-900/90 border-blue-500/50 text-blue-100',
};

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const Icon = toastIcons[type];
  
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
      shadow-lg animate-slide-in-right
      ${toastColors[type]}
    `}>
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

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Toast;
