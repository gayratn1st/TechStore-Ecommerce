const Order = require("../models/Order");

const { createOrder, updateOrderStatus } = require("../services/orderService");

exports.create = async (req, res) => {
  const order = await createOrder({
    userId: req.user.id,
    items: req.body.items,
  });

  res.status(201).json(order);
};

exports.list = async (req, res) => {
  const filter = req.user.role === "ADMIN" ? {} : { userId: req.user.id };

  const orders = await Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(orders);
};

exports.updateStatus = async (req, res) => {
  const order = await updateOrderStatus(req.params.id, req.body.status);

  res.json(order);
};
