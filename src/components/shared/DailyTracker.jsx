import { useState, useEffect, useMemo, useRef } from 'react';

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
const getNextResetTime = () => {
  const now = new Date();
  // Create a date object for today at 6:00 AM UTC
  const resetTime = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    6, 0, 0, 0
  ));
  
  // If it's past 6 AM UTC today, reset is tomorrow
  if (now.getTime() >= resetTime.getTime()) {
    resetTime.setUTCDate(resetTime.getUTCDate() + 1);
  }
  
  return resetTime.getTime();
};

// Check if tasks should be reset (past 6 AM UTC)
const shouldResetTasks = (lastResetTime) => {
  if (!lastResetTime) return true;
  const now = Date.now();
  const nextReset = getNextResetTime();
  return now >= nextReset;
};

const loadSavedTasks = () => {
  const saved = localStorage.getItem('dailyTracker');
  if (!saved) {
    return { tasks: CORE_DAILIES, resetTime: Date.now(), syncMode: 'init' };
  }

  try {
    const parsed = JSON.parse(saved);

    if (shouldResetTasks(parsed.lastResetTime)) {
      const resetTasks = CORE_DAILIES.map(task => ({ ...task, isCompleted: false }));
      const resetTime = Date.now();
      localStorage.setItem('dailyTracker', JSON.stringify({ tasks: resetTasks, lastResetTime: resetTime }));
      return { tasks: resetTasks, resetTime, syncMode: 'reset' };
    }

    return {
      tasks: parsed.tasks || CORE_DAILIES,
      resetTime: parsed.lastResetTime,
      syncMode: 'load',
    };
  } catch {
    return { tasks: CORE_DAILIES, resetTime: Date.now(), syncMode: 'init' };
  }
};

const DailyTracker = ({ hasNightclub, hasAgency, formData, setFormData }) => {
  const [tasks, setTasks] = useState(CORE_DAILIES);
  const [lastResetTime, setLastResetTime] = useState(() => Date.now());

  // Load tasks from localStorage on mount and sync with formData
  useEffect(() => {
    const { tasks: loadedTasks, resetTime, syncMode } = loadSavedTasks();
    setTasks(loadedTasks);
    setLastResetTime(resetTime);

    if (syncMode === 'reset' && setFormData) {
      setFormData(prev => ({ ...prev, dailyStashHouse: false, dailyGsCache: false, dailySafeCollect: false }));
    } else if (syncMode === 'load' && setFormData && formData) {
      setFormData(prev => ({
        ...prev,
        dailyStashHouse: loadedTasks[0]?.isCompleted || false,
        dailyGsCache: loadedTasks[1]?.isCompleted || false,
        dailySafeCollect: loadedTasks[2]?.isCompleted || false,
      }));
    }
  }, [formData, setFormData]);

  // Filter tasks based on owned properties
  const availableTasks = tasks.filter(task => {
    if (task.id === 'wall_safes' && !hasNightclub && !hasAgency) {
      return false; // Hide if player doesn't own Nightclub or Agency
    }
    return true;
  });

  const toggleTask = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    setTasks(updatedTasks);
    
    // Save to localStorage
    localStorage.setItem('dailyTracker', JSON.stringify({
      tasks: updatedTasks,
      lastResetTime: lastResetTime,
    }));

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

  const { hours, minutes } = resetTimer;

  if (availableTasks.length === 0) {
    return null; // Don't show if no tasks available
  }

  return (
    <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
          <span className="text-2xl">💰</span> Daily Cash Loop
        </h3>
        <div className="text-xs text-slate-400">
          Resets in {hours}h {minutes}m
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {availableTasks.map((task) => (
          <div 
            key={task.id} 
            className={`flex items-center p-3 rounded-lg border transition ${
              task.isCompleted 
                ? 'bg-emerald-900/30 border-emerald-600/50 opacity-75' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded border-slate-600 bg-slate-700"
            />
            <div className="ml-3 flex-1">
              <p className={`font-medium ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                {task.label}
              </p>
              {task.rewards.special && (
                <p className="text-xs text-amber-400 mt-0.5">
                  {task.rewards.special}
                </p>
              )}
            </div>
            <span className="text-sm font-mono text-emerald-300 font-bold">
              ${task.rewards.cashEstimate.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
        <span className="text-slate-400 font-medium">Session Total:</span>
        <span className="text-2xl font-bold text-emerald-400">
          ${currentSessionEarnings.toLocaleString()}
        </span>
      </div>

      {/* Quick Tips */}
      <details className="mt-4 text-xs">
        <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
          💡 Quick Tips
        </summary>
        <ul className="mt-2 space-y-1 text-slate-300 ml-4 list-disc">
          <li><strong>Stash House:</strong> Check phone for notification, raid for free Acid Lab supplies</li>
          <li><strong>G's Cache:</strong> Random location daily, check map for green icon</li>
          <li><strong>Safe Income:</strong> Collect from Nightclub safe ($50k) or Agency safe ($20k)</li>
        </ul>
      </details>
    </div>
  );
};

export default DailyTracker;
