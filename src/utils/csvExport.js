// src/utils/csvExport.js
export const exportCommunityStatsCSV = () => {
  const pool = JSON.parse(localStorage.getItem('gta_community_stats_pool') || '[]');
  
  if (pool.length === 0) {
    return null;
  }

  const headers = [
    'Timestamp',
    'Date',
    'Rank',
    'Hours Played',
    'Score',
    'Tier',
    'Income/Hr',
    'Has GTA+',
    'Has Kosatka',
    'Has Sparrow',
    'Has Agency',
    'Has Acid Lab',
    'Has Nightclub',
    'Has Bunker',
    'Has Auto Shop',
    'Avg Stat',
    'Cayo Completions',
    'Heist Ready %',
  ];

  const rows = pool.map(entry => [
    entry.timestamp,
    new Date(entry.timestamp).toISOString(),
    entry.rank,
    entry.timePlayed,
    entry.score,
    entry.tier,
    entry.incomePerHour,
    entry.hasGTAPlus ? 'Yes' : 'No',
    entry.assets?.kosatka ? 'Yes' : 'No',
    entry.assets?.sparrow ? 'Yes' : 'No',
    entry.assets?.agency ? 'Yes' : 'No',
    entry.assets?.acidLab ? 'Yes' : 'No',
    entry.assets?.nightclub ? 'Yes' : 'No',
    entry.assets?.bunker ? 'Yes' : 'No',
    entry.assets?.autoShop ? 'Yes' : 'No',
    entry.avgStat,
    entry.cayoCompletions,
    entry.heistReadyPercent,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csv;
};

export const downloadCSV = (csv, filename = 'gta_community_stats.csv') => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportProgressHistoryCSV = () => {
  const history = JSON.parse(localStorage.getItem('gta_progress_history') || '[]');
  
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

  const rows = history.map(snapshot => [
    snapshot.timestamp,
    new Date(snapshot.timestamp).toLocaleString(),
    snapshot.rank,
    snapshot.liquidCash,
    snapshot.tier,
    snapshot.score,
    snapshot.incomePerHour,
    snapshot.cayoCompletions,
    snapshot.assets?.kosatka ? 'Yes' : 'No',
    snapshot.assets?.sparrow ? 'Yes' : 'No',
    snapshot.assets?.agency ? 'Yes' : 'No',
    snapshot.assets?.acidLab ? 'Yes' : 'No',
    snapshot.assets?.nightclub ? 'Yes' : 'No',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
};
