import test from 'node:test';
import assert from 'node:assert/strict';
import { planShopping } from '../src/plan.js';
import { parseOverpass, chainOf, navigationUrl, distanceMeters, fmtDistance, favoriteChains } from '../src/stores.js';

const deal = (store, price, name = 'x') => ({ id: `${store}-${name}`, store, price, name });
const item = (text, done = false) => ({ id: text, text, done });

test('plan: produkt trafia do sklepu z najtańszą ofertą, reszta sklepów jest w „others”', () => {
  const rows = [{ item: item('mleko'), hits: [deal('Aldi', 0.99), deal('Lidl', 1.09)] }];
  const { groups, none } = planShopping(rows);
  assert.equal(none.length, 0);
  assert.equal(groups[0].store, 'Aldi');
  assert.deepEqual(groups[0].entries[0].others, ['Lidl']);
});

test('plan: ulubione sieci mają pierwszeństwo, a produkty bez promocji lądują w „none”', () => {
  const rows = [
    { item: item('mleko'), hits: [deal('Aldi', 0.99), deal('Lidl', 1.09)] },
    { item: item('chleb'), hits: [deal('Aldi', 0.79)] },
    { item: item('sól'), hits: [] },
  ];
  const { groups, none } = planShopping(rows, ['Lidl']);
  assert.deepEqual(groups.map((g) => g.store), ['Lidl', 'Aldi']); // ulubiony na górze
  assert.equal(groups[0].entries[0].item.text, 'mleko'); // mleko w Lidlu, mimo że w Aldi taniej
  assert.deepEqual(none.map((i) => i.text), ['sól']);
});

test('plan: suma pomija kupione i oferty bez ceny; sklepy sortowane liczbą produktów', () => {
  const rows = [
    { item: item('a'), hits: [deal('Jumbo', 1)] },
    { item: item('b', true), hits: [deal('Jumbo', 5)] },
    { item: item('c'), hits: [deal('Jumbo', null)] },
    { item: item('d'), hits: [deal('Dirk', 2)] },
  ];
  const { groups } = planShopping(rows);
  assert.equal(groups[0].store, 'Jumbo');
  assert.equal(groups[0].total, 1);
});

test('stores: rozpoznawanie sieci po nazwie i marce', () => {
  assert.equal(chainOf({ name: 'Albert Heijn' }), 'Albert Heijn');
  assert.equal(chainOf({ name: 'AH Utrecht', brand: 'Albert Heijn' }), 'Albert Heijn');
  assert.equal(chainOf({ name: 'Dirk van den Broek' }), 'Dirk');
  assert.equal(chainOf({ brand: 'PLUS' }), 'Plus');
  assert.equal(chainOf({ name: 'Plusmarkt Janssen' }), null); // nie myl z siecią Plus
  assert.equal(chainOf({ name: 'Turkse supermarkt' }), null);
});

test('stores: parseOverpass wybiera znane sieci, liczy odległość i sortuje', () => {
  const json = { elements: [
    { type: 'node', id: 1, lat: 52.38, lon: 4.9, tags: { name: 'Lidl', 'addr:street': 'Kerkstraat', 'addr:housenumber': '5', 'addr:city': 'Amsterdam' } },
    { type: 'way', id: 2, center: { lat: 52.3735, lon: 4.8925 }, tags: { brand: 'Aldi', name: 'Aldi Centrum' } },
    { type: 'node', id: 3, lat: 52.37, lon: 4.89, tags: { name: 'Buurtsuper' } },
  ] };
  const out = parseOverpass(json, 52.3731, 4.8922);
  assert.deepEqual(out.map((s) => s.chain), ['Aldi', 'Lidl']);
  assert.equal(out[1].address, 'Kerkstraat 5, Amsterdam');
  assert.ok(out[0].distance < 100);
});

test('stores: odległość, formatowanie i nawigacja', () => {
  assert.ok(Math.abs(distanceMeters(52.37, 4.89, 52.38, 4.89) - 1112) < 15);
  assert.equal(fmtDistance(240), '240 m');
  assert.equal(fmtDistance(1540), '1.5 km');
  const favs = [{ id: 'chain:Aldi', chain: 'Aldi', name: 'Aldi' }, { id: 'n/1', chain: 'Lidl', name: 'Lidl Zuid', lat: 52.3, lon: 4.8 }];
  assert.equal(navigationUrl('Lidl', favs), 'geo:52.3,4.8?q=52.3,4.8(Lidl%20Zuid)');
  assert.equal(navigationUrl('Aldi', favs), 'geo:0,0?q=Aldi%20supermarkt'); // sieć bez konkretnego sklepu
  assert.match(navigationUrl('Lidl', favs, 'ios'), /^http:\/\/maps\.apple\.com\/\?daddr=52\.3,4\.8/);
  assert.deepEqual(favoriteChains(favs), ['Aldi', 'Lidl']);
});

import { parseNominatim } from '../src/stores.js';
import { mapHtml, COLORS } from '../src/mapHtml.js';
import { CHAINS } from '../src/stores.js';

test('Nominatim: współrzędne zamieniane na liczby, wpisy bez pozycji pomijane', () => {
  const out = parseNominatim([{ display_name: 'Utrecht, Nederland', lat: '52.09', lon: '5.12' }, { display_name: 'zły' }]);
  assert.deepEqual(out, [{ name: 'Utrecht, Nederland', lat: 52.09, lon: 5.12 }]);
  assert.deepEqual(parseNominatim(null), []);
});

test('mapa: strona zawiera API wołane z aplikacji i kolor każdej sieci', () => {
  const html = mapHtml({ lat: 51.9, lon: 4.5, zoom: 12 });
  for (const fn of ['window.setStores', 'window.setSelected', 'window.flyTo']) assert.ok(html.includes(fn), fn);
  assert.ok(html.includes('setView([51.9, 4.5], 12)'));
  for (const ch of CHAINS) assert.ok(COLORS[ch.id], `brak koloru dla ${ch.id}`);
});

test('mapa: zgłasza pozycję startową, nie tylko po przesunięciu', () => {
  assert.match(mapHtml(), /postView\(\);\s*\/\/ pozycja startowa/);
});
