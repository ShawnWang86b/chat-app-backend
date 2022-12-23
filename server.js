const express = require("express");

const chats = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");

require("dotenv").config();
connectDB();
const app = express();

app.use(express.json());
app.get("/", (req, res) => {
  res.send("API is Running Successfully");
});

app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`server starts on the port ${PORT}`.yellow.bold));
