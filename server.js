const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Σημαντικό: Σερβίρει τα αρχεία από τον φάκελο public
app.use(express.static(path.join(__dirname, 'public')));

// Routes για τα αρχεία του PWA (Driver)
app.get('/driver.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});

app.get('/driver.webmanifest', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'driver.webmanifest'));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Socket.io Logic
io.on('connection', (socket) => {
    socket.on('driver-login', (data) => {
        socket.join(data.shop);
        console.log(`Driver ${data.name} joined ${data.shop}`);
    });

    socket.on('new-order', (data) => {
        io.to(data.shop).emit('new-order', data);
    });

    socket.on('order-accepted', (data) => {
        io.emit('order-confirmed', data);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
