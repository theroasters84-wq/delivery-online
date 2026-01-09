const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 1. Σερβίρουμε ΟΛΟΥΣ τους πιθανούς φακέλους public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/public')));

// 2. Ειδικό Route που "παντρεύει" το driver.html με το manifest-shop.json
app.get('/driver.html', (req, res) => {
    // Ψάχνει το αρχείο σε όλες τις πιθανές διαδρομές της δομής σου
    const locations = [
        path.join(__dirname, 'public', 'driver.html'),
        path.join(__dirname, 'public', 'public', 'driver.html')
    ];
    const found = locations.find(loc => require('fs').existsSync(loc));
    res.sendFile(found || locations[0]);
});

// 3. Διόρθωση για το Manifest (επειδή το λες manifest-shop.json)
app.get('/manifest-shop.json', (req, res) => {
    const locations = [
        path.join(__dirname, 'public', 'manifest-shop.json'),
        path.join(__dirname, 'public', 'public', 'manifest-shop.json')
    ];
    const found = locations.find(loc => require('fs').existsSync(loc));
    res.sendFile(found || locations[0]);
});

// 4. Socket.io Logic
io.on('connection', (socket) => {
    socket.on('driver-login', (data) => {
        socket.join(data.shop);
        console.log(`Driver ${data.name} online @ ${data.shop}`);
    });
    socket.on('new-order', (data) => io.to(data.shop).emit('new-order', data));
    socket.on('order-accepted', (data) => io.emit('order-confirmed', data));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server is running!'));
