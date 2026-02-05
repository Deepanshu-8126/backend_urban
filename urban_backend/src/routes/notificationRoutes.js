const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get My Notifications
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        // Count unread
        const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

        res.json({ success: true, count: unreadCount, notifications });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// Mark as Read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// Mark ALL as Read
router.patch('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
