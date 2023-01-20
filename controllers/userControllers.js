const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc search user
// @route GET /api/user?search=shawn
// @access Protect
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

module.exports = {
  allUsers,
};
