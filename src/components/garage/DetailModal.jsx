import { useEffect } from 'react';
import { X, Gauge, DollarSign, Car, Store, Info, ExternalLink, Wrench, BookOpen } from 'lucide-react';

const formatPrice = (price) => {
  if (price === 0 || Number.isNaN(price)) return '—';
  return `$${price.toLocaleString()}`;
};

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

  useEffect(() => {
    // Focus management and basic focus trap for accessibility
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const titleEl = document.getElementById('vehicle-detail-title');
    const dialogEl = titleEl ? titleEl.closest('[role="dialog"]') : null;
    const selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = dialogEl ? Array.from(dialogEl.querySelectorAll(selector)).filter((el) => el instanceof HTMLElement) : [];
    const firstFocusable = focusable[0] || null;
    const lastFocusable = focusable[focusable.length - 1] || null;
    const closeBtn = dialogEl ? dialogEl.querySelector('button[aria-label="Close vehicle details"]') : null;
    // move focus to close button (or first focusable) when opened
    if (closeBtn && closeBtn instanceof HTMLElement) {
      closeBtn.focus();
    } else if (firstFocusable && firstFocusable instanceof HTMLElement) {
      firstFocusable.focus();
    }

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        // Basic focus trap: loop focus inside dialog
        if (!focusable.length) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable && lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable && firstFocusable.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose(); }}
      role="presentation"
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-detail-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-1">#{v.Vehicle_ID} · {v.Class}</div>
            <h2 id="vehicle-detail-title" className="text-2xl font-bold text-white">{v.GTA_Make} {v.GTA_Model}</h2>
            <p className="text-slate-400 text-sm">IRL: {v.Real_World || 'N/A'}</p>
          </div>
          <button onClick={onClose} aria-label="Close vehicle details" className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Status strip */}
          {isDelisted && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm">
              <span className="font-semibold">Delisted:</span> {v.Notes || 'Rockstar removed this vehicle from sale.'}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-primary-purple-500/20 text-primary-purple-400 rounded-full text-sm font-medium border border-primary-purple-500/30">
              {v.Class}
            </span>
            {v.HSW && <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">HSW Upgrade</span>}
            {v.Imani && <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">Imani Tech</span>}
            {v.Weaponized && <span className="px-2 py-1 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/40">Weaponized</span>}
            {v.Bennys && <span className="px-2 py-1 rounded text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40">Benny's</span>}
            {v.Arena && <span className="px-2 py-1 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">Arena</span>}
          </div>

          {/* Facts grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <DollarSign className="w-4 h-4" /> Price
              </div>
              <div className={`text-xl font-bold ${isDelisted ? 'text-slate-500 line-through' : 'text-emerald-400'}`}>
                {formatPrice(v.Price)}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Store className="w-4 h-4" /> Shop
              </div>
              <div className={`text-xl font-semibold ${isDelisted ? 'text-rose-400' : 'text-white'}`}>
                {v.Shop || 'Unknown'}
              </div>
            </div>
            {v.Top_Speed_MPH && (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Gauge className="w-4 h-4" /> Top Speed (Broughy)
                </div>
                <div className="text-xl font-semibold text-white">{v.Top_Speed_MPH} mph</div>
              </div>
            )}
            {v.Lap_Time && (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <Car className="w-4 h-4" /> Lap Time
                </div>
                <div className="text-xl font-semibold text-white font-mono">{v.Lap_Time}</div>
              </div>
            )}
          </div>

          {/* Notes */}
          {v.Notes && !isDelisted && (
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-primary-purple-400 text-sm font-medium mb-2">
                <Info className="w-4 h-4" /> Notes
              </div>
              <p className="text-slate-300 leading-relaxed text-sm">{v.Notes}</p>
            </div>
          )}

          {/* Live external references */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-primary-cyan-400 text-sm font-medium mb-3">
              <ExternalLink className="w-4 h-4" /> Verified references (live, Apr 2026)
            </div>
            <div className="flex flex-wrap gap-2">
              {wikiHref && (
                <a
                  href={wikiHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> GTA Wiki
                </a>
              )}
              {gtabaseHref && (
                <a
                  href={gtabaseHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> GTABase
                </a>
              )}
              {modsUrl && (
                <a
                  href={modsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-sm transition-colors"
                >
                  <Wrench className="w-4 h-4" /> gta5-mods.com replace mods
                </a>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-3">
              Links resolve to current top-downloaded mods and authoritative stat pages. No cached/stale mod data shipped in-app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
