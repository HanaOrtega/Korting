import { UA, fetchWithTimeout } from './util.js';

// UWAGA: niezweryfikowane na żywo – ah.nl i api.ah.nl blokują adresy IP centrów danych, więc
// z miejsca, w którym to pisałem, nie dało się go przetestować. Na telefonie (zwykły domowy IP)
// powinno działać. Korzysta z nieoficjalnego API mobilnego AH (anonimowy token + wyszukiwarka).
// Jeśli AH zmieni API, błąd pokaże się przy tym sklepie, a reszta nadal działa.
const API = 'https://api.ah.nl';
const QUERIES = ['', 'melk', 'vlees', 'kip', 'vis', 'groente', 'fruit', 'kaas', 'brood', 'drinken',
  'snoep', 'chips', 'koffie', 'bier', 'wijn', 'diepvries', 'pasta', 'schoonmaak'];

const headers = (token) => ({
  'user-agent': UA, 'x-application': 'AHWEBSHOP', 'content-type': 'application/json',
  ...(token && { authorization: `Bearer ${token}` }),
});

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
    if (!auth.ok) throw new Error(`AH: token HTTP ${auth.status}`);
    const { access_token: token } = await auth.json();

    const pages = await Promise.allSettled(QUERIES.map(async (q) => {
      const res = await fetchWithTimeout(
        `${API}/mobile-services/product/search/v2?query=${encodeURIComponent(q)}&sortOn=RELEVANCE&size=1000&page=0&filters=bonus`,
        { headers: headers(token) }, 20000);
      if (!res.ok) throw new Error(`AH: wyszukiwanie HTTP ${res.status}`);
      return parseAh(await res.json());
    }));
    const ok = pages.filter((p) => p.status === 'fulfilled');
    if (!ok.length) throw pages[0].reason;
    return [...new Map(ok.flatMap((p) => p.value).map((d) => [d.id, d])).values()];
  },
};
