import { fetchWithTimeout } from './util.js';

// UWAGA: niezweryfikowane na żywo – ah.nl i api.ah.nl blokują adresy IP centrów danych, więc
// z miejsca, w którym to pisałem, nie dało się go przetestować. Na telefonie (zwykły domowy IP)
// powinno działać. Korzysta z nieoficjalnego API mobilnego AH (anonimowy token + wyszukiwarka).
// Jeśli AH zmieni API, błąd pokaże się przy tym sklepie, a reszta nadal działa.
const API = 'https://api.ah.nl';
const QUERIES = ['', 'melk', 'vlees', 'kip', 'vis', 'groente', 'fruit', 'kaas', 'brood', 'drinken',
  'snoep', 'chips', 'koffie', 'bier', 'wijn', 'diepvries', 'pasta', 'schoonmaak'];

// API mobilne AH przyjmuje tylko klienta „Appie” – UA przeglądarki dostaje odmowę.
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

export function parseAh(json) {
  return (json?.products ?? [])
    .filter((p) => p.isBonus && p.bonusEndDate && p.currentPrice != null)
    .map((p) => ({
      id: `ah-${p.webshopId}`,
      store: 'Albert Heijn',
      name: p.title,
      description: p.priceBeforeBonus != null ? `Was €${String(p.priceBeforeBonus).replace('.', ',')}` : '',
      unit: p.salesUnitSize ?? '',
      price: p.currentPrice,
      promoText: p.bonusMechanism ?? '',
      validFrom: p.bonusStartDate ?? null,
      validUntil: p.bonusEndDate,
      image: p.images?.[0]?.url ?? null,
      url: `https://www.ah.nl/producten/product/wi${p.webshopId}`,
    }));
}

export default {
  name: 'Albert Heijn',
  async fetch() {
    const auth = await fetchWithTimeout(`${API}/mobile-auth/v1/auth/token/anonymous`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ clientId: 'appie' }),
    }, 15000);
    if (!auth.ok) throw await failure(auth, 'token');
    const { access_token: token } = await auth.json();
    if (!token) throw new Error('AH: odpowiedź bez access_token (zmieniło się API?)');

    const pages = await Promise.allSettled(QUERIES.map(async (q) => {
      const res = await fetchWithTimeout(
        `${API}/mobile-services/product/search/v2?query=${encodeURIComponent(q)}&sortOn=RELEVANCE&size=1000&page=0&filters=bonus`,
        { headers: headers(token) }, 20000);
      if (!res.ok) throw await failure(res, 'wyszukiwanie');
      return parseAh(await res.json());
    }));
    const ok = pages.filter((p) => p.status === 'fulfilled');
    if (!ok.length) throw pages[0].reason;
    return [...new Map(ok.flatMap((p) => p.value).map((d) => [d.id, d])).values()];
  },
};
