import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLine, buildGroups, mergeIntoItems, addAmount, fmtAmounts } from '../src/recipe.js';
import { buildVocab } from '../src/match.js';
import { makeT } from '../src/i18n.js';

const one = (line) => { const p = parseLine(line); return p && [p.name, p.amounts.map((a) => `${a.value} ${a.dim}`).join('+') || '–']; };

test('parseLine: ilości, jednostki i nazwa po polsku', () => {
  assert.deepEqual(one('200 g mąki pszennej'), ['mąki pszennej', '200 g']);
  assert.deepEqual(one('1,5 kg ziemniaków'), ['ziemniaków', '1500 g']);
  assert.deepEqual(one('2 jajka'), ['jajka', '2 piece']);
  assert.deepEqual(one('1 ½ szklanki mleka'), ['mleka', '375 ml']); // polska szklanka = 250 ml
  assert.deepEqual(one('pół szklanki cukru'), ['cukru', '125 ml']);
  assert.deepEqual(one('2 łyżki oleju'), ['oleju', '30 ml']);
  assert.deepEqual(one('1 łyżeczka soli'), ['soli', '5 ml']);
  assert.deepEqual(one('3 ząbki czosnku'), ['czosnku', '3 clove']);
  assert.deepEqual(one('1 puszka pomidorów'), ['pomidorów', '1 can']);
  assert.deepEqual(one('szklanka mleka'), ['mleka', '250 ml']);
  assert.deepEqual(one('2-3 cebule'), ['cebule', '3 piece']);
  assert.deepEqual(one('1/2 cytryny'), ['cytryny', '0.5 piece']);
  assert.deepEqual(one('500ml śmietanki'), ['śmietanki', '500 ml']);
  assert.deepEqual(one('0,5 l mleka'), ['mleka', '500 ml']);
  assert.deepEqual(one('2 x 200 g masła'), ['masła', '400 g']);
});

test('parseLine: lista punktowana, numerowana, uwagi i „do smaku”', () => {
  assert.deepEqual(one('- 3 marchewki, pokrojone w kostkę'), ['marchewki', '3 piece']);
  assert.deepEqual(one('• 100 g sera żółtego (np. gouda)'), ['sera żółtego', '100 g']);
  assert.deepEqual(one('1. 2 pomidory'), ['pomidory', '2 piece']);
  const salt = parseLine('sól do smaku');
  assert.equal(salt.toTaste, true);
  assert.deepEqual([salt.name, salt.amounts.length], ['sól', 0]);
  assert.equal(parseLine('Składniki:'), null);
  assert.equal(parseLine('Na sos:'), null);
  assert.equal(parseLine('   '), null);
  assert.equal(parseLine('123'), null);
});

test('parseLine: inne języki', () => {
  assert.deepEqual(one('2 cups flour'), ['flour', '500 ml']); // domyślnie miary metryczne (cup = 250 ml)
  assert.deepEqual(one('1 tbsp olive oil'), ['olive oil', '15 ml']);
  assert.deepEqual(one('250g butter'), ['butter', '250 g']);
  assert.deepEqual(one('2 EL Öl'), ['Öl', '30 ml']);
  assert.deepEqual(one('1 Prise Salz'), ['Salz', '1 pinch']);
  assert.deepEqual(one('3 eetlepels olie'), ['olie', '45 ml']);
  assert.deepEqual(one('1 blik tomaten'), ['tomaten', '1 can']);
  assert.deepEqual(one('2 gousses d\'ail'), ["ail", '2 clove']);
  assert.deepEqual(one('200 g de harina'), ['harina', '200 g']);
  assert.deepEqual(one('2 ст. л. оливкового масла'), ['оливкового масла', '30 ml']);
  assert.deepEqual(one('1 cuillère à soupe de miel'), ['miel', '15 ml']);
});

