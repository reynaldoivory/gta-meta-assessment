
import PropTypes from 'prop-types';
import { useState, useEffect, useMemo, useRef } from 'react';
import { STORAGE_KEYS, getJSON, setJSON } from '../../utils/storage/appStorage';
import { getNextResetTime, shouldResetTasks } from '../../utils/trackers/dailyReset';

// Daily tasks configuration
const CORE_DAILIES = [
  {
    id: 'stash_house',
    label: 'Raid Stash House',
    category: 'Daily',
    isCompleted: false,
    rewards: {
      cashEstimate: 30000,
      special: 'Resupplies Random Business (Acid Lab Priority)',
    },
  },
  {
    id: 'gs_cache',
    label: "Find G's Cache",
    category: 'Daily',
    isCompleted: false,
    rewards: {
      cashEstimate: 16000,
      special: 'Ammo & Snacks Refill',
    },
  },
  {
    id: 'wall_safes',
    label: 'Collect Safe Income (Nightclub/Agency)',
    category: 'Daily',
    isCompleted: false,
    rewards: {
      cashEstimate: 50000, // Variable based on popularity
    },
  },
];

// Get next reset time (6:00 AM UTC)

// Pure read of the saved tracker state — no writes, safe for useState
// initializers. The 'reset' persistence side-effect happens in the mount
// effect (react-hooks/set-state-in-effect forbids sync setState there, so
// state is hydrated lazily instead).
const readSavedTasks = () => {
  const parsed = getJSON(STORAGE_KEYS.DAILY_TRACKER, null);
  if (!parsed || typeof parsed !== 'object') {
    return { tasks: CORE_DAILIES, resetTime: Date.now(), syncMode: 'init' };
  }
  if (shouldResetTasks(parsed.lastResetTime)) {
    const resetTasks = CORE_DAILIES.map(task => ({ ...task, isCompleted: false }));
    return { tasks: resetTasks, resetTime: Date.now(), syncMode: 'reset' };
  }
  const loadedTasks = Array.isArray(parsed.tasks)
    ? parsed.tasks.filter(t => t && typeof t === 'object' && typeof t.id === 'string')
    : CORE_DAILIES;
  return {
    tasks: loadedTasks.length > 0 ? loadedTasks : CORE_DAILIES,
    resetTime: parsed.lastResetTime,
    syncMode: 'load',
  };
};

const calcResetTimer = () => {
  const diff = getNextResetTime() - Date.now();
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
  };
};

