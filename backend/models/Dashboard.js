const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    // Links the dashboard to a specific user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: trusted
    },

    // Master ledger of all active widgets

    widgets: [{
        widgetId: { type: String, required: true },     // This will by the cryto.randomUUID used to mark unique widgets
        type: { type: String, required: true },         // At the moment, I only have that carousel

        position: {
            x: { type: Number, default: 50 },
            y: { type: Number, default: 100 }
        },
    // Keep it flexible, carousel holds images, notepad holds text, maybe a calculator can only hold numbers (still adding widgets)
    data: { 
            type: mongoose.Schema.Types.Mixed, 
            default: {} 
        } 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);