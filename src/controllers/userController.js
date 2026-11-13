const User = require("../models/User");
exports.create = async (req, res) =>
  res.status(201).json(await User.create(req.body));
exports.list = async (req, res) =>
  res.json(await User.find().sort({ createdAt: -1 }));
