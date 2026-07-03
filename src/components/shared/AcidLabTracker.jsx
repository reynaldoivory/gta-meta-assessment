import { useState, useEffect, useMemo } from 'react';

import PropTypes from 'prop-types';
import { STORAGE_KEYS, getJSON, setJSON } from '../../utils/storage/appStorage';
import { getMaxTime, computeAcidLabStatus } from '../../utils/trackers/acidLab';

const getBorderClasses = (isReady, isNearFull) => {
  if (isReady) return 'border-hud-pink ring-2 ring-hud-pink/50';
  if (isNearFull) return 'border-hud-pink/60';
  return 'border-border';
};

const getProgressBarClass = (isReady, isNearFull) => {
  if (isReady) return 'bg-hud-pink';
  if (isNearFull) return 'bg-hud-pink/70';
  return 'bg-hud-blue';
};

const getStatusText = ({ isReady, lastSold, percentFull, timeToFull, productionTime }) => {
  if (isReady) return '⚠️ Production STOPPED (at max capacity)';
  if (!lastSold) return 'Set last sale time to start tracking';
  return `${Math.round(percentFull)}% full • Ready in ${Math.max(0, (timeToFull - productionTime).toFixed(1))} hrs`;
};

const AcidLabTracker = ({ hasAcidLab, acidLabUpgraded }) => {
  const [productionTime, setProductionTime] = useState(0);
  const [lastSold, setLastSold] = useState(() => {
    if (!hasAcidLab) return null;
    const saved = getJSON(STORAGE_KEYS.ACID_LAB_TRACKER, null);
    return saved && saved.lastSold ? new Date(saved.lastSold) : null;
  });
  const [suppliesNeeded, setSuppliesNeeded] = useState(false);

  // Calculate time since last sale
  useEffect(() => {
    if (!hasAcidLab || !lastSold) return;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - new Date(lastSold).getTime();
      const hours = elapsed / (1000 * 60 * 60);
      setProductionTime(hours);

      const maxTime = getMaxTime(acidLabUpgraded);
      const shouldNeedSupplies = hours >= 4 && hours < maxTime;
      setSuppliesNeeded(shouldNeedSupplies);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [hasAcidLab, lastSold, acidLabUpgraded]);

  const trackerData = useMemo(
    () => computeAcidLabStatus(acidLabUpgraded, productionTime),
    [acidLabUpgraded, productionTime]
  );

  if (!hasAcidLab) return null;

  const recordSale = () => {
    const now = new Date();
    setLastSold(now);
    setProductionTime(0);
    setJSON(STORAGE_KEYS.ACID_LAB_TRACKER, { lastSold: now.toISOString() });
  };

  const { maxCapacity, timeToFull, currentValue, percentFull, isReady, isNearFull } = trackerData;
  const statusText = getStatusText({ isReady, lastSold, percentFull, timeToFull, productionTime });
  const progressBarClass = getProgressBarClass(isReady, isNearFull);
  const borderClasses = getBorderClasses(isReady, isNearFull);

  return (
    // contain-paint contain-layout: this component re-renders every minute
    // via setInterval -- containment keeps that tick's layout/paint work from
    // cascading into the rest of the results view.
    <div className={`contain-paint contain-layout bg-bg-surface rounded-lg p-4 border ${borderClasses}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-hud-blue">🧪 Acid Lab Tracker</h3>
        {isReady && (
          <span className="px-2 py-1 bg-hud-pink text-text-on-accent text-xs font-bold rounded animate-pulse">
            SELL NOW
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-muted">Product Value</span>
          <span className="text-hud-blue font-mono font-bold">
            ${Math.round(currentValue).toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-bg-raised rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${progressBarClass}`}
            style={{ width: `${Math.min(100, percentFull)}%` }}
          />
        </div>
        <div className="text-xs text-text-muted mt-1">
          {statusText}
        </div>
      </div>

      {suppliesNeeded && (
        <div className="mb-3 p-2 bg-hud-pink/10 border border-hud-pink/30 rounded">
          <p className="text-xs text-accent-pink-text">
            ⚠️ Supplies might be depleted. Check lab or buy supplies ($60K)
          </p>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Private Session:</span>
          <span className="text-hud-blue font-mono">${maxCapacity.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Public (High Demand):</span>
          <span className="text-hud-blue font-mono">${Math.round(maxCapacity * 1.5).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Time per Sale:</span>
          <span className="text-text-secondary">~10 minutes</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={recordSale}
          className="w-full px-4 py-2 bg-hud-blue text-text-on-accent hover:brightness-110 rounded font-semibold transition"
        >
          ✅ Mark as Sold (Reset Timer)
        </button>

        {!lastSold && (
          <button
            type="button"
            onClick={() => setLastSold(new Date(Date.now() - (timeToFull * 60 * 60 * 1000)))}
            className="w-full px-3 py-1 bg-bg-raised hover:bg-border-subtle rounded text-sm transition text-text-secondary"
          >
            🕐 Set as Ready Now
          </button>
        )}
      </div>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-text-muted hover:text-text-secondary">
          📋 How to Sell (Quick Guide)
        </summary>
        <ol className="mt-2 space-y-1 text-text-secondary ml-4 list-decimal">
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

AcidLabTracker.propTypes = {
  hasAcidLab: PropTypes.bool,
  acidLabUpgraded: PropTypes.bool,
};

export default AcidLabTracker;
