const router = require("express").Router();

const c = require("../controllers/reviewController");

const { requireAuth } = require("../middleware/authMiddleware");

// Public: anyone can read reviews.
router.get("/", c.list);

// Only authenticated users can create reviews.
router.post("/", requireAuth, c.create);

module.exports = router;
