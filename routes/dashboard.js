const express = require("express");
const { getDashboardData, addSplit, getSplits } = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Get dashboard data
router.get("/", authMiddleware, getDashboardData);

// Add a new split
router.post("/add", authMiddleware, addSplit);

// Get all splits
router.get("/splits", authMiddleware, getSplits);

module.exports = router;
