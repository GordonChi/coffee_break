const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // Username: An alias for a user, used for display and login purposes. 
    // It must be unique and is required.
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, 
        minlength: 3
    },
    // Email: The user's email address, used for communication and password resets
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Password: Pretty self explanatory, will be stored as raw string for now 
    // but will be hashed in the future for security reasons.
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // 2FA Enabled: A boolean flag indicating whether the user has enabled two-factor authentication for added security.
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    // 2FA Secret: A string that stores the secret key used for generating two-factor authentication codes, if 2FA is enabled.
    twoFactorSecret: {
        type: String,
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model("User", UserSchema); 