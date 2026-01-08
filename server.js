const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const webpush = require('web-push'); // ΠΡΟΣΘΗΚΗ

const app = express();
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 5000, pingTimeout: 2000 });

// ΡΥΘΜΙΣΗ WEB PUSH
const publicVapidKey = 'BDeB-u_7Q0z5G_wL8k9Wz8Xp6F6R7T8Y9U0I1O2P3A4S5D6F7G8H9J0K_L1M';
const privateVapidKey = '_A1S2D3F4G5H6J7K8L9P0O9I8U7Y6T5R4E3W2Q1';
webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Για να διαβάζει τα push subscriptions

let shops = {}; 
let subscriptions = {}; // Αποθήκευση των "ταυτοτήτων" των κινητών

io.on('connection', (socket) => {
    socket.on('join-shop', (shopName) => {
        const room = shopName.toLowerCase().trim();
        socket.join(room);
        if (!shops[room]) shops[room] = {};
        io.to(room).emit('update-drivers', shops[room]);
    });

    socket.on('driver-login', ({ name, shop }) => {
        const room = shop.toLowerCase().trim();
        socket.join(room);
        socket.myShop = room;
        if (!shops[room]) shops[room] = {};
        shops[room][socket.id] = name;
        io.to(room).emit('update-drivers', shops[room]);
    });

    // ΑΠΟΘΗΚΕΥΣΗ ΤΟΥ PUSH SUBSCRIPTION
    socket.on('save-subscription', (sub) => {
        subscriptions[socket.id] = sub;
    });

    socket.on('call-driver', (data) => {
        const room = data.shop.toLowerCase().trim();
        // 1. Στέλνουμε μέσω Socket (αν είναι online)
        io.to(data.driverId).emit('new-order');

        // 2. Στέλνουμε μέσω Push (αν έχει κλείσει ο browser)
        const sub = subscriptions[data.driverId];
        if (sub) {
            const payload = JSON.stringify({ title: '🚨 ΝΕΑ ΚΛΗΣΗ!', body: 'Σε χρειάζεται το ' + room });
            webpush.sendNotification(sub, payload).catch(err => console.error(err));
        }
    });

    socket.on('order-accepted', (data) => {
        io.to(data.shopName.toLowerCase().trim()).emit('driver-accepted', { driverName: data.driverName });
    });

    socket.on('disconnect', () => {
        if (socket.myShop && shops[socket.myShop]) {
            delete shops[socket.myShop][socket.id];
            io.to(socket.myShop).emit('update-drivers', shops[socket.myShop]);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
