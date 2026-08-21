const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    widgetType: {
        type: String,
        required: true,
        enum: ['carousel', 'sticky', 'weather', 'spotify']  // list of allowed widgets, add here when more
    },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    },
    /*  
    Mixed allows multiple different types
    to beheld within a single field
    ctrl+f "mixed" here: https://mongoosejs.com/docs/schematypes.html
    */
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true })