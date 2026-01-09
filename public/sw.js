const CACHE_NAME = 'roasters-v2';

// Τα αρχεία που αποθηκεύονται για να δουλεύει η εφαρμογή "offline"
const assets = [
  '/driver.html',
  '/driver.webmanifest',
  'https://img.icons8.com/color/512/motorcycle.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
