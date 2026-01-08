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
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                for (let client of clientList) {
                    if (client.url.includes('/driver.html')) {
                        client.postMessage({ action: 'FORCE_ACCEPT' });
                        return client.focus();
                    }
                }
                // Αν δεν είναι ανοιχτό το app, το ανοίγει και στέλνει την αποδοχή
                return clients.openWindow('/driver.html?action=auto_accept');
            })
        );
    } else {
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                for (let client of clientList) {
                    if (client.url.includes('/driver.html') && 'focus' in client) return client.focus();
                }
                return clients.openWindow('/driver.html');
            })
        );
    }
});
