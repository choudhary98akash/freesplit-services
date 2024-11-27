const express = require("express");
const { registerUser, loginUser, welcomeUser ,sendOtp,updatePassword,sendOtpForFirstTimeUser,verifyOtpForFirstTimeUser} = require("../controllers/authController");

const router = express.Router();


router.get('',welcomeUser);


//for email-based_otp
router.post("/send-otp", sendOtp);

// Route for updating password
router.post("/update-password", updatePassword);

// Register route
router.post("/register", registerUser);

// Route to send OTP for first-time user verification
router.post("/send-otp-for-first-time-user", sendOtpForFirstTimeUser);

// Route to verify OTP for first-time user verification
router.post("/verify-otp-for-first-time-user", verifyOtpForFirstTimeUser);

// Login route
router.post("/login", loginUser);

module.exports = router;
