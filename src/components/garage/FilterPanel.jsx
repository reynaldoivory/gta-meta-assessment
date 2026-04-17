import { RotateCcw } from 'lucide-react';
import { formatPriceShort } from '../../utils/formatters';

const selectCls = 'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-primary-cyan-500 focus:outline-none';

export default function FilterPanel({ filters, setFilters, classes, shops, makes, search, setSearch }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      class: '',
      shop: '',
      make: '',
      hsw: false,
      imani: false,
      weaponized: false,
      priceMin: 0,
      priceMax: 10000000,
      showDelisted: true,
    });
    setSearch('');
  };

  return (
    <div className="pt-4 border-t border-slate-700">
      {/* Search row */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by make, model, or real-world equivalent…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-primary-cyan-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Class</label>
          <select value={filters.class} onChange={(e) => updateFilter('class', e.target.value)} className={selectCls}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Shop</label>
          <select value={filters.shop} onChange={(e) => updateFilter('shop', e.target.value)} className={selectCls}>
            <option value="">All Shops</option>
            {shops.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Make</label>
          <select value={filters.make} onChange={(e) => updateFilter('make', e.target.value)} className={selectCls}>
            <option value="">All Makes</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.hsw} onChange={(e) => updateFilter('hsw', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">HSW</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.imani} onChange={(e) => updateFilter('imani', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500" />
            <span className="text-blue-400 text-sm font-medium">IMANI</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.weaponized} onChange={(e) => updateFilter('weaponized', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-red-500" />
            <span className="text-red-400 text-sm font-medium">Weaponized</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.showDelisted} onChange={(e) => updateFilter('showDelisted', e.target.checked)} className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-slate-400" />
            <span className="text-slate-400 text-sm font-medium">Include delisted</span>
          </label>
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-slate-500 mb-1">
            Price: {formatPriceShort(filters.priceMin)} – {formatPriceShort(filters.priceMax)}
          </label>
          <div className="flex gap-2 items-center">
            <input type="range" min="0" max="5000000" step="50000" value={filters.priceMin} onChange={(e) => updateFilter('priceMin', parseInt(e.target.value, 10))} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-purple-500" />
            <input type="range" min="0" max="10000000" step="100000" value={filters.priceMax} onChange={(e) => updateFilter('priceMax', parseInt(e.target.value, 10))} className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-purple-500" />
          </div>
        </div>

        <button onClick={resetFilters} className="btn-secondary flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
