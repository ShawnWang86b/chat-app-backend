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

// @desc Register
// @route POST /api/user/
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
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
      token: generateRegisterAccessToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failing to create the user");
  }
});

// @desc Login
// @route POST /api/user/login
// @access Public
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
  const accessToken = generateRegisterAccessToken(user._id);
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

// @desc Refresh
// @route GET /api/user/login
// @access Public - because access token has expired
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const user = await User.findOne({ _id: decoded.id });

      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = generateRegisterAccessToken(user._id);

      res.json({ accessToken });
    })
  );
};

// @desc Logout
// @route POST /api/user/logout
// @access Public - clear cookie if exists
const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

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
  refresh,
  logout,
  forgotPassword,
  resetPasswordLink,
  resetPassword,
};
