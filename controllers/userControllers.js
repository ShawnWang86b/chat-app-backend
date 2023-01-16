const asyncHandler = require("express-async-handler");
const {
  generateRegisterToken,
  generateResetPwdToken,
} = require("../config/generateToken");
var nodemailer = require("nodemailer");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

//user register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exist");
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateRegisterToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failing to create the user");
  }
});

//login
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateRegisterToken(user._id),
    });
  } else {
    //code 401 Unauthorized
    //the client request has not been completed because it lacks valid authentication credentials for the requested resource
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});
// /api/user?search=shawn
const allUsers = asyncHandler(async (req, res) => {
  const optionalQuery = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(optionalQuery).find({
    _id: { $ne: req.user._id },
  });
  res.send(users);
});

// /api/user/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userInfo = await User.findOne({ email });
  if (!userInfo) {
    res.status(400);
    throw new Error("User not exists");
  }

  //create a secret, related to this user
  const secret = process.env.JWT_SECRET + userInfo.password;
  console.log("secret", secret);
  //generate a token
  const token = generateResetPwdToken(userInfo.email, userInfo._id, secret);
  console.log("token", token);

  const link = `http://localhost:5000/api/user/forgot-password/${userInfo._id}/${token}`;
  console.log("link", link);
});

const resetPassword = asyncHandler(async (req, res) => {
  //get id and token from the url
  const { id, token } = req.params;
  const userInfo = User.findOne({ _id: id });
  if (!userInfo) {
    res.status(400);
    throw new Error("User not exists");
  }
  const secret = process.env.JWT_SECRET + userInfo.password;

  const verify = jwt.verify(token, secret);
  console.log("verify", verify);
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  forgotPassword,
  resetPassword,
};
