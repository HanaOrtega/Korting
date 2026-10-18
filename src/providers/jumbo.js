import { fetchText, nuxtData } from './util.js';

const URL_ = 'https://www.jumbo.com/aanbiedingen/nu';

// "voor 4,99" -> 4.99; "2 voor 6,49", "1+1 gratis", "1,00 korting" -> brak ceny za sztukę.
function priceFromTags(tags) {
  for (const t of tags) {
    const m = /^voor (\d+),(\d\d)$/.exec(t.trim());
    if (m) return Number(`${m[1]}.${m[2]}`);
  }
  return null;
}

export function parseJumbo(html) {
  const { flat, get } = nuxtData(html, 'Jumbo');
  const byId = new Map();
  flat.forEach((node, i) => {
    if (!node || Array.isArray(node) || typeof node !== 'object') return;
    if (!('uuid' in node && 'title' in node && 'tags' in node && 'start' in node && 'end' in node)) return;
    const p = get(i);
    if (p.active === false || p.hidden || byId.has(p.id)) return;
    const tags = (p.tags ?? []).map((t) => t.text).filter(Boolean);
    byId.set(p.id, {
      id: `jumbo-${p.id}`,
      store: 'Jumbo',
      name: p.title,
      description: p.subtitle ?? '',
      unit: '',
      price: priceFromTags(tags),
      promoText: tags.join(', '),
      validFrom: p.start?.iso ?? null,
      validUntil: p.end?.iso ?? null,
      image: p.image ?? null,
      url: p.url ? `https://www.jumbo.com${p.url}` : URL_,
    });
  });
  return [...byId.values()];
}

export default {
  name: 'Jumbo',
  async fetch() {
    return parseJumbo(await fetchText(URL_));
  },
};
