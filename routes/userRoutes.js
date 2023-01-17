const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(registerUser);
router.route("/login").post(authUser);
//can write in this way, if their router same:
// router.route("/").post(registerUser).get(allUsers)
router.route("/").get(protect, allUsers);
router.route("/forget-password").post(forgotPassword);
router
  .route("/reset-password/:id/:token")
  .get(resetPasswordLink)
  .put(resetPassword);

module.exports = router;
