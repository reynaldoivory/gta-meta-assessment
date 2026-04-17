import { ChevronUp, ChevronDown } from 'lucide-react';
import { formatPriceShort } from '../../utils/formatters';

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


export default function VehicleTable({ vehicles, sortConfig, onSort, onSelect }) {
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="w-4 h-4 inline ml-1" />
      : <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  const renderFlags = (v) => {
    const badges = [];
    if (v.HSW) badges.push(<span key="hsw" className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">HSW</span>);
    if (v.Imani) badges.push(<span key="imani" className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">IMANI</span>);
    if (v.Weaponized) badges.push(<span key="wpn" className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">WPN</span>);
    if (v.Bennys) badges.push(<span key="bny" className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/40">BNY</span>);
    if (v.Arena) badges.push(<span key="arena" className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">ARN</span>);
    return <div className="flex flex-wrap gap-1">{badges}</div>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className={`${col.width} px-3 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-primary-cyan-400 transition-colors`}
              >
                {col.label}
                <SortIcon columnKey={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr
              key={v.Vehicle_ID}
              onClick={() => onSelect(v)}
              className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
            >
              <td className="px-3 py-2 text-slate-500 text-xs">{v.Vehicle_ID}</td>
              <td className="px-3 py-2 text-white font-medium text-sm">{v.GTA_Make}</td>
              <td className="px-3 py-2 text-white text-sm">{v.GTA_Model}</td>
              <td className={`px-3 py-2 font-medium text-sm ${classColors[v.Class] || 'text-slate-400'}`}>
                {v.Class}
              </td>
              <td className="px-3 py-2 text-slate-400 text-xs">{v.Real_World}</td>
              <td className={`px-3 py-2 font-medium text-sm ${v.Shop === 'Delisted' ? 'text-slate-600 line-through' : 'text-emerald-400'}`}>
                {formatPriceShort(v.Price)}
              </td>
              <td className={`px-3 py-2 text-xs ${v.Shop === 'Delisted' ? 'text-rose-400' : 'text-slate-400'}`}>
                {v.Shop || '—'}
              </td>
              <td className="px-3 py-2 text-slate-300 text-xs font-mono">
                {v.Top_Speed_MPH ? `${v.Top_Speed_MPH}` : '—'}
              </td>
              <td className="px-3 py-2 text-slate-300 text-xs font-mono">{v.Lap_Time || '—'}</td>
              <td className="px-3 py-2">{renderFlags(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No vehicles match your filters
        </div>
      )}
    </div>
  );
}
