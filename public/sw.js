const CACHE_NAME = 'roasters-cache-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Απλή μεταφορά αιτημάτων για να δουλεύει το PWA
    event.respondWith(fetch(event.request));
});
