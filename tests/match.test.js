import test from 'node:test';
import assert from 'node:assert/strict';
import { ROWS, LANGS } from '../src/data/glossary.js';
import { resolve, suggest, matchDeals, buildVocab, dutchName, displayName, norm, distance } from '../src/match.js';

test('słownik: każdy wiersz ma kolumnę dla każdego języka', () => {
  const bad = ROWS.filter((r) => r.split(';').length !== LANGS.length);
  assert.deepEqual(bad, []);
});

test('norm usuwa akcenty i ujednolica pisownię', () => {
  assert.equal(norm('Käse'), 'kase');
  assert.equal(norm('Łosoś'), 'losos');
  assert.equal(norm('ÇILEK'), 'cilek');
  assert.equal(norm("м'ясо"), 'мясо');
});

test('distance obsługuje zamianę sąsiednich liter', () => {
  assert.equal(distance('mleko', 'melko'), 1);
  assert.equal(distance('kaas', 'kaas'), 0);
});

const cases = [
  ['mleko', 'melk'], ['Milch', 'melk'], ['lait', 'melk'], ['молоко', 'melk'], ['süt', 'melk'],
  ['chleb', 'brood'], ['kurczak', 'kipfilet'], ['ser', 'kaas'], ['jajka', 'eieren'],
  ['pomidory', 'tomaten'], ['κ', null],
];
for (const [input, nl] of cases) {
  test(`rozpoznaje „${input}”`, () => {
    const r = resolve(input);
    if (nl === null) return assert.equal(r.ci, null);
    assert.equal(dutchName(r.ci), nl);
  });
}

test('ilości i jednostki są ignorowane', () => {
  assert.equal(dutchName(resolve('2 x mleko 1,5 l').ci), 'melk');
  assert.equal(dutchName(resolve('chleb razowy').ci), 'brood');
});

test('literówki są poprawiane i oznaczane jako fuzzy', () => {
  for (const [typo, nl] of [['mlko', 'melk'], ['kurzcak', 'kipfilet'], ['pomidroy', 'tomaten'], ['bananny', 'bananen'], ['cebula', 'uien']]) {
    const r = resolve(typo);
    assert.equal(dutchName(r.ci), nl, typo);
  }
  assert.equal(resolve('mlko').status, 'fuzzy');
});

test('krótkie słowa nie są poprawiane na siłę', () => {
  assert.equal(resolve('xyz').status, 'unknown');
});

const deals = [
  { name: 'Halfvolle melk 1 L', price: 1.09, validUntil: '2026-10-20' },
  { name: 'Melkchocolade reep', price: 1.5, validUntil: '2026-10-20' },
  { name: 'Alle Kipfilet', price: 4.99, validUntil: '2026-10-20' },
  { name: 'Verse kipfilet 500 g', price: 3.99, validUntil: '2026-10-20' },
  { name: 'Hertog Jan pils', price: null, validUntil: '2026-10-19' },
];

test('dopasowanie: mocne trafienia wypierają słabe, sortowanie od najtańszej', () => {
  assert.deepEqual(matchDeals(resolve('mleko').terms, deals).map((d) => d.name), ['Halfvolle melk 1 L']);
  assert.deepEqual(matchDeals(resolve('kurczak').terms, deals).map((d) => d.price), [3.99, 4.99]);
});

test('początek wyrazu to nie trafienie, ale liczba mnoga i zdrobnienie tak', () => {
  assert.equal(matchDeals(['melk'], [{ name: 'Melkchocolade reep', price: 1 }]).length, 0);
  assert.equal(matchDeals(['boter'], [{ name: 'Frisse boterhamspread', price: 1 }]).length, 0);
  assert.equal(matchDeals(['tomaat'], [{ name: 'Snackgroente tomaatjes', price: 1 }]).length, 1);
  assert.equal(matchDeals(['appel'], [{ name: 'Gala appels', price: 1 }]).length, 1);
  assert.equal(matchDeals(['kaas'], [{ name: 'Kaasje', price: 1 }]).length, 1);
});

test('holenderskie słowa z promocji: dokładne i z literówką', () => {
  const vocab = buildVocab([{ name: 'Speculaas gevuld' }, { name: 'Pindakaas' }]);
  assert.equal(resolve('speculaas', vocab).status, 'dutch');
  const r = resolve('spekulaas', vocab);
  assert.equal(r.status, 'dutch-fuzzy');
  assert.deepEqual(r.terms, ['speculaas']);
});

test('podpowiedzi podczas pisania', () => {
  assert.ok(suggest('mle', 'pl').map((ci) => displayName(ci, 'pl')).includes('mleko'));
  assert.ok(suggest('mlko', 'pl').map((ci) => dutchName(ci)).includes('melk'));
  assert.deepEqual(suggest('m', 'pl'), []);
});

