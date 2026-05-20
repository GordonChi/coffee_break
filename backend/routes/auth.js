const express = require('express');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// User schema from models/User.js
const User = require('../models/User');

const router = express.Router();

// POST request: /api/auth/setup-2fa
router.post('/setup-2fa', async (req, res) => {
    console.log("TRIPWIRE TRIGGERED: request made it to the backend")
    try {
        // Generate a unique secret for the user
        const secret = speakeasy.generateSecret({
            name: `Coffee Break`
        });

        // Turn the secure URL into a QR code image data string
        const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

        // Send the QR code data URL and the secret back to the client
        res.json({
            qrCode: qrCodeDataUrl,
            secret: secret.base32
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error setting up 2FA' });
    }
});

module.exports = router;