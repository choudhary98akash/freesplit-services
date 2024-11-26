const Split = require("../models/Split");

// Get basic dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    const splits = await Split.find({ user: req.user.id });
    const totalAmount = splits.reduce((acc, split) => acc + split.amount, 0);

    res.json({
      totalSplits: splits.length,
      totalAmount,
      recentSplits: splits.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a new split
exports.addSplit = async (req, res) => {
  const { description, amount } = req.body;

  try {
    const split = await Split.create({
      user: req.user.id,
      description,
      amount,
    });

    res.status(201).json({ message: "Split added successfully", split });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all splits
exports.getSplits = async (req, res) => {
  try {
    const splits = await Split.find({ user: req.user.id });
    res.json(splits);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
