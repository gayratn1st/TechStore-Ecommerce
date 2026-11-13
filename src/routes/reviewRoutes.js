const router = require("express").Router();
const c = require("../controllers/reviewController");
router.post("/", c.create);
router.get("/", c.list);
module.exports = router;
