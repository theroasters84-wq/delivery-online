// Service Worker για το The Roasters Delivery
// Διαχειρίζεται τις ειδοποιήσεις σε κλειδωμένη οθόνη

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    return self.clients.claim();
});

// Λήψη ειδοποίησης (Push / Background Notification)
self.addEventListener('push', function(event) {
    let data = { title: 'The Roasters', body: '🚨 ΝΕΑ ΚΛΗΣΗ ΓΙΑ ΠΑΡΑΓΓΕΛΙΑ!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png', // Μηχανάκι
        badge: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
        vibrate: [500, 100, 500, 100, 500, 100, 500],
        data: { url: '/driver.html' },
        tag: 'order-alert',
        renotify: true,
        requireInteraction: true, // Η ειδοποίηση μένει στην οθόνη μέχρι να την πατήσει
        actions: [
            { action: 'open', title: 'ΑΝΟΙΓΜΑ ΕΦΑΡΜΟΓΗΣ' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Όταν ο διανομέας πατάει πάνω στην ειδοποίηση
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Κλείνει το συννεφάκι

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Αν το app είναι ήδη ανοιχτό, πήγαινε εκεί
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes('/driver.html') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Αν είναι κλειστό, άνοιξέ το
            if (clients.openWindow) {
                return clients.openWindow('/driver.html');
            }
        })
    );
});
