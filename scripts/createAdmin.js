require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("node:readline/promises");

const User = require("../src/models/User");
const connectDB = require("../src/config/database");

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const name = (await rl.question("Admin name: ")).trim();
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();
    const password = await rl.question("Admin password: ");

    if (!name || !email || password.length < 12 || password.length > 72) {
      throw new Error(
        "Name, email and password (12-72 characters) are required",
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
    });

    console.log("Admin created successfully:", admin.email);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
