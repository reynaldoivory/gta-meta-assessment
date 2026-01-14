import React, { useState, useEffect } from 'react';

const AcidLabTracker = ({ hasAcidLab, acidLabUpgraded }) => {
  const [productionTime, setProductionTime] = useState(0);
  const [lastSold, setLastSold] = useState(null);
  const [suppliesNeeded, setSuppliesNeeded] = useState(false);

  if (!hasAcidLab) return null;

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('acidLabTracker');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lastSold) {
          setLastSold(new Date(parsed.lastSold));
        }
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  // Calculate time since last sale
  useEffect(() => {
    if (!lastSold) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - new Date(lastSold).getTime();
      const hours = elapsed / (1000 * 60 * 60);
      setProductionTime(hours);

      // Alert when ready to sell (4 hours for upgraded)
      const maxTime = acidLabUpgraded ? 4 : 6;
      if (hours >= maxTime) {
        setSuppliesNeeded(false); // Ready to sell
      }
      if (hours >= 4) {
        setSuppliesNeeded(true); // Supplies might be depleted
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [lastSold, acidLabUpgraded]);

  const recordSale = () => {
    const now = new Date();
    setLastSold(now);
    setProductionTime(0);
    localStorage.setItem('acidLabTracker', JSON.stringify({ lastSold: now.toISOString() }));
  };

  const maxCapacity = acidLabUpgraded ? 335000 : 237500;
  const timeToFull = acidLabUpgraded ? 4 : 6;
  const currentValue = Math.min(maxCapacity, (productionTime / timeToFull) * maxCapacity);
  const percentFull = (productionTime / timeToFull) * 100;

  const isReady = productionTime >= timeToFull;
  const isNearFull = productionTime >= timeToFull * 0.75; // 75% full

  return (
    <div className={`bg-slate-800 rounded-lg p-4 border ${
      isReady ? 'border-red-500 ring-2 ring-red-500/50' : 
      isNearFull ? 'border-yellow-500' : 
      'border-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-purple-200">🧪 Acid Lab Tracker</h3>
        {isReady && (
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded animate-pulse">
            SELL NOW
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Product Value</span>
          <span className="text-green-400 font-mono font-bold">
            ${Math.round(currentValue).toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isReady ? 'bg-red-500' :
              isNearFull ? 'bg-yellow-500' :
              'bg-purple-500'
            }`}
            style={{ width: `${Math.min(100, percentFull)}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {isReady 
            ? '⚠️ Production STOPPED (at max capacity)' 
            : lastSold
              ? `${Math.round(percentFull)}% full • Ready in ${Math.max(0, (timeToFull - productionTime).toFixed(1))} hrs`
              : 'Set last sale time to start tracking'}
        </div>
      </div>

      {/* Supply Warning */}
      {suppliesNeeded && (
        <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-500/30 rounded">
          <p className="text-xs text-yellow-300">
            ⚠️ Supplies might be depleted. Check lab or buy supplies ($60K)
          </p>
        </div>
      )}

      {/* Sale Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Private Session:</span>
          <span className="text-green-400 font-mono">${maxCapacity.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Public (High Demand):</span>
          <span className="text-green-400 font-mono">${Math.round(maxCapacity * 1.5).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Time per Sale:</span>
          <span className="text-slate-300">~10 minutes</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 space-y-2">
        <button
          onClick={recordSale}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition"
        >
          ✅ Mark as Sold (Reset Timer)
        </button>
        
        {!lastSold && (
          <button
            onClick={() => setLastSold(new Date(Date.now() - (timeToFull * 60 * 60 * 1000)))}
            className="w-full px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition"
          >
            🕐 Set as Ready Now
          </button>
        )}
      </div>

      {/* How to Sell Instructions */}
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
          📋 How to Sell (Quick Guide)
        </summary>
        <ol className="mt-2 space-y-1 text-slate-300 ml-4 list-decimal">
          <li>Register as CEO/MC President</li>
          <li>Enter Acid Lab (rear of Brickade truck)</li>
          <li>Interact with wooden pallet (Right D-Pad)</li>
          <li>Choose session type (Public = +50% bonus)</li>
          <li>Deliver product on bike (~10 mins)</li>
        </ol>
      </details>
    </div>
  );
};

export default AcidLabTracker;
