const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User'); 
// Make sure your 2FA imports are still here!
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');

// ==========================================
// 1. THE NEW SIGNUP ROUTE
// ==========================================
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            isTwoFactorEnabled: false 
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
// 2. YOUR EXISTING 2FA SETUP ROUTE
// ==========================================
router.post('/setup-2fa', async (req, res) => {
    // Keep all the code you wrote here for generating the QR code!
    // ...
});

// ==========================================
// 3. LOGIN ROUTE
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