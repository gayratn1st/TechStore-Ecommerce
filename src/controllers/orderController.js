const Order = require("../models/Order");
const { createOrder, updateOrderStatus } = require("../services/orderService");

exports.create = async (req, res) =>
  res.status(201).json(await createOrder(req.body));

exports.list = async (req, res) =>
  res.json(
    await Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
  );

exports.updateStatus = async (req, res) => {
  const order = await updateOrderStatus(req.params.id, req.body.status);

  res.json(order);
};
