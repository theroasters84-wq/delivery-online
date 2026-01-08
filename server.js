const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingInterval: 5000, 
    pingTimeout: 2000    
});

app.use(express.static(path.join(__dirname, 'public')));

let shops = {}; 

io.on('connection', (socket) => {
    
    socket.on('join-shop', (shopName) => {
        const room = shopName.toLowerCase().trim();
        socket.join(room);
        if (!shops[room]) shops[room] = {};
        io.to(room).emit('update-drivers', shops[room]);
    });

    socket.on('driver-login', ({ name, shop }) => {
        const room = shop.toLowerCase().trim();
        socket.join(room);
        socket.myShop = room;
        socket.myName = name;
        
        if (!shops[room]) shops[room] = {};
        // Καθαρισμός αν υπήρχε ήδη ο οδηγός με το ίδιο όνομα (για να μη διπλασιάζεται)
        Object.keys(shops[room]).forEach(id => {
            if(shops[room][id] === name) delete shops[room][id];
        });
        
        shops[room][socket.id] = name;
        io.to(room).emit('update-drivers', shops[room]);
    });

    // Νέο: Χειροκίνητο Reset από το Shop
    socket.on('reset-drivers', (shopName) => {
        const room = shopName.toLowerCase().trim();
        shops[room] = {};
        io.to(room).emit('update-drivers', {});
    });

    socket.on('call-driver', (data) => {
        const room = data.shop.toLowerCase().trim();
        if (data.driverId) {
            io.to(data.driverId).emit('new-order', { shop: room });
        }
    });

    socket.on('order-accepted', (data) => {
        const room = data.shopName.toLowerCase().trim();
        io.to(room).emit('driver-accepted', { driverName: data.driverName });
    });

    socket.on('disconnect', () => {
        if (socket.myShop && shops[socket.myShop]) {
            delete shops[socket.myShop][socket.id];
            io.to(socket.myShop).emit('update-drivers', shops[socket.myShop]);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
