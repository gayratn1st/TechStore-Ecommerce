const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
exports.create = async (req, res) => {
  const { userId, productId } = req.body;
  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(productId))
    return res.status(400).json({ error: "Invalid IDs" });
  if (
    !(await User.exists({ _id: userId })) ||
    !(await Product.exists({ _id: productId }))
  )
    return res.status(404).json({ error: "User or product not found" });
  res.status(201).json(await Review.create(req.body));
};
exports.list = async (req, res) =>
  res.json(
    await Review.find()
      .populate("userId", "name")
      .populate("productId", "name"),
  );
