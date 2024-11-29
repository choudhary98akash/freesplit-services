const mongoose = require("mongoose");

const SplitSchema = new mongoose.Schema({
  paidBy: { type: String, required: true },
  total: { type: Number, required: true },
  split: [
    {
      email: { type: String, required: true },
      share: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Split", SplitSchema);
