// Strona z mapą (Leaflet + OpenStreetMap) ładowana w WebView. Bez kluczy API.
// React Native → mapa: window.setStores(arr), window.setSelected(ids), window.flyTo(lat, lon, zoom).
// Mapa → React Native (postMessage): { type: 'ready' } | { type: 'view', lat, lon, zoom, radius } | { type: 'tap', id }.
export const COLORS = {
  'Albert Heijn': '#00a0e2', Aldi: '#1f3a93', Lidl: '#0050aa', Jumbo: '#e0a800', Dirk: '#e2001a', Plus: '#00a550',
};

export function mapHtml({ lat = 52.2, lon = 5.3, zoom = 7 } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<style>
html,body,#map{height:100%;margin:0;background:#e5e3df}
.pin{width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px #0008;display:flex;align-items:center;justify-content:center}
.pin span{transform:rotate(45deg);color:#fff;font:700 13px sans-serif}
.pin.sel{width:32px;height:32px;border-color:#ffd43b;border-width:3px}
</style></head><body><div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
var COLORS = ${JSON.stringify(COLORS)};
function post(o) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o)); }
var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lon}], ${zoom});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
var layer = L.layerGroup().addTo(map), stores = [], selected = {};
function render() {
  layer.clearLayers();
  stores.forEach(function (s) {
    var sel = !!selected[s.id], size = sel ? 32 : 26;
    var icon = L.divIcon({ className: '', iconSize: [size, size], iconAnchor: [size / 2, size],
      html: '<div class="pin' + (sel ? ' sel' : '') + '" style="background:' + (COLORS[s.chain] || '#555') + '"><span>' + (sel ? '&#9733;' : '') + '</span></div>' });
    L.marker([s.lat, s.lon], { icon: icon, zIndexOffset: sel ? 1000 : 0 }).on('click', function () { post({ type: 'tap', id: s.id }); }).addTo(layer);
  });
}
window.setStores = function (arr) { stores = arr || []; render(); };
window.setSelected = function (ids) { selected = {}; (ids || []).forEach(function (i) { selected[i] = true; }); render(); };
window.flyTo = function (lat, lon, z) { map.flyTo([lat, lon], z || 14); };
function postView() {
  var c = map.getCenter(), b = map.getBounds();
  post({ type: 'view', lat: c.lat, lon: c.lng, zoom: map.getZoom(), radius: Math.round(c.distanceTo(b.getNorthEast())) });
}
map.on('moveend', postView);
post({ type: 'ready' });
postView(); // pozycja startowa, żeby „Szukaj sklepów tutaj” działało bez przesuwania mapy
</script></body></html>`;
}
