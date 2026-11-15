const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.login = async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+passwordHash");

  // Old demo users may not have a passwordHash.
  if (!user || !user.passwordHash) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "2h",
  });

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || "CUSTOMER",
    },
  });
};
