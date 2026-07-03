// src/components/shared/IncomeComparison.jsx
import PropTypes from 'prop-types';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';
import { computeAutoShopRate, CAYO_RATE } from '../../utils/calculations/incomeComparison';

export const IncomeComparison = ({ hasAutoShop }) => {
  const { rate: autoShopRate, isActive: isAutoShopEvent, multiplier: autoShopMultiplier } = computeAutoShopRate();
  const cayoRate = CAYO_RATE;

  return (
    <div className="bg-bg-surface border border-hud-blue/30 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-hud-blue" /> Income Options This Week
      </h3>
      <div className="space-y-3">
        <div className={`p-4 rounded-lg border-2 flex justify-between items-center ${
          hasAutoShop ? 'bg-hud-blue/10 border-hud-blue/50' : 'bg-bg-raised/50 border-border opacity-75'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">Auto Shop{isAutoShopEvent ? ' (Event)' : ''}</span>
              {isAutoShopEvent && (
                <span className="px-2 py-0.5 bg-hud-pink/20 text-accent-pink-text text-xs font-bold rounded">
                  {autoShopMultiplier}X BONUS
                </span>
              )}
            </div>
            <div className="text-xs text-text-muted">
              No Cooldown{isAutoShopEvent ? ` • Expires ${WEEKLY_EVENTS.meta.displayDate}` : ''}
            </div>
          </div>
          <div className="text-xl font-bold text-hud-blue">${(autoShopRate / 1000).toFixed(0)}k/hr</div>
        </div>

        <div className="p-4 rounded-lg border-2 border-border bg-bg-raised/50 flex justify-between items-center">
          <div>
            <div className="font-bold text-text-secondary">Cayo Perico</div>
            <div className="text-xs text-text-muted">2.5h Cooldown • Standard Rate</div>
          </div>
          <div className="text-xl font-bold text-text-muted">${(cayoRate / 1000).toFixed(0)}k/hr</div>
        </div>
      </div>

      {!hasAutoShop && isAutoShopEvent && (
        <div className="mt-4 p-4 bg-hud-pink/10 border border-hud-pink/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-hud-pink flex-shrink-0" />
            <div>
              <div className="font-bold text-accent-pink-text mb-1">
                You&apos;re missing the best income option this week!
              </div>
              <div className="text-sm text-text-secondary">
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
