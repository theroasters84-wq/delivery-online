self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
    // Απαραίτητο για να περάσει το τεστ του Chrome
    event.respondWith(fetch(event.request));
});
