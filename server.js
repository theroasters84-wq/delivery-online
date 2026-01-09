const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    
    socket.on('shop-login', (data) => {
        socket.join(data.shop.toLowerCase());
        console.log(`Shop connected: ${data.shop}`);
    });

    socket.on('driver-login', (data) => {
        const shopRoom = data.shop.toLowerCase();
        socket.join(shopRoom);
        socket.shopName = shopRoom;
        socket.driverName = data.name;
        
        // Στέλνουμε στο Shop το socket.id για να ξέρει σε ποιον να απαντήσει
        io.to(shopRoom).emit('driver-status', { 
            name: data.name, 
            status: 'online',
            socketId: socket.id 
        });
    });

    socket.on('send-private-order', (data) => {
        // Στόχευση μόνο σε έναν οδηγό
        io.to(data.targetId).emit('new-order', { shop: data.shop });
    });

    socket.on('order-accepted', (data) => {
        const shopRoom = data.shopName || socket.shopName;
        io.to(shopRoom).emit('order-confirmed', { driverName: data.driverName });
    });

    socket.on('disconnect', () => {
        if (socket.driverName && socket.shopName) {
            io.to(socket.shopName).emit('driver-status', { 
                name: socket.driverName, 
                status: 'offline' 
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
