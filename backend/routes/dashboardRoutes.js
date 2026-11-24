const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');

// GET: Fetch user's dashboard layout (silently creates a blank one if none exists)
router.get('/:userId', async (req, res) => {
    try {
        let dashboard = await Dashboard.findOne({ userId: req.params.userId });

        if (!dashboard) {
            dashboard = await Dashboard.create({
                userId: req.params.userId,
                widgets: []
            });
        }

        res.status(200).json(dashboard);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).json({ message: 'Failed to load dashboard layout' });
    }
});

// PUT: Save the updated widgets array
router.put('/:userId', async (req, res) => {
    try {
        const { widgets } = req.body;

        const updatedDashboard = await Dashboard.findOneAndUpdate(
            { userId: req.params.userId },
            { widgets },
            { new: true, upsert: true }
        );

        res.status(200).json(updatedDashboard);
    } catch (error) {
        console.error('Error saving dashboard:', error);
        res.status(500).json({ message: 'Failed to save dashboard layout' });
    }
});

module.exports = router;