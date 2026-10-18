import { fetchText, nuxtData } from './util.js';

const URL_ = 'https://www.dirk.nl/aanbiedingen';
const IMG = 'https://web-fileserver.dirk.nl/';

export function parseDirk(html) {
  const { flat, get } = nuxtData(html, 'Dirk');
  const byId = new Map();
  flat.forEach((node, i) => {
    if (!node || Array.isArray(node) || typeof node !== 'object') return;
    if (!('offerId' in node && 'headerText' in node && 'offerPrice' in node && 'endDate' in node)) return;
    const o = get(i);
    if (byId.has(o.offerId)) return;
    const image = o.products?.[0]?.productInformation?.image;
    const was = o.normalPrice > o.offerPrice ? o.normalPrice : null;
    byId.set(o.offerId, {
      id: `dirk-${o.offerId}`,
      store: 'Dirk',
      name: o.headerText,
      description: [o.packaging, was && `Was €${String(was).replace('.', ',')}`].filter(Boolean).join(' · '),
      unit: '',
      price: o.offerPrice,
      promoText: (o.textPriceSign ?? '').replace(/_actie$/, '').trim(),
      validFrom: o.startDate ?? null,
      validUntil: o.endDate ?? null,
      image: image ? `${IMG}${encodeURI(image)}?width=190` : null, // miniaturka (oryginał ma kilka MB)
      url: URL_,
    });
  });
  return [...byId.values()];
}

export default {
  name: 'Dirk',
  async fetch() {
    return parseDirk(await fetchText(URL_));
  },
};
