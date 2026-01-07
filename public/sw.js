// public/sw.js

self.addEventListener('push', event => {
    if (!event.data) return;

    // Μετατρέπουμε τα δεδομένα που στέλνει ο server σε JSON
    const data = event.data.json();
    
    const options = {
        title: data.title,
        body: data.body,
        // Εικονίδιο με μηχανάκι για την ειδοποίηση
        icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png', 
        badge: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
        
        // Επιθετικό μοτίβο δόνησης (2 δευτερόλεπτα δόνηση, 200ms παύση)
        vibrate: [2000, 200, 2000, 200, 2000, 200, 2000],
        
        data: { url: data.url }, // Η σελίδα που θα ανοίξει (π.χ. /driver.html)
        
        tag: 'urgent-delivery', // Αν έρθουν πολλές ειδοποιήσεις, τις ομαδοποιεί
        renotify: true,         // Κάνει ξανά ήχο/δόνηση αν έρθει νέα ειδοποίηση με το ίδιο tag
        requireInteraction: true, // Η ειδοποίηση ΔΕΝ φεύγει αν δεν την πατήσει ο χρήστης
        
        // Ρυθμίσεις για Android προτεραιότητα
        priority: 'high',
        dir: 'ltr',
        timestamp: Date.now()
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Τι συμβαίνει όταν ο ντελιβεράς κάνει κλικ στην ειδοποίηση
self.addEventListener('notificationclick', event => {
    event.notification.close(); // Κλείνει το παράθυρο της ειδοποίησης

    // Ανοίγει την εφαρμογή στη σελίδα που ορίσαμε
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Αν η σελίδα είναι ήδη ανοιχτή, κάνε focus σε αυτήν
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // Αν δεν είναι ανοιχτή, άνοιξε νέο παράθυρο
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
