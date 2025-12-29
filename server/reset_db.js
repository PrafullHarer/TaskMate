const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Group = require('./models/Group');
const Task = require('./models/Task');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

const path = require('path');
// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not Loaded');

const resetData = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Delete all collections
        console.log('Deleting Groups...');
        await Group.deleteMany({});

        console.log('Deleting Tasks...');
        await Task.deleteMany({});

        console.log('Deleting Messages...');
        await Message.deleteMany({});

        console.log('Deleting Notifications...');
        await Notification.deleteMany({});

        // Reset Users
        console.log('Resetting Users...');
        await User.updateMany({}, {
            $set: {
                groups: [],
                groupCoins: [],
                weeklyCoins: 0,
                lifetimeCoins: 0
            }
        });

        console.log('-----------------------------------');
        console.log('DATA RESET COMPLETE');
        console.log('All groups, tasks, messages deleted.');
        console.log('All user coins and memberships reset.');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error resetting data:', error);
        process.exit(1);
    }
};

resetData();
