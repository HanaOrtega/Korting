export const UA =
  'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36';

// fetch z limitem czasu (AbortSignal.timeout nie istnieje w React Native).
export async function fetchWithTimeout(url, opts = {}, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } catch (e) {
    throw ctrl.signal.aborted ? new Error(`${url} -> przekroczono czas oczekiwania`) : e;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchText(url, timeoutMs = 20000) {
  const res = await fetchWithTimeout(
    url, { headers: { 'user-agent': UA, 'accept-language': 'nl-NL,nl;q=0.9' } }, timeoutMs);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

// Zwraca podciąg od otwierającego znaku '{' lub '[' do pasującego zamknięcia.
export function sliceBalanced(text, start) {
  const open = text[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (c === '\\') i++;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) return text.slice(start, i + 1);
  }
  throw new Error('Niezbalansowany JSON');
}

// Nuxt zapisuje stan strony jako płaską tablicę, w której obiekty odwołują się do
// siebie numerami indeksów (format "devalue"). Rozwijamy tylko to, co potrzebne.
export function nuxtData(html, label = 'strona') {
  const raw = /id="__NUXT_DATA__"[^>]*>(.*?)<\/script>/s.exec(html)?.[1];
  if (!raw) throw new Error(`${label}: brak __NUXT_DATA__ (zmieniła się strona?)`);
  const flat = JSON.parse(raw);
  const get = (i, depth = 0) => {
    const v = flat[i];
    if (depth > 6 || v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) {
      if (typeof v[0] === 'string' && /^(Shallow)?(Reactive|Ref)$/.test(v[0])) return get(v[1], depth + 1);
      return v.map((x) => (typeof x === 'number' ? get(x, depth + 1) : x));
    }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'number' ? get(x, depth + 1) : x]));
  };
  return { flat, get };
}

// Hermes (React Native) bywa wybredny: dopisz sekundy do "…T22:00Z".
export const isoFix = (s) => (s ? s.replace(/T(\d\d:\d\d)(Z|[+-]\d\d:\d\d)?$/, 'T$1:00$2') : s);