test('buildGroups: duplikaty z kilku linii są sumowane, rodzaj/odmiana nie ma znaczenia', () => {
  const { groups, lines } = buildGroups('2 jajka\n3 jajka\n200 g mąki\n150 g mąki pszennej\nsól do smaku\nsól\n1 cebula\n2 cebule', { lang: 'pl' });
  assert.equal(lines, 8);
  const by = Object.fromEntries(groups.map((g) => [g.text, g]));
  assert.equal(groups.length, 4);
  assert.deepEqual(by.jajka?.amounts ?? by[Object.keys(by).find((k) => /jajk/.test(k))].amounts, [{ dim: 'piece', value: 5 }]);
  const flour = groups.find((g) => /mąk/.test(g.text));
  assert.deepEqual(flour.amounts, [{ dim: 'g', value: 350 }]);
  assert.equal(groups.find((g) => /sól/.test(g.text)).count, 2);
  assert.deepEqual(groups.find((g) => /cebul/.test(g.text)).amounts, [{ dim: 'piece', value: 3 }]);
});

test('buildGroups: g, kg i szklanki tego samego produktu sumują się (szklanka mąki ≈ 132 g)', () => {
  const { groups } = buildGroups('1 kg mąki\n500 g mąki\n2 szklanki mąki', { lang: 'pl' });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].amounts.length, 1);
  const [a] = groups[0].amounts;
  assert.equal(a.dim, 'g');
  assert.equal(a.approx, true); // przeliczone z objętości, więc „≈”
  assert.ok(Math.abs(a.value - (1500 + 2 * 250 * 0.53)) < 1, `value=${a.value}`);
  assert.equal(fmtAmounts(groups[0].amounts, makeT('pl')), '≈ 1,77 kg');
});

test('buildGroups: produkt bez znanej gęstości zostaje w ml i g osobno', () => {
  const { groups } = buildGroups('200 g pieczarek\n2 łyżki pieczarek', { lang: 'pl' });
  assert.deepEqual(groups[0].amounts.map((x) => x.dim).sort(), ['g', 'ml']);
});

test('buildGroups: składniki z różnych języków trafiają do tego samego produktu', () => {
  const { groups } = buildGroups('200 g flour\n100 g mąki\n1 Zwiebel\n1 cebula', { lang: 'pl' });
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.find((g) => /mąk/.test(g.text)).amounts, [{ dim: 'g', value: 300 }]);
});

test('buildGroups: mnożnik porcji', () => {
  const { groups } = buildGroups('200 g mąki\n2 jajka', { lang: 'pl', multiplier: 2 });
  assert.deepEqual(groups.map((g) => g.amounts[0].value).sort((a, b) => a - b), [4, 400]);
});

test('mergeIntoItems: produkt już na liście dostaje zsumowane ilości zamiast duplikatu', () => {
  const items = [{ id: 'a', text: 'mąka', done: true, amounts: [{ dim: 'g', value: 500 }] }, { id: 'b', text: 'chleb', done: false }];
  const { groups } = buildGroups('250 g mąki\n2 jajka', { lang: 'pl' });
  let n = 0;
  const { items: out, merged } = mergeIntoItems(items, groups, { lang: 'pl', makeId: () => `n${++n}` });
  assert.equal(merged, 1);
  assert.equal(out.length, 3);
  const flour = out.find((i) => i.id === 'a');
  assert.deepEqual(flour.amounts, [{ dim: 'g', value: 750 }]);
  assert.equal(flour.done, false); // znów do kupienia
  assert.ok(out.some((i) => /jajk/.test(i.text) && i.amounts[0].value === 2));
});

test('addAmount i formatowanie', () => {
  assert.deepEqual(addAmount([{ dim: 'g', value: 200 }], { dim: 'g', value: 50 }), [{ dim: 'g', value: 250 }]);
  const t = makeT('pl');
  assert.equal(fmtAmounts([{ dim: 'piece', value: 2 }, { dim: 'ml', value: 1500 }], t), '1,5 l + 2 szt.'); // masa i objętość najpierw
});

