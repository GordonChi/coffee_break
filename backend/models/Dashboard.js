const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    widgets: [{
        widgetId: { type: String, required: true }, // Frontend crypto.randomUUID()
        type: { type: String, required: true },     // e.g., 'carousel'
        position: {
            x: { type: Number, default: 50 },
            y: { type: Number, default: 150 }
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema);