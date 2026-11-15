const router = require("express").Router();

const c = require("../controllers/orderController");

const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// All order operations require authentication.
router.use(requireAuth);

// CUSTOMER creates an order for themselves.
// ADMIN can also create orders.
router.post("/", c.create);

// Customers see their own orders.
// Admins see all orders.
router.get("/", c.list);

// Only admins can change order statuses.
router.patch("/:id/status", requireAdmin, c.updateStatus);

module.exports = router;
