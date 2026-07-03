
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

const loadSavedTasks = () => {
  const parsed = getJSON(STORAGE_KEYS.DAILY_TRACKER, null);
  if (!parsed || typeof parsed !== 'object') {
    return { tasks: CORE_DAILIES, resetTime: Date.now(), syncMode: 'init' };
  }
  if (shouldResetTasks(parsed.lastResetTime)) {
    const resetTasks = CORE_DAILIES.map(task => ({ ...task, isCompleted: false }));
    const resetTime = Date.now();
    setJSON(STORAGE_KEYS.DAILY_TRACKER, { tasks: resetTasks, lastResetTime: resetTime });
    return { tasks: resetTasks, resetTime, syncMode: 'reset' };
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
const DailyTracker = ({ hasNightclub, hasAgency, formData, setFormData }) => {
  const [tasks, setTasks] = useState(CORE_DAILIES);
  const [lastResetTime, setLastResetTime] = useState(() => Date.now());

  // Load tasks from localStorage on mount and sync with formData
  // Run on mount only: load tasks from localStorage and sync initial state into formData.
  // formData must NOT be in deps -- adding it would cause an infinite loop because
  // this effect calls setFormData, which produces a new formData reference, re-triggering the effect.
  useEffect(() => {
    const { tasks: loadedTasks, resetTime, syncMode } = loadSavedTasks();
    setTasks(loadedTasks);
    setLastResetTime(resetTime);

    if (syncMode === 'reset' && setFormData) {
      setFormData(prev => ({ ...prev, dailyStashHouse: false, dailyGsCache: false, dailySafeCollect: false }));
    } else if (syncMode === 'load' && setFormData) {
      setFormData(prev => ({
        ...prev,
        dailyStashHouse: loadedTasks[0]?.isCompleted || false,
        dailyGsCache: loadedTasks[1]?.isCompleted || false,
        dailySafeCollect: loadedTasks[2]?.isCompleted || false,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only effect; setFormData is stable
  }, []);

  // Calculate time until next reset
  const nowRef = useRef(Date.now());
  useEffect(() => { nowRef.current = Date.now(); }, [lastResetTime]);
  const resetTimer = useMemo(() => {
    const nextReset = getNextResetTime();
    const diff = nextReset - nowRef.current;
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lastResetTime triggers recalculation intentionally
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
        <h3 className="text-xl font-bold text-hud-blue flex items-center gap-2">
          <span className="text-2xl">💰</span> Daily Cash Loop
        </h3>
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
                ? 'bg-hud-blue/10 border-hud-blue/50 opacity-75'
                : 'bg-bg-raised border-border hover:border-border-strong'
            }`}
          >
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 accent-hud-blue cursor-pointer rounded border-border bg-bg-raised"
            />
            <div className="ml-3 flex-1">
              <p className={`font-medium ${task.isCompleted ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                {task.label}
              </p>
              {task.rewards.special && (
                <p className="text-xs text-hud-pink mt-0.5">
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
