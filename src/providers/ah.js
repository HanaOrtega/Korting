import { fetchWithTimeout } from './util.js';

// UWAGA: niezweryfikowane na żywo – ah.nl i api.ah.nl blokują adresy IP centrów danych, więc
// z miejsca, w którym to pisałem, nie dało się go przetestować. Na telefonie (zwykły domowy IP)
// powinno działać. Korzysta z nieoficjalnego API mobilnego AH (anonimowy token + wyszukiwarka).
// Jeśli AH zmieni API, błąd pokaże się przy tym sklepie, a reszta nadal działa.
const API = 'https://api.ah.nl';
const QUERIES = ['melk', 'vlees', 'kip', 'vis', 'groente', 'fruit', 'kaas', 'brood', 'drinken',
  'snoep', 'chips', 'koffie', 'bier', 'wijn', 'diepvries', 'pasta', 'schoonmaak', 'ontbijt'];
// Parametry wyszukiwania sprawdzane po kolei (serwer AH wywala się na nieznanych: np. „filters=bonus”
// daje 500 „Index: 1, Size: 1”). Pierwszy zestaw, który zwróci 200, jest używany do reszty zapytań.
const PARAM_SETS = ['sortOn=RELEVANCE&size=100&page=0', 'size=100&page=0', 'page=0&size=50', 'size=50'];

const APPIE_UA = 'Appie/8.22.3';
const headers = (token) => ({
  'user-agent': APPIE_UA, 'x-application': 'AHWEBSHOP', 'content-type': 'application/json', accept: 'application/json',
  ...(token && { authorization: `Bearer ${token}` }),
});

async function failure(res, what) {
  let body = '';
  try { body = (await res.text()).replace(/\s+/g, ' ').slice(0, 120); } catch {}
  return new Error(`AH ${what}: HTTP ${res.status}${body ? ` – ${body}` : ''}`);
}

// Pola z nieoficjalnego API; kilka nazw zapasowych, bo odpowiedzi AH bywają różne.
const priceOf = (p) => p.currentPrice ?? p.price?.now ?? p.priceNow ?? null;
const endOf = (p) => p.bonusEndDate ?? p.promotion?.endDate ?? null;

export function parseAh(json) {
  return (json?.products ?? [])
    .filter((p) => (p.isBonus || p.bonusMechanism) && priceOf(p) != null)
    .map((p) => ({
      id: `ah-${p.webshopId ?? p.id}`,
      store: 'Albert Heijn',
      name: p.title,
      description: '',
      oldPrice: p.priceBeforeBonus ?? null,
      unit: p.salesUnitSize ?? '',
      price: priceOf(p),
      promoText: p.bonusMechanism ?? '',
      validFrom: p.bonusStartDate ?? null,
      validUntil: endOf(p),
      image: p.images?.[0]?.url ?? null,
      url: `https://www.ah.nl/producten/product/wi${p.webshopId ?? p.id}`,
    }));
}

const searchUrl = (q, params) => `${API}/mobile-services/product/search/v2?query=${encodeURIComponent(q)}&${params}`;

let session = null; // { token, params } – po pierwszym udanym wyszukiwaniu pamiętamy działające parametry

async function getToken() {
  const auth = await fetchWithTimeout(`${API}/mobile-auth/v1/auth/token/anonymous`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ clientId: 'appie' }),
  }, 15000);
  if (!auth.ok) throw await failure(auth, 'token');
  const { access_token: token } = await auth.json();
  if (!token) throw new Error('AH: odpowiedź bez access_token (zmieniło się API?)');
  return token;
}

/** Wyszukuje produkty; przy pierwszym wywołaniu dobiera parametry, które serwer przyjmuje. */
async function search(q) {
  session ??= { token: await getToken(), params: null };
  const get = (params) => fetchWithTimeout(searchUrl(q, params), { headers: headers(session.token) }, 20000);
  if (session.params) {
    const res = await get(session.params);
    if (res.ok) return res.json();
    session = null; // token mógł wygasnąć – następne wywołanie zacznie od nowa
    throw await failure(res, 'wyszukiwanie');
  }
  const tried = [];
  for (const set of PARAM_SETS) {
    const res = await get(set);
    if (res.ok) { session.params = set; return res.json(); }
    tried.push(`[${set}] ${(await failure(res, '')).message.replace(/^AH : /, '')}`);
  }
  session = null;
  throw new Error(`AH wyszukiwanie: ${tried.join(' | ')}`);
}

/** Produkty z wyszukiwarki jako zwykłe ceny (przy produkcie w bonusie – cena sprzed bonusu). */
export function parseAhRegular(json) {
  return (json?.products ?? [])
    .map((p) => ({ p, price: p.priceBeforeBonus ?? p.currentPrice ?? p.price?.now ?? null }))
    .filter(({ p, price }) => p.title && price != null)
    .map(({ p, price }) => ({
      id: `ah-${p.webshopId ?? p.id}`, store: 'Albert Heijn', name: p.title, description: '', oldPrice: null,
      unit: p.salesUnitSize ?? '', price, promoText: '', validFrom: null, validUntil: null,
      image: p.images?.[0]?.url ?? null, url: `https://www.ah.nl/producten/product/wi${p.webshopId ?? p.id}`,
    }));
}

export default {
  name: 'Albert Heijn',
  async regular(term) {
    return parseAhRegular(await search(term));
  },
  async fetch() {
    const first = await search(QUERIES[0]);
    const sample = first?.products?.[0];
    const results = [parseAh(first)];
    await Promise.all(QUERIES.slice(1).map(async (q) => {
      try { results.push(parseAh(await search(q))); } catch { /* pojedyncze hasło może zawieść */ }
    }));
    const deals = [...new Map(results.flat().map((d) => [d.id, d])).values()];
    if (!deals.length) {
      const keys = sample ? Object.keys(sample).slice(0, 25).join(',') : 'brak produktów w odpowiedzi';
      throw new Error(`AH: wyszukiwanie działa, ale brak produktów w bonusie (pola produktu: ${keys})`);
    }
    return deals;
  },
};
