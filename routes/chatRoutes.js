const { protect } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
} = require("../controllers/chatControllers");
const express = require("express");
const router = express.Router();

router.route("/").post(protect, accessChat);
//fetch all of the chat for particular user
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
// router.route("/rename").put(protect, renameGroup);
// router.route("/groupremove").put(protect, removeFromGroup);
// router.route("/groupadd").put(protect, addToGroup)

module.exports = router;
