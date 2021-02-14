import { Server } from "socket.io";
import { DateTime } from "luxon";

const ROOM_NAME = "main";
// Add listeners
class Chatland {
  constructor(server, options) {
    this.io = new Server(server, options);
    this.io.on("connection", (socket) => {
      const userData = {
        id: socket.id,
        isRegistered: false,
        nick: "Anonymous Turtle"
      };

      console.log("Client connected: " + socket.id);
      socket.join(ROOM_NAME);
      socket.emit("psa", {
        text: `Welcome to Chatland! You are in the room: ${ROOM_NAME}`
      });

      socket.on("joined", (userData) => {
        Chatland.makeBroadcast(socket, {
          type: "userJoined",
          nick: userData.nick
        });
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
        Chatland.makeBroadcast(socket, {
          userData,
          text: `${userData.nick} has left the chat.`,
          time: new DateTime.now(),
          type: "userLeft"
        });
      });

      socket.on("message", (data) => {
        const { userData, text, time } = data;
        const { id, nick } = userData;
        const newChatData = { userData, text, time, type: "newMessage" };
        console.log(newChatData);
        Chatland.makeBroadcast(socket, newChatData);
      });
    });
  }

  static makeBroadcast(socket, data) {
    socket.to(ROOM_NAME).emit("psa", data);
  }
}

// module.exports = function (server, options) {
//   return new Chatland(server, options);
// };

export default Chatland;
