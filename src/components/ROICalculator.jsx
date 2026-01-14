// src/components/ROICalculator.jsx
import React, { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

const ROICalculator = ({ formData, results }) => {
  const [targetPurchase, setTargetPurchase] = useState('oppressor');
  
  const purchases = {
    oppressor: { name: 'Oppressor Mk II', cost: 8000000 },
    nightclub: { name: 'Nightclub (full setup)', cost: 4000000 },
    bunkerUpgrade: { name: 'Bunker Upgrades', cost: 1700000 },
    facility: { name: 'Facility', cost: 2950000 },
    penthouse: { name: 'Casino Penthouse', cost: 6500000 },
    autoShop: { name: 'Auto Shop', cost: 1700000 },
  };

  const selectedPurchase = purchases[targetPurchase];
  const currentCash = Number(formData.liquidCash) || 0;
  const incomePerHour = results?.incomePerHour || 0;
  
  const cashNeeded = Math.max(0, selectedPurchase.cost - currentCash);
  const hoursNeeded = incomePerHour > 0 ? (cashNeeded / incomePerHour).toFixed(1) : '∞';
  const cayoRunsNeeded = Math.ceil(cashNeeded / 700000);
  const daysNeeded = incomePerHour > 0 ? Math.ceil((cashNeeded / incomePerHour) / 3) : '∞';

  return (
    <div className="bg-slate-900/60 border border-green-500/30 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Calculator className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-bold text-white">ROI Calculator</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-400 mb-2">
          What are you saving for?
        </label>
        <select
          value={targetPurchase}
          onChange={(e) => setTargetPurchase(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white"
        >
          {Object.entries(purchases).map(([key, item]) => (
            <option key={key} value={key}>
              {item.name} (${(item.cost / 1000000).toFixed(1)}M)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Cash Needed</div>
          <div className="text-lg font-bold text-red-400">
            ${(cashNeeded / 1000000).toFixed(2)}M
          </div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Hours Needed</div>
          <div className="text-lg font-bold text-yellow-400">
            {hoursNeeded}h
          </div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Cayo Runs</div>
          <div className="text-lg font-bold text-blue-400">
            {cayoRunsNeeded} runs
          </div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg">
          <div className="text-xs text-slate-400 mb-1">Real Days</div>
          <div className="text-lg font-bold text-green-400">
            ~{daysNeeded} days
          </div>
        </div>
      </div>

      {currentCash >= selectedPurchase.cost && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-400 font-bold">
            <TrendingUp className="w-5 h-5" />
            You can afford this now!
          </div>
        </div>
      )}
    </div>
  );
};

export default ROICalculator;
