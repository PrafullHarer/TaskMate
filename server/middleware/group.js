const Group = require('../models/Group');

// Check if user is member of group
const isMember = async (req, res, next) => {
    try {
        const groupId = req.params.groupId || req.params.id || req.body.group;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required'
            });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        if (!group.isMember(req.user._id) && !group.isAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group'
            });
        }

        req.group = group;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Check if user is group admin
const isGroupAdmin = async (req, res, next) => {
    try {
        const groupId = req.params.groupId || req.params.id || req.body.group;

        if (!groupId) {
            return res.status(400).json({
                success: false,
                message: 'Group ID is required'
            });
        }

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group not found'
            });
        }

        if (!group.isAdmin(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: 'Only group admin can perform this action'
            });
        }

        req.group = group;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { isMember, isGroupAdmin };
