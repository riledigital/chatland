const express = require("express");
const app = express();
const server = require("http").createServer(app);

const Chatland = require("./Chatland.js");

app.use(express.static("public"));

app.get("/", (req, res) => {
  // res.send("Hello World!");
});

server.listen(3000);

Chatland(server, {});
