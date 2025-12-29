const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect, platformAdmin } = require('../middleware/auth');

// @desc    Get all groups (admin only - limited info)
// @route   GET /api/admin/groups
// @access  Private (Platform Admin only)
router.get('/groups', protect, platformAdmin, async (req, res) => {
    try {
        // Admin can only see group names and member names
        const groups = await Group.find()
            .select('name members createdAt')
            .populate('members', 'name username');

        res.status(200).json({
            success: true,
            count: groups.length,
            groups: groups.map(g => ({
                _id: g._id,
                name: g.name,
                memberCount: g.members.length,
                members: g.members.map(m => ({ name: m.name, username: m.username })),
                createdAt: g.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching groups',
            error: error.message
        });
    }
});

// @desc    Get all users (admin only - limited info)
// @route   GET /api/admin/users
// @access  Private (Platform Admin only)
router.get('/users', protect, platformAdmin, async (req, res) => {
    try {
        const users = await User.find()
            .select('name username email createdAt lastActive');

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (Platform Admin only)
router.get('/stats', protect, platformAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalGroups = await Group.countDocuments();

        // Active users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers = await User.countDocuments({
            lastActive: { $gte: sevenDaysAgo }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalGroups,
                activeUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

module.exports = router;
