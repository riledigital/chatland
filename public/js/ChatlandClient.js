import { DateTime } from "https://cdn.skypack.dev/luxon";
import ChatlandAudio from "/js/ChatlandAudio.js";

class ChatlandClient {
  constructor(socket, document) {
    this.audio = new ChatlandAudio();
    this.preferences = { scroll: true };
    this.chatbox = document.getElementById("chatbox");
    this.userData = {
      id: socket.id,
      isRegistered: false,
      nick: "Anonymous Turtle"
    };
    this.socket = socket;
    this.form = document.querySelector("#form");

    // Set up simple socket listeners
    socket.on("connect", () => {
      this.audio.playSound("chat");
      console.log("You have connected to the chat server.");
      socket.emit("joined", this.userData);
      this.appendMessage({ type: "psa", text: "Connected to chat server." });
    });

    socket.on("psa", (message) => {
      this.audio.playSound("psa");
      this.appendPsaMessage(message);
    });

    socket.on("broadcast", (data) => {
      this.audio.playSound("newMessage");
      this.appendMessage(data);
    });

    // Sidestep losing access to `this`
    this.form.addEventListener("submit", (e) => this.handleChatSubmit(e));
  }

  handleChatSubmit(e) {
    const text = document.querySelector("#textInput").value;
    if (!this.userData?.isRegistered) {
      if (text.startsWith("/nick") && text.split(" ")[1]) {
        this.userData.nick = text.split(" ")[1];
        this.userData.isRegistered = true;
        this.socket.emit("newRegistration", this.userData);
        document.querySelector("#textInput").value = "";
      } else {
        this.appendPsaMessage({
          text: "Please set your nick with /nick <your desired username>"
        });
      }
    } else {
      if (text.length > 1) {
        const newTime = DateTime.now();
        const messageData = {
          userData: this.userData,
          text,
          time: newTime
        };
        this.socket.emit("message", messageData);
        console.info(messageData);
        this.appendMessage(messageData);
      }
      document.querySelector("#textInput").value = "";
    }
    e.preventDefault();
  }
  // Vanilla JS view code
  appendPsaMessage(data) {
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
    this.appendMessage({ type: "psa", text: formatted });
  }

  appendMessage(data) {
    // This is a pure vanilla JS view function that could
    // be subbed in for a Vue/React state change
    this.audio.playSound("chat");
    const { userData, time, text, type } = data;

    const item = document.createElement("div");
    item.className = "message";

    const messageText = document.createElement("span");
    messageText.innerText = text;
    messageText.className = "message-text";
    item.insertAdjacentElement("afterbegin", messageText);

    const nickSpan = document.createElement("span");
    nickSpan.innerText = userData ? userData.nick : "Chatland";
    nickSpan.className = "nick";
    messageText.insertAdjacentElement("afterbegin", nickSpan);

    const timestamp = document.createElement("span");
    const formattedTime = time
      ? DateTime.fromISO(time).toFormat("tt ZZZZ", { locale: "en-US" })
      : DateTime.now().toFormat("tt ZZZZ", { locale: "en-US" });
    timestamp.innerText = formattedTime;

    timestamp.title = time
      ? DateTime.fromISO(time).toFormat("FFFF")
      : formattedTime;
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
