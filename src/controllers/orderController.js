const Order = require("../models/Order");
const { createOrder } = require("../services/orderService");
exports.create = async (req, res) =>
  res.status(201).json(await createOrder(req.body));
exports.list = async (req, res) =>
  res.json(
    await Order.find().populate("userId", "name email").sort({ createdAt: -1 }),
  );
exports.updateStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
};
