import { useMemo, useState } from 'react';

import { Gauge, Landmark } from 'lucide-react';
import { useEmpire } from '../../context/EmpireContext';
import { createCfoModeLedger, getEffectiveHeat } from '../../utils/cfoModeLedger';

const SHEETS = [
  { id: 'balance', label: 'Consolidated Balance Sheet' },
  { id: 'income', label: 'Income Statement (P&L)' },
  { id: 'capex', label: 'CapEx Strategy' },
  { id: 'synergy', label: 'Synergy Multiplier' },
];

const formatCurrency = (value) => `$${(Number(value) || 0).toLocaleString()}`;
const formatCycle = (minutes) => (minutes >= 60 ? `${(minutes / 60).toFixed(1)} Hours` : `${minutes} Mins`);
const clampHeat = (value) => Math.max(0, Math.min(100, value));

const getHeatTone = (heat) => {
  if (heat <= 30) return { label: 'System Normal', color: 'text-emerald-300', bar: 'bg-emerald-500' };
  if (heat <= 70) return { label: 'Raid Risk Elevated', color: 'text-yellow-300', bar: 'bg-yellow-500' };
  return { label: 'Laundering Suspended', color: 'text-red-300', bar: 'bg-red-500' };
};

const HeatGauge = ({ heat }) => {
  const tone = getHeatTone(heat);

  return (
    <div className="bg-black/30 border border-slate-700 rounded p-3 w-full md:w-64">
      <div className="flex items-center gap-2 text-xs uppercase text-slate-400 mb-2">
        <Gauge className="w-4 h-4" /> Heat Gauge
      </div>
      <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
        <div className={`h-full ${tone.bar}`} style={{ width: `${heat}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={tone.color}>{tone.label}</span>
        <span className="text-slate-300 font-mono">{heat}%</span>
      </div>
    </div>
  );
};

HeatGauge.propTypes = {
  heat: PropTypes.number.isRequired,
};

const BalanceSheet = ({ ledger }) => {
  const rows = ledger.balanceSections.flatMap((section) => ([
    (
      <tr key={section.id} className="bg-slate-800/80">
        <td className="p-2 border-b border-slate-700 text-slate-100 font-semibold">{section.title}</td>
        <td className="p-2 border-b border-slate-700 text-right text-emerald-300 font-mono">{formatCurrency(section.total)}</td>
        <td className="p-2 border-b border-slate-700" />
        <td className="p-2 border-b border-slate-700" />
      </tr>
    ),
    ...section.rows.map((row) => (
      <tr key={row.id} className="bg-slate-900/40">
        <td className="p-2 border-b border-slate-800 text-slate-200">└─ {row.label}</td>
        <td className="p-2 border-b border-slate-800 text-right font-mono text-slate-100">{formatCurrency(row.value)}</td>
        <td className="p-2 border-b border-slate-800 text-xs text-slate-300">{row.status}</td>
        <td className="p-2 border-b border-slate-800 text-xs text-slate-400">{row.notes}</td>
      </tr>
    )),
  ]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-700 rounded overflow-hidden">
        <thead className="bg-slate-800">
          <tr>
            <th className="text-left p-2 border-b border-slate-700 text-slate-300">Asset Class</th>
            <th className="text-right p-2 border-b border-slate-700 text-slate-300">Book Value (Est.)</th>
            <th className="text-left p-2 border-b border-slate-700 text-slate-300">Status</th>
            <th className="text-left p-2 border-b border-slate-700 text-slate-300">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr className="bg-slate-800/90">
            <td className="p-2 text-slate-100 font-bold">TOTAL ASSETS</td>
            <td className="p-2 text-right font-mono text-emerald-300 font-bold">{formatCurrency(ledger.totalAssets)}</td>
            <td className="p-2" />
            <td className="p-2" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

BalanceSheet.propTypes = {
  ledger: PropTypes.object.isRequired,
};

const IncomeSheet = ({ ledger, incomeView }) => {
  const rows = [...ledger.passiveIncomeRows, ...ledger.safeIncomeRows];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-slate-700 rounded overflow-hidden">
        <thead className="bg-slate-800">
          <tr>
            <th className="text-left p-2 border-b border-slate-700 text-slate-300">Revenue Stream</th>
            <th className="text-right p-2 border-b border-slate-700 text-slate-300">Gross Revenue</th>
            <th className="text-right p-2 border-b border-slate-700 text-slate-300">Cycle Time</th>
            <th className="text-right p-2 border-b border-slate-700 text-slate-300">
              {incomeView === 'hour' ? 'Yield (Per Hour)' : 'Yield (Per Cycle)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="bg-slate-900/40">
              <td className="p-2 border-b border-slate-800 text-slate-200">{row.label}</td>
              <td className="p-2 border-b border-slate-800 text-right font-mono text-slate-100">{formatCurrency(row.grossRevenue)}</td>
              <td className="p-2 border-b border-slate-800 text-right text-slate-300">{formatCycle(row.cycleMinutes)}</td>
              <td className={`p-2 border-b border-slate-800 text-right font-mono ${row.highlightRed ? 'text-red-300' : 'text-emerald-300'}`}>
                {incomeView === 'hour' ? formatCurrency(row.yieldPerHour) : formatCurrency(row.grossRevenue)}
              </td>
            </tr>
          ))}
          <tr className="bg-slate-800/90">
            <td className="p-2 text-slate-100 font-bold">TOTAL PROJECTED REVENUE</td>
            <td className="p-2" />
            <td className="p-2" />
            <td className="p-2 text-right font-mono text-emerald-300 font-bold">{formatCurrency(ledger.totalProjectedPerHour)} / HR</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

IncomeSheet.propTypes = {
  ledger: PropTypes.object.isRequired,
  incomeView: PropTypes.oneOf(['hour', 'cycle']).isRequired,
};

const CapexSheet = ({ items, capexSelection, onToggle }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border border-slate-700 rounded overflow-hidden">
      <thead className="bg-slate-800">
        <tr>
          <th className="text-left p-2 border-b border-slate-700 text-slate-300">Priority Tier</th>
          <th className="text-left p-2 border-b border-slate-700 text-slate-300">Asset / Upgrade</th>
          <th className="text-right p-2 border-b border-slate-700 text-slate-300">Cost</th>
          <th className="text-right p-2 border-b border-slate-700 text-slate-300">Expected ROI (HRS)</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const checked = Object.hasOwn(capexSelection, item.id)
            ? capexSelection[item.id]
            : item.purchased;
          return (
            <tr key={item.id} className="bg-slate-900/40">
              <td className="p-2 border-b border-slate-800 text-xs text-slate-400">{item.tier}</td>
              <td className="p-2 border-b border-slate-800 text-slate-200">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} className="w-4 h-4 rounded bg-slate-800 border-slate-600" />
                  <span>{item.label}</span>
                </label>
              </td>
              <td className="p-2 border-b border-slate-800 text-right font-mono text-slate-100">{checked ? '(PURCHASED)' : formatCurrency(item.cost)}</td>
              <td className="p-2 border-b border-slate-800 text-right text-slate-300">{item.expectedRoiHours} • {item.roiBand}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

CapexSheet.propTypes = {
  items: PropTypes.array.isRequired,
  capexSelection: PropTypes.object.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const SynergySheet = ({ ledger }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border border-slate-700 rounded overflow-hidden">
      <thead className="bg-slate-800">
        <tr>
          <th className="text-left p-2 border-b border-slate-700 text-slate-300">Network Component</th>
          <th className="text-right p-2 border-b border-slate-700 text-slate-300">Standalone ROI</th>
          <th className="text-left p-2 border-b border-slate-700 text-slate-300">Synergy Effect</th>
          <th className="text-right p-2 border-b border-slate-700 text-slate-300">Networked ROI</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-slate-900/40"><td className="p-2 border-b border-slate-800 text-slate-200">Weed Farm</td><td className="p-2 border-b border-slate-800 text-right font-mono text-slate-100">{formatCurrency(ledger.synergy.weedStandalonePerHour)} / hr</td><td className="p-2 border-b border-slate-800 text-slate-300">+16.7% with Dispensary</td><td className="p-2 border-b border-slate-800 text-right font-mono text-emerald-300">{formatCurrency(ledger.synergy.weedNetworkedPerHour)} / hr</td></tr>
        <tr className="bg-slate-900/40"><td className="p-2 border-b border-slate-800 text-slate-200">Dispensary Front</td><td className="p-2 border-b border-slate-800 text-right font-mono text-slate-100">{formatCurrency(ledger.synergy.dispensaryPerHour)} / hr</td><td className="p-2 border-b border-slate-800 text-slate-300">Enables Weed boost</td><td className="p-2 border-b border-slate-800 text-right font-mono text-emerald-300">{formatCurrency(ledger.synergy.dispensaryPerHour)} / hr</td></tr>
        <tr className="bg-slate-900/40"><td className="p-2 border-b border-slate-800 text-slate-200">Car Wash Front</td><td className="p-2 border-b border-slate-800 text-right font-mono text-slate-100">{formatCurrency(ledger.synergy.carWashPerHour)} / hr</td><td className="p-2 border-b border-slate-800 text-slate-300">Launders network cash</td><td className="p-2 border-b border-slate-800 text-right font-mono text-emerald-300">{formatCurrency(ledger.synergy.carWashPerHour)} / hr</td></tr>
        <tr className="bg-slate-800/90"><td className="p-2 text-slate-100 font-bold">NETWORK TOTALS</td><td className="p-2 text-right font-mono text-slate-100">{formatCurrency(ledger.synergy.standaloneTotalPerHour)} / hr</td><td className="p-2 text-slate-300">VS</td><td className="p-2 text-right font-mono text-emerald-300 font-bold">{formatCurrency(ledger.synergy.networkedTotalPerHour)} / hr</td></tr>
        <tr className="bg-slate-800/90"><td className="p-2 text-slate-100 font-bold">NETWORK EFFICIENCY</td><td className="p-2" /><td className="p-2" /><td className="p-2 text-right font-mono text-emerald-300 font-bold">+{ledger.synergy.efficiencyPercent}% PROFIT</td></tr>
      </tbody>
    </table>
  </div>
);

SynergySheet.propTypes = {
  ledger: PropTypes.object.isRequired,
};

export const EnterpriseFinancialGuidePanel = ({ formData, setFormData }: any) => {
  const { state } = useEmpire();
  const [activeSheet, setActiveSheet] = useState('balance');
  const [incomeView, setIncomeView] = useState('hour');
  const [capexSelection, setCapexSelection] = useState({});

  const rawHeat = Number(formData.cfoHeat) || 0;
  const ledger = useMemo(() => createCfoModeLedger(state, rawHeat), [state, rawHeat]);
  const effectiveHeat = getEffectiveHeat(rawHeat, ledger.moneyFrontOwnedCount);

  const adjustHeat = (delta) => {
    const next = clampHeat(rawHeat + delta);
    setFormData((prev) => ({ ...prev, cfoHeat: next }));
  };

  const toggleCapexItem = (itemId) => {
    setCapexSelection((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <section className="space-y-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-blue-500/40 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-blue-300 uppercase font-heading flex items-center gap-2">
              <Landmark className="w-5 h-5" /> Executive Workbook (CFO Mode)
            </h2>
            <p className="text-xs text-slate-400 mt-1">Verified Feb 2026 edition with ledger-style drilldown and live empire integration.</p>
          </div>
          <HeatGauge heat={effectiveHeat} />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {SHEETS.map((sheet) => (
            <button
              key={sheet.id}
              type="button"
              onClick={() => setActiveSheet(sheet.id)}
              className={`px-3 py-2 rounded text-xs border whitespace-nowrap ${activeSheet === sheet.id ? 'border-blue-400 bg-blue-900/40 text-blue-200' : 'border-slate-700 bg-slate-800 text-slate-300'}`}
            >
              {sheet.label}
            </button>
          ))}
        </div>

        {activeSheet === 'income' && (
          <div className="flex justify-end mb-3">
            <button type="button" onClick={() => setIncomeView((prev) => (prev === 'hour' ? 'cycle' : 'hour'))} className="px-3 py-2 rounded text-xs border border-slate-600 text-slate-300 hover:bg-slate-800">
              View: {incomeView === 'hour' ? 'PER HOUR' : 'PER CYCLE'}
            </button>
          </div>
        )}

        {activeSheet === 'balance' && <BalanceSheet ledger={ledger} />}
        {activeSheet === 'income' && <IncomeSheet ledger={ledger} incomeView={incomeView} />}
        {activeSheet === 'capex' && <CapexSheet items={ledger.capexItems} capexSelection={capexSelection} onToggle={toggleCapexItem} />}
        {activeSheet === 'synergy' && <SynergySheet ledger={ledger} />}

        <div className="mt-4 p-3 border border-slate-700 rounded bg-black/20">
          <div className="text-xs uppercase text-slate-400 mb-2">Heat Actions</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => adjustHeat(20)} className="px-2 py-1 text-xs rounded border border-slate-600 text-slate-200 hover:bg-slate-800">Sell large shipment (+20%)</button>
            <button type="button" onClick={() => adjustHeat(-15)} className="px-2 py-1 text-xs rounded border border-slate-600 text-slate-200 hover:bg-slate-800">Complete Car Wash shift (-15%)</button>
            <button type="button" onClick={() => adjustHeat(10)} className="px-2 py-1 text-xs rounded border border-slate-600 text-slate-200 hover:bg-slate-800">Fail sale mission (+10%)</button>
            <button type="button" onClick={() => adjustHeat(-5)} className="px-2 py-1 text-xs rounded border border-slate-600 text-slate-200 hover:bg-slate-800">Buy a Money Front (-5%)</button>
          </div>
          <p className="text-xs text-slate-500 mt-2">Effective heat auto-reduces by 5% for each owned Money Front (permanent mitigation).</p>
        </div>
      </div>
    </section>
  );
};

EnterpriseFinancialGuidePanel.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
};
