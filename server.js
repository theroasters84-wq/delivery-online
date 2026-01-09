const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 30000,
    pingInterval: 10000
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Login οδηγού
    socket.on('driver-login', (data) => {
        socket.join(data.shop.toLowerCase());
        console.log(`Driver ${data.name} joined shop: ${data.shop}`);
    });

    // Heartbeat για να μην πέφτει η σύνδεση
    socket.on('heartbeat', (data) => {
        // Επιβεβαίωση σύνδεσης
    });

    // Όταν το μαγαζί στέλνει παραγγελία
    socket.on('new-order', (data) => {
        const shopRoom = data.shopName.toLowerCase();
        io.to(shopRoom).emit('new-order', data);
        console.log(`Order sent to shop: ${shopRoom}`);
    });

    // Όταν ο οδηγός πατάει αποδοχή
    socket.on('order-accepted', (data) => {
        const shopRoom = data.shopName.toLowerCase();
        io.to(shopRoom).emit('order-confirmed', data);
        console.log(`Driver ${data.driverName} accepted order for ${shopRoom}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
