export const escapeCsvCell = (val: unknown): string => {
  const s = String(val ?? '');
  const sanitized = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${sanitized.replace(/"/g, '""')}"`;
};
