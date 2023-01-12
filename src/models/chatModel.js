const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Creating a model
// we need to convert our chatModel into a Model we can work with
// therefore, we pass it into mongoose.model("Chat", chatModel)
// ready to go
const Chat = mongoose.model("Chat", chatModel);

// Last export the model
module.exports = Chat;
