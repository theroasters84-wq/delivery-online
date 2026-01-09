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

// Συνάρτηση για αποστολή λίστας οδηγών στο Shop
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
        if(data.password !== "1234") {
            socket.emit('auth-error', 'Λάθος Κωδικός!');
            return;
        }

        const room = data.shop.toLowerCase().trim();
        socket.join(room);
        socket.shop = room;
        socket.userName = data.name;
        socket.isDriver = data.isDriver;

        console.log(`[LOGIN] ${data.name} στο ${room} (Driver: ${socket.isDriver})`);
        sendUpdatedDriverList(io, room);
    });

    socket.on('new-order', (data) => {
        if (data.targetDriverId) {
            // Στόχευση συγκεκριμένου οδηγού
            io.to(data.targetDriverId).emit('new-order', data);
        } else {
            // Backup: Αποστολή σε όλους στο δωμάτιο
            io.to(data.shopName.toLowerCase()).emit('new-order', data);
        }
    });

    socket.on('order-accepted', (data) => {
        io.to(data.shopName.toLowerCase()).emit('order-confirmed', data);
    });

    // Το "Κρυφό" σήμα για να μένει ξύπνιος ο driver
    socket.on('heartbeat', () => {
        socket.emit('heartbeat-ack'); 
    });

    socket.on('disconnect', () => {
        if (socket.shop) {
            sendUpdatedDriverList(io, socket.shop);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
