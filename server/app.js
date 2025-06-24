if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const router = require("./routers/router");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use(errorHandler);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.on("userConnected", (username) => {
    console.log(`User ${username} (${socket.id}) connected.`);
    io.emit("message", {
      username: "Server",
      message: `${username} has joined the chat.`,
    });
  });

  socket.on("chatMessage", (data) => {
    if (data && data.username && data.message) {
      console.log(`A message from ${data.username}: ${data.message}`);
      io.emit("message", {
        username: data.username,
        message: data.message,
      });
    } else {
      console.log(`Received: ${data}`);
    }
  });

  socket.on("disconnect", (username) => {
    console.log(`User ${username} (${socket.id}) disconnected.`);
    io.emit("message", {
      username: "Server",
      message: `${username} has left the chat.`,
    });
  });
});

module.exports = server;
