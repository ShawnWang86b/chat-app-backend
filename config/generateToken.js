const jwt = require("jsonwebtoken");

const generateRegisterToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

//don't forget to pass secret, because secret may change in different scenario
const generateResetPwdToken = (email, id, secret) => {
  return jwt.sign({ email, id }, secret, {
    expiresIn: "30d",
  });
};

module.exports = { generateRegisterToken, generateResetPwdToken };
