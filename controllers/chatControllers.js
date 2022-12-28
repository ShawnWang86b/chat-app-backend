const asyncHandler = require("express-async-handler");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
});

module.exports = { accessChat };
