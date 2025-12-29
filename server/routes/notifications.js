const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .populate('sender', 'name username profilePicture')
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 notifications

        // Count unread
        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            read: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Check ownership
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notification',
            error: error.message
        });
    }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating notifications',
            error: error.message
        });
    }
});

module.exports = router;
