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
    console.log('Νέα σύνδεση:', socket.id);

    // Είσοδος Καταστήματος
    socket.on('shop-login', (data) => {
        const shopRoom = data.shop.toLowerCase().trim();
        socket.join(shopRoom);
        console.log(`Το κατάστημα ${shopRoom} συνδέθηκε.`);
    });

    // Είσοδος Οδηγού
    socket.on('driver-login', (data) => {
        const shopRoom = data.shop.toLowerCase().trim();
        socket.join(shopRoom);
        socket.shopName = shopRoom;
        socket.driverName = data.name;
        
        // Ενημερώνουμε το Shop για τον νέο οδηγό και στέλνουμε το Socket ID του
        io.to(shopRoom).emit('driver-status', { 
            name: data.name, 
            status: 'online',
            socketId: socket.id 
        });
    });

    // Λήψη Heartbeat (Ping από το κινητό)
    socket.on('heartbeat', (data) => {
        // Δεν χρειάζεται δράση, η λήψη και μόνο κρατάει τη σύνδεση ενεργή
        console.log(`Heartbeat: ${data.name} @ ${data.shop}`);
    });

    // Ιδιωτική Αποστολή Παραγγελίας σε συγκεκριμένο Socket ID
    socket.on('send-private-order', (data) => {
        io.to(data.targetId).emit('new-order', { shop: data.shop });
    });

    // Αποδοχή Παραγγελίας
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
