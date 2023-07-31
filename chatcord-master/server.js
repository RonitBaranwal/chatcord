const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const server = http.createServer(app);
const { userJoin, currentUser, getCurrentUser ,getRoomUsers, userLeave} = require("./utils/users");
const io = socketio(server);
const botName = "chatcord bot";
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit("message", formatMessage(botName, "welcome to chatcord"));
        socket.broadcast
            .to(user.room)
            .emit("message", formatMessage(botName, ` ${username} has joined  the chat`));
            // send users and room info 
      io.to(user.room).emit('roomUsers',  {
                room: user.room,
                users: getRoomUsers(user.room),
            })
    });

  socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message", formatMessage(user.username, msg));
    });
    //disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    // const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`));
      
    }
    
    });
});
const PORT = 3000 || express.env.PORT;
server.listen(PORT, () => console.log("server starting at prot 3000"));
