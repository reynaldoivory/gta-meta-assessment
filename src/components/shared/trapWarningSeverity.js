import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { TRAP_SEVERITY } from '../../utils/trapDetector';

// Arcade HUD two-channel severity ramp: LOW reads as informational (blue),
// MEDIUM/HIGH/CRITICAL escalate through increasing Vice Pink intensity.
export const severityConfig = {
  [TRAP_SEVERITY.CRITICAL]: {
    bg: 'bg-hud-pink/20',
    border: 'border-hud-pink',
    text: 'text-accent-pink-text',
    badge: 'bg-hud-pink text-text-on-accent',
    icon: AlertCircle,
    glow: 'shadow-glow-pink',
  },
  [TRAP_SEVERITY.HIGH]: {
    bg: 'bg-hud-pink/15',
    border: 'border-hud-pink/70',
    text: 'text-accent-pink-text',
    badge: 'bg-hud-pink/80 text-text-on-accent',
    icon: AlertTriangle,
    glow: '',
  },
  [TRAP_SEVERITY.MEDIUM]: {
    bg: 'bg-hud-pink/10',
    border: 'border-hud-pink/40',
    text: 'text-accent-pink-text',
    badge: 'bg-hud-pink/50 text-text-on-accent',
    icon: AlertTriangle,
    glow: '',
  },
  [TRAP_SEVERITY.LOW]: {
    bg: 'bg-hud-blue/10',
    border: 'border-hud-blue/30',
    text: 'text-hud-blue',
    badge: 'bg-hud-blue/60 text-text-on-accent',
    icon: Info,
    glow: '',
  },
};
