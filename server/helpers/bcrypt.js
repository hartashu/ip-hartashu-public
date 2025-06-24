const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
  return bcrypt.hashSync(password);
};

const compareHash = (plainText, hash) => {
  return bcrypt.compareSync(plainText, hash);
};

module.exports = {
  hashPassword,
  compareHash,
};
