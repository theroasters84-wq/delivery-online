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

// VAPID Keys (Κράτα τα ίδια)
const publicVapidKey = 'BLWh5oe7cn7f1WZjxkYAUoJiWimKmiQ4psQ-2CkdxXNx2HukkF3ExB4RmUHDakiwTFyHzcs5SKVpRUeAR_pZUMs';
const privateVapidKey = 'h0TuE6vul1BuU5EpmNQBVyKe7sgGMb_mgf5h66CgPYU';
webpush.setVapidDetails('mailto:theroasters84@gmail.com', publicVapidKey, privateVapidKey);

let subscriptions = {}; 

io.on('connection', (socket) => {
    
    // Είσοδος Μαγαζιού
    socket.on('join-shop', (shopName) => {
        const cleanShop = shopName.toLowerCase().trim();
        socket.join(cleanShop);
        socket.currentShop = cleanShop;
        socket.isShop = true;
        updateDriversInShop(cleanShop);
    });

    // Είσοδος Ντελιβερά
    socket.on('driver-login', (data) => {
        const cleanShop = data.shop.toLowerCase().trim();
        socket.driverName = data.name;
        socket.currentShop = cleanShop;
        socket.join(cleanShop);
        updateDriversInShop(cleanShop);
    });

    socket.on('subscribe-push', (subscription) => {
        subscriptions[socket.id] = subscription;
    });

    socket.on('call-driver', (data) => {
        // data: { driverId, time, shop }
        io.to(data.driverId).emit('new-order', { time: data.time, shop: data.shop });
        
        const sub = subscriptions[data.driverId];
        if (sub) {
            const payload = JSON.stringify({
                title: `🚨 ${data.shop.toUpperCase()}`,
                body: `Νέα παραγγελία - ${data.time}`,
                url: `/driver.html`
            });
            webpush.sendNotification(sub, payload).catch(e => console.error(e));
        }
    });

    socket.on('order-accepted', (data) => {
        // Στέλνουμε την αποδοχή ΜΟΝΟ στο δωμάτιο του συγκεκριμένου μαγαζιού
        io.to(data.shopName.toLowerCase().trim()).emit('driver-accepted', data);
    });

    socket.on('disconnect', () => {
        const shop = socket.currentShop;
        delete subscriptions[socket.id];
        if (shop) updateDriversInShop(shop);
    });

    function updateDriversInShop(shopName) {
        const driversInShop = {};
        const clients = io.sockets.adapter.rooms.get(shopName);
        if (clients) {
            for (const clientId of clients) {
                const clientSocket = io.sockets.sockets.get(clientId);
                if (clientSocket && clientSocket.driverName) {
                    driversInShop[clientId] = clientSocket.driverName;
                }
            }
        }
        io.to(shopName).emit('update-drivers', driversInShop);
    }
});

server.listen(process.env.PORT || 3000);