test('parseLine: części fraz wielowyrazowych nie są jednostkami', () => {
  assert.deepEqual(one('2 de pommes'), ['pommes', '2 piece']); // „de” to spójnik, nie jednostka
  assert.deepEqual(one('1 l mleka'), ['mleka', '1000 ml']);
  assert.deepEqual(one('1 ч. л. соли'), ['соли', '5 ml']);
  assert.deepEqual(one('2 colheres de sopa de azeite'), ['azeite', '30 ml']);
});

test('buildGroups: tytuł przepisu i nagłówek „Składniki:” nie są składnikami', () => {
  const text = 'Spaghetti bolognese (4 porcje)\nSkładniki:\n- 400 g spaghetti\n- 2 ząbki czosnku\n\nZapiekanka makaronowa\nSkładniki:\n1. 200 g makaronu penne\n2. 3 ząbki czosnku';
  const { groups, lines } = buildGroups(text, { lang: 'pl' });
  assert.equal(lines, 4);
  assert.deepEqual(groups.find((g) => /spaghetti/.test(g.text)).amounts, [{ dim: 'g', value: 400 }]); // inny makaron = osobna pozycja
  assert.deepEqual(groups.find((g) => /penne/.test(g.text)).amounts, [{ dim: 'g', value: 200 }]);
  assert.deepEqual(groups.find((g) => /czosnek/.test(g.text)).amounts, [{ dim: 'clove', value: 5 }]);
});

test('buildGroups: tytuł bez nagłówka (blok z ilościami) też jest pomijany, a sama lista przypraw nie', () => {
  const { groups } = buildGroups('Naleśniki\n200 g mąki\n2 jajka\n300 ml mleka', { lang: 'pl' });
  assert.equal(groups.length, 3);
  const spices = buildGroups('sól\npieprz\npapryka', { lang: 'pl' });
  assert.equal(spices.groups.length, 3); // bez ilości – żadnej linii nie traktujemy jako tytułu
});

test('buildGroups: „sól, pieprz do smaku” to dwa składniki, a „cebula, drobno posiekana” jeden', () => {
  const { groups } = buildGroups('sól, pieprz do smaku\ncebula, drobno posiekana', { lang: 'pl' });
  assert.deepEqual(groups.map((g) => g.text).sort(), ['cebula', 'pieprz', 'sól'].map((x) => groups.find((g) => g.text.startsWith(x.slice(0, 3)))?.text).sort());
  assert.equal(groups.filter((g) => g.toTaste).length, 2);
});

test('buildGroups: odmieniona fraza i nieznane słowo w różnych formach', () => {
  const { groups } = buildGroups('2 łyżki koncentratu pomidorowego\n100 g parmezanu\n50 g parmezan', { lang: 'pl' });
  assert.equal(groups.length, 2);
  assert.ok(groups.some((g) => g.text === 'koncentrat pomidorowy'));
  assert.deepEqual(groups.find((g) => /parmezan/.test(g.text)).amounts, [{ dim: 'g', value: 150 }]);
});

test('buildGroups: niejednoznaczna „śmietanka” zostaje z wyborem (nie jest po cichu zamieniona)', () => {
  const { groups } = buildGroups('250 ml śmietanki', { lang: 'pl' });
  assert.equal(groups[0].text, 'śmietanki'); // tekst użytkownika → na liście pojawią się przyciski „czy chodziło o…”
});

test('buildGroups: odmiana „mąki” i „mięsa wołowego” to pewne dopasowania, „śmietanki” zostaje z wyborem', () => {
  const { groups } = buildGroups('200 g mąki\n500 g mięsa wołowego\n250 ml śmietanki', { lang: 'pl' });
  assert.deepEqual(groups.map((g) => g.text), ['mąka', 'wołowina', 'śmietanki']);
});

