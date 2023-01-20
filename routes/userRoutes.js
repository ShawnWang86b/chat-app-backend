const express = require("express");
const { allUsers } = require("../controllers/userControllers");
const { verifyJWT } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").get(verifyJWT, allUsers);

module.exports = router;
