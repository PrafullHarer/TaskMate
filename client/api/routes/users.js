const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If not the same user, return limited public info
        if (req.user._id.toString() !== req.params.id) {
            return res.status(200).json({
                success: true,
                user: user.getPublicProfile()
            });
        }

        // Return full profile for own user
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        // Ensure user can only update their own profile
        if (req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this profile'
            });
        }

        const { name, username, profilePicture } = req.body;

        // Check if username is being changed and if it's unique
        if (username && username !== req.user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, username, profilePicture },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// @desc    Search users by username or name
// @route   GET /api/users/search
// @access  Private
router.get('/search/query', protect, async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { name: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.user._id }
        }).limit(20);

        // Return only public profiles
        const publicProfiles = users.map(user => user.getPublicProfile());

        res.status(200).json({
            success: true,
            count: publicProfiles.length,
            users: publicProfiles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching users',
            error: error.message
        });
    }
});

module.exports = router;
