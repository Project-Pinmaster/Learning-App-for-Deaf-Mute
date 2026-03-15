const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret_dweep", {
    expiresIn: "30d",
  });
};

module.exports = generateToken;
