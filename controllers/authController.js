const User = require("../models/User");
const TempUser = require("../models/TempUser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const generateOtp = require("../utils/generateOtp");
const nodemailer = require("nodemailer");
require('dotenv').config();


exports.sendOtpForFirstTimeUser = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user already exists in the main User table
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate OTP and expiry time
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Save OTP and expiry to the TempUser collection
    await TempUser.findOneAndUpdate(
      { email },
      { otp, otpExpiry },
      { upsert: true, new: true } // Create a new TempUser if not existing
    );

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email for FreeSplit",
      html: `<h1>Welcome to FreeSplit!</h1>
             <h3>Your OTP code is: ${otp}. It is valid for 10 minutes.</h3>
             <p>Please use this OTP to verify your email address.</p>`,
    });

    res.status(200).json({ message: "OTP sent successfully for email verification" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};



exports.verifyOtpForFirstTimeUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if the email exists in the TempUser collection
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(404).json({ message: "No OTP request found for this email" });
    }

    // Check if the OTP matches and is not expired
    if (tempUser.otp !== otp || tempUser.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // OTP is valid - clear TempUser data and allow registration
    await TempUser.deleteOne({ email }); // Remove the temporary record after verification

    res.status(200).json({ message: "OTP verified successfully. You can now proceed with registration." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};



exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Generate OTP and expiry time
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes






    // Save OTP and expiry to the user document
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html: `<h1> Freesplit OTP Code</h1>
      <h3>Your OTP code is: ${otp}. It is valid for 10 minutes.</h3>`
    });


    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error });
  }
};






exports.updatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate OTP
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating password", error });
  }
};

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


//Welcome User

exports.welcomeUser = async (req, res) => {
  try {
    // Assuming you have a valid authentication mechanism (e.g., JWT)


    res.status(200).json({ message: `Welcome Amigos` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
