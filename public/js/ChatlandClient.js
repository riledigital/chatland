import { DateTime } from "https://cdn.skypack.dev/luxon";

class ChatlandClient {
  constructor(document) {
    const $chatbox = document.getElementById("chatbox");

    const newItem = (content) => {
      const item = document.createElement("div");
      item.className = "message";
      item.innerText = content;
      return item;
    };

    function appendMessage(data) {
      const { userData, time, text } = data;
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

      $chatbox.append(item);
    }

    const socket = io();
    const userData = {
      id: socket.id,
      isRegistered: false,
      nick: "Anonymous Turtle"
    };

    socket.on("connect", () => {
      $chatbox.appendChild(newItem("Connected to chat server."));
      $chatbox.appendChild(
        newItem("Please set your nick with /nick <your nick>")
      );
      socket.emit("joined", userData);
    });

    socket.on("psa", (message) => {
      addPsaMessage(message);
    });

    socket.on("broadcast", (data) => {
      const { userData, text, time } = data;
      const { id, nick } = userData;
      console.log(data);
      console.log(`New message from ${nick} session ${id}`);
      // addNewMessage({ userData, text, time });
      appendMessage(data);
    });

    function addNewMessage(data) {
      const { userData, text, time } = data;
      const { id, nick } = userData;
      const formatted = `${time} ${nick}: ${text}`;
      $chatbox.appendChild(newItem(formatted));
    }

    function addPsaMessage(message) {
      // const timestamp = DateTime().now().toFormat("HH:mm");
      const formatted = `Chatland System: ${message}`;
      $chatbox.appendChild(newItem(formatted));
    }

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
        appendMessage(messageData);
      }
      e.preventDefault();
      document.querySelector("#textInput").value = "";
    });

    function clearChat() {
      // document.querySelector(".chat-log")
    }
  }
}

export default ChatlandClient;
