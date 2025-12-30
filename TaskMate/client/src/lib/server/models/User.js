const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    profilePicture: {
        type: String,
        default: ''
    },
    weeklyCoins: {
        type: Number,
        default: 0
    },
    lifetimeCoins: {
        type: Number,
        default: 0
    },
    achievements: [{
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            default: '🏆'
        },
        description: String,
        earnedAt: {
            type: Date,
            default: Date.now
        }
    }],
    groupCoins: [{
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group'
        },
        weeklyCoins: {
            type: Number,
            default: 0
        },
        lifetimeCoins: {
            type: Number,
            default: 0
        }
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { id: this._id, username: this.username },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Get public profile (limited info)
userSchema.methods.getPublicProfile = function () {
    return {
        _id: this._id,
        name: this.name,
        username: this.username,
        profilePicture: this.profilePicture,
        lifetimeCoins: this.lifetimeCoins,
        achievements: this.achievements
    };
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

