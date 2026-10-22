import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSize, unitPrice, saving, oldPriceFromPercent, bestUnitId, fmtUnit } from '../src/pricing.js';
import { parseAldi } from '../src/providers/aldi.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test('parseSize: gramatury, wielopaki, zakresy', () => {
  near(parseSize('500 g').amount, 0.5);
  assert.equal(parseSize('500 g').per, 'kg');
  near(parseSize('2x190 g').amount, 0.38);
  near(parseSize('Pak 2 x 250 gram. OP=OP').amount, 0.5);
  near(parseSize('1,5 L').amount, 1.5);
  assert.equal(parseSize('1,5 L').per, 'l');
  near(parseSize('6 x 33 cl').amount, 1.98);
  near(parseSize('Inhoud: 6x2 stuks, 250 g').amount, 0.25);
  near(parseSize('0.5 kg').amount, 0.5);
  assert.equal(parseSize('500-1000 g'), null); // zakres – nie zgadujemy
  assert.equal(parseSize('Per stuk'), null);
  assert.equal(parseSize(''), null);
});

test('unitPrice: cena za kg/l z pola unit, a potem nazwy i opisu', () => {
  const u = unitPrice({ price: 1.19, unit: '100 g', name: 'x' });
  near(u.value, 11.9); assert.equal(u.per, 'kg');
  assert.equal(fmtUnit(u), '€11,90/kg');
  near(unitPrice({ price: 1.5, unit: '', name: 'Melk 1 l', description: '' }).value, 1.5);
  near(unitPrice({ price: 3, unit: '', name: 'Koffie', description: 'Pak 2 x 250 gram' }).value, 6);
  assert.equal(unitPrice({ price: null, unit: '500 g', name: 'x' }), null);
  assert.equal(unitPrice({ price: 1, unit: '', name: 'Banaan', description: '' }), null);
});

test('saving: oszczędność z ceny regularnej, brak gdy oldPrice nie jest wyższa', () => {
  const s = saving({ price: 1.59, oldPrice: 1.99 });
  near(s.eur, 0.4); assert.equal(s.pct, 20);
  assert.equal(saving({ price: 2, oldPrice: 2 }), null);
  assert.equal(saving({ price: 2, oldPrice: null }), null);
  assert.equal(saving({ price: null, oldPrice: 3 }), null);
});

test('oldPriceFromPercent: Aldi podaje tylko „-33%”', () => {
  assert.equal(oldPriceFromPercent(0.89, '-33%'), 1.33);
  assert.equal(oldPriceFromPercent(2.99, 'OP=OP'), null);
  assert.equal(oldPriceFromPercent(1, '-95%'), null);
});

test('bestUnitId: najtańsza za kg wśród porównywalnych, minimum dwie oferty', () => {
  const a = { id: 'a', price: 2, unit: '500 g', name: '' }; // 4 €/kg
  const b = { id: 'b', price: 3, unit: '1 kg', name: '' }; // 3 €/kg
  const c = { id: 'c', price: 1, unit: '1 l', name: '' }; // litr – inna jednostka
  assert.equal(bestUnitId([a, b, c]), 'b');
  assert.equal(bestUnitId([a]), null);
  assert.equal(bestUnitId([a, c]), null);
});

test('Aldi: stara cena i oszczędność z procentu w prawdziwym formacie', () => {
  const item = { isAvailable: true, salesUnit: '90 g', name: 'Kroepoek', assets: [], productSlug: 'k', objectID: '9',
    currentPrice: { priceValue: 0.89 },
    promotionPrices: [{ priceValue: 0.89, validUntil: 1792360799, priceTagLabels: { promoText1: '-33%' } }] };
  const html = '<script>"' + JSON.stringify({ algoliaDataMap: { 9: item } }).replace(/"/g, '\\"') + '"</script>';
  const [d] = parseAldi(html);
  assert.equal(d.oldPrice, 1.33);
  assert.equal(saving(d).pct, 33);
});
