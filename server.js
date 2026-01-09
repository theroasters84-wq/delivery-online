const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Login Shop
    socket.on('shop-login', (data) => {
        socket.join(data.shop.toLowerCase());
    });

    // Login Driver
    socket.on('driver-login', (data) => {
        const room = data.shop.toLowerCase();
        socket.join(room);
        socket.shopName = room;
        socket.driverName = data.name;
        io.to(room).emit('driver-status', { name: data.name, status: 'online', socketId: socket.id });
    });

    // Αποστολή Παραγγελίας
    socket.on('send-private-order', (data) => {
        io.to(data.targetId).emit('new-order', { shop: data.shop });
    });

    // ΑΠΟΔΟΧΗ (Εδώ που είχαμε θέμα)
    socket.on('order-accepted', (data) => {
        const room = data.shopName || socket.shopName;
        io.to(room).emit('order-confirmed', { driverName: data.driverName });
    });

    socket.on('disconnect', () => {
        if (socket.driverName && socket.shopName) {
            io.to(socket.shopName).emit('driver-status', { name: socket.driverName, status: 'offline' });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server Live on ${PORT}`));
