const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, () => {
    (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = User.findById(decoded.id).select("-password");
      next();
    };
  });
});

// const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
// req.user = await User.findById(decoded.id).select("-password");
// next();

module.exports = { verifyJWT };
