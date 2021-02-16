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
          nick: userData.nick,
          time: DateTime.now()
        });
      });

      socket.on("newRegistration", ({ id, nick }) => {
        if (nick.length > 15 && nick.length < 1) {
          socket.emit("psa", {
            type: "error",
            text: "Please choose a nick of >= 1 and <= 15 characters."
          });
        }
        userData.isRegistered = true;
        userData.nick = nick;

        socket.emit("psa", {
          type: "psa",
          text: `Your nick is: ${userData.nick}.`
        });
        ChatlandServer.makeBroadcast(socket, {
          time: DateTime.now(),
          type: "userJoined",
          userData
        });
      });

      socket.on("register", (registration) => {
        if (!socket.info.registered) {
          socket.emit("psa", {
            type: "error",
            text: "Please enter your nick to send messages.",
            time: DateTime.now()
          });
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(`Client ${userData.nick} disconnected, ${reason}`);
        ChatlandServer.makeBroadcast(socket, {
          userData,
          text: `${userData.nick} has left the chat.`,
          type: "userLeft",
          time: DateTime.now()
        });
      });

      socket.on("message", (data) => {
        const { userData, text, time } = data;
        const { id, nick } = userData;
        // Forward the time data from the client
        const newChatData = {
          userData,
          text,
          time: DateTime.fromISO(time),
          type: "newMessage"
        };
        console.log(newChatData);
        ChatlandServer.makeBroadcast(socket, newChatData);
      });
    });
  }

  static makeBroadcast(socket, data) {
    if (data.type === "newMessage") {
      socket.to(ROOM_NAME).emit("broadcast", { ...data });
    } else if (data.type === "psa") {
      socket.to(ROOM_NAME).emit("psa", { time: DateTime.now(), ...data });
    }
  }
}

export default ChatlandServer;
