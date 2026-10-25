// Skalowanie tekstu: rozmiar systemowy (Ustawienia → Rozmiar czcionki) × opcja w aplikacji, z górnym limitem,
// żeby układ nie rozsypał się przy największych ustawieniach.
export const MAX_SCALE = 1.75;
export const MIN_SCALE = 0.85;

export const effectiveScale = (system = 1, app = 1) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, (Number(system) || 1) * (Number(app) || 1)));
