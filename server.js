const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let drivers = {}; // Εδώ αποθηκεύουμε τους online ντελιβεράδες

io.on('connection', (socket) => {
    // Όταν συνδέεται ντελιβεράς και στέλνει το όνομά του
    socket.on('driver-login', (name) => {
        drivers[socket.id] = name;
        io.emit('update-drivers', drivers); // Ενημέρωση του μαγαζιού
    });

    // Κλήση συγκεκριμένου ντελιβερά
    socket.on('call-driver', (data) => {
        io.to(data.driverId).emit('new-order', { time: data.time });
    });

    // Αποδοχή παραγγελίας
    socket.on('order-accepted', (data) => {
        io.emit('driver-accepted', data);
    });

    // Ακύρωση από το μαγαζί
    socket.on('cancel-order', () => {
        io.emit('order-cancelled');
    });

    socket.on('disconnect', () => {
        delete drivers[socket.id];
        io.emit('update-drivers', drivers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
