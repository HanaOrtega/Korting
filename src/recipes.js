// Książka przepisów: zapisane przepisy (tytuł, porcje, składniki jako wklejony tekst, kroki, źródło). Składniki są
// parsowane dopiero przy dodawaniu do listy (buildGroups), więc zawsze korzystają z aktualnego słownika i regionu miar.
import { norm } from './match.js';

export const DEFAULT_SERVINGS = 4;

export function newRecipe({ title, servings = DEFAULT_SERVINGS, ingredients = '', steps = '', source = '' }, now = Date.now()) {
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    title: String(title ?? '').trim(), servings: Math.max(1, Math.round(Number(servings)) || DEFAULT_SERVINGS),
    ingredients: String(ingredients).trim(), steps: String(steps).trim(), source: String(source).trim(),
    fav: false, created: now, updated: now,
  };
}

export const updateRecipe = (r, patch, now = Date.now()) => ({ ...r, ...patch, updated: now });

/** Tytuł z pierwszej linii wklejonego tekstu, jeśli wygląda jak tytuł (krótka, bez cyfr); inaczej ''. */
export function guessTitle(text) {
  const first = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? '';
  return first && first.length <= 60 && !/\d/.test(first) && !/:\s*$/.test(first) ? first : '';
}

/** Wyszukiwanie po tytule, składnikach i krokach (bez znaków diakrytycznych i wielkości liter). */
export function filterRecipes(list, q, onlyFav = false) {
  const nq = norm(q);
  return list
    .filter((r) => (!onlyFav || r.fav) && (!nq || norm(`${r.title} ${r.ingredients} ${r.steps}`).includes(nq)))
    .sort((a, b) => b.updated - a.updated);
}

/** Mnożnik składników: chcę `want` porcji z przepisu na `base`. */
export const factor = (base, want) => (base > 0 ? want / base : 1);

/** Tekst do wysłania znajomym (np. komunikatorem). */
export function shareText(r, { servings, ingredients, steps }) {
  return [`${r.title}`, `${servings}: ${r.servings}`, '', `${ingredients}:`, r.ingredients, r.steps ? `\n${steps}:\n${r.steps}` : '', r.source ? `\n${r.source}` : ''].join('\n').trim();
}
