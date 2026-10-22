// Kondycja słownika: czy słowa mają oferty, czy nie dają podejrzanie dużo trafień i które są niejednoznaczne.
import { LANGS } from './data/glossary.js';
import { concepts, dutchName, matchDeals, nlTerms, norm } from './match.js';

export const MANY_DEALS = 15; // tyle ofert dla jednego produktu to już podejrzanie dużo (np. zbyt szerokie słowo)

/**
 * Raport o słowniku względem aktualnych ofert.
 * - noDeals: produkty bez żadnej oferty (to normalne, jeśli nie ma promocji, ale też sygnał, że hasło po holendersku nie pasuje),
 * - tooMany: produkty z ≥ MANY_DEALS ofert (możliwe fałszywe trafienia),
 * - ambiguous: słowa w języku `lang` opisujące kilka produktów (aplikacja pyta, o który chodzi),
 * - shared: słowa wspólne dla kilku języków (rozstrzyga język interfejsu),
 * - missing: brakujące nazwy w którymś języku.
 */
export function vocabHealth(deals, lang) {
  const noDeals = [];
  const tooMany = [];
  for (const c of concepts) {
    const n = matchDeals(nlTerms(c.id), deals, c.id).length;
    if (n === 0) noDeals.push({ ci: c.id, name: dutchName(c.id) });
    else if (n >= MANY_DEALS) tooMany.push({ ci: c.id, name: dutchName(c.id), n });
  }
  tooMany.sort((a, b) => b.n - a.n);

  const byTerm = new Map(); // termin -> Map(id pojęcia -> Set(języków))
  const original = new Map(); // termin znormalizowany -> pierwsza oryginalna pisownia (z polskimi znakami)
  const missing = [];
  let terms = 0;
  for (const c of concepts) {
    for (const l of LANGS) {
      if (!c.names[l]?.length) missing.push({ ci: c.id, lang: l, name: dutchName(c.id) });
      for (const name of c.names[l] ?? []) {
        terms++;
        const t = norm(name);
        if (!original.has(t) || l === lang) original.set(t, name); // pisownia w języku użytkownika ma pierwszeństwo
        const m = byTerm.get(t) ?? new Map();
        m.set(c.id, (m.get(c.id) ?? new Set()).add(l));
        byTerm.set(t, m);
      }
    }
  }
  const ambiguous = [];
  const shared = [];
  for (const [term, m] of byTerm) {
    if (m.size < 2) continue;
    const entry = { term, display: original.get(term) ?? term, names: [...m.keys()].map(dutchName) };
    const inLang = [...m.values()].filter((langs) => langs.has(lang)).length;
    if (inLang >= 2) ambiguous.push(entry);
    else shared.push(entry);
  }
  return { products: concepts.length, terms, languages: LANGS.length, noDeals, tooMany, ambiguous, shared, missing };
}

/** Zliczenie wyników rozpoznawania pozycji z listy (statusy z match.resolve). */
export function listStats(statuses) {
  const s = { recognized: 0, fuzzy: 0, translated: 0, unknown: 0 };
  for (const st of statuses) {
    if (st === 'unknown') s.unknown++;
    else if (st === 'translated') s.translated++;
    else if (st === 'fuzzy' || st === 'dutch-fuzzy') s.fuzzy++;
    else s.recognized++;
  }
  return s;
}
