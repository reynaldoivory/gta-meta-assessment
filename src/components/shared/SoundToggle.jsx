// src/components/shared/SoundToggle.jsx
import React, { useState, useCallback } from 'react';
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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/60 text-slate-400 transition-colors hover:border-cyan-500/40 hover:text-cyan-300"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
};

export default SoundToggle;
