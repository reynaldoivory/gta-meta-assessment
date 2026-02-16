import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { TRAP_SEVERITY } from '../../utils/trapDetector';

export const severityConfig = {
  [TRAP_SEVERITY.CRITICAL]: {
    bg: 'bg-red-900/40',
    border: 'border-red-500',
    text: 'text-red-400',
    badge: 'bg-red-500 text-white',
    icon: AlertCircle,
    glow: 'shadow-red-500/20 shadow-lg',
  },
  [TRAP_SEVERITY.HIGH]: {
    bg: 'bg-orange-900/30',
    border: 'border-orange-500/70',
    text: 'text-orange-400',
    badge: 'bg-orange-500 text-white',
    icon: AlertTriangle,
    glow: '',
  },
  [TRAP_SEVERITY.MEDIUM]: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/80 text-black',
    icon: AlertTriangle,
    glow: '',
  },
  [TRAP_SEVERITY.LOW]: {
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/70 text-white',
    icon: Info,
    glow: '',
  },
};
