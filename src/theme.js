// System projektowy Korting: kolory (jasny/ciemny), typografia, odstępy, promienie, cienie, kolory sieci.
export const ACCENT = '#e8590c';

const shared = { danger: '#c92a2a', accent: ACCENT };

export const light = {
  ...shared,
  bg: '#f7f4ef', surface: '#ffffff', surfaceAlt: '#f1ede6', card: '#ffffff', chip: '#efebe4',
  fg: '#1d1b17', ink2: '#57524a', mut: '#857f74', border: '#e7e1d6', line: '#ece6db',
  primary: ACCENT, primaryInk: '#ffffff', primaryTint: '#fff0e6', primaryDeep: '#b8430a',
  success: '#2b8a3e', successTint: '#e6f5ea', warn: '#fff3bf', warnFg: '#5c4400', warnTint: '#fff6d6',
  dangerTint: '#fdeaea', overlay: 'rgba(20,16,10,0.45)', shadow: '#2b2114',
};

export const dark = {
  ...shared, danger: '#ff8787',
  bg: '#12110f', surface: '#1d1b18', surfaceAlt: '#27241f', card: '#1d1b18', chip: '#2a2621',
  fg: '#f5f2ea', ink2: '#cbc5b8', mut: '#9a9488', border: '#35312b', line: '#2c2823',
  primary: '#ff7a33', primaryInk: '#1a0e05', primaryTint: '#3a2314', primaryDeep: '#ffb184',
  success: '#69db7c', successTint: '#16301d', warn: '#4a3d00', warnFg: '#ffe066', warnTint: '#3b3208',
  dangerTint: '#3a1b1b', overlay: 'rgba(0,0,0,0.6)', shadow: '#000000',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
export const type = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  h2: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '500' },
  strong: { fontSize: 16, fontWeight: '700' },
  small: { fontSize: 13, fontWeight: '500' },
  caption: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  overline: { fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
};

/** Cień kart: w jasnym motywie miękki, w ciemnym rezygnujemy z cienia na rzecz obrysu. */
export const elevation = (c, level = 1) => (c === dark
  ? { borderWidth: 1, borderColor: c.border }
  : { shadowColor: c.shadow, shadowOpacity: level === 2 ? 0.14 : 0.07, shadowRadius: level === 2 ? 16 : 8, shadowOffset: { width: 0, height: level === 2 ? 6 : 2 }, elevation: level === 2 ? 5 : 2 });

/** Barwy sieci (tło znaczka, kolor tekstu na nim). */
export const STORE_COLORS = {
  'Albert Heijn': { bg: '#00a0e2', fg: '#ffffff', short: 'AH' },
  Jumbo: { bg: '#fdc400', fg: '#1d1b17', short: 'Jumbo' },
  Lidl: { bg: '#0050aa', fg: '#ffffff', short: 'Lidl' },
  Aldi: { bg: '#1c3f94', fg: '#ffffff', short: 'Aldi' },
  Dirk: { bg: '#e30613', fg: '#ffffff', short: 'Dirk' },
  Plus: { bg: '#2a9d4b', fg: '#ffffff', short: 'Plus' },
};
export const storeColor = (store) => STORE_COLORS[store] ?? { bg: '#78716c', fg: '#ffffff', short: store };
