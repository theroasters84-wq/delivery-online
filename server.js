const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const webpush = require('web-push');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingInterval: 10000,
    pingTimeout: 5000
});

// Ρύθμιση Web Push
const publicVapidKey = 'BEl6M-m-E-G_S5O1A5eI-R_Gv4W_p0Yn7H3XjU7Y4N4I_O8N8U4M_P5I_T1O_A';
const privateVapidKey = 'YOUR_PRIVATE_KEY_HERE'; // Βάλε το Private Key εδώ
webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey);

app.use(express.static(path.join(__dirname, 'public')));

let shops = {}; 

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
        socket.myName = name;
        if (!shops[room]) shops[room] = {};
        shops[room][socket.id] = name;
        io.to(room).emit('update-drivers', shops[room]);
    });

    socket.on('call-driver', (data) => {
        const room = data.shop.toLowerCase().trim();
        if (data.driverId) {
            io.to(data.driverId).emit('new-order', { shop: room });
        } else {
            io.to(room).emit('new-order', { shop: room });
        }
    });

    socket.on('order-accepted', (data) => {
        const room = data.shopName.toLowerCase().trim();
        console.log(`Acceptance: ${data.driverName} for ${room}`);
        // Στέλνει την επιβεβαίωση σε ΟΛΟΥΣ στο δωμάτιο του μαγαζιού
        io.to(room).emit('driver-accepted', {
            driverName: data.driverName,
            shopName: room
        });
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
