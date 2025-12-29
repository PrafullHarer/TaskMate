const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { isMember } = require('../middleware/group');
const { getIO } = require('../config/socket');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, description, priority, effort, dueDate, group } = req.body;

        const task = await Task.create({
            user: req.user._id,
            group,
            title,
            description,
            priority,
            effort,
            dueDate
        });

        // Emit to group members
        try {
            const io = getIO();
            io.to(`group-${group}`).emit('task-created', {
                task: await task.populate('user', 'name username profilePicture')
            });
        } catch (err) {
            console.log('Socket not available');
        }

        res.status(201).json({
            success: true,
            task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
});

// @desc    Get all tasks for a group
// @route   GET /api/tasks/group/:groupId
// @access  Private (Members only)
router.get('/group/:groupId', protect, isMember, async (req, res) => {
    try {
        const { date, status, userId } = req.query;

        let query = { group: req.params.groupId };

        // Filter by date
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: startOfDay, $lte: endOfDay };
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by user
        if (userId) {
            query.user = userId;
        }

        const tasks = await Task.find(query)
            .populate('user', 'name username profilePicture')
            .populate('verifiedBy', 'name username')
            .sort({ dueDate: -1, priority: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
});

// @desc    Get user's tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
router.get('/my-tasks', protect, async (req, res) => {
    try {
        const { date, status, groupId } = req.query;

        let query = { user: req.user._id };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.dueDate = { $gte: startOfDay, $lte: endOfDay };
        }

        if (status) {
            query.status = status;
        }

        if (groupId) {
            query.group = groupId;
        }

        const tasks = await Task.find(query)
            .populate('group', 'name')
            .sort({ dueDate: -1, priority: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks',
            error: error.message
        });
    }
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Task owner only)
router.put('/:id', protect, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check ownership
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this task'
            });
        }

        const { title, description, priority, effort, dueDate } = req.body;

        task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, priority, effort, dueDate },
            { new: true, runValidators: true }
        ).populate('user', 'name username profilePicture');

        // Emit update
        try {
            const io = getIO();
            io.to(`group-${task.group}`).emit('task-updated', { task });
        } catch (err) {
            console.log('Socket not available');
        }

        res.status(200).json({
            success: true,
            task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
});

// @desc    Mark task as complete
// @route   POST /api/tasks/:id/complete
// @access  Private (Task owner only)
router.post('/:id/complete', protect, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (task.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Task is already completed'
            });
        }

        // Calculate coins
        const coins = task.calculateCoins();

        task.status = 'completed';
        task.completedAt = new Date();
        task.coinsEarned = coins;
        await task.save();

        // Update group-specific coins
        const user = await User.findById(req.user._id);
        const groupCoinEntry = user.groupCoins.find(gc => gc.group.toString() === task.group.toString());
        let updatedUser;

        if (groupCoinEntry) {
            // Update existing group coin entry
            updatedUser = await User.findOneAndUpdate(
                { _id: req.user._id, 'groupCoins.group': task.group },
                {
                    $inc: {
                        'groupCoins.$.weeklyCoins': coins,
                        'groupCoins.$.lifetimeCoins': coins,
                        weeklyCoins: coins,
                        lifetimeCoins: coins
                    }
                },
                { new: true }
            );
        } else {
            // Create new group coin entry and update totals
            updatedUser = await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    groupCoins: {
                        group: task.group,
                        weeklyCoins: coins,
                        lifetimeCoins: coins
                    }
                },
                $inc: { weeklyCoins: coins, lifetimeCoins: coins }
            }, { new: true });
        }

        await task.populate('user', 'name username profilePicture');

        // Emit update
        try {
            const io = getIO();
            io.to(`group-${task.group}`).emit('task-completed', {
                task,
                coinsEarned: coins
            });

            if (updatedUser) {
                io.to(req.user._id.toString()).emit('coins-updated', {
                    weeklyCoins: updatedUser.weeklyCoins,
                    lifetimeCoins: updatedUser.lifetimeCoins
                });
            }
        } catch (err) {
            console.log('Socket not available');
        }

        res.status(200).json({
            success: true,
            task,
            coinsEarned: coins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing task',
            error: error.message
        });
    }
});

// @desc    Verify task (group validation)
// @route   POST /api/tasks/:id/verify
// @access  Private (Group members only)
router.post('/:id/verify', protect, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Task must be completed before verification'
            });
        }

        // Cannot verify own task
        if (task.user.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot verify your own task'
            });
        }

        task.status = 'verified';
        task.verifiedBy = req.user._id;
        task.verifiedAt = new Date();
        await task.save();

        await task.populate([
            { path: 'user', select: 'name username profilePicture' },
            { path: 'verifiedBy', select: 'name username' }
        ]);

        res.status(200).json({
            success: true,
            task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error verifying task',
            error: error.message
        });
    }
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Task owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const groupId = task.group;
        await Task.findByIdAndDelete(req.params.id);

        // Emit deletion
        try {
            const io = getIO();
            io.to(`group-${groupId}`).emit('task-deleted', { taskId: req.params.id });
        } catch (err) {
            console.log('Socket not available');
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
});

// @desc    Get task stats for user in group
// @route   GET /api/tasks/stats/:groupId
// @access  Private
router.get('/stats/:groupId', protect, isMember, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Today's stats
        const todayTasks = await Task.find({
            group: req.params.groupId,
            user: req.user._id,
            dueDate: { $gte: today, $lte: endOfDay }
        });

        const completedToday = todayTasks.filter(t => t.status !== 'pending').length;

        // Weekly stats
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weekTasks = await Task.find({
            group: req.params.groupId,
            user: req.user._id,
            dueDate: { $gte: weekStart }
        });

        const completedThisWeek = weekTasks.filter(t => t.status !== 'pending').length;
        const totalCoinsThisWeek = weekTasks.reduce((sum, t) => sum + (t.coinsEarned || 0), 0);

        res.status(200).json({
            success: true,
            stats: {
                today: {
                    total: todayTasks.length,
                    completed: completedToday,
                    completionRate: todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0
                },
                week: {
                    total: weekTasks.length,
                    completed: completedThisWeek,
                    completionRate: weekTasks.length > 0 ? Math.round((completedThisWeek / weekTasks.length) * 100) : 0,
                    coinsEarned: totalCoinsThisWeek
                }
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
