const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    // The user who created the post
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // The content of the post
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1500
    },

    // image associated with the post (optional)
    image: [{
        type: String,
        default: []
    }],

    // Organization associated with the post (tags)
    tags: [{
        type: String,
        trim: true
    }],
}, {
    // Automatically add createdAt and timestamps
    timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);
