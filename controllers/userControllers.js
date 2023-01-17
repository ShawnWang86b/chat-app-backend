const asyncHandler = require("express-async-handler");
const {
  generateRegisterToken,
  generateResetPwdToken,
} = require("../config/generateToken");
var nodemailer = require("nodemailer");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { userInfo } = require("os");
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
  console.log("secret", secret, userInfo);
  //generate a token, remainder: _id is an Object, need to use toString()
  const token = generateResetPwdToken(
    userInfo.email,
    userInfo._id.toString(),
    secret
  );
  console.log("token", token);

  //const link = `http://localhost:5000/api/user/reset-password/${userInfo._id}/${token}`;
  const link = `http://localhost:3000/reset-password/${userInfo._id}/${token}`;
  console.log("link", link);
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: userInfo.email,
    subject: "Password Reset",
    text: link,
  };
  console.log(mailOptions);

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.send(error);
    } else {
      console.log("Email sent:" + info.response);
      res.send("successful send");
    }
  });
});

//remainder: res.json(), res.send(), res.render, res.redirect make sure only call once
const resetPasswordLink = asyncHandler(async (req, res) => {
  //get id and token from the url
  const { id, token } = req.params;
  console.log("req.params", req.params);

  const userInfo = await User.findOne({ _id: id });
  if (!userInfo) {
    res.status(400);
    throw new Error("User not exists");
  }

  const secret = process.env.JWT_SECRET + userInfo.password;

  try {
    const verify = jwt.verify(token, secret);
    console.log("verify", verify);

    res.send("verified");
  } catch (error) {
    console.log(error);
    res.send("Not verified");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const userInfo = await User.findOne({ _id: id });
  if (!userInfo) {
    res.status(400);
    throw new Error("User not exists");
  }
  console.log("userInfo", userInfo);
  //
  const secret = process.env.JWT_SECRET + userInfo.password;
  console.log("secret", secret);
  try {
    const verify = jwt.verify(token, secret);

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    console.log("encryptedPassword", encryptedPassword);
    const userWithNewPwd = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        password: encryptedPassword,
      },
      { new: true }
    );
    res.send(userWithNewPwd);
    console.log("userWithNewPwd", userWithNewPwd);
  } catch (error) {
    res.send(error);
  }
});

module.exports = {
  registerUser,
  authUser,
  allUsers,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
};
