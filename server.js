const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
// Μειώνουμε τα timeouts στο ελάχιστο για να είναι "στην τσίτα" ο server
const io = new Server(server, { 
    cors: { origin: "*" },
    pingTimeout: 10000, 
    pingInterval: 5000 
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

    // Δυνατό "Σκουίρτ" επικοινωνίας - Ο οδηγός ζητάει επιβεβαίωση ζωής
    socket.on('force-alive', (data) => {
        socket.emit('alive-confirm', { time: new Date().getTime() });
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
server.listen(PORT, () => console.log(`Super-Active Server Running`));
