import { DateTime } from "https://cdn.skypack.dev/luxon";
import ChatlandAudio from "/js/ChatlandAudio.js";
class ChatlandClient {
  constructor(socket, document) {
    this.audio = new ChatlandAudio();
    this.preferences = { scroll: true };
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
      this.audio.playSound("chat");
      this.chatbox.appendChild(
        newItem("You have connected to the chat server.")
      );
      this.chatbox.appendChild(
        newItem("Please set your nick with /nick <your nick>")
      );
      socket.emit("joined", userData);
    });

    socket.on("psa", (message) => {
      this.audio.playSound("psa");
      addPsaMessage(message);
    });

    socket.on("broadcast", (data) => {
      console.log(data);
      this.audio.playSound("chatIncoming");
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
          break;
        }
        case "userLeft": {
          formatted = `${nick} has left the chat.`;
          break;
        }
        case "error": {
          formatted = `Error! ${data.text}`;
          break;
        }
        default: {
          formatted = `${data.text}`;
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
          addPsaMessage({ text: `Your nick is: ${userData.nick}.` });
          socket.emit("newRegistration", userData);
          document.querySelector("#textInput").value = "";
        } else {
          addPsaMessage({
            text: "Please set your nick with /nick <your desired username>"
          });
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
    this.audio.playSound("chat");
    const { userData, time, text, type } = data;
    const { id, nick } = userData;
    const item = document.createElement("div");
    item.className = "message";

    const messageText = document.createElement("span");
    messageText.innerText = text;
    messageText.className = "message-text";
    item.insertAdjacentElement("afterbegin", messageText);

    const nickSpan = document.createElement("span");
    nickSpan.innerText = nick;
    nickSpan.className = "nick";
    messageText.insertAdjacentElement("afterbegin", nickSpan);

    const timestamp = document.createElement("span");
    timestamp.innerText = time;
    timestamp.className = "timestamp";
    item.appendChild(timestamp);

    this.chatbox.append(item);
    console.log(data);
    if (type === "userLeft") {
      item.classList.add("broadcast--left");
    }
    item.scrollIntoView();
  }
}

export default ChatlandClient;
