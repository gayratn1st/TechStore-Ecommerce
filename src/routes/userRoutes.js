const router = require("express").Router();

const c = require("../controllers/userController");

const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Public registration
router.post("/", c.create);

// Only admins can view all users
router.get("/", requireAuth, requireAdmin, c.list);

module.exports = router;
