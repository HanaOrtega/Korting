import { fetchText, sliceBalanced } from './util.js';

const URL_ = 'https://www.aldi.nl/aanbiedingen.html';
const toISO = (sec) => (sec ? new Date(sec * 1000).toISOString() : null);

// Strona Aldi osadza dane Algolia jako JSON w stringu (z cudzysłowami poprzedzonymi \).
export function parseAldi(html) {
  const text = html.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  const key = '"algoliaDataMap":';
  const at = text.indexOf(key);
  if (at < 0) throw new Error('Aldi: brak algoliaDataMap (zmieniła się strona?)');
  const map = JSON.parse(sliceBalanced(text, at + key.length));

  return Object.values(map)
    .filter((p) => p.isAvailable !== false && p.currentPrice?.priceValue != null)
    .map((p) => {
      const promo = p.promotionPrices?.[0] ?? p.currentPrice;
      const primary = p.assets?.find((a) => a.type === 'primary')?.url;
      const image = primary ? `${primary}?wid=200&fmt=jpg` : null; // miniaturka: ~8 KB zamiast ~130 KB
      return {
        id: `aldi-${p.objectID}`,
        store: 'Aldi',
        name: p.name,
        description: p.shortDescription ?? '',
        unit: p.salesUnit ?? '',
        price: promo.priceValue,
        promoText: promo.priceTagLabels?.promoText1 ?? '',
        validFrom: toISO(promo.validFrom),
        validUntil: toISO(promo.validUntil),
        image,
        url: p.productSlug ? `https://www.aldi.nl/product/${p.productSlug}.html` : URL_,
      };
    });
}

export default {
  name: 'Aldi',
  async fetch() {
    return parseAldi(await fetchText(URL_));
  },
};
