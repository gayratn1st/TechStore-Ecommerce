require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Review = require('../src/models/Review');
const { createOrder } = require('../src/services/orderService');
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  // Idempotent: demo entries have predictable email/names. No deletion of existing data.
  const users = [];
  for (const [name, email] of [['Ali Karimov','ali.demo@techstore.example'], ['Sara Kim','sara.demo@techstore.example'], ['Daniel Park','daniel.demo@techstore.example']]) {
    users.push(await User.findOneAndUpdate({ email }, { $set: { name, email } }, { upsert: true, new: true, runValidators: true }));
  }
  const catalog = [
    { name: 'NovaBook 14', category: 'laptops', price: 899, stock: 12, specifications: { ram: '16GB', cpu: 'Core i5', storage: '512GB SSD' } },
    { name: 'Orbit Headphones', category: 'headphones', price: 129, stock: 30, specifications: { wireless: true, batteryHours: 32, anc: true } },
    { name: 'PixelView Monitor', category: 'monitors', price: 249, stock: 15, specifications: { screenSize: '27 inch', resolution: '2560x1440', refreshHz: 144 } },
    { name: 'SwiftMouse Pro', category: 'accessories', price: 59, stock: 40, specifications: { dpi: 16000, wireless: true } },
    { name: 'KeyForge Keyboard', category: 'accessories', price: 89, stock: 25, specifications: { switchType: 'mechanical', layout: 'TKL' } },
    { name: 'NovaBook 16', category: 'laptops', price: 1199, stock: 7, specifications: { ram: '32GB', cpu: 'Ryzen 7', storage: '1TB SSD' } }
  ];
  const products = [];
  for (const item of catalog) products.push(await Product.findOneAndUpdate({ name: item.name }, { $set: item }, { upsert: true, new: true, runValidators: true }));
  if (!(await Order.exists({ userId: users[0]._id }))) await createOrder({ userId: users[0]._id, items: [{ productId: products[0]._id.toString(), quantity: 1 }, { productId: products[1]._id.toString(), quantity: 2 }] });
  await Review.findOneAndUpdate({ userId: users[0]._id, productId: products[0]._id }, { $set: { rating: 5, comment: 'Great laptop for studying!' } }, { upsert: true, new: true, runValidators: true });
  console.log('Seed complete: users, products, sample order, review');
  console.log('Example product ID:', products[0]._id.toString());
}
seed().catch(err => { console.error(err); process.exitCode = 1; }).finally(() => mongoose.disconnect());