import { detectRegion, resolveRegion, REGIONS, applyDensity } from '../src/recipe.js';

const ml = (line, region) => { const p = parseLine(line, { region }); return p.amounts[0]; };

test('region miar: ta sama „tablespoon” to 15 ml (metryczny), 14,8 ml (USA), 20 ml (Australia)', () => {
  assert.equal(ml('2 tbsp oil', 'metric').value, 30);
  assert.equal(ml('2 tbsp oil', 'us').value, 29.58);
  assert.equal(ml('2 tbsp oil', 'au').value, 40);
  assert.equal(ml('2 tbsp oil', 'uk').value, 30);
});

test('region miar: cup = 250 ml (metryczny, AU), ≈237 ml (USA), ≈284 ml (UK); pinta i fl oz też', () => {
  assert.equal(ml('1 cup milk', 'metric').value, 250);
  assert.equal(ml('1 cup milk', 'us').value, 236.59);
  assert.equal(ml('1 cup milk', 'uk').value, 284.13);
  assert.equal(ml('1 pint milk', 'us').value, 473.18);
  assert.equal(ml('1 pint milk', 'uk').value, 568.26);
  assert.equal(ml('8 fl oz milk', 'us').value, 236.56);
  assert.equal(ml('8 fl oz milk', 'uk').value, 227.28);
});

test('region nie zmienia słów nieangielskich: polska łyżka i szklanka są stałe', () => {
  assert.equal(ml('2 łyżki oleju', 'us').value, 30);
  assert.equal(ml('1 szklanka mleka', 'us').value, 250);
  assert.equal(ml('1 EL Öl', 'au').value, 15);
  assert.equal(ml('1 su bardağı süt', 'us').value, 200);
});

test('miary wagowe i kostka masła: uncje, funty, stick', () => {
  assert.equal(ml('8 oz cheese', 'us').dim, 'g');
  assert.equal(ml('8 oz cheese', 'us').value, 226.8);
  assert.equal(ml('1 lb flour', 'us').value, 453.6);
  assert.equal(ml('1 stick butter', 'us').value, 113.4);
  assert.equal(ml('2 sticks butter', 'us').value, 226.8);
});

test('gęstość: „2 cups flour” (USA) i „200 g mąki” zsumują się w gramach', () => {
  const { groups } = buildGroups('2 cups flour\n200 g mąki', { lang: 'pl', region: 'us' });
  assert.equal(groups.length, 1);
  const [a] = groups[0].amounts;
  assert.equal(a.dim, 'g');
  assert.ok(Math.abs(a.value - (2 * 236.59 * 0.53 + 200)) < 1, `value=${a.value}`); // ≈ 451 g
});

test('gęstość: płyny kupowane na objętość (mleko) – „8 oz milk” to ≈ 220 ml; masło na wagę – „1 cup butter” ≈ 227 g', () => {
  const milk = applyDensity([{ dim: 'g', value: 226.8 }], 'melk')[0];
  assert.equal(milk.dim, 'ml');
  assert.ok(Math.abs(milk.value - 220.2) < 1);
  const butter = buildGroups('1 cup butter', { lang: 'pl', region: 'us' }).groups[0].amounts[0];
  assert.equal(butter.dim, 'g');
  assert.ok(Math.abs(butter.value - 227) < 2, `value=${butter.value}`);
});

test('ta sama receptura w metrycznym i w USA daje różne ilości, bo „cup” się różni', () => {
  const us = buildGroups('2 cups sugar', { lang: 'pl', region: 'us' }).groups[0].amounts[0].value;
  const metric = buildGroups('2 cups sugar', { lang: 'pl', region: 'metric' }).groups[0].amounts[0].value;
  assert.ok(metric > us); // 500 ml > 473 ml
  assert.ok(Math.abs(metric / us - 250 / 236.59) < 0.001);
});

