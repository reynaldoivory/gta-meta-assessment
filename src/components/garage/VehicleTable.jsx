import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatPriceShort } from '../../utils/formatters';
import { TableWrap, Table, THead, TBody, TR, TH, TD } from '../ui';

// Documented exception to the Arcade HUD two-channel rule (see DESIGN_SYSTEM.md):
// vehicle Class is a categorical label users scan a 795-row table by, so it
// keeps a rich raw-Tailwind hue map rather than collapsing to cyan/pink.
const classColors = {
  Super: 'text-purple-400',
  Sports: 'text-blue-400',
  Muscle: 'text-orange-400',
  'Sports Classic': 'text-amber-400',
  Sedans: 'text-gray-400',
  Coupes: 'text-cyan-400',
  SUVs: 'text-green-400',
  'Off-Road': 'text-yellow-600',
  Motorcycles: 'text-red-400',
  Military: 'text-red-600',
  Planes: 'text-sky-400',
  Helicopters: 'text-indigo-400',
  Commercial: 'text-stone-400',
  Industrial: 'text-stone-500',
  Vans: 'text-teal-400',
  Cycles: 'text-lime-400',
  Compacts: 'text-pink-400',
  Emergency: 'text-rose-500',
  Service: 'text-emerald-400',
  Utility: 'text-zinc-400',
  Boats: 'text-sky-300',
  Trailers: 'text-neutral-400',
};

const columns = [
  { key: 'Vehicle_ID', label: 'ID', width: 'w-16' },
  { key: 'GTA_Make', label: 'Make', width: 'w-28' },
  { key: 'GTA_Model', label: 'Model', width: 'w-36' },
  { key: 'Class', label: 'Class', width: 'w-28' },
  { key: 'Real_World', label: 'Real-world', width: 'w-48' },
  { key: 'Price', label: 'Price', width: 'w-24' },
  { key: 'Shop', label: 'Shop', width: 'w-28' },
  { key: 'Top_Speed_MPH', label: 'Top MPH', width: 'w-20' },
  { key: 'Lap_Time', label: 'Lap', width: 'w-24' },
  { key: 'Tags', label: 'Flags', width: 'w-32' },
];

// All flag badges are informational capability tags (not a good/bad status),
// so they share one hud-blue treatment rather than 5 competing raw hues.
const FLAG_DEFS = [
  { key: 'HSW', test: (v) => v.HSW, label: 'HSW' },
  { key: 'Imani', test: (v) => v.Imani, label: 'IMANI' },
  { key: 'Weaponized', test: (v) => v.Weaponized, label: 'WPN' },
  { key: 'Bennys', test: (v) => v.Bennys, label: 'BNY' },
  { key: 'Arena', test: (v) => v.Arena, label: 'ARN' },
];

const renderFlags = (v) => (
  <div className="flex flex-wrap gap-1">
    {FLAG_DEFS.filter((f) => f.test(v)).map((f) => (
      <span key={f.key} className="px-1.5 py-0.5 rounded text-2xs font-bold bg-hud-blue/20 text-hud-blue border border-hud-blue/40">
        {f.label}
      </span>
    ))}
  </div>
);

export default function VehicleTable({ vehicles, sortConfig, onSort, onSelect }) {
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  return (
    // contain-paint contain-layout: bounds this 795-row table's paint/layout
    // work so it doesn't cascade into the rest of the garage view.
    <div className="contain-paint contain-layout">
      <TableWrap>
        <Table>
          <THead>
            <TR>
              {columns.map(col => (
                <TH
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  className={`${col.width} cursor-pointer hover:text-hud-blue transition-colors`}
                >
                  {col.label}
                  <SortIcon columnKey={col.key} />
                </TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {vehicles.map((v) => (
              <TR
                key={v.Vehicle_ID}
                onClick={() => onSelect(v)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(v); } }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${v.GTA_Make} ${v.GTA_Model}`}
                className="hover:bg-bg-raised/50 cursor-pointer focus:outline-none focus-visible:bg-bg-raised/70"
              >
                <TD className="text-text-muted text-xs">{v.Vehicle_ID}</TD>
                <TD className="text-text-primary font-medium text-sm">{v.GTA_Make}</TD>
                <TD className="text-text-primary text-sm">{v.GTA_Model}</TD>
                <TD className={`font-medium text-sm ${classColors[v.Class] || 'text-text-muted'}`}>
                  {v.Class}
                </TD>
                <TD className="text-text-muted text-xs">{v.Real_World}</TD>
                <TD className={`font-medium text-sm ${v.Shop === 'Delisted' ? 'text-text-muted line-through' : 'text-hud-blue'}`}>
                  {formatPriceShort(v.Price)}
                </TD>
                <TD className={`text-xs ${v.Shop === 'Delisted' ? 'text-accent-pink-text' : 'text-text-muted'}`}>
                  {v.Shop || '—'}
                </TD>
                <TD className="text-text-secondary text-xs font-mono">
                  {v.Top_Speed_MPH ? `${v.Top_Speed_MPH}` : '—'}
                </TD>
                <TD className="text-text-secondary text-xs font-mono">{v.Lap_Time || '—'}</TD>
                <TD>{renderFlags(v)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableWrap>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          No vehicles match your filters
        </div>
      )}
    </div>
  );
}
