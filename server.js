const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

// ΑΥΤΟΜΑΤΟ MANIFEST ΓΙΑ ΤΟΝ DRIVER (Δεν χρειάζεται αρχείο πλέον)
app.get('/manifest-driver.json', (req, res) => {
    res.json({
        "name": "Roasters Driver",
        "short_name": "Driver",
        "start_url": "/driver.html",
        "display": "standalone",
        "background_color": "#000000",
        "theme_color": "#ffc107",
        "icons": [{ "src": "https://img.icons8.com/color/192/motorcycle.png", "sizes": "192x192", "type": "image/png" }]
    });
});

// ΑΥΤΟΜΑΤΟ MANIFEST ΓΙΑ TO SHOP
app.get('/manifest-shop.json', (req, res) => {
    res.json({
        "name": "Roasters Shop",
        "short_name": "Shop",
        "start_url": "/shop.html",
        "display": "standalone",
        "background_color": "#1a1a1a",
        "theme_color": "#ffc107",
        "icons": [{ "src": "https://img.icons8.com/color/192/shop.png", "sizes": "192x192", "type": "image/png" }]
    });
});

function sendUpdatedDriverList(io, room) {
    const clients = io.sockets.adapter.rooms.get(room);
    let drivers = [];
    if (clients) {
        for (const clientId of clients) {
            const clientSocket = io.sockets.sockets.get(clientId);
            if (clientSocket && clientSocket.isDriver) {
                drivers.push({ name: clientSocket.userName, id: clientSocket.id });
            }
        }
    }
    io.to(room).emit('update-drivers-detailed', drivers);
}

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        if(data.password !== "1234") return;
        const room = data.shop.toLowerCase().trim();
        socket.join(room);
        socket.shop = room;
        socket.userName = data.name;
        socket.isDriver = data.isDriver;
        sendUpdatedDriverList(io, room);
    });

    socket.on('new-order', (data) => {
        if (data.targetDriverId) {
            io.to(data.targetDriverId).emit('new-order', data);
        } else {
            io.to(data.shopName.toLowerCase()).emit('new-order', data);
        }
    });

    socket.on('order-accepted', (data) => {
        io.to(data.shopName.toLowerCase()).emit('order-confirmed', data);
    });

    socket.on('heartbeat', () => { /* keep alive */ });

    socket.on('disconnect', () => {
        if (socket.shop) sendUpdatedDriverList(io, socket.shop);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
