require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());            // Cross-Origin Resource Sharing: Allows the frontend to communicate with the backend
app.use(express.json());    // Allows the server to read incoming JSON data

// Database connection
mongoose.connect(process.env.MONGO_URI) 
    .then(() => console.log(`Connected to MongoDB sucessfully!`))
    .catch((err) => console.error(`MongoDB connection error: `, err));

// API routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes (register, login)

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
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server is listening on port ${PORT}`);
});