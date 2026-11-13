const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);
productSchema.index({ category: 1, price: 1 });
module.exports = mongoose.model("Product", productSchema);
