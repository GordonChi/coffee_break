const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Prevents two people from signing up with the same email
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false // Everyone starts with 2FA off
    },
    twoFactorSecret: {
        type: String, 
        // We will store the Speakeasy secret here later if they choose to enable it!
        default: null
    }
}, { 
    // This automatically tracks when the user signed up (createdAt) 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);