const cacheName = 'sudoku-pwa-v1';
const assetsToCache = [
  './sudoku-app.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalación y cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assetsToCache))
  );
});

// Activación
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Intercepción de peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
