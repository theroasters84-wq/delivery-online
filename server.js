const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// 1. Ρύθμιση για να αναγνωρίζει ο server τα αρχεία μέσα στον φάκελο public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Συγκεκριμένα Routes για τα αρχεία του Driver (για σιγουριά)
app.get('/driver', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});

app.get('/driver.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'driver.html'));
});

// 3. Σύνδεση Socket.io
io.on('connection', (socket) => {
    console.log('Ένας χρήστης συνδέθηκε:', socket.id);

    // Όταν συνδέεται ο οδηγός
    socket.on('driver-login', (data) => {
        socket.join(data.shop);
        console.log(`Ο οδηγός ${data.name} συνδέθηκε στο κατάστημα: ${data.shop}`);
    });

    // Όταν το κατάστημα στέλνει παραγγελία
    socket.on('new-order', (data) => {
        // Η παραγγελία πάει σε όλους τους οδηγούς του συγκεκριμένου καταστήματος
        io.to(data.shop).emit('new-order', data);
    });

    // Όταν ο οδηγός αποδέχεται την παραγγελία
    socket.on('order-accepted', (data) => {
        console.log(`Η παραγγελία έγινε δεκτή από: ${data.driverName}`);
        io.emit('order-confirmed', data);
    });

    socket.on('disconnect', () => {
        console.log('Ένας χρήστης αποσυνδέθηκε');
    });
});

// 4. Εκκίνηση του Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
