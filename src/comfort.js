// Ustawienia „komfortu” (skupienie i spokój): wszystkie opcjonalne i domyślnie wyłączone. Czysta logika bez UI.
export const SCALES = [1, 1.15, 1.3];

export const DEFAULTS = {
  focus: false, // przycisk „Tryb zakupów” (jeden produkt naraz)
  aisles: false, // widok wg działów sklepu
  simple: false, // prosta lista: bez podglądu promocji pod pozycją
  calm: false, // spokojne kolory
  scale: 0, // indeks w SCALES
  still: false, // bez animacji i bez znikających komunikatów
  routine: true, // lista kontrolna „przed wyjściem” w trybie zakupów
  routineItems: null, // null = domyślne w języku aplikacji
  weekly: { on: false, day: 6, hour: 10, minute: 0 }, // dzień ISO 1=pon … 7=niedz
  expiry: { on: false, hour: 9 }, // dzień przed końcem promocji z listy
};

export const mergeComfort = (saved) => ({ ...DEFAULTS, ...(saved ?? {}), weekly: { ...DEFAULTS.weekly, ...(saved?.weekly ?? {}) }, expiry: { ...DEFAULTS.expiry, ...(saved?.expiry ?? {}) } });

/** Spokojniejsza paleta: przygaszone, mniej nasycone kolory, bez jaskrawej pomarańczy (kontrast tekstu zachowany). */
export function calmPalette(c, isDark) {
  return isDark
    ? { ...c, bg: '#17191a', surface: '#202324', card: '#202324', surfaceAlt: '#2a2e2f', chip: '#2b2f30', border: '#383d3e', line: '#2f3435', fg: '#ecebe6', ink2: '#c3c4bd', mut: '#979a94',
      primary: '#7fb3a8', primaryInk: '#10201c', primaryTint: '#26373a', primaryDeep: '#a9d3c9', accent: '#7fb3a8', success: '#86c39a', successTint: '#1e3226', dangerTint: '#382424', danger: '#e39a9a', warnTint: '#37321f', warn: '#37321f' }
    : { ...c, bg: '#f2f1ec', surface: '#fbfaf7', card: '#fbfaf7', surfaceAlt: '#ebe9e2', chip: '#e8e6df', border: '#dcd9cf', line: '#e3e0d6', fg: '#24262a', ink2: '#4a4d52', mut: '#6f736f',
      primary: '#4f7a72', primaryInk: '#ffffff', primaryTint: '#e3eeeb', primaryDeep: '#2f524b', accent: '#4f7a72', success: '#3f7d52', successTint: '#e4f0e7', dangerTint: '#f3e6e6', danger: '#a14a4a', warnTint: '#f4efdc', warn: '#f4efdc', shadow: '#3a3a30' };
}

const parseDay = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };

/**
 * Przypomnienie o kończących się promocjach z listy: najwcześniejszy koniec promocji pasującej do niezaznaczonej pozycji;
 * powiadomienie dzień wcześniej o godzinie `hour`. Zwraca { at, entries: [{ text, store }] } albo null.
 * rows: [{ item: {text, done}, hits: [{store, validUntil}] }]
 */
export function expiryReminder(rows, now, hour) {
  let best = null;
  for (const { item, hits } of rows) {
    if (item.done) continue;
    for (const d of hits) {
      if (!d.validUntil) continue;
      const end = parseDay(d.validUntil);
      const at = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1, hour, 0, 0);
      if (at <= now) continue; // dzień przed już minął – nie przypominamy wstecz
      if (!best || at < best.at) best = { at, entries: [] };
      if (at.getTime() === best.at.getTime() && !best.entries.some((e) => e.text === item.text)) best.entries.push({ text: item.text, store: d.store });
    }
  }
  return best;
}

/** Wyzwalacz tygodniowy dla expo-notifications (weekday: 1 = niedziela … 7 = sobota). */
export const weeklyTrigger = ({ day, hour, minute }) => ({ weekday: (day % 7) + 1, hour, minute });
