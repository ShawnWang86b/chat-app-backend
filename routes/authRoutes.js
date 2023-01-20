const express = require("express");
const {
  registerUser,
  authUser,
  refresh,
  logout,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
  //googleLogin,
} = require("../controllers/authControllers");
const router = express.Router();

router.route("/").post(registerUser);
//router.route("/google-login").post(googleLogin);
router.route("/login").post(authUser);
router.route("/refresh").get(refresh);
router.route("/logout").post(logout);
router.route("/forget-password").post(forgotPassword);
router
  .route("/reset-password/:id/:token")
  .get(resetPasswordLink)
  .put(resetPassword);

module.exports = router;
