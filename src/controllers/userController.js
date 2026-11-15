const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.create = async (req, res) => {
  const { name, email, password, address } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return res.status(400).json({
      error: "Valid name, email and password (8-72 characters) are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return res.status(409).json({
      error: "Email already registered",
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    address: typeof address === "string" ? address : "",
    role: "CUSTOMER",
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

exports.list = async (req, res) => {
  const users = await User.find()
    .select("name email role address createdAt")
    .sort({ createdAt: -1 });

  res.json(users);
};
