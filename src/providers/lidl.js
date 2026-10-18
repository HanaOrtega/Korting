import { fetchText, isoFix } from './util.js';

// Wyszukiwarka Lidla zwraca ~79 kafelków na zapytanie (offset nie działa), więc
// odpytujemy kilka haseł i deduplikujemy po productId.
const QUERIES = ['aanbiedingen', 'vlees', 'kip', 'vis', 'groente', 'fruit', 'kaas', 'brood',
  'zuivel', 'melk', 'diepvries', 'snoep', 'chocolade', 'koffie', 'bier', 'wijn', 'pasta', 'drinken'];
const searchUrl = (q) => `https://www.lidl.nl/q/search?q=${encodeURIComponent(q)}`;

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');
const toISO = (sec) => (sec ? new Date(sec * 1000).toISOString() : null);

export function parseLidl(html) {
  const out = [];
  for (const m of html.matchAll(/data-grid-data="(\{[^"]*)"/g)) {
    let p;
    try { p = JSON.parse(decode(m[1])); } catch { continue; }
    const regionPrices = Object.values(p.regionsPrices ?? {})[0] ?? {};
    // currentPrice / currentLidlPlusPrice: cena bywa zagnieżdżona w .price albo leży bezpośrednio.
    const entry = Object.values(regionPrices).find((v) => v?.price?.price != null || typeof v?.price === 'number');
    const cur = entry && (typeof entry.price === 'number' ? entry : entry.price);
    if (!cur && p.price?.price == null) continue;
    if (!p.fullTitle) continue;
    const validUntil = isoFix(cur?.endDate) ?? toISO(p.storeEndDate);
    if (!validUntil) continue; // bez daty końca to stały asortyment, nie promocja
    const discount = cur?.discount?.showDiscount ? cur.discount : null;
    out.push({
      id: `lidl-${p.productId}`,
      store: 'Lidl',
      name: p.fullTitle,
      description: discount?.deletedPrice != null ? `Was €${String(discount.deletedPrice).replace('.', ',')}` : '',
      unit: cur?.packaging?.text ?? '',
      price: cur?.price ?? p.price.price,
      promoText: discount?.discountText ?? '',
      validFrom: isoFix(cur?.startDate) ?? toISO(p.storeStartDate),
      validUntil,
      image: p.image ?? null,
      url: p.canonicalUrl ? `https://www.lidl.nl${p.canonicalUrl}` : '',
    });
  }
  return out;
}

export default {
  name: 'Lidl',
  async fetch() {
    const pages = await Promise.allSettled(QUERIES.map((q) => fetchText(searchUrl(q))));
    const ok = pages.filter((p) => p.status === 'fulfilled');
    if (!ok.length) throw pages[0].reason;
    const byId = new Map();
    for (const p of ok) for (const d of parseLidl(p.value)) byId.set(d.id, d);
    return [...byId.values()];
  },
};
