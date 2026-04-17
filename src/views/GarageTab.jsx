import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { ArrowLeft, Car, Database, AlertTriangle } from 'lucide-react';
import { useAssessment } from '../context/AssessmentContext';
import FilterPanel from '../components/garage/FilterPanel';
import VehicleTable from '../components/garage/VehicleTable';
import DetailModal from '../components/garage/DetailModal';

const BASE_URL = import.meta.env.BASE_URL || '/';
const CSV_URL = new URL(
  'data/vehicles.csv',
  new URL(BASE_URL, typeof window !== 'undefined' ? window.location.href : 'http://localhost/')
).pathname;

const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v !== 'string') return false;
  return v.trim().toUpperCase() === 'TRUE';
};

const toNumber = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeRow = (row) => {
  const make = row.Real_World_Make?.trim() || '';
  const model = row.Real_World_Model?.trim() || '';
  const realWorld = [make, model].filter(Boolean).join(' ');
  return {
    Vehicle_ID: row.Vehicle_ID?.trim() || '',
    GTA_Make: row.GTA_Make?.trim() || '',
    GTA_Model: row.GTA_Model?.trim() || '',
    Class: row.Class?.trim() || 'Unknown',
    Real_World_Make: make,
    Real_World_Model: model,
    Real_World: realWorld || 'N/A',
    Price: toNumber(row.Price),
    Drivetrain: row.Drivetrain?.trim() || '',
    Shop: row.Shop?.trim() || 'Unknown',
    Top_Speed_MPH: row.Top_Speed_MPH ? toNumber(row.Top_Speed_MPH) : null,
    Lap_Time: row.Lap_Time?.trim() || '',
    Weaponized: toBool(row.Weaponized),
    HSW: toBool(row.HSW),
    Imani: toBool(row.Imani),
    Bennys: toBool(row.Bennys),
    Arena: toBool(row.Arena),
    Notes: row.Notes?.trim() || '',
  };
};

const DEFAULT_FILTERS = {
  class: '',
  shop: '',
  make: '',
  hsw: false,
  imani: false,
  weaponized: false,
  priceMin: 0,
  priceMax: 10000000,
  showDelisted: true,
};

const sortVehicles = (rows, { key, direction }) => {
  if (!key) return rows;
  const dir = direction === 'asc' ? 1 : -1;
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  return copy;
};

export default function GarageTab() {
  const { setStep } = useAssessment();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'Vehicle_ID', direction: 'asc' });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(CSV_URL);
        if (!res.ok) throw new Error(`Failed to load vehicle data (${res.status})`);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (cancelled) return;
        const rows = parsed.data
          .filter((r) => r.Vehicle_ID)
          .map(normalizeRow);
        setVehicles(rows);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load vehicle data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { classes, shops, makes } = useMemo(() => {
    const classSet = new Set();
    const shopSet = new Set();
    const makeSet = new Set();
    for (const v of vehicles) {
      if (v.Class) classSet.add(v.Class);
      if (v.Shop) shopSet.add(v.Shop);
      if (v.GTA_Make) makeSet.add(v.GTA_Make);
    }
    return {
      classes: [...classSet].sort(),
      shops: [...shopSet].sort(),
      makes: [...makeSet].sort(),
    };
  }, [vehicles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (filters.class && v.Class !== filters.class) return false;
      if (filters.shop && v.Shop !== filters.shop) return false;
      if (filters.make && v.GTA_Make !== filters.make) return false;
      if (filters.hsw && !v.HSW) return false;
      if (filters.imani && !v.Imani) return false;
      if (filters.weaponized && !v.Weaponized) return false;
      if (!filters.showDelisted && v.Shop === 'Delisted') return false;
      if (v.Price < filters.priceMin) return false;
      if (v.Price > filters.priceMax) return false;
      if (q) {
        const hay = `${v.GTA_Make} ${v.GTA_Model} ${v.Real_World}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [vehicles, filters, search]);

  const sorted = useMemo(() => sortVehicles(filtered, sortConfig), [filtered, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const delistedCount = useMemo(
    () => vehicles.filter((v) => v.Shop === 'Delisted').length,
    [vehicles]
  );

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-body text-slate-50">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between pb-6 border-b-2 border-slate-700">
          <div>
            <button
              type="button"
              onClick={() => setStep('form')}
              className="btn-secondary text-sm py-2 px-4 mb-4 inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Planning Board
            </button>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight">
              <span className="heading-gradient-purple">THE GARAGE</span>
            </h1>
            <p className="text-primary-cyan-400 text-base font-bold flex items-center gap-2 mt-2">
              <Car className="w-5 h-5" />
              Vehicle intel updated Apr 17, 2026 — wiki & gta5-mods.com live
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700">
              <Database className="w-3.5 h-3.5" />
              {vehicles.length} vehicles · {delistedCount} delisted
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading && (
          <div className="text-center py-20 text-slate-400">Loading vehicle database…</div>
        )}

        {error && !loading && (
          <div className="bg-rose-500/10 border border-rose-500/40 rounded-xl p-6 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">Wasted! Couldn't load the garage.</div>
              <div className="text-sm text-rose-400">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                classes={classes}
                shops={shops}
                makes={makes}
                search={search}
                setSearch={setSearch}
              />
              <div className="mt-3 text-xs text-slate-500">
                Showing {sorted.length} of {vehicles.length} vehicles
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-2">
              <VehicleTable
                vehicles={sorted}
                sortConfig={sortConfig}
                onSort={handleSort}
                onSelect={setSelected}
              />
            </div>

            <p className="text-center text-xs text-slate-600 mt-6">
              Vehicle data sourced from the community-maintained{' '}
              <a
                href="https://github.com/reynaldoivory/gta-online-database"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-cyan-400 underline"
              >
                gta-online-database
              </a>
              . Stats cross-checked against GTA Wiki and Broughy1322 as of Apr 17, 2026.
              Mod links resolve live — nothing cached or shipped in-app.
            </p>
          </>
        )}
      </div>

      {selected && <DetailModal vehicle={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
