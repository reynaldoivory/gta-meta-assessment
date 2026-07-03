// src/components/shared/SoundToggle.jsx
import { useState, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../../utils/gamificationEngine';

const SoundToggle = () => {
  const [enabled, setEnabled] = useState(isSoundEnabled);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  }, [enabled]);

  return (
    <button
      onClick={toggle}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-bg-surface/60 text-text-muted transition-colors hover:border-hud-blue/40 hover:text-hud-blue"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
};

export default SoundToggle;
