import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLidl } from '../src/providers/lidl.js';
import { parseJumbo } from '../src/providers/jumbo.js';

const esc = (o) => JSON.stringify(o).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const lidlItem = (over) => ({
  fullTitle: 'CHEF SELECT & YOU Andijvie', productId: 1, canonicalUrl: '/p/x/p1', image: 'https://img',
  storeEndDate: 1792965599, price: { price: 1.59 },
  regionsPrices: { 1: { currentLidlPlusPrice: { price: {
    price: 1.59, endDate: '2026-10-25T21:59:59Z', packaging: { text: '500 g' },
    discount: { showDiscount: true, deletedPrice: 1.99, discountText: '-20%' } } } } },
  ...over,
});
const lidlHtml = (...items) => items.map((i) => `<div data-grid-data="${esc(i)}"></div>`).join('');

test('Lidl: cena, rabat i data końca; stały asortyment pomijany', () => {
  const regular = lidlItem({ productId: 2, storeEndDate: undefined, regionsPrices: {} });
  const deals = parseLidl(lidlHtml(lidlItem({}), regular));
  assert.equal(deals.length, 1);
  assert.deepEqual(
    [deals[0].name, deals[0].price, deals[0].promoText, deals[0].description, deals[0].validUntil],
    ['CHEF SELECT & YOU Andijvie', 1.59, '-20%', 'Was €1,99', '2026-10-25T21:59:59Z'],
  );
});

test('Lidl: cena w formacie currentPrice (bez zagnieżdżenia)', () => {
  const item = lidlItem({ regionsPrices: { 1: { currentPrice: { price: 9.99, endDate: '2026-10-25T21:59:59Z' } } } });
  assert.equal(parseLidl(lidlHtml(item))[0].price, 9.99);
});

// Mini stan Nuxt w formacie devalue: wartości liczbowe to indeksy w płaskiej tablicy.
const nuxt = (tag) => `<script id="__NUXT_DATA__" type="application/json">${JSON.stringify([
  { id: 1, uuid: 2, title: 3, subtitle: 4, active: 5, hidden: 6, start: 7, end: 8, tags: 9, image: 4, url: 10 },
  'p1', 'u', 'Broccoli', null, true, false, { iso: 11 }, { iso: 12 }, [13],
  '/aanbiedingen/broccoli/1', '2026-10-14T00:01:00+02:00', '2026-10-20T23:59:59+02:00', { text: 14 }, tag,
])}</script>`;

test('Jumbo: rozwija devalue i wyciąga cenę z etykiety "voor X,XX"', () => {
  const [d] = parseJumbo(nuxt('voor 4,99'));
  assert.deepEqual(
    [d.store, d.name, d.price, d.promoText, d.validUntil],
    ['Jumbo', 'Broccoli', 4.99, 'voor 4,99', '2026-10-20T23:59:59+02:00'],
  );
});

test('Jumbo: "2 voor 6,49" nie daje ceny za sztukę', () => {
  const [d] = parseJumbo(nuxt('2 voor 6,49'));
  assert.equal(d.price, null);
  assert.equal(d.promoText, '2 voor 6,49');
});

test('Jumbo: błąd gdy brak danych', () => {
  assert.throws(() => parseJumbo('<html></html>'), /__NUXT_DATA__/);
});

import { parsePlus } from '../src/providers/plus.js';
import { parseDirk } from '../src/providers/dirk.js';
import { parseAh } from '../src/providers/ah.js';

test('Plus: oferty z kategorii, bez darmowej dostawy', () => {
  const offer = (o) => ({ PromotionID: '1', Offer_Id: '7', Brand: 'Biologisch PLUS', Name: 'Wortelen', Example: 'Per 1 kg',
    NewPrice: '1.49', PriceOriginal_Product: '1.85', StartDate: '2026-10-14', EndDate: '2026-10-20', Slug: 'wortelen-1', ...o });
  const json = { data: { PromotionPeriod: {}, PromotionOfferList: { List: [
    { Category: { Offers: { List: [offer({}), offer({ Offer_Id: '8', IsFreeDeliveryOffer: true, NewPrice: '0.0' })] } } },
  ] } } };
  const deals = parsePlus(json);
  assert.equal(deals.length, 1);
  assert.deepEqual(
    [deals[0].name, deals[0].price, deals[0].description, deals[0].validUntil],
    ['Biologisch PLUS Wortelen', 1.49, 'Per 1 kg · Was €1,85', '2026-10-20T23:59:59'],
  );
  assert.throws(() => parsePlus({}), /PLUS/);
});

test('Dirk: oferta z ceną, ceną regularną i zdjęciem produktu', () => {
  const nuxt = `<script id="__NUXT_DATA__" type="application/json">${JSON.stringify([
    { offerId: 1, headerText: 2, packaging: 3, offerPrice: 4, normalPrice: 5, textPriceSign: 6, startDate: 7, endDate: 8, products: 9 },
    139844, 'Gevulde speculaas', 'Pak 2 x 250 gram', 2.99, 3.69, 'VR, ZA & ZO_actie',
    '2026-10-14T00:00:00.000Z', '2026-10-18T23:59:00.000Z', [10], { productInformation: 11 }, { image: 12 }, 'artikelen/a b.png',
  ])}</script>`;
  const [d] = parseDirk(nuxt);
  assert.deepEqual(
    [d.store, d.name, d.price, d.promoText, d.description, d.image],
    ['Dirk', 'Gevulde speculaas', 2.99, 'VR, ZA & ZO', 'Pak 2 x 250 gram · Was €3,69', 'https://web-fileserver.dirk.nl/artikelen/a%20b.png'],
  );
});

test('AH: tylko produkty w bonusie', () => {
  const deals = parseAh({ products: [
    { webshopId: 1, title: 'Melk', isBonus: true, bonusEndDate: '2026-10-20', currentPrice: 1.09, priceBeforeBonus: 1.29, bonusMechanism: '25% korting' },
    { webshopId: 2, title: 'Brood', isBonus: false, currentPrice: 2 },
  ] });
  assert.equal(deals.length, 1);
  assert.equal(deals[0].price, 1.09);
});
