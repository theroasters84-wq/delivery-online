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
    console.log('Σύνδεση:', socket.id);

    socket.on('driver-login', (data) => {
        if(!data.shop) return;
        const room = data.shop.toLowerCase().trim();
        socket.join(room);
        console.log(`Ο οδηγός ${data.name} μπήκε στο room: ${room}`);
    });

    socket.on('new-order', (data) => {
        const room = data.shopName.toLowerCase().trim();
        io.to(room).emit('new-order', data);
    });

    socket.on('order-accepted', (data) => {
        const room = data.shopName.toLowerCase().trim();
        io.to(room).emit('order-confirmed', data);
    });

    socket.on('heartbeat', () => {
        // Απλή επιβεβαίωση
    });

    socket.on('disconnect', () => {
        console.log('Αποσύνδεση');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
