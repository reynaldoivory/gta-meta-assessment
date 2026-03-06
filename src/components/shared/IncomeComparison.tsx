// src/components/shared/IncomeComparison.jsx

import { TrendingUp, AlertTriangle } from 'lucide-react';
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';

const computeAutoShopRate = () => {
  const baseContractPayout = 300000;
  const contractsPerHour = 60 / 25; // ~2.4 contracts/hour
  const autoShopBonus = WEEKLY_EVENTS.bonuses?.autoShop;
  const isActive = autoShopBonus?.isActive === true;
  const multiplier = isActive ? (autoShopBonus.multiplier || 2) : 1;
  return {
    rate: baseContractPayout * contractsPerHour * multiplier,
    isActive,
    multiplier,
  };
};

export const IncomeComparison = ({ hasAutoShop }: any) => {
  const { rate: autoShopRate, isActive: isAutoShopEvent, multiplier: autoShopMultiplier } = computeAutoShopRate();
  const cayoRate = 466000;

  return (
    <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-400" /> Income Options This Week
      </h3>
      <div className="space-y-3">
        <div className={`p-4 rounded-lg border-2 flex justify-between items-center ${
          hasAutoShop ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800/50 border-slate-700 opacity-75'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Auto Shop{isAutoShopEvent ? ' (Event)' : ''}</span>
              {isAutoShopEvent && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">
                  {autoShopMultiplier}X BONUS
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              No Cooldown{isAutoShopEvent ? ` • Expires ${WEEKLY_EVENTS.meta.displayDate}` : ''}
            </div>
          </div>
          <div className="text-xl font-bold text-green-400">${(autoShopRate / 1000).toFixed(0)}k/hr</div>
        </div>

        <div className="p-4 rounded-lg border-2 border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <div>
            <div className="font-bold text-slate-300">Cayo Perico</div>
            <div className="text-xs text-slate-500">2.5h Cooldown • Standard Rate</div>
          </div>
          <div className="text-xl font-bold text-slate-400">${(cayoRate / 1000).toFixed(0)}k/hr</div>
        </div>
      </div>

      {!hasAutoShop && isAutoShopEvent && (
        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-yellow-300 mb-1">
                You&apos;re missing the best income option this week!
              </div>
              <div className="text-sm text-yellow-200">
                Auto Shop {autoShopMultiplier}X event earns ${((autoShopRate - cayoRate) / 1000).toFixed(0)}k/hr MORE than Cayo. 
                Buy it now before the event ends.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

IncomeComparison.propTypes = {
  hasAutoShop: PropTypes.bool,
};
