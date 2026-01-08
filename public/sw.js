self.addEventListener('push', function(event) {
    const options = {
        body: '🚨 ΝΕΑ ΚΛΗΣΗ ΑΠΟ ΤΟ ΚΑΤΑΣΤΗΜΑ!',
        icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
        vibrate: [500, 200, 500, 200, 500],
        tag: 'order-alert',
        renotify: true,
        requireInteraction: true,
        actions: [
            { action: 'accept', title: '✅ ΑΠΟΔΟΧΗ ΤΩΡΑ' },
            { action: 'open', title: '🔍 ΑΝΟΙΓΜΑ APP' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('The Roasters Delivery', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    if (event.action === 'accept') {
        // Εδώ στέλνουμε σήμα στο App να κάνει την αποδοχή ακαριαία
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                for (let client of clientList) {
                    if (client.url.includes('/driver.html')) {
                        return client.postMessage({ action: 'FORCE_ACCEPT' });
                    }
                }
            })
        );
    } else {
        // Απλό άνοιγμα του App
        event.waitUntil(
            clients.openWindow('/driver.html')
        );
    }
});
