const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

function createError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

exports.createOrder = async ({ userId, items }) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError("Invalid userId", 400);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw createError("items must be a nonempty array", 400);
  }

  // Combine repeated product IDs to prevent duplicate stock deductions.
  const quantities = new Map();

  for (const item of items) {
    if (
      !item ||
      !mongoose.isValidObjectId(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      throw createError("Invalid productId or quantity", 400);
    }

    const productId = item.productId.toString();

    quantities.set(productId, (quantities.get(productId) || 0) + item.quantity);
  }

  return mongoose.connection.transaction(async (session) => {
    const user = await User.exists({ _id: userId }).session(session);

    if (!user) {
      throw createError("User not found", 404);
    }

    const snapshots = [];

    for (const [productId, quantity] of quantities) {
      // Atomically decrement stock only when enough units exist.
      const product = await Product.findOneAndUpdate(
        {
          _id: productId,
          stock: { $gte: quantity },
        },
        {
          $inc: { stock: -quantity },
        },
        {
          new: false,
          session,
          runValidators: true,
        },
      );

      if (!product) {
        const exists = await Product.exists({
          _id: productId,
        }).session(session);

        if (!exists) {
          throw createError("Product not found", 404);
        }

        throw createError("Insufficient stock for product: " + productId, 409);
      }

      snapshots.push({
        productId: product._id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
      });
    }

    const totalAmount =
      Math.round(
        snapshots.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        ) * 100,
      ) / 100;

    const [order] = await Order.create(
      [
        {
          userId,
          items: snapshots,
          totalAmount,
        },
      ],
      { session },
    );

    return order;
  });
};

exports.updateOrderStatus = async (orderId, newStatus) => {
  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!mongoose.isValidObjectId(orderId)) {
    throw createError("Invalid order ID", 400);
  }

  if (!allowedStatuses.includes(newStatus)) {
    throw createError("Invalid order status", 400);
  }

  return mongoose.connection.transaction(async (session) => {
    const order = await Order.findById(orderId).session(session);

    if (!order) {
      throw createError("Order not found", 404);
    }

    if (order.status === "cancelled") {
      throw createError("Order has already been cancelled", 409);
    }

    if (newStatus === "cancelled") {
      if (!["pending", "processing"].includes(order.status)) {
        throw createError(
          "Only pending or processing orders can be cancelled",
          409,
        );
      }

      for (const item of order.items) {
        const result = await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: item.quantity } },
          { session },
        );

        if (result.matchedCount !== 1) {
          throw createError("Cannot restore stock: product not found", 409);
        }
      }
    }

    order.status = newStatus;
    await order.save({ session });

    return order;
  });
};
