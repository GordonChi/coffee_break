const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
// Make sure your 2FA imports are still here!
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');

// ==========================================
// SIGNUP ROUTE
// ==========================================
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the username is already in use
        const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // Check if the email is already in use
        const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username.trim(),
            email,
            password: hashedPassword,
            isTwoFactorEnabled: false, // 
        });

        await newUser.save();

        res.status(201).json({ 
            message: 'User created successfully!',
            userId: newUser._id
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});


// ==========================================
// LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Does this user exist in the database?
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // 2. Does the password match?
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // If they match, confirmed login
        res.status(200).json({
            message: 'Login successful!',
            userId: user._id,
            // Let the frontend know if it needs to ask for 2FA code
            isTwoFactorEnabled: user.isTwoFactorEnabled
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ==========================================
// EXPORT THE ROUTER
// ==========================================
module.exports = router;