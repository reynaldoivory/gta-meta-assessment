// src/utils/csvExport.js
import { escapeCsvCell } from './csvHelpers';
import { LEGACY_READ_KEYS, getRaw } from './storage/appStorage';

export const downloadCSV = (csv, filename = 'gta_community_stats.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = globalThis.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  globalThis.URL.revokeObjectURL(url);
};

export const exportProgressHistoryCSV = () => {
  let history;
  try {
    // NOTE: this legacy key is never written by any current writer, so reads always return [] (pre-existing drift; see docs/ux-overhaul/AUDIT.md 9b).
    const _raw = JSON.parse(getRaw(LEGACY_READ_KEYS.PROGRESS_HISTORY_BROKEN) || '[]');
    history = Array.isArray(_raw) ? _raw : [];
  } catch {
    return null;
  }

  if (history.length === 0) {
    return null;
  }

  const headers = [
    'Timestamp',
    'Date',
    'Rank',
    'Liquid Cash',
    'Tier',
    'Score',
    'Income/Hr',
    'Cayo Completions',
    'Has Kosatka',
    'Has Sparrow',
    'Has Agency',
    'Has Acid Lab',
    'Has Nightclub',
  ];

  const asYesNo = (value) => (value ? 'Yes' : 'No');

const toHistoryRow = (snapshot) => {
  const assets = snapshot.assets || {};
  return [
    snapshot.timestamp,
    new Date(snapshot.timestamp).toLocaleString(),
    snapshot.rank,
    snapshot.liquidCash,
    snapshot.tier,
    snapshot.score,
    snapshot.incomePerHour,
    snapshot.cayoCompletions,
    asYesNo(assets.kosatka),
    asYesNo(assets.sparrow),
    asYesNo(assets.agency),
    asYesNo(assets.acidLab),
    asYesNo(assets.nightclub),
  ];
};

  const rows = history.map(toHistoryRow);

  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvCell).join(',')),
  ].join('\n');
};


