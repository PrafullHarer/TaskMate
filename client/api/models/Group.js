const mongoose = require('mongoose');
const crypto = require('crypto');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a group name'],
        trim: true,
        maxlength: [50, 'Group name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters'],
        default: ''
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    pendingRequests: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        taskVerification: {
            type: String,
            enum: ['self', 'group', 'admin'],
            default: 'self'
        },
        coinMultiplier: {
            type: Number,
            default: 1,
            min: 1,
            max: 5
        },
        allowMemberInvites: {
            type: Boolean,
            default: true
        },
        resetFrequency: {
            type: String,
            enum: ['weekly', 'biweekly', 'monthly'],
            default: 'weekly'
        }
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    nextResetDate: {
        type: Date
    },
    weeklyLeader: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        coins: Number,
        weekEnding: Date
    },
    weeklyLoser: {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        coins: Number,
        weekEnding: Date
    }
}, {
    timestamps: true
});

// Generate unique invite code before saving
groupSchema.pre('save', async function (next) {
    if (!this.inviteCode) {
        this.inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    }
    next();
});

// Check if user is member
groupSchema.methods.isMember = function (userId) {
    return this.members.some(member => member.toString() === userId.toString());
};

// Check if user is admin
groupSchema.methods.isAdmin = function (userId) {
    return this.admin.toString() === userId.toString();
};

// Generate new invite code
groupSchema.methods.regenerateInviteCode = function () {
    this.inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    return this.inviteCode;
};

module.exports = mongoose.model('Group', groupSchema);
