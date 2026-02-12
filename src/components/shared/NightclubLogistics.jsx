// src/components/shared/NightclubLogistics.jsx
// Smart Nightclub technician assignment with real-time income calculation
import React, { useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Zap, DollarSign } from 'lucide-react';

// The Meta Ranking (Best to Worst) - $/hr per technician
const SOURCE_RANKING = [
  { id: 'imports', label: 'Cocaine Lockup', product: 'S. American Imports', rate: 10000, emoji: '🧊' },
  { id: 'cargo', label: 'Hangar / Warehouse', product: 'Cargo & Shipments', rate: 8570, emoji: '📦' },
  { id: 'pharma', label: 'Meth Lab', product: 'Pharm. Research', rate: 8500, emoji: '💎' },
  { id: 'sporting', label: 'Bunker', product: 'Sporting Goods', rate: 7500, emoji: '🔫' },
  { id: 'cash', label: 'Counterfeit Cash', product: 'Cash Creation', rate: 7000, emoji: '💵' },
  { id: 'organic', label: 'Weed Farm', product: 'Organic Produce', rate: 4500, emoji: '🌿', warning: true },
  { id: 'printing', label: 'Document Forgery', product: 'Printing & Copying', rate: 1500, emoji: '📄', warning: true }
];

// Technician hire prices (1st is free with nightclub, 2-5 cost GTA$)
const TECH_PRICES = [0, 0, 141050, 141050, 141050, 141050];
// Index 0 = "0 techs" (no cost), Index 1 = 1st tech (free), Index 2-5 = $141,050 each

