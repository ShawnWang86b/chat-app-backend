const jwt = require("jsonwebtoken");

const generateRegisterAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRegisterRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

//don't forget to pass secret, because secret may change in different scenario
const generateResetPwdToken = (email, id, secret) => {
  return jwt.sign({ email, id }, secret, {
    expiresIn: "5m",
  });
};

module.exports = {
  generateRegisterAccessToken,
  generateRegisterRefreshToken,
  generateResetPwdToken,
};