test('karma dla zwierząt nie jest pokazywana przy szukaniu mięsa', () => {
  const food = [{ name: 'Hondenvoer kuipje senior kip', price: 0.49 }, { name: 'Kipfilet', price: 2 }];
  assert.deepEqual(matchDeals(resolve('kurczak').terms, food).map((d) => d.name), ['Kipfilet']);
  assert.equal(matchDeals(resolve('karma dla psa').terms, food).length, 1);
});

test('odmiana: końcówki fleksyjne nie psują rozpoznania', () => {
  for (const [input, nl] of [['pomidorów', 'tomaten'], ['masła', 'boter'], ['chleba', 'brood'], ['jabłek', 'appels'],
    ['ziemniaków', 'aardappelen'], ['kurczaka', 'kipfilet'], ['sera', 'kaas'], ['jajek', 'eieren']]) {
    assert.equal(dutchName(resolve(input).ci), nl, input);
  }
});

test('z kilku słów wygrywa właściwe: „piersi z kurczaka” to kurczak, a „mleko kokosowe” to kokosmelk', () => {
  assert.equal(dutchName(resolve('piersi z kurczaka').ci), 'kipfilet');
  assert.equal(dutchName(resolve('mleko kokosowe').ci), 'kokosmelk');
});

test('dokładne holenderskie słowo z promocji wygrywa z domysłem literówki', () => {
  const vocab = buildVocab([{ name: 'Tompouce' }, { name: 'Roomboter' }]);
  assert.equal(resolve('tompouce', vocab).status, 'dutch');
});

test('tłumaczenie: nierozpoznane słowo jest rozpoznawane po przetłumaczeniu', () => {
  const vocab = buildVocab([{ name: 'Tuinkers bakje' }]);
  assert.equal(resolve('rzeżucha', vocab).status, 'unknown');
  const r = resolve('rzeżucha', vocab, 'tuinkers');
  assert.equal(r.status, 'translated');
  assert.deepEqual(r.terms, ['tuinkers']);
  assert.equal(matchDeals(r.terms, [{ name: 'Tuinkers bakje', price: 1 }]).length, 1);
  // tłumaczenie na słowo ze słownika → pojęcie
  assert.equal(dutchName(resolve('rzeżucha', vocab, 'melk').ci), 'melk');
});

test('ziemniak (aardappel) nie jest jabłkiem (appel)', () => {
  const d = [{ name: 'Aardappel Anders', price: 1 }, { name: 'Elstar appels', price: 2 }];
  assert.deepEqual(matchDeals(resolve('jabłka').terms, d).map((x) => x.name), ['Elstar appels']);
});

const nm = (input, list) => { const r = resolve(input); return matchDeals(r.terms, list, r.ci).map((d) => d.name); };

test('masło: bez croissantów z masłem i innych produktów, w których masło to tylko dodatek', () => {
  const list = [
    { name: 'Campina roomboter', price: 2 },
    { name: 'Roomboter croissants', price: 1 },
    { name: 'Croissants met roomboter', price: 1 },
    { name: 'Boterkoek met amandel', price: 3 },
    { name: 'Pizza met kaas en boter', price: 3 },
    { name: 'Blue Band boter', price: 2.5 },
  ];
  assert.deepEqual(nm('masło', list).sort(), ['Blue Band boter', 'Campina roomboter']);
});

test('dodatki po „met / in / voor” nie liczą się jako produkt', () => {
  const list = [{ name: 'Tonijn in olie', price: 1 }, { name: 'Zonnebloemolie', price: 3 }, { name: 'Hondenvoer met kip', price: 1 }];
  assert.deepEqual(nm('olej', list), ['Zonnebloemolie']);
  assert.deepEqual(nm('tuńczyk', list), ['Tonijn in olie']);
  assert.deepEqual(nm('kurczak', list), []);
});

test('osobne produkty ze słownika nie podszywają się pod siebie (mleko ≠ czekoladowe mleko, kawa ≠ kawa mrożona jest OK)', () => {
  const list = [{ name: 'Halfvolle melk', price: 1 }, { name: 'Chocolademelk', price: 1 }, { name: 'Alle Douwe Egberts ijskoffie', price: 1 }];
  assert.deepEqual(nm('mleko', list), ['Halfvolle melk']);
  assert.deepEqual(nm('kawa', list), ['Alle Douwe Egberts ijskoffie']);
});

test('ilości na końcu nazwy nie zaburzają rozpoznania produktu', () => {
  const list = [{ name: 'Verse kipfilet 500 g', price: 3 }, { name: 'Pils 6 pack', price: 4 }];
  assert.deepEqual(nm('kurczak', list), ['Verse kipfilet 500 g']);
  assert.deepEqual(nm('piwo', list), ['Pils 6 pack']);
});

