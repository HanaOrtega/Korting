import { fetchText, nuxtData } from './util.js';

const URL_ = 'https://www.jumbo.com/aanbiedingen/nu';

// „voor 4,99” → 4,99 za sztukę; „2 voor 6,49” → 3,25 za sztukę (kupując 2); „1+1 gratis”, „25% korting”
// i „2e halve prijs” nie mają ceny bazowej, więc ceny nie dostają.
function priceFromTags(tags) {
  for (const t of tags) {
    const single = /^voor (\d+),(\d\d)$/i.exec(t.trim());
    if (single) return { price: Number(`${single[1]}.${single[2]}`) };
    const multi = /^(\d+) voor (\d+),(\d\d)$/i.exec(t.trim());
    if (multi && Number(multi[1]) > 1) {
      const n = Number(multi[1]); const total = Number(`${multi[2]}.${multi[3]}`);
      return { price: Math.round((total / n) * 100) / 100, bundle: { n, total } };
    }
  }
  return { price: null };
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
      oldPrice: null,
      unit: '',
      ...priceFromTags(tags),
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
