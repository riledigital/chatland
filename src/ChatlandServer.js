import { Server } from "socket.io";
import { DateTime } from "luxon";

const ROOM_NAME = "main";
// Add listeners
class ChatlandServer {
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
        ChatlandServer.makeBroadcast(socket, {
          type: "userJoined",
          nick: userData.nick
        });
      });

      socket.on("newRegistration", ({ id, nick }) => {
        userData.isRegistered = true;
        userData.nick = nick;
        ChatlandServer.makeBroadcast(socket, { type: "userJoined", userData });
      });

      socket.on("register", (registration) => {
        if (!socket.info.registered) {
          socket.emit("psa", {
            type: "error",
            text: "Please enter your nick to send messages."
          });
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(`Client ${userData.nick} disconnected, ${reason}`);
        ChatlandServer.makeBroadcast(socket, {
          userData,
          text: `${userData.nick} has left the chat.`,
          type: "userLeft"
        });
      });

      socket.on("message", (data) => {
        const { userData, text, time } = data;
        const { id, nick } = userData;
        const newChatData = { userData, text, time, type: "newMessage" };
        console.log(newChatData);
        ChatlandServer.makeBroadcast(socket, newChatData);
      });
    });
  }

  static makeBroadcast(socket, data) {
    if (data.type === "newMessage") {
      socket.to(ROOM_NAME).emit("broadcast", { time: DateTime.now(), ...data });
    } else if (data.type === "psa") {
      socket.to(ROOM_NAME).emit("psa", { time: DateTime.now(), ...data });
    }
  }
}

export default ChatlandServer;
