const router = require("express").Router();
const c = require("../controllers/orderController");
router.post("/", c.create);
router.get("/", c.list);
router.patch("/:id/status", c.updateStatus);
module.exports = router;
