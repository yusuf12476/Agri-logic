// AgriLogic Service Worker v2 — cache busted
const CACHE_NAME = 'agrilogic-v2';

const ASSETS = [
  './index.html',
  './shared.css',
  './shared.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './animals.html',
  './books.html',
  './breeding.html',
  './calendar.html',
  './chat.html',
  './diagnosis.html',
  './eggs.html',
  './feed.html',
  './insurance.html',
  './inventory.html',
  './labour.html',
  './land.html',
  './loan.html',
  './market.html',
  './milk.html',
  './profit.html',
  './reports.html',
  './soil.html',
  './subsidy.html',
  './suppliers.html',
  './sw.js',
  './tasks.html',
  './vets.html',
  './water.html',
  './weather.html',
  './weight.html',
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname === 'api.anthropic.com') return;
  if (url.hostname.includes('fonts')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
