import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAldi } from '../providers/aldi.js';

const item = {
  isAvailable: true, salesUnit: 'Per stuk', name: 'Amaryllismix', shortDescription: 'Potmaat: 12 cm.',
  assets: [{ type: 'primary', url: 'https://img/x' }], productSlug: 'amaryllismix-1',
  currentPrice: { priceValue: 2.99 }, objectID: '1',
  promotionPrices: [{ priceValue: 2.99, validFrom: 1791928800, validUntil: 1792360799, priceTagLabels: { promoText1: 'OP=OP' } }],
};
const html = '<script>x = "' + JSON.stringify({ res: { algoliaDataMap: { 1: item, 2: { ...item, objectID: '2', isAvailable: false } } } }).replace(/"/g, '\\"') + '"</script>';

test('parsuje produkty Aldi i pomija niedostępne', () => {
  const deals = parseAldi(html);
  assert.equal(deals.length, 1);
  assert.deepEqual(
    [deals[0].store, deals[0].name, deals[0].price, deals[0].promoText, deals[0].validUntil],
    ['Aldi', 'Amaryllismix', 2.99, 'OP=OP', '2026-10-18T21:59:59.000Z'],
  );
});

test('rzuca błąd gdy zmieniła się struktura strony', () => {
  assert.throws(() => parseAldi('<html></html>'), /algoliaDataMap/);
});
