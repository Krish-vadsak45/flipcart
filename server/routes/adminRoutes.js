const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSettings,
} = require("../controllers/adminController");

// const { protect } = require("../middleware/authMiddleware");
// const ipCheckMiddleware = require("../middleware/ipCheckMiddleware");

// All routes are protected
// router.use(protect);
// Apply IP restriction to admin routes
// router.use(ipCheckMiddleware);

// Settings
router.get("/settings", getSettings);
router.post("/settings", updateSettings);

module.exports = router;
