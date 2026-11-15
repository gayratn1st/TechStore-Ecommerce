const router = require("express").Router();

const c = require("../controllers/productController");

const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

// Public routes: anyone can browse products.
router.get("/", c.list);
router.get("/:id", c.get);

// Protected routes: only admins can modify products.
router.post("/", requireAuth, requireAdmin, c.create);

router.patch("/:id", requireAuth, requireAdmin, c.update);

router.delete("/:id", requireAuth, requireAdmin, c.remove);

module.exports = router;
