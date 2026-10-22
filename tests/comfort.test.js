import test from 'node:test';
import assert from 'node:assert/strict';
import { calmPalette, DEFAULTS, expiryReminder, mergeComfort, weeklyTrigger } from '../src/comfort.js';
import { dark, light } from '../src/theme.js';

const lum = (hex) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('spokojna paleta: przycisk i tekst zachowują kontrast WCAG AA', () => {
  for (const [p, isDark] of [[light, false], [dark, true]]) {
    const c = calmPalette(p, isDark);
    assert.ok(ratio(c.primary, c.primaryInk) >= 4.5, `przycisk ${isDark}`);
    assert.ok(ratio(c.fg, c.bg) >= 7, `tekst ${isDark}`);
    assert.ok(ratio(c.mut, c.bg) >= 4, `tekst pomocniczy ${isDark}`);
    assert.ok(ratio(c.primaryDeep, c.primaryTint) >= 4.5, `plakietka ${isDark}`);
  }
});

test('ustawienia: domyślnie wszystko wyłączone, zapisane wartości nakładają się częściowo', () => {
  assert.equal(DEFAULTS.focus, false); assert.equal(DEFAULTS.weekly.on, false);
  const m = mergeComfort({ calm: true, weekly: { on: true } });
  assert.equal(m.calm, true); assert.equal(m.weekly.on, true); assert.equal(m.weekly.hour, 10); assert.equal(m.scale, 0);
});

test('przypomnienie tygodniowe: dzień ISO → weekday expo (1 = niedziela)', () => {
  assert.equal(weeklyTrigger({ day: 1, hour: 9, minute: 5 }).weekday, 2); // poniedziałek
  assert.equal(weeklyTrigger({ day: 6, hour: 9, minute: 0 }).weekday, 7); // sobota
  assert.equal(weeklyTrigger({ day: 7, hour: 9, minute: 0 }).weekday, 1); // niedziela
});

test('przypomnienie o kończących się promocjach: dzień przed końcem, najwcześniejsza, pomija odhaczone i przeszłe', () => {
  const now = new Date(2026, 9, 20, 12, 0);
  const rows = [
    { item: { text: 'mleko', done: false }, hits: [{ store: 'Lidl', validUntil: '2026-10-25' }, { store: 'Aldi', validUntil: '2026-10-28' }] },
    { item: { text: 'masło', done: false }, hits: [{ store: 'Jumbo', validUntil: '2026-10-25' }] },
    { item: { text: 'chleb', done: true }, hits: [{ store: 'Dirk', validUntil: '2026-10-22' }] },
    { item: { text: 'ser', done: false }, hits: [{ store: 'Plus', validUntil: '2026-10-20' }] }, // dzień przed już minął
  ];
  const r = expiryReminder(rows, now, 9);
  assert.equal(r.at.getTime(), new Date(2026, 9, 24, 9, 0).getTime());
  assert.deepEqual(r.entries.map((e) => e.text).sort(), ['masło', 'mleko']);
  assert.equal(expiryReminder([], now, 9), null);
});
