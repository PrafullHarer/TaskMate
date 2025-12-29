const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isMember } = require('../middleware/group');
const { getIO } = require('../config/socket');

// @desc    Get messages for a group
// @route   GET /api/messages/:groupId
// @access  Private (Members only)
router.get('/:groupId', protect, isMember, async (req, res) => {
    try {
        const { limit = 50, before } = req.query;

        let query = { group: req.params.groupId };

        // Pagination - get messages before a certain timestamp
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await Message.find(query)
            .populate('sender', 'name username profilePicture')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Reverse to get chronological order
        messages.reverse();

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching messages',
            error: error.message
        });
    }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { content, group, messageType = 'text' } = req.body;

        // Create message
        let message = await Message.create({
            group,
            sender: req.user._id,
            content,
            messageType
        });

        message = await message.populate('sender', 'name username profilePicture');

        // Emit to group via Socket.io
        try {
            const io = getIO();
            io.to(`group-${group}`).emit('new-message', message);


        } catch (err) {
            console.log('Socket not available');
        }

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private (Sender only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this message'
            });
        }

        const groupId = message.group;
        await Message.findByIdAndDelete(req.params.id);

        // Emit deletion
        try {
            const io = getIO();
            io.to(`group-${groupId}`).emit('message-deleted', { messageId: req.params.id });
        } catch (err) {
            console.log('Socket not available');
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting message',
            error: error.message
        });
    }
});

module.exports = router;