export default function NightclubLogistics({ formData, setFormData }) {
  
  // Toggle source ownership
  const toggleSource = (sourceId) => {
    setFormData(prev => ({
      ...prev,
      nightclubSources: {
        ...prev.nightclubSources,
        [sourceId]: !prev.nightclubSources?.[sourceId]
      }
    }));
  };

  // Set technician count
  const setTechs = (num) => {
    setFormData(prev => ({ ...prev, nightclubTechs: num }));
  };

  // Smart Calculation Logic
  const { activeSources, optimizedIncome, missedIncome, techAssignments, ownedCount } = useMemo(() => {
    const sources = formData.nightclubSources || {};
    const techs = Number(formData.nightclubTechs) || 0;
    
    // 1. Identify what the user OWNS (sorted by value)
    const ownedSources = SOURCE_RANKING.filter(s => sources[s.id]);
    
    // 2. Assign techs to the BEST owned sources (Top N)
    const assigned = ownedSources.slice(0, techs);
    
    // 3. Calculate Income from assigned techs
    const income = assigned.reduce((sum, s) => sum + s.rate, 0);
    
    // 4. Calculate Opportunity Cost (next best unassigned source)
    const potentialNext = ownedSources.length > techs && techs < 5
      ? ownedSources[techs]?.rate || 0
      : 0;

    return { 
      activeSources: ownedSources, 
      optimizedIncome: income, 
      missedIncome: potentialNext,
      techAssignments: assigned.map(a => a.id),
      ownedCount: ownedSources.length
    };
  }, [formData.nightclubSources, formData.nightclubTechs]);

  const currentTechs = Number(formData.nightclubTechs) || 0;

  return (
    <div className="space-y-4">
      
      {/* 1. Source Selector Grid (Linked Businesses — select FIRST) */}
      <div>
        <label className="text-xs text-slate-500 font-bold uppercase mb-2 flex justify-between items-center">
          <span>Linked Businesses (Check what you own)</span>
          <span className="text-purple-400 text-[10px] normal-case font-normal flex items-center gap-1">
            <Zap className="w-3 h-3" /> Auto-assigns best earners
          </span>
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SOURCE_RANKING.map((source, index) => {
            const isOwned = formData.nightclubSources?.[source.id];
            const isAssigned = techAssignments.includes(source.id);
            
            return (
              <div 
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`
                  relative p-3 rounded-lg border cursor-pointer transition-all select-none
                  ${isOwned 
                    ? (isAssigned 
                        ? 'bg-purple-900/30 border-purple-500/50 ring-1 ring-purple-500/30' 
                        : 'bg-slate-800 border-slate-600')
                    : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                      isOwned ? 'bg-purple-500 border-purple-500' : 'border-slate-600 bg-slate-800'
                    }`}>
                      {isOwned ? <CheckCircle className="w-3 h-3 text-white" /> : <span className="text-slate-500">{index + 1}</span>}
                    </div>
                    <div>
                      <div className={`text-sm font-medium flex items-center gap-1.5 ${isOwned ? 'text-white' : 'text-slate-500'}`}>
                        <span>{source.emoji}</span>
                        <span>{source.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{source.product}</span>
                        <span className={`font-mono ${isAssigned ? 'text-green-400' : 'text-slate-600'}`}>
                          ${source.rate.toLocaleString()}/hr
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isAssigned && (
                    <div className="px-1.5 py-0.5 bg-green-900/50 text-green-400 text-[10px] rounded border border-green-800 font-bold animate-pulse">
                      ACTIVE
                    </div>
                  )}
                  
                  {isOwned && !isAssigned && currentTechs > 0 && (
                    <div className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[10px] rounded border border-slate-700">
                      IDLE
                    </div>
                  )}
                </div>

                {/* Warning for Low-Value Businesses */}
                {isOwned && source.warning && (
                  <div className="mt-2 text-[10px] text-orange-400 flex items-center gap-1 bg-orange-900/20 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Low-value earner - assign last
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Technician Counter (hire AFTER selecting businesses) */}
      <div>
        <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">
          Technicians Hired ({currentTechs}/5)
          {ownedCount > 0 && currentTechs === 0 && (
            <span className="text-orange-400 normal-case font-normal ml-2">← hire techs to start earning</span>
          )}
        </label>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map(num => {
            const price = TECH_PRICES[num];
            const cumulativeCost = TECH_PRICES.slice(2, num + 1).reduce((s, p) => s + p, 0);
            return (
              <button
                key={num}
                type="button"
                onClick={() => setTechs(num)}
                className={`flex-1 py-2 rounded font-bold text-sm transition-all border flex flex-col items-center ${
                  currentTechs === num
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50' 
                    : num <= ownedCount 
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                }`}
                disabled={num > ownedCount && num > 0}
                title={
                  num === 0 ? 'No technicians' 
                  : num === 1 ? '1 technician (free with nightclub)' 
                  : num > ownedCount ? `Need ${num} linked businesses first` 
                  : `${num} technicians (total hire cost: $${cumulativeCost.toLocaleString()})`
                }
              >
                <span>{num}</span>
                {num >= 2 && (
                  <span className={`text-[8px] font-normal leading-tight ${
                    currentTechs === num ? 'text-purple-200' : 'text-slate-600'
                  }`}>
                    ${(price / 1000).toFixed(0)}k
                  </span>
                )}
                {num === 1 && (
                  <span className={`text-[8px] font-normal leading-tight ${
                    currentTechs === num ? 'text-purple-200' : 'text-slate-600'
                  }`}>
                    free
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {currentTechs > ownedCount && ownedCount > 0 && (
          <div className="text-xs text-orange-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            You have {currentTechs} techs but only {ownedCount} businesses. {currentTechs - ownedCount} tech(s) idle.
          </div>
        )}
        {currentTechs >= 2 && (
          <div className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Total hire cost: ${TECH_PRICES.slice(2, currentTechs + 1).reduce((s, p) => s + p, 0).toLocaleString()} (1st tech free with nightclub)
          </div>
        )}
      </div>

      {/* 3. Real-Time Insights Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Projected Passive Income</div>
            <div className="text-2xl font-mono text-green-400 flex items-baseline gap-1">
              ${optimizedIncome.toLocaleString()}
              <span className="text-sm text-slate-500">/hr</span>
            </div>
            {ownedCount > 0 && currentTechs === 0 && (
              <div className="text-xs text-red-400 mt-1">
                Hire technicians to start earning!
              </div>
            )}
          </div>

          {missedIncome > 0 && currentTechs < 5 && (
            <div className="text-right">
              <div className="text-xs text-orange-400 font-bold flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3" /> Unclaimed Value
              </div>
              <div className="text-xs text-slate-400">
                Hire 1 more tech: <span className="text-green-400 font-mono">+${missedIncome.toLocaleString()}/hr</span>
              </div>
            </div>
          )}
          
          {currentTechs === 5 && ownedCount >= 5 && (
            <div className="text-right">
              <div className="text-xs text-green-400 font-bold flex items-center justify-end gap-1">
                <CheckCircle className="w-3 h-3" /> Fully Optimized
              </div>
              <div className="text-xs text-slate-400">
                All 5 techs assigned
              </div>
            </div>
          )}
        </div>
        
        {/* Quick stats row */}
        <div className="mt-3 pt-3 border-t border-slate-700 flex gap-4 text-xs">
          <div>
            <span className="text-slate-500">Businesses: </span>
            <span className="text-white font-mono">{ownedCount}/7</span>
          </div>
          <div>
            <span className="text-slate-500">Techs Active: </span>
            <span className="text-white font-mono">{Math.min(currentTechs, ownedCount)}/{currentTechs}</span>
          </div>
          <div>
            <span className="text-slate-500">Daily: </span>
            <span className="text-green-400 font-mono">${(optimizedIncome * 24).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
