const asyncHandler = require("express-async-handler");
const {
  generateRegisterAccessToken,
  generateRegisterRefreshToken,
  generateResetPwdToken,
} = require("../config/generateToken");
var nodemailer = require("nodemailer");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client, GoogleAuth } = require("google-auth-library");

//Google login
// const googleLogin = asyncHandler(async (req, res) => {
//   const googleToken = req.body.google_token;
//   const client = new OAuth2Client(
//     "183399659179-8lecl04i1iiijq2tovp18h3rqn3kl4cd.apps.googleusercontent.com",
//     "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"
//   );
//   //to get id token
//   const googleAuth = new GoogleAuth()
//   const client_For_ID_Token = await googleAuth.getClient();

//   const ticket = await client.verifyIdToken({
//     idToken: googleToken,
//     audience:
//       "183399659179-8lecl04i1iiijq2tovp18h3rqn3kl4cd.apps.googleusercontent.com",
//   });
//   const payload = ticket.getPayload();
//   console.log(payload);
// });
//user register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
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

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  //code 401 Unauthorized
  //the client request has not been completed because it lacks valid authentication credentials for the requested resource
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  accessToken = generateRegisterAccessToken(user._id);
  //Create secure cookie with refresh
  res.cookie("jwt", generateRegisterRefreshToken(user._id), {
    httpOnly: true, //accessible only by web server
    //secure: true, //https, will added when deployed
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: accessToken,
  });
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
  //googleLogin,
  registerUser,
  authUser,
  allUsers,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
};
