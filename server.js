const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('--- Νέα σύνδεση:', socket.id);

    // Σύνδεση στο δωμάτιο (χρησιμοποιείται από Driver ΚΑΙ Shop)
    socket.on('driver-login', (data) => {
        if(!data.shop) return;
        const room = data.shop.toLowerCase().trim();
        socket.join(room);
        console.log(`[LOGIN] Ο χρήστης ${data.name} μπήκε στο δωμάτιο: ${room}`);
    });

    // Λήψη παραγγελίας από το Shop
    socket.on('new-order', (data) => {
        const room = data.shopName.toLowerCase().trim();
        console.log(`[ORDER] Νέα παραγγελία για το μαγαζί: ${room}`);
        // Στέλνουμε σε ΟΛΟΥΣ στο δωμάτιο (συμπεριλαμβανομένων των οδηγών)
        io.to(room).emit('new-order', data);
    });

    // Λήψη αποδοχής από τον Οδηγό
    socket.on('order-accepted', (data) => {
        const room = data.shopName.toLowerCase().trim();
        console.log(`[ACCEPT] Ο οδηγός ${data.driverName} αποδέχτηκε στο δωμάτιο: ${room}`);
        // Στέλνουμε την επιβεβαίωση πίσω στο Shop
        io.to(room).emit('order-confirmed', data);
    });

    socket.on('disconnect', () => {
        console.log('--- Χρήστης αποσυνδέθηκε');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
