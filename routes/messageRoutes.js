const express = require("express");
const {
  sendMessage,
  allMessages,
} = require("../controllers/messageControllers");
const { verifyJWT } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(verifyJWT);

router.route("/").post(sendMessage);
router.route("/:chatId").get(allMessages);
module.exports = router;
