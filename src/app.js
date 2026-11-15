const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) =>
  res.json({ message: "Welcome to TechStore API", status: "running" }),
);
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === "ValidationError" || err.name === "CastError")
    return res.status(400).json({ error: err.message });
  if (err.code === 11000)
    return res.status(409).json({ error: "Duplicate value" });
  res
    .status(err.status || 500)
    .json({ error: err.status ? err.message : "Internal server error" });
});
module.exports = app;
