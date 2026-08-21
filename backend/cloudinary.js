const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Authenticating with Cloudinary credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer to use server's RAM (Memory)
// In my case, its my local computer ram
const storage = multer.memoryStorage();

// Create the middleware function
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };