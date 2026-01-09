const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

// 1. Σερβίρισμα στατικών αρχείων από τον φάκελο public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Routes για τα αρχεία (για να μην βγάζει 404 ο Chrome)
app.get('/driver', (req, res) => res.sendFile(path.join(__dirname, 'public', 'driver.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(__dirname, 'public', 'shop.html')));
app.get('/manifest-shop.json', (req, res) => res.sendFile(path.join(__dirname, 'public', 'manifest-shop.json')));
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// 3. Λογική Socket.io για την επικοινωνία
io.on('connection', (socket) => {
    console.log('Νέα σύνδεση:', socket.id);

    // Σύνδεση Καταστήματος
    socket.on('shop-login', (data) => {
        const shopRoom = data.shop.toLowerCase().trim();
        socket.join(shopRoom);
        socket.isShop = true;
        console.log(`Το κατάστημα ${shopRoom} είναι online.`);
    });

    // Σύνδεση Οδηγού
    socket.on('driver-login', (data) => {
        const shopRoom = data.shop.toLowerCase().trim();
        socket.join(shopRoom);
        socket.shopName = shopRoom;
        socket.driverName = data.name;
        
        console.log(`Ο οδηγός ${data.name} συνδέθηκε στο ${shopRoom}`);

        // Ενημέρωση του καταστήματος ότι ο οδηγός μπήκε
        io.to(shopRoom).emit('driver-status', { 
            name: data.name, 
            status: 'online' 
        });
    });

    // Αποστολή Παραγγελίας (Από Shop -> Οδηγούς)
    socket.on('new-order', (data) => {
        const shopRoom = data.shop.toLowerCase().trim();
        console.log(`Νέα παραγγελία για το κατάστημα: ${shopRoom}`);
        // Στέλνουμε σε όλους στο δωμάτιο (οι οδηγοί θα την ακούσουν)
        io.to(shopRoom).emit('new-order', data);
    });

    // Αποδοχή Παραγγελίας (Από Οδηγό -> Shop)
    socket.on('order-accepted', (data) => {
        const shopRoom = data.shopName ? data.shopName.toLowerCase().trim() : socket.shopName;
        console.log(`Η παραγγελία έγινε δεκτή από: ${data.driverName}`);
        
        // Ενημερώνουμε το κατάστημα ότι ο συγκεκριμένος οδηγός την πήρε
        io.to(shopRoom).emit('order-confirmed', { 
            driverName: data.driverName 
        });
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

// 4. Εκκίνηση Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server τρέχει στη θύρα ${PORT}`);
});
