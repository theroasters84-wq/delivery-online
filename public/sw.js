const CACHE_NAME = 'roasters-v1';
const urlsToCache = [
  '/driver.html',
  '/manifest-driver.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('push', function(event) {
  const options = {
    body: '🚨 ΝΕΑ ΚΛΗΣΗ ΑΠΟ ΤΟ ΜΑΓΑΖΙ!',
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40],
    requireInteraction: true
  };
  event.waitUntil(self.registration.showNotification('Roasters Delivery', options));
});
