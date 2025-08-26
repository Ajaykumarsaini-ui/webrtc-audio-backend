const express = require("express");
const http = require("http");
const morgan = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io"); // ✅ FIXED

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://taupe-madeleine-4fb604.netlify.app", // ← No trailing slash
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);


    socket.on("message", (data) => {
        console.log("Message received:", data);
        // Broadcast message to all clients (including sender)
        io.emit("message", data);
        // Agar sirf dusre clients ko bhejna hai toh:
        // socket.broadcast.emit("message", data);
    });


    // exchange offer 

    socket.on("offer", (data) => {
        socket.to(data.roomId).emit("offer", {
            sdp: data.sdp,
            sender: socket.id
        });
    });

    // exchange answer

    socket.on("answer", (data) => {
        socket.to(data.roomId).emit("answer", {
            sdp: data.sdp,
            sender: socket.id
        });
    });

    // exchange ice-candidate

    socket.on("ice-candidate", (data) => {
        socket.to(data.roomId).emit("ice-candidate", {
            candidate: data.candidate,
            sender: socket.id
        });
    });

    socket.on("join", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });


    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });


});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
