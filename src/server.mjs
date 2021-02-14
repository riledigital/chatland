import express from 'express';
import http from "http";
import Chatland from "./Chatland.js";
const app = express();
const server = http.createServer(app);
app.use(express.static("public"));
app.get("/", (req, res) => {
  // res.send("Hello World!");
});

server.listen(3000);

const chatland = new Chatland(server, {});