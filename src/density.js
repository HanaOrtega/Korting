// Gęstość popularnych produktów (g na ml) i jednostka, w jakiej kupuje się je w sklepie.
// Dzięki temu „2 cups flour” (objętość) da się zsumować z „200 g mąki” (masa). Wartości przybliżone:
// np. amerykańska szklanka (≈237 ml) mąki waży ok. 125 g, cukru ok. 200 g, masła ok. 227 g.
// Klucz = pierwsza holenderska nazwa produktu w słowniku (src/data/glossary.js).
const g = (d) => ({ d, prefer: 'g' }); // kupujemy na wagę
const ml = (d) => ({ d, prefer: 'ml' }); // kupujemy na objętość

export const DENSITY = {
  bloem: g(0.53), suiker: g(0.85), boter: g(0.96), rijst: g(0.78), havermout: g(0.38), honing: g(1.42), zout: g(1.2),
  bakpoeder: g(0.93), kaneel: g(0.53), peper: g(0.47), pindakaas: g(1.09), jam: g(1.3), kaas: g(0.48), noten: g(0.55),
  rozijnen: g(0.65), tomatenpuree: g(1.1), mayonaise: g(0.95), ketchup: g(1.15), mosterd: g(1.05), kwark: g(1.03),
  roomkaas: g(1.0), 'zure room': g(0.97),
  melk: ml(1.03), sojamelk: ml(1.03), karnemelk: ml(1.03), kokosmelk: ml(0.97), chocolademelk: ml(1.04), olie: ml(0.92),
  olijfolie: ml(0.91), water: ml(1), azijn: ml(1.01), sap: ml(1.04), slagroom: ml(1), kookroom: ml(1), koffiemelk: ml(1),
  yoghurt: ml(1.03), drinkyoghurt: ml(1.03), wijn: ml(0.99), bier: ml(1.01),
};

export const densityOf = (nlName) => DENSITY[nlName] ?? null;
