import { RotateCcw } from 'lucide-react';
import { formatPriceShort } from '../../utils/formatters';
import { Button, Field, Input } from '../ui';

const selectCls = 'bg-bg-raised border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:border-hud-blue focus:outline-none';

const SORT_OPTIONS = [
  { key: 'Vehicle_ID', label: 'ID' },
  { key: 'GTA_Make', label: 'Make' },
  { key: 'GTA_Model', label: 'Model' },
  { key: 'Class', label: 'Class' },
  { key: 'Real_World', label: 'Real-world' },
  { key: 'Price', label: 'Price' },
  { key: 'Shop', label: 'Shop' },
  { key: 'Top_Speed_MPH', label: 'Top MPH' },
  { key: 'Lap_Time', label: 'Lap' },
];

export default function FilterPanel({ filters, setFilters, classes, shops, makes, search, setSearch, sortConfig, onSort }) {
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
    <div className="pt-4 border-t border-border">
      {/* Search row */}
      <div className="mb-4">
        <Field label="Search vehicles" htmlFor="garage-search" hideLabel>
          <Input
            id="garage-search"
            type="text"
            placeholder="Search by make, model, or real-world equivalent…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
      </div>

      {/* Mobile-only sort control (table headers, the desktop sort affordance, are hidden below md) */}
      {sortConfig && onSort && (
        <div className="mb-4 md:hidden">
          <Field label="Sort by" htmlFor="garage-sort-mobile">
            <div className="flex gap-2">
              <select
                id="garage-sort-mobile"
                value={sortConfig.key}
                onChange={(e) => {
                  // Selecting a different field resets to ascending (handleSort's
                  // existing same-key-toggles/new-key-resets behavior).
                  if (e.target.value !== sortConfig.key) onSort(e.target.value);
                }}
                className={`${selectCls} flex-1`}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onSort(sortConfig.key)}
                aria-label={`Sort direction: ${sortConfig.direction === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortConfig.direction === 'asc' ? '↑ Asc' : '↓ Desc'}
              </Button>
            </div>
          </Field>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-text-muted mb-1" htmlFor="garage-class">Class</label>
          <select id="garage-class" value={filters.class} onChange={(e) => updateFilter('class', e.target.value)} className={selectCls}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1" htmlFor="garage-shop">Shop</label>
          <select id="garage-shop" value={filters.shop} onChange={(e) => updateFilter('shop', e.target.value)} className={selectCls}>
            <option value="">All Shops</option>
            {shops.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1" htmlFor="garage-make">Make</label>
          <select id="garage-make" value={filters.make} onChange={(e) => updateFilter('make', e.target.value)} className={selectCls}>
            <option value="">All Makes</option>
            {makes.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.hsw} onChange={(e) => updateFilter('hsw', e.target.checked)} className="w-4 h-4 rounded bg-bg-raised border-border accent-hud-blue" />
            <span className="text-hud-blue text-sm font-medium">HSW</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.imani} onChange={(e) => updateFilter('imani', e.target.checked)} className="w-4 h-4 rounded bg-bg-raised border-border accent-hud-blue" />
            <span className="text-hud-blue text-sm font-medium">IMANI</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.weaponized} onChange={(e) => updateFilter('weaponized', e.target.checked)} className="w-4 h-4 rounded bg-bg-raised border-border accent-hud-blue" />
            <span className="text-hud-blue text-sm font-medium">Weaponized</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.showDelisted} onChange={(e) => updateFilter('showDelisted', e.target.checked)} className="w-4 h-4 rounded bg-bg-raised border-border accent-hud-blue" />
            <span className="text-text-secondary text-sm font-medium">Include delisted</span>
          </label>
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs text-text-muted mb-1" htmlFor="garage-price-min">
            Price: {formatPriceShort(filters.priceMin)} – {formatPriceShort(filters.priceMax)}
          </label>
          <div className="flex gap-2 items-center">
            <input id="garage-price-min" aria-label="Minimum price" aria-valuetext={formatPriceShort(filters.priceMin)} type="range" min="0" max="5000000" step="50000" value={filters.priceMin} onChange={(e) => updateFilter('priceMin', parseInt(e.target.value, 10))} className="flex-1 h-2 bg-bg-raised rounded-lg appearance-none cursor-pointer accent-hud-blue" />
            <input aria-label="Maximum price" aria-valuetext={formatPriceShort(filters.priceMax)} type="range" min="0" max="10000000" step="100000" value={filters.priceMax} onChange={(e) => updateFilter('priceMax', parseInt(e.target.value, 10))} className="flex-1 h-2 bg-bg-raised rounded-lg appearance-none cursor-pointer accent-hud-blue" />
          </div>
        </div>

        <Button type="button" variant="secondary" onClick={resetFilters} icon={RotateCcw}>
          Reset
        </Button>
      </div>
    </div>
  );
}
