const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

let onlineDrivers = {}; 

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        // Έλεγχος Κωδικού 1234
        if(data.password !== "1234") {
            socket.emit('auth-error', 'Λάθος Κωδικός!');
            return;
        }

        const room = data.shop.toLowerCase().trim();
        socket.join(room);
        socket.shop = room;
        socket.userName = data.name;
        socket.isDriver = data.isDriver;

        if (socket.isDriver) {
            if (!onlineDrivers[room]) onlineDrivers[room] = [];
            if (!onlineDrivers[room].includes(data.name)) {
                onlineDrivers[room].push(data.name);
            }
            io.to(room).emit('update-drivers', onlineDrivers[room]);
        }
        console.log(`[LOGIN] ${data.name} στο κατάστημα ${room}`);
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
        // Κρατάει τη σύνδεση ενεργή
    });

    socket.on('disconnect', () => {
        if (socket.shop && socket.isDriver) {
            onlineDrivers[socket.shop] = onlineDrivers[socket.shop]?.filter(d => d !== socket.userName);
            io.to(socket.shop).emit('update-drivers', onlineDrivers[socket.shop] || []);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
