const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const webpush = require('web-push');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));

// === ΡΥΘΜΙΣΗ VAPID KEYS ===
const publicVapidKey = 'BLWh5oe7cn7f1WZjxkYAUoJiWimKmiQ4psQ-2CkdxXNx2HukkF3ExB4RmUHDakiwTFyHzcs5SKVpRUeAR_pZUMs';
const privateVapidKey = 'h0TuE6vul1BuU5EpmNQBVyKe7sgGMb_mgf5h66CgPYU';

webpush.setVapidDetails('mailto:theroasters84@gmail.com', publicVapidKey, privateVapidKey);

let drivers = {};
let subscriptions = {}; 

io.on('connection', (socket) => {
    socket.on('driver-login', (name) => {
        drivers[socket.id] = name;
        io.emit('update-drivers', drivers);
    });

    socket.on('subscribe-push', (subscription) => {
        subscriptions[socket.id] = subscription;
        console.log('Push Subscription received');
    });

    socket.on('call-driver', (data) => {
        // 1. Κανονικό σήμα (για ανοιχτή οθόνη)
        io.to(data.driverId).emit('new-order', { time: data.time });

        // 2. Push Notification (για κλειστό κινητό)
        const sub = subscriptions[data.driverId];
        if (sub) {
            const payload = JSON.stringify({
                title: '🚨 THE ROASTERS: ΚΛΗΣΗ!',
                body: `Νέα παραγγελία - Ώρα: ${data.time}`,
                url: '/driver.html'
            });
            webpush.sendNotification(sub, payload).catch(err => console.error('Push Error:', err));
        }
    });

    socket.on('disconnect', () => {
        delete drivers[socket.id];
        delete subscriptions[socket.id];
        io.emit('update-drivers', drivers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
