const mongoose = require("mongoose");

const tempUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("TempUser", tempUserSchema);
