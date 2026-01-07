self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'https://via.placeholder.com/128',
        badge: 'https://via.placeholder.com/128',
        
        // Μοτίβο δόνησης που δεν σταματάει εύκολα: 
        // 2 δευτερόλεπτα δόνηση, 200ms παύση (πολύ επιθετικό)
        vibrate: [2000, 200, 2000, 200, 2000, 200, 2000],
        
        data: { url: data.url },
        tag: 'urgent-delivery',
        renotify: true,
        requireInteraction: true,
        
        // Αυτά βοηθούν το Android να το δει σαν "Συναγερμό"
        priority: 'high',
        dir: 'ltr',
        timestamp: Date.now()
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
