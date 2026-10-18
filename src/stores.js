// Sklepy: sieci, wyszukiwanie w pobliżu (OpenStreetMap / Overpass) i nawigacja.
import { fetchWithTimeout } from './providers/util.js';

// id sieci = nazwa sklepu w promocjach (deal.store)
export const CHAINS = [
  { id: 'Albert Heijn', re: /albert heijn|^ah(\s|$)/i },
  { id: 'Aldi', re: /\baldi\b/i },
  { id: 'Lidl', re: /\blidl\b/i },
  { id: 'Jumbo', re: /\bjumbo\b/i },
  { id: 'Dirk', re: /^dirk(\s|$)|dirk van den broek/i },
  { id: 'Plus', re: /^plus(\s|$)/i },
];

export const chainOf = (tags = {}) =>
  CHAINS.find((c) => c.re.test(tags.brand ?? '') || c.re.test(tags.name ?? ''))?.id ?? null;

export function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = (d) => (d * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

export const fmtDistance = (m) => (m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1)} km`);

/** Odpowiedź Overpass → sklepy znanych sieci, od najbliższego. */
export function parseOverpass(json, lat, lon) {
  const seen = new Set();
  const out = [];
  for (const e of json?.elements ?? []) {
    const tags = e.tags ?? {};
    const chain = chainOf(tags);
    const eLat = e.lat ?? e.center?.lat;
    const eLon = e.lon ?? e.center?.lon;
    if (!chain || eLat == null || eLon == null) continue;
    const id = `${e.type}/${e.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
    out.push({
      id, chain, name: tags.name ?? chain,
      address: [street, tags['addr:city']].filter(Boolean).join(', '),
      lat: eLat, lon: eLon, distance: distanceMeters(lat, lon, eLat, eLon),
    });
  }
  return out.sort((a, b) => a.distance - b.distance);
}

const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'];

export async function findNearbyStores(lat, lon, radius = 5000) {
  const query = `[out:json][timeout:25];nwr["shop"="supermarket"](around:${radius},${lat},${lon});out center tags 400;`;
  const errors = [];
  for (const url of ENDPOINTS) {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'Korting/0.3 (shopping list app)' },
        body: `data=${encodeURIComponent(query)}`,
      }, 30000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseOverpass(await res.json(), lat, lon);
    } catch (e) {
      errors.push(`${new URL(url).hostname}: ${e.message}`);
    }
  }
  throw new Error(errors.join('; '));
}

// ---- ulubione ----
// Ulubiony wpis: { id, chain, name, address?, lat?, lon? }. Bez współrzędnych = „cała sieć”.
export const chainFavoriteId = (chain) => `chain:${chain}`;
export const favoriteChains = (favs) => [...new Set(favs.map((f) => f.chain))];

/** Adres do otwarcia w aplikacji map: konkretny ulubiony sklep tej sieci albo wyszukiwanie sieci w okolicy. */
export function navigationUrl(chain, favs, platform = 'android') {
  const spot = favs.find((f) => f.chain === chain && f.lat != null);
  if (platform === 'ios') {
    return spot ? `http://maps.apple.com/?daddr=${spot.lat},${spot.lon}&dirflg=d`
      : `http://maps.apple.com/?q=${encodeURIComponent(`${chain} supermarkt`)}`;
  }
  return spot ? `geo:${spot.lat},${spot.lon}?q=${spot.lat},${spot.lon}(${encodeURIComponent(spot.name)})`
    : `geo:0,0?q=${encodeURIComponent(`${chain} supermarkt`)}`;
}

// ---- wyszukiwanie miejsc (Nominatim / OpenStreetMap) ----
/** Odpowiedź Nominatim → [{ name, lat, lon }]. */
export function parseNominatim(json) {
  return (Array.isArray(json) ? json : [])
    .filter((p) => p.lat != null && p.lon != null)
    .map((p) => ({ name: p.display_name ?? p.name ?? '', lat: Number(p.lat), lon: Number(p.lon) }));
}

export async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&limit=6&countrycodes=nl`;
  const res = await fetchWithTimeout(url, { headers: { 'user-agent': 'Korting/0.4 (shopping list app)', accept: 'application/json' } }, 15000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseNominatim(await res.json());
}
