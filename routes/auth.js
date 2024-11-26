const express = require("express");
const { registerUser, loginUser, welcomeUser } = require("../controllers/authController");

const router = express.Router();

//welcomeUser
router.get('',welcomeUser);

// Register route
router.post("/register", registerUser);

// Login route
router.post("/login", loginUser);

module.exports = router;
