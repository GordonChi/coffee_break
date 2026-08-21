require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const widgetRoutes = require('./routes/widgets.js');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());            // Cross-Origin Resource Sharing: Allows the frontend to communicate with the backend
app.use(express.json());    // Allows the server to read incoming JSON data

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    // Add a longer timeout since I'm in a place with a bad internet connection (default
    // 10 seconds is not long enough)
    // Wait 30 seconds before timing out operations 
    bufferTimeoutMS: 30000, 
  
      // Wait 30 seconds for the MongoDB driver to connect to the server
    serverSelectionTimeoutMS: 30000 
    })
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Could not connect to MongoDB:", err));

// API routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes (register, login)
app.use('/api/widgets', widgetRoutes);  // Widget routes (cloudinary and mulet thing)

// Timeline fetching api route
app.use('/api/posts', require('./routes/posts'));

// Test route
app.post('/api/test', (req, res) => {
    console.log("SUCCESS: POST request made it through the middleware!");
    res.json({ message: "POST works perfectly" });
});

app.get(`/`, (req, res) => {
    res.send(`Coffee Break API is running!`);
});

// Start the server
const PORT = process.env.PORT || 5000;
// Allow the HOST to be injected via the environment (linux/windows/containers)
// Leave it undefined for local development (localhost) since I am working on windows
// and linux, Node dual-stacks automatically
const HOST = process.env.HOST;

app.listen(PORT, HOST, () => { 
    console.log(`Server is listening on port ${PORT}`);
});