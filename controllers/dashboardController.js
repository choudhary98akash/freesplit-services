const Split = require("../models/Split");

// Get basic dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    // const splits = await Split.find();
    // console.log(splits);
    // const totalAmount = splits.reduce((acc, split) => acc + split.amount, 0);

    // res.json({
    //   totalSplits: splits.length,
    //   totalAmount,
    //   recentSplits: splits.slice(0, 5),
    // });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};










exports.addSplit = async (req, res) => {
  const { paidBy, total, split } = req.body;

  // Validate input
  if (!paidBy || !total || !split || !Array.isArray(split)) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    // Check that shares sum up to the total amount
    const totalShares = split.reduce((sum, person) => sum + person.share, 0);
    if (totalShares !== total) {
      return res.status(400).json({ message: "Shares do not match the total expense" });
    }

    // Create a new split
    const newSplit = await Split.create({
      paidBy,
      total,
      split,
    });

    res.status(201).json({
      message: "Split added successfully",
      split: newSplit,
    });
  } catch (error) {
    console.error("Error adding split:", error);
    res.status(500).json({ message: "Server error", error });
  }
};






exports.getSplits = async (req, res) => {
  const userEmail = req.body.email; 

  try {
    // Find splits where the user is either the payer or part of the split array
    const splits = await Split.find({
      $or: [
        { paidBy: userEmail }, // Match documents where paidBy matches userEmail
        { "split.email": userEmail } // Match documents where split array has an email field matching userEmail
      ],
    });

    if (!splits || splits.length === 0) {
      return res.status(404).json({ message: "No splits found for this user." });
    }

    res.status(200).json(splits);
  } catch (error) {
    console.error("Error fetching splits:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
