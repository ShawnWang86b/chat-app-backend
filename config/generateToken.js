const jwt = require("jsonwebtoken");

const generateRegisterToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const generateResetPwdToken = (email, id, secret) => {
  return jwt.sign({ email, id }, secret, {
    expiresIn: "5m",
  });
};

module.exports = { generateRegisterToken, generateResetPwdToken };
