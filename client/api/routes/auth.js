const express = require('express');
const router = express.Router();
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Cookie options for authentication
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
        success: false,
        message: 'Too many attempts, please try again after 15 minutes'
    }
});

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create user
        const user = await User.create({
            name,
            username,
            email,
            password
        });

        // Generate token
        const token = user.generateAuthToken();

        // Set HTTP-only cookie for SSR
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                weeklyCoins: user.weeklyCoins,
                lifetimeCoins: user.lifetimeCoins,
                achievements: user.achievements
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating account',
            error: error.message
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last active
        user.lastActive = new Date();
        await user.save({ validateBeforeSave: false });

        // Generate token
        const token = user.generateAuthToken();

        // Set HTTP-only cookie for SSR
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                weeklyCoins: user.weeklyCoins,
                lifetimeCoins: user.lifetimeCoins,
                achievements: user.achievements,
                groups: user.groups
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('groups', 'name description');

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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
    // Clear the auth cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
