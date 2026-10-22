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
const UA = 'Korting/0.4 (shopping list app)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pierwsza udana odpowiedź ze wszystkich serwerów naraz (Promise.any bywa niedostępne); błędy zbiera w jeden.
function firstSuccess(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    promises.forEach((p) => p.then(resolve, (e) => { errors.push(e.message); if (errors.length === promises.length) reject(new Error(errors.join('; '))); }));
  });
}

async function overpass(lat, lon, radius) {
  const query = `[out:json][timeout:25];nwr["shop"="supermarket"](around:${radius},${lat},${lon});out center tags 400;`;
  return firstSuccess(ENDPOINTS.map(async (url) => {
    try {
      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': UA },
        body: `data=${encodeURIComponent(query)}`,
      }, 15000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseOverpass(await res.json(), lat, lon);
    } catch (e) { throw new Error(`${new URL(url).hostname}: ${e.message}`); }
  }));
}

// ---- plan B: Nominatim (wyszukiwanie sieci w obszarze mapy) ----
/** Wyniki Nominatim dla jednej sieci → sklepy (tylko obiekty „shop”, z rozpoznaną siecią). */
export function parseNominatimStores(json, lat, lon) {
  const out = [];
  for (const p of Array.isArray(json) ? json : []) {
    if (p.category !== 'shop' || p.lat == null || p.lon == null) continue;
    const chain = chainOf({ name: p.name ?? '' });
    if (!chain) continue;
    const a = p.address ?? {};
    const street = [a.road, a.house_number].filter(Boolean).join(' ');
    const place = a.town ?? a.city ?? a.village ?? a.municipality;
    out.push({
      id: `${p.osm_type}/${p.osm_id}`, chain, name: p.name,
      address: [street, place].filter(Boolean).join(', '),
      lat: Number(p.lat), lon: Number(p.lon), distance: distanceMeters(lat, lon, Number(p.lat), Number(p.lon)),
    });
  }
  return out;
}

async function nominatimStores(lat, lon, radius) {
  const dLat = radius / 111000;
  const dLon = radius / (111000 * Math.cos((lat * Math.PI) / 180));
  const viewbox = `${lon - dLon},${lat + dLat},${lon + dLon},${lat - dLat}`;
  const byId = new Map();
  const errors = [];
  for (const chain of CHAINS) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(chain.id)}&viewbox=${viewbox}&bounded=1`
        + '&format=jsonv2&addressdetails=1&limit=40&countrycodes=nl';
      const res = await fetchWithTimeout(url, { headers: { 'user-agent': UA, accept: 'application/json' } }, 15000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      for (const s of parseNominatimStores(await res.json(), lat, lon)) byId.set(s.id, s);
    } catch (e) { errors.push(`${chain.id}: ${e.message}`); }
    await sleep(1100); // polityka Nominatim: najwyżej jedno zapytanie na sekundę
  }
  if (errors.length === CHAINS.length) throw new Error(errors[0]);
  return [...byId.values()].sort((a, b) => a.distance - b.distance);
}

/** Sklepy znanych sieci w okolicy: najpierw Overpass (jedno zapytanie), a gdy zawiedzie – Nominatim. */
export async function findNearbyStores(lat, lon, radius = 5000) {
  try {
    return await overpass(lat, lon, radius);
  } catch (e1) {
    try {
      return await nominatimStores(lat, lon, Math.min(radius, 6000));
    } catch (e2) {
      throw new Error(`Overpass: ${String(e1.message).slice(0, 90)} | Nominatim: ${e2.message}`);
    }
  }
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
