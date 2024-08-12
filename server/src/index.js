const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change this to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

const users = {}; // Track connected users

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    const { username, room } = data;
    socket.join(room);
    users[socket.id] = { username, room };

    // Notify other users that this user is online
    socket.to(room).emit("user_online", { username });

    const onlineUsers = Object.values(users)
      .filter((user) => user.room === room)
      .map((user) => user.username);

    // Send the list of current online users to the newly connected user
    socket.emit("online_users", onlineUsers);

    // Notify all users in the room except the new user
    socket.to(room).emit("user_joined", {
      userId: socket.id,
      username: username,
      message: `${username} has joined the room.`,
    });
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("leave_room", (data) => {
    const { username, room } = data;
    socket.leave(room);
    
    // Remove the user from the tracking object
    delete users[socket.id];
    console.log(`User with ID: ${socket.id} left room: ${room}`);

    // Notify all users in the room that the user has left
    socket.to(room).emit("user_left", {
      userId: socket.id,
      username: username,
      message: `${username} has left the room.`,
    });

    // Notify others in the room that this user is offline
    io.to(room).emit("user_offline", { username });
  });

  // Typing notification
  socket.on("typing", (data) => {
    socket.to(data.room).emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.room).emit("stop_typing", data);
  });

  // Message deletion
  socket.on("delete_message", (messageData) => {
    const { room, messageId } = messageData;
    socket.to(room).emit("message_deleted", messageId);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users[socket.id];

    if (user) {
      const { username, room } = user;

      // Remove the user from the users object
      delete users[socket.id];

      // Notify others in the room that this user is offline
      io.to(room).emit('user_offline', { username });

      console.log(`User with ID: ${socket.id} disconnected from room: ${room}`);
    } else {
      console.log(`User with ID: ${socket.id} disconnected, but no user data found.`);
    }
  });
});

// Set the port dynamically using an environment variable, defaulting to 3001
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SERVER RUNNING on port ${PORT}`);
});