const DailyTracker = ({ hasNightclub, hasAgency, formData, setFormData }) => {
  // Hydrate from localStorage in the initializers (one lazy read shared via
  // the first useState) instead of a mount effect with sync setState.
  const [initialLoad] = useState(readSavedTasks);
  const [tasks, setTasks] = useState(initialLoad.tasks);
  const [lastResetTime] = useState(initialLoad.resetTime);

  // Mount-only: persist a daily reset (write moved out of readSavedTasks so
  // the initializer stays pure) and sync initial completion into formData.
  // formData must NOT be in deps -- adding it would cause an infinite loop
  // because setFormData produces a new formData reference.
  useEffect(() => {
    if (initialLoad.syncMode === 'reset') {
      setJSON(STORAGE_KEYS.DAILY_TRACKER, {
        tasks: initialLoad.tasks,
        lastResetTime: initialLoad.resetTime,
      });
      if (setFormData) {
        setFormData(prev => ({ ...prev, dailyStashHouse: false, dailyGsCache: false, dailySafeCollect: false }));
      }
    } else if (initialLoad.syncMode === 'load' && setFormData) {
      setFormData(prev => ({
        ...prev,
        dailyStashHouse: initialLoad.tasks[0]?.isCompleted || false,
        dailyGsCache: initialLoad.tasks[1]?.isCompleted || false,
        dailySafeCollect: initialLoad.tasks[2]?.isCompleted || false,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect; setFormData is stable
  }, []);

  // Countdown to next reset — recomputed on lastResetTime change and every
  // minute thereafter (the old nowRef version froze between prop changes and
  // read Date.now()/refs during render, which the hooks lint forbids).
  const [resetTimer, setResetTimer] = useState({ hours: 0, minutes: 0 });
  useEffect(() => {
    let cancelled = false;
    const tick = () => { if (!cancelled) setResetTimer(calcResetTimer()); };
    const kickoff = setTimeout(tick, 0);
    const interval = setInterval(tick, 60 * 1000);
    return () => { cancelled = true; clearTimeout(kickoff); clearInterval(interval); };
  }, [lastResetTime]);

  // Filter tasks based on owned properties
  const availableTasks = tasks.filter(
    (task) => task.id !== 'wall_safes' || hasNightclub || hasAgency
  );


  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
    // Save via central storage service
    setJSON(STORAGE_KEYS.DAILY_TRACKER, {
      tasks: updatedTasks,
      lastResetTime: lastResetTime,
    });
    // Sync with form data
    if (setFormData) {
      const stashCompleted = updatedTasks.find(t => t.id === 'stash_house')?.isCompleted || false;
      const cacheCompleted = updatedTasks.find(t => t.id === 'gs_cache')?.isCompleted || false;
      const safesCompleted = updatedTasks.find(t => t.id === 'wall_safes')?.isCompleted || false;
      setFormData(prev => ({
        ...prev,
        dailyStashHouse: stashCompleted,
        dailyGsCache: cacheCompleted,
        dailySafeCollect: safesCompleted,
      }));
    }
  };

  // Calculate total earnings from checked items
  const currentSessionEarnings = tasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + t.rewards.cashEstimate, 0);

  const { hours, minutes } = resetTimer;

  if (availableTasks.length === 0) {
    return null; // Don't show if no tasks available
  }

  return (
    // contain-paint contain-layout: isolates this card's per-task re-renders
    // (toggling a checkbox recomputes session earnings) from the rest of the
    // results view.
    <div className="contain-paint contain-layout bg-bg-surface border border-hud-blue/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-hud-blue flex items-center gap-2">
          <span className="text-2xl">💰</span> Daily Cash Loop
        </h2>
        <div className="text-xs text-text-muted">
          Resets in {hours}h {minutes}m
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {availableTasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center p-3 rounded-lg border transition ${
              task.isCompleted
                ? 'bg-hud-blue/10 border-hud-blue/50'
                : 'bg-bg-raised border-border hover:border-border-strong'
            }`}
          >
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => toggleTask(task.id)}
              aria-label={task.label}
              className="w-5 h-5 accent-hud-blue cursor-pointer rounded border-border bg-bg-raised"
            />
            <div className="ml-3 flex-1">
              <p className={`font-medium ${task.isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                {task.label}
              </p>
              {task.rewards.special && (
                <p className="text-xs text-accent-pink-text mt-0.5">
                  {task.rewards.special}
                </p>
              )}
            </div>
            <span className="text-sm font-mono text-hud-blue font-bold">
              ${task.rewards.cashEstimate.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border flex justify-between items-center">
        <span className="text-text-muted font-medium">Session Total:</span>
        <span className="text-2xl font-bold text-hud-blue">
          ${currentSessionEarnings.toLocaleString()}
        </span>
      </div>

      {/* Quick Tips */}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-text-muted hover:text-text-secondary">
          💡 Quick Tips
        </summary>
        <ul className="mt-2 space-y-1 text-text-secondary ml-4 list-disc">
          <li><strong>Stash House:</strong> Check phone for notification, raid for free Acid Lab supplies</li>
          <li><strong>G's Cache:</strong> Random location daily, check map for green icon</li>
          <li><strong>Safe Income:</strong> Collect from Nightclub safe ($50k) or Agency safe ($20k)</li>
        </ul>
      </details>
    </div>
  );
};

DailyTracker.propTypes = {
  hasNightclub: PropTypes.bool,
  hasAgency: PropTypes.bool,
  formData: PropTypes.object,
  setFormData: PropTypes.func,
};

DailyTracker.defaultProps = {
  hasNightclub: false,
  hasAgency: false,
  formData: null,
  setFormData: null,
};

export default DailyTracker;
