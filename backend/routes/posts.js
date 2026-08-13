const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

// Making a new post (user)
router.post('/', async (req, res) => {
    console.log("Backend received this body:", req.body);

    try{
        const newPost = new Post({
            // For now, just pull the user from frontend
            // Evenutally pull it from jwt
            user: req.body.userId,
            content: req.body.content
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error("Post creation error: ", error);
        res.status(500).json({ message: 'Error creating post' });
    }
});


// Getting posts to populate feed
router.get('/timeline', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skipIndex = (page - 1) * limit;


        // Grab current user and see who they are following 
        const currentUserId = req.query.userId || req.body.userId;
        const currentUser = await User.findById(currentUserId);


        // If there is a user mismatch, return an error
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create a network list (people the user follows as well as themselves)
        const networkIds = [...currentUser.following, currentUser._id];


        // Fetch a timeline
        const posts = await Post.find({ user: { $in: networkIds } })
        .sort({ createdAt: -1 })    // Sort by the time posts are created
        .limit(limit)               // limit how many posts are on the screen at once
        .skip(skipIndex)
        .populate('user', 'username');

        const total = await Post.countDocuments({ user: { $in: networkIds } });

        res.status(200).json({
            posts,
            hasMore: total > (page * limit)
        });
    } catch (error) {
        console.error("Timeline fetch error: ", error);
        res.status(500).json({ message: 'Error fetching timeline' });
    }
});

module.exports = router;