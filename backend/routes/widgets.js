const express = require('express');
const router = express.Router();
const { Readable } = require('stream');

// Import the 'bridge'
const { cloudinary, upload } = require('../cloudinary.js');
// Import the stuff for CRUD-ing it up
const Widget = require('../models/Widget.js');

// POST: Uploading an image for the carousel to cloudinary
// upload.single is a multer thingy, for more info
// check out this https://expressjs.com/en/resources/middleware/multer/
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Check if multer got the file or not
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }
        
        // Open a secure stream to cloudinary 
        // more info here: https://cloudinary.com/documentation/node_image_and_video_upload
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "dashboard_carousel" }, // Organizes in cloudinary dashboard
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ error: "Failed to upload to cloudinary" });
                }
                // Succeeded in uploading to cloudinary
                console.log("Upload successful. URL:", result.secure_url);
                res.status(201).json({ imageUrl: result.secure_url });
            }
        );

        // Take the file from RAM and pipe it to stream
        Readable.from(req.file.buffer).pipe(uploadStream);
    }
    catch (error) {
        console.log("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST: creating a new widget
router.post('/', async (req, res) => {
    try{
        const { userId, widgetType, position, data } = req.body;

        const newWidget = new Widget({ userId, widgetType, position, data });
        const savedWidget = await newWidget.save();

        res.status(201).json(savedWidget);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to save widget to database" });
    }
});

// GET: grab all the existing widgets for the user
router.get('/:userId', async (req, res) => {
    try{
        const widgets = await Widget.find({ userId: req.params.userId });
        res.status(200).json(widgets);
    }
    catch (error){
        res.status(500).json({ error: "Failed to fetch widgets" });
    }
});

// PUT: updating widget locations
router.put('/:widgetId', async (req, res) => {
    try{
        const updatedWidget = await Widget.findByIdAndUpdate(
            req.params.widgetId,
            { $set: req.body },
            { new: true }
        );
        res.status(201).json(updatedWidget);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update widget" });
    }
});

module.exports = router;