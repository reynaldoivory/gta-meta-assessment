import { Gauge, DollarSign, Car, Store, Info, ExternalLink, Wrench, BookOpen } from 'lucide-react';
import { Modal, Badge } from '../ui';

const formatPrice = (price) => {
  if (price === 0 || Number.isNaN(price)) return '—';
  return `$${price.toLocaleString()}`;
};

// Origin allowlist untouched -- defense in depth against a tampered CSV
// building unexpected external hrefs. Do not widen without a security review.
const ALLOWED_ORIGINS = [
  'https://gta.fandom.com/',
  'https://www.gtabase.com/',
  'https://www.gta5-mods.com/',
];

const isSafeUrl = (url) => ALLOWED_ORIGINS.some((o) => url.startsWith(o));

const wikiUrl = (v) => {
  const slug = `${v.GTA_Make}_${v.GTA_Model}`.replace(/\s+/g, '_');
  const url = `https://gta.fandom.com/wiki/${encodeURIComponent(slug)}`;
  return isSafeUrl(url) ? url : null;
};

const gtabaseUrl = (v) => {
  const slug = `${v.GTA_Make} ${v.GTA_Model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const url = `https://www.gtabase.com/grand-theft-auto-v/vehicles/${encodeURIComponent(slug)}`;
  return isSafeUrl(url) ? url : null;
};

const gta5ModsSearch = (v) => {
  const q = `${v.Real_World_Make || ''} ${v.Real_World_Model || ''}`.trim();
  if (!q) return null;
  const url = `https://www.gta5-mods.com/vehicles?search=${encodeURIComponent(q)}&tags=replace&sort=downloads`;
  return isSafeUrl(url) ? url : null;
};

export default function DetailModal({ vehicle, onClose }) {
  const v = vehicle;
  const isDelisted = v.Shop === 'Delisted';
  const wikiHref = wikiUrl(v);
  const gtabaseHref = gtabaseUrl(v);
  const modsUrl = gta5ModsSearch(v);

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={(
        <div>
          <div className="text-xs text-text-muted mb-1 font-normal">#{v.Vehicle_ID} · {v.Class}</div>
          <div>{v.GTA_Make} {v.GTA_Model}</div>
        </div>
      )}
    >
      <p className="text-text-muted text-sm -mt-2 mb-4">IRL: {v.Real_World || 'N/A'}</p>

      {/* Status strip */}
      {isDelisted && (
        <div className="mb-4 p-3 bg-hud-pink/10 border border-hud-pink/30 rounded-lg text-accent-pink-text text-sm">
          <span className="font-semibold">Delisted:</span> {v.Notes || 'Rockstar removed this vehicle from sale.'}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge tone="accent">{v.Class}</Badge>
        {v.HSW && <Badge tone="info">HSW Upgrade</Badge>}
        {v.Imani && <Badge tone="info">Imani Tech</Badge>}
        {v.Weaponized && <Badge tone="info">Weaponized</Badge>}
        {v.Bennys && <Badge tone="info">Benny's</Badge>}
        {v.Arena && <Badge tone="info">Arena</Badge>}
      </div>

      {/* Facts grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-bg-raised rounded-lg p-4">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <DollarSign className="w-4 h-4" /> Price
          </div>
          <div className={`text-xl font-bold ${isDelisted ? 'text-text-muted line-through' : 'text-hud-blue'}`}>
            {formatPrice(v.Price)}
          </div>
        </div>
        <div className="bg-bg-raised rounded-lg p-4">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
            <Store className="w-4 h-4" /> Shop
          </div>
          <div className={`text-xl font-semibold ${isDelisted ? 'text-accent-pink-text' : 'text-text-primary'}`}>
            {v.Shop || 'Unknown'}
          </div>
        </div>
        {v.Top_Speed_MPH && (
          <div className="bg-bg-raised rounded-lg p-4">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <Gauge className="w-4 h-4" /> Top Speed (Broughy)
            </div>
            <div className="text-xl font-semibold text-text-primary">{v.Top_Speed_MPH} mph</div>
          </div>
        )}
        {v.Lap_Time && (
          <div className="bg-bg-raised rounded-lg p-4">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <Car className="w-4 h-4" /> Lap Time
            </div>
            <div className="text-xl font-semibold text-text-primary font-mono">{v.Lap_Time}</div>
          </div>
        )}
      </div>

      {/* Notes */}
      {v.Notes && !isDelisted && (
        <div className="bg-bg-raised rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-hud-blue text-sm font-medium mb-2">
            <Info className="w-4 h-4" /> Notes
          </div>
          <p className="text-text-secondary leading-relaxed text-sm">{v.Notes}</p>
        </div>
      )}

      {/* Live external references */}
      <div className="bg-bg-raised rounded-lg p-4">
        <div className="flex items-center gap-2 text-hud-blue text-sm font-medium mb-3">
          <ExternalLink className="w-4 h-4" /> Verified references (live, Apr 2026)
        </div>
        <div className="flex flex-wrap gap-2">
          {wikiHref && (
            <a
              href={wikiHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface hover:bg-border-subtle text-text-primary text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" /> GTA Wiki
            </a>
          )}
          {gtabaseHref && (
            <a
              href={gtabaseHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface hover:bg-border-subtle text-text-primary text-sm transition-colors"
            >
              <BookOpen className="w-4 h-4" /> GTABase
            </a>
          )}
          {modsUrl && (
            <a
              href={modsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-hud-pink/15 hover:bg-hud-pink/25 text-accent-pink-text border border-hud-pink/40 text-sm transition-colors"
            >
              <Wrench className="w-4 h-4" /> gta5-mods.com replace mods
            </a>
          )}
        </div>
        <p className="text-text-muted text-xs mt-3">
          Links resolve to current top-downloaded mods and authoritative stat pages. No cached/stale mod data shipped in-app.
        </p>
      </div>
    </Modal>
  );
}
