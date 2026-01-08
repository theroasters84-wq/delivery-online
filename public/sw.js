self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: '🚨 ΚΛΗΣΗ!', body: 'Νέα παραγγελία!' };
    
    const options = {
        body: data.body,
        icon: '/icon.png', // Βάλε μια εικόνα αν έχεις
        badge: '/icon.png',
        vibrate: [500, 200, 500, 200, 500, 200, 500],
        tag: 'delivery-call', // Σημαντικό: για να μην γεμίζει η οθόνη
        renotify: true,
        requireInteraction: true, // Η ειδοποίηση ΔΕΝ φεύγει αν δεν την πατήσει ο οδηγός
        data: { url: '/driver.html' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Αν ο οδηγός έχει ήδη ανοιχτό το tab, πάει εκεί. Αν όχι, ανοίγει νέο.
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
