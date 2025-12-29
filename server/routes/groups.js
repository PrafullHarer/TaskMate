const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const { protect } = require('../middleware/auth');
const { isMember, isGroupAdmin } = require('../middleware/group');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, settings } = req.body;

        const group = await Group.create({
            name,
            description,
            admin: req.user._id,
            members: [req.user._id],
            settings
        });

        // Add group to user's groups and initialize coins
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                groups: group._id,
                groupCoins: {
                    group: group._id,
                    weeklyCoins: 0,
                    lifetimeCoins: 0
                }
            }
        });

        res.status(201).json({
            success: true,
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating group',
            error: error.message
        });
    }
});

// @desc    Get all groups for current user
// @route   GET /api/groups
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const groups = await Group.find({
            members: req.user._id
        })
            .populate('admin', 'name username profilePicture')
            .populate('members', 'name username profilePicture weeklyCoins groupCoins');

        // Transform members to use group-specific coins
        const groupsWithStats = groups.map(group => {
            const groupObj = group.toObject();
            groupObj.members = groupObj.members.map(member => {
                const groupCoins = member.groupCoins?.find(gc => gc.group.toString() === group._id.toString());
                return {
                    ...member,
                    weeklyCoins: groupCoins ? groupCoins.weeklyCoins : 0
                };
            });
            return groupObj;
        });

        res.status(200).json({
            success: true,
            count: groupsWithStats.length,
            groups: groupsWithStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching groups',
            error: error.message
        });
    }
});

// @desc    Get single group by ID
// @route   GET /api/groups/:id
// @access  Private (Members only)
router.get('/:id', protect, isMember, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('admin', 'name username profilePicture')
            .populate('members', 'name username profilePicture weeklyCoins lifetimeCoins')
            .populate('pendingRequests.user', 'name username profilePicture');

        res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching group',
            error: error.message
        });
    }
});

// @desc    Join group via invite code
// @route   POST /api/groups/join/:inviteCode
// @access  Private
router.post('/join/:inviteCode', protect, async (req, res) => {
    try {
        const group = await Group.findOne({ inviteCode: req.params.inviteCode });

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Invalid invite code'
            });
        }

        // Check if already a member
        if (group.isMember(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        // Add user to group
        group.members.push(req.user._id);
        await group.save();

        // Add group to user's groups and initialize coins
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                groups: group._id,
                groupCoins: {
                    group: group._id,
                    weeklyCoins: 0,
                    lifetimeCoins: 0
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully joined group',
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error joining group',
            error: error.message
        });
    }
});

// @desc    Request to join group by ID
// @route   POST /api/groups/:id/request
// @access  Private
router.post('/:id/request', protect, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        // Check if already a member
        if (group.isMember(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this group'
            });
        }

        // Check if already requested
        const alreadyRequested = group.pendingRequests.some(
            req => req.user.toString() === req.user._id.toString()
        );

        if (alreadyRequested) {
            return res.status(400).json({
                success: false,
                message: 'Request already pending'
            });
        }

        group.pendingRequests.push({ user: req.user._id });
        await group.save();

        res.status(200).json({
            success: true,
            message: 'Join request sent'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error requesting to join',
            error: error.message
        });
    }
});

// @desc    Handle join request (accept/reject)
// @route   PUT /api/groups/:id/requests/:userId
// @access  Private (Admin only)
router.put('/:id/requests/:userId', protect, isGroupAdmin, async (req, res) => {
    try {
        const { action } = req.body; // 'accept' or 'reject'
        const group = req.group;

        // Find and remove the pending request
        const requestIndex = group.pendingRequests.findIndex(
            r => r.user.toString() === req.params.userId
        );

        if (requestIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        group.pendingRequests.splice(requestIndex, 1);

        if (action === 'accept') {
            group.members.push(req.params.userId);
            await User.findByIdAndUpdate(req.params.userId, {
                $push: {
                    groups: group._id,
                    groupCoins: {
                        group: group._id,
                        weeklyCoins: 0,
                        lifetimeCoins: 0
                    }
                }
            });
        }

        await group.save();

        res.status(200).json({
            success: true,
            message: action === 'accept' ? 'Member added' : 'Request rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error handling request',
            error: error.message
        });
    }
});

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private (Admin only)
router.delete('/:id/members/:userId', protect, isGroupAdmin, async (req, res) => {
    try {
        const group = req.group;

        // Cannot remove admin
        if (group.admin.toString() === req.params.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove group admin'
            });
        }

        // Remove member
        group.members = group.members.filter(
            m => m.toString() !== req.params.userId
        );
        await group.save();

        // Remove group from user's groups
        await User.findByIdAndUpdate(req.params.userId, {
            $pull: { groups: group._id }
        });

        res.status(200).json({
            success: true,
            message: 'Member removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing member',
            error: error.message
        });
    }
});

// @desc    Regenerate invite code
// @route   POST /api/groups/:id/invite
// @access  Private (Admin only)
router.post('/:id/invite', protect, isGroupAdmin, async (req, res) => {
    try {
        const group = req.group;
        const newCode = group.regenerateInviteCode();
        await group.save();

        res.status(200).json({
            success: true,
            inviteCode: newCode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating invite code',
            error: error.message
        });
    }
});

// @desc    Update group settings
// @route   PUT /api/groups/:id
// @access  Private (Admin only)
router.put('/:id', protect, isGroupAdmin, async (req, res) => {
    try {
        const { name, description, settings } = req.body;

        const group = await Group.findByIdAndUpdate(
            req.params.id,
            { name, description, settings },
            { new: true, runValidators: true }
        )
            .populate('admin', 'name username profilePicture')
            .populate('members', 'name username profilePicture weeklyCoins');

        res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating group',
            error: error.message
        });
    }
});

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private (Members only)
router.post('/:id/leave', protect, isMember, async (req, res) => {
    try {
        const group = req.group;

        // Admin cannot leave, must transfer ownership first
        if (group.admin.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Admin cannot leave. Transfer ownership first.'
            });
        }

        // Remove user from group
        group.members = group.members.filter(
            m => m.toString() !== req.user._id.toString()
        );
        await group.save();

        // Remove group from user's groups
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { groups: group._id }
        });

        res.status(200).json({
            success: true,
            message: 'Successfully left group'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error leaving group',
            error: error.message
        });
    }
});

module.exports = router;
