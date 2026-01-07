self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'https://via.placeholder.com/128',
        // Δόνηση: 500ms δόνηση, 100ms παύση, 500ms δόνηση (επαναλαμβανόμενο)
        vibrate: [500, 100, 500, 100, 500, 100, 500],
        data: { url: data.url },
        badge: 'https://via.placeholder.com/128',
        tag: 'delivery-alert',
        renotify: true,
        requireInteraction: true // Η ειδοποίηση δεν εξαφανίζεται μόνη της
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
