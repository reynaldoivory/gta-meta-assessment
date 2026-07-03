import { formatPriceShort } from '../../utils/formatters';

interface Vehicle {
  Vehicle_ID: string;
  GTA_Make: string;
  GTA_Model: string;
  Class: string;
  Real_World: string;
  Price: number;
  Shop: string;
  Top_Speed_MPH: number | null;
  HSW: boolean;
  Imani: boolean;
  Weaponized: boolean;
}

export interface VehicleCardListProps {
  vehicles: Vehicle[];
  onSelect: (vehicle: Vehicle) => void;
}

const FLAGS: { key: keyof Vehicle; label: string }[] = [
  { key: 'HSW', label: 'HSW' },
  { key: 'Imani', label: 'IMANI' },
  { key: 'Weaponized', label: 'WPN' },
];

/**
 * Phone-width reflow of VehicleTable: one card per vehicle instead of a
 * horizontally-scrolling 10-column table (which can't be legible at 390px).
 * Fed the SAME filtered/sorted row slice as the table so only one of the two
 * ever mounts (see useMediaQuery in GarageTab) -- DOM stays bounded.
 */
export function VehicleCardList({ vehicles, onSelect }: VehicleCardListProps) {
  if (vehicles.length === 0) {
    return <div className="text-center py-12 text-text-muted">No vehicles match your filters</div>;
  }

  return (
    <div className="contain-paint contain-layout flex flex-col gap-2">
      {vehicles.map((v) => (
        <button
          key={v.Vehicle_ID}
          type="button"
          onClick={() => onSelect(v)}
          aria-label={`View details for ${v.GTA_Make} ${v.GTA_Model}`}
          className="w-full text-left rounded-2xl border border-border-subtle bg-bg-surface p-3 transition-colors hover:border-border"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-2xs text-text-muted">#{v.Vehicle_ID} · {v.Class}</div>
              <div className="font-semibold text-text-primary truncate">{v.GTA_Make} {v.GTA_Model}</div>
              {v.Real_World ? <div className="text-xs text-text-muted truncate">{v.Real_World}</div> : null}
            </div>
            <div className={`shrink-0 font-mono font-bold ${v.Shop === 'Delisted' ? 'text-text-muted line-through' : 'text-hud-blue'}`}>
              {formatPriceShort(v.Price)}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {FLAGS.filter((f) => v[f.key]).map((f) => (
                <span key={f.key} className="px-1.5 py-0.5 rounded text-2xs font-bold bg-hud-blue/20 text-hud-blue border border-hud-blue/40">
                  {f.label}
                </span>
              ))}
            </div>
            {v.Top_Speed_MPH ? (
              <span className="text-xs text-text-muted font-mono">{v.Top_Speed_MPH} mph</span>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  );
}
