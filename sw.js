// AgriLogic Service Worker v1.0
// Enables: PWA install prompt, offline fallback, asset caching

const CACHE_NAME = 'agrilogic-v1';

// All files to cache for offline use
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
  './tasks.html',
  './vets.html',
  './water.html',
  './weather.html',
  './weight.html',
];

// Install — cache all app files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate — clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go to network for AI API calls (Anthropic)
  if (url.hostname === 'api.anthropic.com') {
    return; // let it go to network normally
  }

  // For Google Fonts — network first, cache fallback
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For app files — cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
