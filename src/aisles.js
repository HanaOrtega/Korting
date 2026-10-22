// Działy sklepu: kolejność zakupów „po drodze”, żeby nie wracać w to samo miejsce. Dział wynika z sekcji słownika,
// z kilkoma wyjątkami po nazwie; produkty szczegółowe (np. olej rzepakowy) dziedziczą dział po nadrzędnym.
import { SECTIONS } from './data/glossary.js';
import { concepts, parentOf } from './match.js';

export const AISLES = ['produce', 'bakery', 'meat', 'dairy', 'pantry', 'frozen', 'drinks', 'household', 'other'];

const BY_SECTION = [
  [/nabiał|śmietana/, 'dairy'], [/mięso i ryby/, 'meat'], [/owoce|warzywa/, 'produce'], [/pieczywo/, 'bakery'],
  [/suche/, 'pantry'], [/^napoje$/, 'drinks'], [/dom i higiena/, 'household'],
];
const OVERRIDE = {
  diepvries: 'frozen', ijs: 'frozen', pizza: 'frozen', friet: 'frozen',
  roomkaas: 'dairy', mozzarella: 'dairy', feta: 'dairy', karnemelk: 'dairy', kefir: 'dairy', drinkyoghurt: 'dairy', chocolademelk: 'dairy', tofu: 'dairy', hummus: 'dairy',
  pannenkoeken: 'bakery', wafels: 'bakery', muffins: 'bakery', wraps: 'bakery',
  whisky: 'drinks', prosecco: 'drinks', cider: 'drinks', ijsthee: 'drinks', smoothie: 'drinks',
  tissues: 'household', maandverband: 'household', deodorant: 'household', scheermesjes: 'household', aluminiumfolie: 'household', schoonmaakmiddel: 'household',
  kokosmelk: 'pantry', chocolade: 'pantry', snoep: 'pantry', chips: 'pantry', koekjes: 'pantry', hagelslag: 'pantry',
};

/** Dział dla pojęcia (id ze słownika); brak pojęcia → 'other'. */
export function aisleOf(ci) {
  if (ci == null) return 'other';
  const nl = concepts[ci].names.nl[0];
  if (OVERRIDE[nl]) return OVERRIDE[nl];
  const parent = parentOf(ci);
  if (parent != null) return aisleOf(parent);
  const sec = SECTIONS[ci] ?? '';
  if (/dodatkowe: mięso/.test(sec)) return 'meat';
  if (/dodatkowe: owoce/.test(sec)) return 'produce';
  if (/dodatkowe: pieczywo/.test(sec)) return 'pantry';
  if (/dodatkowe: napoje/.test(sec)) return 'drinks';
  return BY_SECTION.find(([re]) => re.test(sec))?.[1] ?? 'other';
}

/** Pozycje pogrupowane w działach, w kolejności działów: [{ aisle, entries: [...] }]. `ciOf(entry)` zwraca id pojęcia. */
export function groupByAisle(entries, ciOf) {
  const map = new Map(AISLES.map((a) => [a, []]));
  for (const e of entries) map.get(aisleOf(ciOf(e))).push(e);
  return AISLES.map((aisle) => ({ aisle, entries: map.get(aisle) })).filter((g) => g.entries.length);
}
