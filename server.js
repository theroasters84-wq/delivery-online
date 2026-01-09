const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    pingTimeout: 60000, 
    pingInterval: 25000 
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('shop-login', (data) => {
        socket.join(data.shop.toLowerCase().trim());
    });

    socket.on('driver-login', (data) => {
        const room = data.shop.toLowerCase().trim();
        socket.join(room);
        socket.shopName = room;
        socket.driverName = data.name;
        io.to(room).emit('driver-status', { name: data.name, status: 'online', socketId: socket.id });
    });

    // Απλώς ακούει το σήμα για να κρατάει το socket ενεργό
    socket.on('heartbeat', (data) => {
        // console.log("Heartbeat from: " + data.name);
    });

    socket.on('send-private-order', (data) => {
        io.to(data.targetId).emit('new-order', { shop: data.shop });
    });

    socket.on('order-accepted', (data) => {
        const room = data.shopName || socket.shopName;
        io.to(room).emit('order-confirmed', { driverName: data.driverName });
    });

    socket.on('disconnect', () => {
        if (socket.driverName && socket.shopName) {
            io.to(socket.shopName).emit('driver-status', { name: socket.driverName, status: 'offline', socketId: socket.id });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running`));
