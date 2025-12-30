const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Group = require('../models/Group');
const Task = require('../models/Task');
const { protect, platformAdmin } = require('../middleware/auth');
const { isMember } = require('../middleware/group');

// @desc    Get group leaderboard
// @route   GET /api/leaderboard/:groupId
// @access  Private (Members only)
router.get('/:groupId', protect, isMember, async (req, res) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members', 'name username profilePicture weeklyCoins lifetimeCoins groupCoins');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        const groupId = req.params.groupId;

        // Helper function to get user's coins for this specific group
        const getGroupCoins = (member, coinType = 'weeklyCoins') => {
            const groupCoinEntry = member.groupCoins?.find(gc => gc.group.toString() === groupId);
            return groupCoinEntry ? groupCoinEntry[coinType] : 0;
        };

        // Sort members by weekly coins for this group (descending)
        const weeklyLeaderboard = [...group.members].sort((a, b) =>
            getGroupCoins(b, 'weeklyCoins') - getGroupCoins(a, 'weeklyCoins')
        );

        // Sort members by lifetime coins for this group (descending)
        const lifetimeLeaderboard = [...group.members].sort((a, b) =>
            getGroupCoins(b, 'lifetimeCoins') - getGroupCoins(a, 'lifetimeCoins')
        );

        // Find user with lowest weekly coins in this group
        const lowestPerformer = weeklyLeaderboard[weeklyLeaderboard.length - 1];

        // Get weekly stats for all members
        const weekStart = new Date();
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const memberStats = await Promise.all(
            group.members.map(async (member) => {
                const tasks = await Task.find({
                    group: groupId,
                    user: member._id,
                    dueDate: { $gte: weekStart }
                });

                const completed = tasks.filter(t => t.status !== 'pending').length;
                const total = tasks.length;
                const groupWeeklyCoins = getGroupCoins(member, 'weeklyCoins');

                return {
                    user: member,
                    tasksCompleted: completed,
                    totalTasks: total,
                    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    weeklyCoins: groupWeeklyCoins
                };
            })
        );

        // Sort by completion rate
        memberStats.sort((a, b) => b.completionRate - a.completionRate);

        res.status(200).json({
            success: true,
            leaderboard: {
                weekly: weeklyLeaderboard.map((m, idx) => ({
                    rank: idx + 1,
                    ...m.toObject(),
                    weeklyCoins: getGroupCoins(m, 'weeklyCoins'),
                    lifetimeCoins: getGroupCoins(m, 'lifetimeCoins')
                })),
                lifetime: lifetimeLeaderboard.slice(0, 10).map((m, idx) => ({
                    rank: idx + 1,
                    ...m.toObject(),
                    weeklyCoins: getGroupCoins(m, 'weeklyCoins'),
                    lifetimeCoins: getGroupCoins(m, 'lifetimeCoins')
                })),
                memberStats,
                lowestPerformer: lowestPerformer ? {
                    user: lowestPerformer,
                    coins: getGroupCoins(lowestPerformer, 'weeklyCoins')
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
});

// @desc    Get global user rankings (top performers)
// @route   GET /api/leaderboard/global/top
// @access  Private
router.get('/global/top', protect, async (req, res) => {
    try {
        const topUsers = await User.find()
            .select('name username profilePicture lifetimeCoins achievements')
            .sort({ lifetimeCoins: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            leaderboard: topUsers.map((user, idx) => ({
                rank: idx + 1,
                ...user.toObject(),
                points: Math.floor(user.lifetimeCoins / 10)
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching global leaderboard',
            error: error.message
        });
    }
});

module.exports = router;
