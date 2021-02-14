// Start up the server
const io = require("socket.io");
const ROOM_NAME = "main";
// Add listeners
class Chatland {
  constructor(server, options) {
    this.io = io(server, options);
    this.io.on("connection", (socket) => {
      const userData = {
        id: socket.id,
        isRegistered: false,
        nick: "Anonymous Turtle"
      };

      console.log("Client connected: " + socket.id);
      socket.join(ROOM_NAME);
      socket.emit(
        "psa",
        "Welcome to Chatland! You are in the room: " + ROOM_NAME
      );

      socket.on("joined", (userData) => {
        socket
          .to(ROOM_NAME)
          .emit("psa", `An anonymous reader has joined the chat.`);
      });

      socket.on("newRegistration", ({ id, nick }) => {
        userData.isRegistered = true;
        userData.nick = nick;
        socket.to(ROOM_NAME).emit("psa", `${nick} has joined the chat.`);
      });

      socket.on("register", (registration) => {
        if (!socket.info.registered) {
          socket.emit("psa", "Please enter your nick to send messages.");
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(`Client ${userData.nick} disconnected, ${reason}`);

        socket.to(ROOM_NAME).emit("psa", `${userData.nick} has left the chat.`);
      });

      socket.on("message", (data) => {
        const { userData, text, time } = data;
        const { id, nick } = userData;
        console.log(`${time} ${id} / ${nick}: ${text}`);
        socket.to(ROOM_NAME).emit("broadcast", { userData, text, time });
      });
    });
  }
}

module.exports = function (server, options) {
  return new Chatland(server, options);
};
