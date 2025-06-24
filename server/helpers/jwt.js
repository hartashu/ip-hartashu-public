if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_KEY);
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_KEY);
};

module.exports = {
  generateToken,
  verifyToken,
};
