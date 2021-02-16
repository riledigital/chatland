import express from 'express';
import http from "http";
import ChatlandServer from "./ChatlandServer.js";
const app = express();
const server = http.createServer(app);
app.use(express.static("public"));

app.get("/", (req, res) => {

});

server.listen(3000);

const chatland = new ChatlandServer(server, {});