const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");

exports.create = async (req, res) => {
  const { productId, rating, comment } = req.body || {};

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      error: "Invalid productId",
    });
  }

  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return res.status(400).json({
      error: "Rating must be an integer from 1 to 5",
    });
  }

  if (comment !== undefined && typeof comment !== "string") {
    return res.status(400).json({
      error: "Comment must be a string",
    });
  }

  const productExists = await Product.exists({
    _id: productId,
  });

  if (!productExists) {
    return res.status(404).json({
      error: "Product not found",
    });
  }

  const review = await Review.create({
    userId: req.user.id,
    productId,
    rating,
    comment: comment || "",
  });

  res.status(201).json(review);
};

exports.list = async (req, res) => {
  const reviews = await Review.find()
    .populate("userId", "name")
    .populate("productId", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
};
