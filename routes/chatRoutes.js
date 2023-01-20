const { verifyJWT } = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");
const express = require("express");
const router = express.Router();

router.use(verifyJWT);
router.route("/").post(accessChat);
//fetch all of the chat for particular user
router.route("/").get(fetchChats);
router.route("/group").post(createGroupChat);
router.route("/rename").put(renameGroup);
router.route("/groupadd").put(addToGroup);
router.route("/groupremove").put(removeFromGroup);

module.exports = router;
