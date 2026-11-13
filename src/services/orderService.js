const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
// Educational demo: no payments, no inventory deduction, no concurrent checkout guarantees.
exports.createOrder = async ({ userId, items }) => {
  if (!mongoose.isValidObjectId(userId)) {
    const e = new Error("Invalid userId");
    e.status = 400;
    throw e;
  }
  if (!(await User.exists({ _id: userId }))) {
    const e = new Error("User not found");
    e.status = 404;
    throw e;
  }
  if (!Array.isArray(items) || !items.length) {
    const e = new Error("items must be a nonempty array");
    e.status = 400;
    throw e;
  }
  const snapshots = [];
  for (const item of items) {
    if (
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      const e = new Error("Invalid productId or quantity");
      e.status = 400;
      throw e;
    }
    const product = await Product.findById(item.productId);
    if (!product) {
      const e = new Error("Product not found");
      e.status = 404;
      throw e;
    }
    snapshots.push({
      productId: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }
  const totalAmount =
    Math.round(
      snapshots.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) * 100,
    ) / 100;
  return Order.create({ userId, items: snapshots, totalAmount });
};
