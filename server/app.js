if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const router = require("./routers/router");
const errorHandler = require("./middlewares/errorHandler");
const Controller = require("./controllers/controller");

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

io.on("connect", (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.on("userConnected", (username) => {
    socket.username = username;

    io.emit("message", {
      username: "System",
      message: `${username} has joined the chat`,
    });
  });

  socket.on("chatMessage", (data) => {
    if (data && data.userId && data.username && data.message) {
      Controller.postMessageByServer(data.userId, data.message);
      // const foundUser = Controller.findUserById(userId);

      io.emit("message", {
        username: data.username,
        message: data.message,
      });
    }
  });

  socket.on("disconnect", () => {
    const disconnectedUsername = socket.username || "Someone";

    io.emit("message", {
      username: "System",
      message: `${disconnectedUsername} has left the chat.`,
    });
  });
});

module.exports = server;
