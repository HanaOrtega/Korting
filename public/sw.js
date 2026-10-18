// Minimalny service worker: sam shell aplikacji z cache, dane zawsze z sieci.
const SHELL = ['/', '/app.js', '/style.css', '/icon.svg'];
self.addEventListener('install', (e) => e.waitUntil(caches.open('korting-v1').then((c) => c.addAll(SHELL))));
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
