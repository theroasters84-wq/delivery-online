const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Ένας χρήστης συνδέθηκε');

    // Όταν το μαγαζί καλεί ντελιβερά
    socket.on('new-order', (data) => {
        io.emit('new-order', data);
    });

    // Όταν ο ντελιβεράς αποδέχεται την κλήση
    socket.on('order-accepted', (data) => {
        console.log('Η παραγγελία έγινε αποδεκτή από:', data.driverName);
        io.emit('driver-accepted', data);
    });

    socket.on('disconnect', () => {
        console.log('Ένας χρήστης αποσυνδέθηκε');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
