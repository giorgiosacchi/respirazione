/* Respirazione guidata: cache locale per uso senza connessione. */
const CACHE = 'respirazione-offline-v5';
const BASE = self.registration.scope;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png',
  './music/part-01.js',
  './music/part-02.js',
  './music/part-03.js',
  './music/part-04.js',
  './music/part-05.js',
  './music/part-06.js',
  './music/part-07.js',
  './music/part-08.js',
  './music/part-09.js',
  './music/part-10.js',
  './music/part-11.js',
  './music/part-12.js',
  './music/part-13.js',
  './music/part-14.js',
  './music/part-15.js',
  './music/part-16.js',
  './music/part-17.js']
  .map(path => new URL(path, BASE).href);
const FALLBACK = new URL('./index.html', BASE).href;
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('respirazione-offline-') && key !== CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(BASE)) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(FALLBACK, copy)));
        }
        return response;
      }).catch(() => caches.match(FALLBACK))
    );
    return;
  }
  event.respondWith(
    caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
      }
      return response;
    }))
  );
});
