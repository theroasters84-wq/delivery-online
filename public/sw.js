self.addEventListener('push', event => {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'https://via.placeholder.com/128',
        badge: 'https://via.placeholder.com/128',
        // Πιο έντονη δόνηση: 1 δευτερόλεπτο δόνηση, μισό δευτερόλεπτο παύση (3 φορές)
        vibrate: [1000, 500, 1000, 500, 1000, 500, 1000],
        data: { url: data.url },
        tag: 'delivery-alert',
        renotify: true,
        requireInteraction: true,
        silent: false // Επιβάλλει να ΜΗΝ είναι αθόρυβο
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
