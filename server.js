const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "shop.html"));
});

app.get("/driver", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "driver.html"));
});

// ================= SOCKET.IO =================
const drivers = {}; // name -> socket.id

io.on("connection", (socket) => {
  console.log("Νέα σύνδεση:", socket.id);

  socket.on("register-driver", (name) => {
    drivers[name] = socket.id;
    socket.driverName = name;
    console.log("Ντελιβεράς συνδέθηκε:", name);

    // στέλνει τη λίστα ονομάτων σε όλα τα shops
    io.emit("drivers-list", Object.keys(drivers));
  });

  socket.on("call-driver", (name) => {
    const driverSocket = drivers[name];
    if(driverSocket) {
      io.to(driverSocket).emit("ring");
      console.log("Κλήση προς:", name);
    }
  });

  socket.on("driver-accepted", () => {
    console.log("Ο ντελιβεράς πήρε την κλήση:", socket.driverName);
  });

  socket.on("disconnect", () => {
    if(socket.driverName && drivers[socket.driverName]) {
      delete drivers[socket.driverName];
      io.emit("drivers-list", Object.keys(drivers));
      console.log("Αποσύνδεση:", socket.driverName);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log("Server τρέχει στο http://localhost:" + PORT);
});