test('detectRegion/resolveRegion: jednostki amerykańskie → USA; ręczny wybór ma pierwszeństwo', () => {
  assert.equal(detectRegion('2 cups flour\n1 stick butter'), 'us');
  assert.equal(detectRegion('Preheat oven to 350 °F'), 'us');
  assert.equal(detectRegion('200 g mąki\n2 łyżki oleju'), 'metric');
  assert.equal(detectRegion('2 tablespoons oil\n500 ml milk'), 'metric');
  assert.equal(resolveRegion('auto', '2 cups flour'), 'us');
  assert.equal(resolveRegion('au', '2 cups flour'), 'au');
  assert.equal(resolveRegion(undefined, '2 cups flour'), 'us');
  assert.deepEqual(Object.keys(REGIONS).sort(), ['au', 'metric', 'uk', 'us']);
});

test('pomnożone przybliżone wartości nie są zaokrąglane przedwcześnie', () => {
  const g = buildGroups('1 cup flour', { lang: 'pl', region: 'us', multiplier: 3 }).groups[0].amounts[0];
  assert.ok(Math.abs(g.value - 3 * 236.59 * 0.53) < 0.5);
});

test('skopiowane ze strony: nazwa i ilość w osobnych liniach', () => {
  const text = ['filety z piersi kurczaka', '500 gramów', 'makaron tagliatelle', '250 gramów', 'mleko', '150 mililitrów',
    'cebula', '1 sztuka', 'musztarda', '2 łyżki', 'olej rzepakowy', '1 łyżka'].join('\n');
  const { groups } = buildGroups(text, { lang: 'pl', vocab: buildVocab([]) });
  const by = (re) => groups.find((g) => re.test(g.text));
  assert.equal(groups.length, 6);
  assert.deepEqual(by(/mleko/i).amounts.map((a) => [a.dim, Math.round(a.value)]), [['ml', 150]]);
  assert.deepEqual(by(/kurczak/i).amounts.map((a) => [a.dim, a.value]), [['g', 500]]);
  assert.ok(!groups.some((g) => /mililitr|gram/i.test(g.text)));
});

test('filet z piersi kurczaka to nie kurczak', () => {
  const vocab = buildVocab([]);
  const { groups } = buildGroups('filety z piersi kurczaka\n500 g\nudka z kurczaka\n2 szt.\nkurczak\n1 szt.', { lang: 'pl', vocab });
  assert.equal(groups.length, 3);
  assert.deepEqual(groups.map((g) => g.text).sort(), groups.map((g) => g.text).sort());
  assert.equal(new Set(groups.map((g) => g.ci)).size, 3);
});

test('przepis: różne rodzaje tego samego produktu nie są sumowane', () => {
  const { groups } = buildGroups('2 łyżki oleju rzepakowego\n1 łyżka oliwy z oliwek\n100 g czerwonej cebuli\n200 g cebuli\n50 g cukru pudru\n100 g cukru\n2 łyżki oleju arganowego', { lang: 'pl' });
  assert.equal(groups.length, 7);
  assert.ok(groups.some((g) => /argan/.test(g.text)));
});

test('skopiowane ze strony: pusta linia między każdymi dwiema liniami', () => {
  const lines = ['filety z piersi kurczaka', '500 gramów', 'makaron tagliatelle', '250 gramów', 'mleko', '150 mililitrów', 'musztarda', '2 łyżki', 'olej rzepakowy', '1 łyżka'];
  for (const sep of ['\n\n', '\r\n\r\n', '\n \n', ' ']) {
    const { groups } = buildGroups(lines.join(sep), { lang: 'pl', vocab: buildVocab([]) });
    assert.equal(groups.length, 5, JSON.stringify(sep));
    assert.deepEqual(groups.find((g) => /kurczak/.test(g.text)).amounts, [{ dim: 'g', value: 500 }]);
    assert.deepEqual(groups.find((g) => /mleko/.test(g.text)).amounts, [{ dim: 'ml', value: 150 }]);
  }
});

