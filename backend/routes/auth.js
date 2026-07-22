const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Added for JWT token generation
const User = require('../models/User'); 
// Make sure your 2FA imports are still here!
// const speakeasy = require('speakeasy');
// const qrcode = require('qrcode');

// ==========================================
// CHECK USERNAME ROUTE (Part of SignupPage.jsx username availability check)
// ==========================================
router.post('/check-username', async (req, res) => {
    try {
        // Need to have a username in the request body to check
        const { username } = req.body;

        // If the username is empty or too short, we can immediately return that it's not available
        if (!username || username.trim() < 3) {
            return res.status(400).json({ available: false, message: 'Must be at least 3 characters.' });
        }

        const userExists = await User.findOne({ username: username.toLowerCase().trim() });

        // If the user exists, return false again because its unavailable
        if (userExists) {
            return res.status(200).json({ available: false, message: 'Username is already taken.' });
        }

        // If username is valid and not taken, return true
        res.status(200).json({ available: true, message: 'Username is available!' });
    } catch (error) {
        // In case of any server error, we can return error message
        res.status(500).json({ message: 'Server error while checking username.' });
    }
});

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
        console.log('boop')
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

        // 3. Generate JWT keycard
        const token = jwt.sign(
            { userId: user._id },       // Payload: user ID
            process.env.JWT_SECRET,     // Secret key from .env
            { expiresIn: '2h' }         // Token expiration time
        );

        // If they match, confirmed login. Send token back to user
        res.status(200).json({
            message: 'Login successful!',
            token: token,
            userId: user._id,
            username: user.username, // send back the username as well for frontend use
            // Let the frontend know if it needs to ask for 2FA code
            isTwoFactorEnabled: user.isTwoFactorEnabled
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ==========================================
// 2FA SETUP ROUTE (Part of Setup2FAPage.jsx)
// ==========================================
router.post('/setup-2fa', async (req, res) => {
    console.log("TRIPWIRE TRIGGERED: request made it to the backend")
    try {
        // Generate a unique secret for this user
        const secret = speakeasy.generateSecret({ 
            name: "Coffee Break"
        });

        // Convert the secret into a scannable QR code URL
        qrcode.toDataURL(secret.otpauth_user, (err, data_url) => {
            if (err) {
                console.error("QR Code Generation Error:", err);
                return res.status(500).json({ message: 'Error generating QR code.' });
            }

            // Send the secret and QR code URL back to the frontend
            res.status(200).json({
                secret: secret.base32, // This is the secret key that will be stored in the database
                qrCodeUrl: data_url // This is the QR code that the user will scan with their authenticator app
            });
        });
    } catch (error) {
        // Log error if database fails
        console.error("2FA Setup Error:", error);
        res.status(500).json({ message: 'Server error during 2FA setup.' });
    }
});

// ==========================================
// EXPORT THE ROUTER
// ==========================================
module.exports = router;