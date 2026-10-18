export const fmtPrice = (n) => `€${n.toFixed(2).replace('.', ',')}`;

export function fmtDate(iso, lang) {
  const d = new Date(iso);
  try {
    return d.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
  } catch {
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }
}

export const daysLeft = (iso) => Math.ceil((Date.parse(iso) - Date.now()) / 86400000);
