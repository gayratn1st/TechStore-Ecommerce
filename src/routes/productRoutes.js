const router = require("express").Router();
const c = require("../controllers/productController");
router.post("/", c.create);
router.get("/", c.list);
router.get("/:id", c.get);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);
module.exports = router;
