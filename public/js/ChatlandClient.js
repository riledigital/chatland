import { DateTime } from "https://cdn.skypack.dev/luxon";
import { zzfx } from "https://cdn.skypack.dev/zzfx";

class ChatlandClient {
  constructor(socket, document) {
    console.log(zzfx);
    this.chatbox = document.getElementById("chatbox");

    const newItem = (content) => {
      const item = document.createElement("div");
      item.className = "message";
      item.innerText = content;
      return item;
    };

    const userData = {
      id: socket.id,
      isRegistered: false,
      nick: "Anonymous Turtle"
    };

    socket.on("connect", () => {
      this.playSound("chat");
      this.chatbox.appendChild(newItem("Connected to chat server."));
      this.chatbox.appendChild(
        newItem("Please set your nick with /nick <your nick>")
      );
      socket.emit("joined", userData);
    });

    socket.on("psa", (message) => {
      this.playSound("psa");
      addPsaMessage(message);
    });

    socket.on("broadcast", (data) => {
      const { userData, text, time, type } = data;
      const { id, nick } = userData;
      console.log(data);
      this.playSound("chat");
      this.appendMessage(data);
    });

    const addNewMessage = (data) => {
      const { userData, text, time } = data;
      const { id, nick } = userData;
      const formatted = `${time} ${nick}: ${text}`;
      this.chatbox.appendChild(newItem(formatted));
    };

    const addPsaMessage = (data) => {
      const { type, nick } = data;
      let formatted;
      switch (type) {
        case "userJoined": {
          formatted = `${nick} has joined the chat.`;
        }
        case "userLeft": {
          formatted = `${nick} has left the chat.`;
        }
        default: {
        }
      }
      this.chatbox.appendChild(newItem(formatted));
    };

    const form = document.querySelector("#form");

    form.addEventListener("submit", (e) => {
      const text = document.querySelector("#textInput").value;
      if (!userData.isRegistered) {
        if (text.startsWith("/nick") && text.split(" ")[1]) {
          userData.nick = text.split(" ")[1];
          userData.isRegistered = true;
          addPsaMessage(`Hi there ${userData.nick}!`);
          socket.emit("newRegistration", userData);
          document.querySelector("#textInput").value = "";
        } else {
          addPsaMessage(
            "Please set your nick with /nick <your desired username>"
          );
        }
      } else {
        console.log(`Sending ${text}`);
        const messageData = {
          userData,
          text,
          time: DateTime.now().toFormat("HH:mm")
        };
        socket.emit("message", messageData);
        // addNewMessage(messageData);
        this.appendMessage(messageData);
      }
      e.preventDefault();
      document.querySelector("#textInput").value = "";
    });
  }

  appendMessage(data) {
    const { userData, time, text, type } = data;
    const { id, nick } = userData;
    const item = document.createElement("div");
    item.className = "message";

    const messageText = document.createElement("span");
    messageText.innerText = nick + ": " + text;
    messageText.className = "message-text";
    item.appendChild(messageText);

    const timestamp = document.createElement("span");
    timestamp.innerText = time;
    timestamp.className = "timestamp";
    item.appendChild(timestamp);
    this.playSound("chat");
    this.chatbox.append(item);
  }

  playSound(sound) {
    switch (sound) {
      case "psa": {
        zzfx(...[0.25, , 1193, 0.01, 0.02, 0.09, , 2.29, -8.7, , 69]); // Blip 7
        break;
      }
      case "chat": {
        console.log("sfx");
        zzfx(
          ...[
            0.5,
            0,
            520,
            0.11,
            ,
            0.01,
            ,
            6,
            90,
            ,
            -850,
            0.37,
            ,
            ,
            ,
            ,
            ,
            0,
            0.03
          ]
        ); // Blip 3        break;
      }
      default: {
        return null;
      }
    }
  }
}

export default ChatlandClient;
