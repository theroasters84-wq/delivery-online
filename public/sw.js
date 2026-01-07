self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: 'https://via.placeholder.com/128',
        badge: 'https://via.placeholder.com/128',
        
        // Μοτίβο δόνησης: Δονείται για 1 δευτερόλεπτο, σταματάει για μισό (επαναλαμβανόμενο)
        vibrate: [1000, 500, 1000, 500, 1000, 500, 1000, 500, 1000],
        
        data: { url: data.url },
        tag: 'delivery-alert',
        renotify: true,
        requireInteraction: true, // ΔΕΝ φεύγει από την οθόνη αν δεν την πατήσεις
        priority: 'high',         // Λέει στο Android ότι είναι επείγον
        urgency: 'high'
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
