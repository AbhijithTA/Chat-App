const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data.room);
    console.log(`User with ID: ${socket.id} joined room: ${data.room}`);

    // Notify all users in the room except the new user
    socket.to(data.room).emit("user_joined", {
      userId: socket.id,
      username: data.username,
      message: `${data.username} has joined the room.`,
    });
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", (data) => {
    socket.leave(data.room);
    console.log(`User with ID: ${socket.id} left room: ${data.room}`);

    // Notify all users in the room that the user has left
    socket.to(data.room).emit("user_left", {
      userId: socket.id,
      username: data.username,
      message: `${data.username} has left the room.`,
    });
  });

  //typing notification
  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});


