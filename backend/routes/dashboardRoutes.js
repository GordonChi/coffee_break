const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');

// GET: Fetch a user's dashboard layout
router.get('/:userId', async (req, res) => {
    try {
        // Look for the user's dashboard
        let dashboard = await Dashboard.findOne({ userId: req.params.userId });
        // If the dashboard doesn't exist, create a new one
        if (!dashboard) {
            dashboard = await Dashboard.create({ userId: req.params.userId, widgets: [] });
        }
        // send it back to React frontpage
        res.status(200).json(dashboard);
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        res.status(500).json({ message: "Failed to fetch dashboard" });
    }
});

// PUT: Save the dashboard layout
router.put('/:userId', async (req, res) => {
    try {
        const { widgets } = req.body;
        
        const updatedDashboard = await Dashboard.findOneAndUpdate(
            { userId: req.params.userId },  // Find the user's dashboard
            { widgets: widgets },           // Collect and overwrites the widget array that already existed (empty if fresh)
            { new: true }                   // Return the updated version
        );
    res.status(200).json(updatedDashboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update dashboard" });
    }
})