test('fałszywe złożenia: granat to nie jabłko, folia to nie olej', () => {
  const list = [{ name: 'Granaatappel', price: 1 }, { name: 'Rasterfolie 3 x 4 m', price: 2 }, { name: 'Elstar appels', price: 2 }, { name: 'Olijfolie', price: 5 }];
  assert.deepEqual(nm('jabłka', list), ['Elstar appels']);
  assert.deepEqual(nm('oliwa', list), ['Olijfolie']);
});

import { concepts } from '../src/match.js';

test('słownik: pierwsza nazwa każdego produktu w każdym języku rozpoznaje właśnie ten produkt (z preferencją języka)', () => {
  // inaczej użytkownik wpisujący słowo w swoim języku dostawałby inny produkt niż ten, który to słowo opisuje
  const bad = [];
  for (const c of concepts) {
    for (const [lang, names] of Object.entries(c.names)) {
      const r = resolve(names[0], undefined, null, lang);
      if (r.ci !== c.id) bad.push(`${lang}:"${names[0]}" → ${r.ci == null ? r.status : dutchName(r.ci)} (miało być ${c.names.nl[0]})`);
    }
  }
  assert.deepEqual(bad, []);
});

test('śmietana, śmietanka i inne „bliźniaki”: różne produkty, z wyborem gdy niejednoznaczne', () => {
  const pl = (w) => resolve(w, undefined, null, 'pl');
  assert.equal(dutchName(pl('śmietana').ci), 'zure room');
  assert.equal(pl('śmietana').status, 'ambiguous');
  assert.ok(pl('śmietana').alts.map(dutchName).includes('crème fraîche'));
  assert.equal(dutchName(pl('śmietanka').ci), 'slagroom');
  assert.deepEqual(pl('śmietanka').alts.map(dutchName).sort(), ['koffiemelk', 'kookroom']);
  assert.equal(dutchName(pl('śmietana kwaśna').ci), 'zure room');
  assert.equal(dutchName(pl('śmietanka do gotowania').ci), 'kookroom');
  assert.equal(dutchName(pl('śmietanka do kawy').ci), 'koffiemelk');
  assert.equal(dutchName(pl('szynka').ci), 'ham');
  assert.equal(dutchName(pl('wędlina').ci), 'vleeswaren');
  assert.equal(dutchName(pl('parówki').ci), 'knakworst');
  assert.equal(dutchName(pl('oliwa').ci), 'olijfolie');
  assert.equal(dutchName(pl('olej').ci), 'olie');
  assert.equal(dutchName(pl('kefir').ci), 'kefir');
  assert.equal(dutchName(pl('limonka').ci), 'limoen');
});

test('rozdzielone produkty nie mieszają ofert: śmietanka (slagroom) ≠ zure room, szynka ≠ wędlina', () => {
  const deals = [{ name: 'Zure room 150 ml', price: 1 }, { name: 'Verse slagroom 250 ml', price: 2 }, { name: 'Kookroom 250 ml', price: 1 },
    { name: 'Achterham', price: 2 }, { name: 'Voorverpakte vleeswaren', price: 2 }, { name: 'Crème fraîche', price: 2 }];
  const names = (w) => { const r = resolve(w, undefined, null, 'pl'); return matchDeals(r.terms, deals, r.ci).map((d) => d.name); };
  assert.deepEqual(names('śmietana kwaśna'), ['Zure room 150 ml']);
  assert.deepEqual(names('śmietanka do ubijania'), ['Verse slagroom 250 ml']);
  assert.deepEqual(names('śmietanka do gotowania'), ['Kookroom 250 ml']);
  assert.deepEqual(names('szynka'), ['Achterham']);
  assert.deepEqual(names('wędlina'), ['Voorverpakte vleeswaren']);
});

test('język użytkownika rozstrzyga słowa wspólne dla kilku języków („pasta”, „miel”)', () => {
  assert.equal(dutchName(resolve('pasta', undefined, null, 'tr').ci), 'taart'); // po turecku: ciasto
  assert.equal(dutchName(resolve('pasta', undefined, null, 'it').ci), 'pasta');
  assert.equal(dutchName(resolve('miel', undefined, null, 'fr').ci), 'honing');
  assert.equal(dutchName(resolve('miel', undefined, null, 'ro').ci), 'lamsvlees');
  assert.equal(dutchName(resolve('pommes', undefined, null, 'de').ci), 'friet');
  assert.equal(dutchName(resolve('pommes', undefined, null, 'fr').ci), 'appels');
});

test('wędlina nie łapie dojrzałego sera („belegen” to nie „beleg”)', () => {
  const deals = [{ name: 'Goudse jong belegen kaas', price: 3 }, { name: 'Voorverpakte vleeswaren', price: 2 }];
  const r = resolve('wędlina', undefined, null, 'pl');
  assert.deepEqual(matchDeals(r.terms, deals, r.ci).map((d) => d.name), ['Voorverpakte vleeswaren']);
});