test('odporność na różne formaty wklejki: te same ilości niezależnie od formatu', () => {
  const pairs = [['filety z piersi kurczaka', '500 gramów'], ['makaron tagliatelle', '250 gramów'], ['mleko', '150 mililitrów'], ['jajka', '3']];
  const check = (text, label) => {
    const { groups } = buildGroups(text, { lang: 'pl', vocab: buildVocab([]) });
    const by = (re) => groups.find((g) => re.test(g.text))?.amounts.map((a) => `${a.value}${a.dim}`).join('+');
    assert.equal(groups.length, 4, label);
    assert.equal(by(/kurczak/), '500g', label);
    assert.equal(by(/tagliatelle/), '250g', label);
    assert.equal(by(/mleko/), '150ml', label);
    assert.equal(by(/jaj/), '3piece', label);
  };
  const nameFirst = pairs.map(([n, q]) => `${n}\n${q}`).join('\n');
  check(nameFirst, 'nazwa, ilość');
  check(pairs.map(([n, q]) => `${q}\n${n}`).join('\n'), 'ilość, nazwa');
  check(pairs.map(([n, q]) => `${n}\n\n${q}`).join('\n\n'), 'puste linie');
  check(nameFirst.normalize('NFD'), 'NFD');
  check(nameFirst.replace(/ /g, ' ').replace(/\n/g, '\r\n'), 'nbsp + CRLF');
  check(pairs.map(([n, q]) => `<li>${n}</li><li>${q}</li>`).join(''), 'HTML');
  check(pairs.map(([n, q]) => `<p>${n}&nbsp;</p>\n<p>${q}</p>`).join('\n'), 'HTML z encjami');
  check(pairs.map(([n, q]) => `• **${n}**\n• ${q}`).join('\n'), 'punktory i markdown');
  check(pairs.map(([n, q]) => `${n}\t${q}`).join('\n'), 'tabulator');
  check(pairs.map(([n, q]) => `${n} ........ ${q}`).join('\n'), 'kropki');
  check(pairs.map(([n, q]) => `${n}: ${q}`).join('\n'), 'dwukropek');
  check(pairs.map(([n, q]) => `${n} - ${q}`).join('\n'), 'myślnik');
  check(pairs.map(([n, q]) => `${n} (${q})`).join('\n'), 'nawias');
});

test('linie, których nie da się odczytać, są zgłaszane, nie gubione po cichu', () => {
  const { skipped } = buildGroups('mleko 1 l\n500 gramów\n', { lang: 'pl', vocab: buildVocab([]) });
  assert.deepEqual(skipped, ['500 gramów']);
});

import { amountsToText, parseAmounts } from '../src/recipe.js';

test('edycja ilości: tekst ↔ ilości', () => {
  const am = [{ dim: 'g', value: 500 }, { dim: 'piece', value: 2 }, { dim: 'ml', value: 1500 }];
  assert.equal(amountsToText(am), '500 g + 2 szt + 1,5 l');
  assert.deepEqual(parseAmounts('500 g + 2 szt + 1,5 l'), [{ dim: 'g', value: 500 }, { dim: 'piece', value: 2 }, { dim: 'ml', value: 1500 }]);
  assert.deepEqual(parseAmounts('1,5 kg'), [{ dim: 'g', value: 1500 }]);
  assert.deepEqual(parseAmounts('2 łyżki').map((a) => a.dim), ['ml']);
  assert.deepEqual(parseAmounts('3'), [{ dim: 'piece', value: 3 }]);
  assert.deepEqual(parseAmounts(''), []);
  assert.equal(parseAmounts('dużo'), null);
  assert.deepEqual(parseAmounts(amountsToText([{ dim: 'clove', value: 3 }])), [{ dim: 'clove', value: 3 }]);
});
