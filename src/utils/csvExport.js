// src/utils/csvExport.js

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
    const _raw = JSON.parse(localStorage.getItem('gta_progress_history') || '[]');
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
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
};


