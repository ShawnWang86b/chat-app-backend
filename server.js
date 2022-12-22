const express = require("express");
require("dotenv").config();
const chats = require("./data/data");
const app = express();

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  const singleChat = chats.find((c) => c._id === req.params.id);
  res.send(singleChat);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server starts on the port ${PORT}`));
