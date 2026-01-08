const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingInterval: 10000, // Στέλνει ping κάθε 10 δευτερόλεπτα
    pingTimeout: 5000    // Περιμένει 5 δευτερόλεπτα για απάντηση
});

app.use(express.static(path.join(__dirname, 'public')));

let shops = {}; // { shopName: { driverId: driverName } }

io.on('connection', (socket) => {
    console.log('New Connection:', socket.id);

    socket.on('join-shop', (shopName) => {
        socket.join(shopName);
        if (!shops[shopName]) shops[shopName] = {};
        io.to(shopName).emit('update-drivers', shops[shopName]);
    });

    socket.on('driver-login', ({ name, shop }) => {
        socket.join(shop);
        socket.myShop = shop;
        socket.myName = name;
        if (!shops[shop]) shops[shop] = {};
        shops[shop][socket.id] = name;
        io.to(shop).emit('update-drivers', shops[shop]);
        console.log(`Driver ${name} joined ${shop}`);
    });

    socket.on('call-driver', (data) => {
        // Στέλνουμε σε όλους στο δωμάτιο ή σε συγκεκριμένο driverId
        if (data.driverId) {
            io.to(data.driverId).emit('new-order', { shop: data.shop });
        } else {
            io.to(data.shop).emit('new-order', { shop: data.shop });
        }
    });

    socket.on('order-accepted', (data) => {
        io.to(data.shopName).emit('driver-accepted', data);
    });

    socket.on('disconnect', () => {
        if (socket.myShop && shops[socket.myShop]) {
            delete shops[socket.myShop][socket.id];
            io.to(socket.myShop).emit('update-drivers', shops[socket.myShop]);
        }
        console.log('Disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
