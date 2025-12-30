const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true,
        maxlength: [100, 'Task title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    effort: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'verified'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    coinsEarned: {
        type: Number,
        default: 0
    },
    penalized: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
taskSchema.index({ group: 1, dueDate: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Calculate coins for completed task
taskSchema.methods.calculateCoins = function (totalTasks, completedTasks) {
    const baseCoins = 10;
    const priorityMultiplier = {
        low: 1,
        medium: 1.5,
        high: 2
    };
    const effortMultiplier = this.effort * 0.5;

    return Math.round(baseCoins * priorityMultiplier[this.priority] * effortMultiplier);
};

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);

