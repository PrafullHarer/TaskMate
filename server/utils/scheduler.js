const cron = require('node-cron');
const User = require('../models/User');
const Group = require('../models/Group');

// Helper to calculate the next reset date
const calculateNextResetDate = (frequency, fromDate = new Date()) => {
    const nextDate = new Date(fromDate);
    nextDate.setHours(0, 0, 0, 0); // Normalize to midnight

    if (frequency === 'weekly') {
        // Next Sunday
        const day = nextDate.getDay();
        const diff = 7 - day + (day === 0 ? 0 : 7); // If today is Sunday (0), next is +7. If Monday (1), +6 to Sunday (0=7 in math?) No, Sunday is 0.
        // Standard "Next Sunday" logic:
        // If today is Sunday, we want NEXT Sunday (7 days).
        // If today is Monday(1), we want Sunday (which is +6 days).
        // (7 - 1) = 6.
        nextDate.setDate(nextDate.getDate() + (7 - day) % 7);
        if (nextDate <= fromDate) { // If it didn't move forward (e.g. today is Sunday), add 7
            nextDate.setDate(nextDate.getDate() + 7);
        }
    } else if (frequency === 'biweekly') {
        // Every 14 days
        nextDate.setDate(nextDate.getDate() + 14);
    } else if (frequency === 'monthly') {
        // 1st of next month
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextDate.setDate(1);
    }
    return nextDate;
};

// Daily check for resets - runs every day at midnight (00:00)
const dailyResetCheck = cron.schedule('0 0 * * *', async () => {
    console.log('Running daily reset check...');

    try {
        const now = new Date();
        const groups = await Group.find().populate('members');

        for (const group of groups) {
            // Initialize nextResetDate if missing
            if (!group.nextResetDate) {
                group.nextResetDate = calculateNextResetDate(group.settings.resetFrequency || 'weekly', group.lastResetDate || group.createdAt);
                await group.save();
                continue;
            }

            // Check if reset is due
            if (group.nextResetDate <= now) {
                console.log(`Resetting coins for group: ${group.name}`);

                // 1. Calculate Leader/Loser for THIS group
                let leader = null;
                let loser = null;
                let highestCoins = -1;
                let lowestCoins = Infinity;

                for (const member of group.members) {
                    // Find group-specific coins
                    const groupCoinEntry = member.groupCoins.find(gc => gc.group.toString() === group._id.toString());
                    const coins = groupCoinEntry ? groupCoinEntry.weeklyCoins : 0;

                    if (coins > highestCoins) {
                        highestCoins = coins;
                        leader = member;
                    }
                    if (coins < lowestCoins) {
                        lowestCoins = coins;
                        loser = member;
                    }

                    // 2. Reset weeklyCoins for this member in this group
                    if (groupCoinEntry) {
                        groupCoinEntry.weeklyCoins = 0;
                    } else {
                        // Create entry if missing (robustness)
                        member.groupCoins.push({
                            group: group._id,
                            weeklyCoins: 0,
                            lifetimeCoins: 0
                        });
                    }
                    await member.save();
                }

                // 3. Update Group Stats & Dates
                group.weeklyLeader = leader ? {
                    user: leader._id,
                    coins: highestCoins,
                    weekEnding: now
                } : null;

                group.weeklyLoser = loser ? {
                    user: loser._id,
                    coins: lowestCoins,
                    weekEnding: now
                } : null;

                group.lastResetDate = now;
                group.nextResetDate = calculateNextResetDate(group.settings.resetFrequency, now);
                await group.save();
            }
        }
        console.log('Daily reset check completed');
    } catch (error) {
        console.error('Error during daily reset check:', error);
    }
}, {
    scheduled: false
});

// Award achievements based on milestones
const checkAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const achievements = [];

        // First task completed
        if (user.lifetimeCoins >= 10 && !user.achievements.find(a => a.name === 'First Steps')) {
            achievements.push({
                name: 'First Steps',
                icon: '🌟',
                description: 'Completed your first task!'
            });
        }

        // 100 lifetime coins
        if (user.lifetimeCoins >= 100 && !user.achievements.find(a => a.name === 'Rising Star')) {
            achievements.push({
                name: 'Rising Star',
                icon: '⭐',
                description: 'Earned 100 lifetime coins'
            });
        }

        // 500 lifetime coins
        if (user.lifetimeCoins >= 500 && !user.achievements.find(a => a.name === 'Dedicated')) {
            achievements.push({
                name: 'Dedicated',
                icon: '💪',
                description: 'Earned 500 lifetime coins'
            });
        }

        // 1000 lifetime coins
        if (user.lifetimeCoins >= 1000 && !user.achievements.find(a => a.name === 'Champion')) {
            achievements.push({
                name: 'Champion',
                icon: '🏆',
                description: 'Earned 1000 lifetime coins'
            });
        }

        // 5000 lifetime coins
        if (user.lifetimeCoins >= 5000 && !user.achievements.find(a => a.name === 'Legend')) {
            achievements.push({
                name: 'Legend',
                icon: '👑',
                description: 'Earned 5000 lifetime coins'
            });
        }

        if (achievements.length > 0) {
            user.achievements.push(...achievements);
            await user.save();
        }

        return achievements;
    } catch (error) {
        console.error('Error checking achievements:', error);
        return [];
    }
};

// Hourly check for overdue tasks
const checkOverdueTasks = cron.schedule('0 * * * *', async () => {
    try {
        const now = new Date();
        const Task = require('../models/Task'); // Import here to avoid circular dependency if any

        // Find overdue, pending, non-penalized tasks
        const overdueTasks = await Task.find({
            status: 'pending',
            dueDate: { $lt: now },
            penalized: { $ne: true }
        }).populate('user group');

        for (const task of overdueTasks) {
            console.log(`Penalizing overdue task: ${task.title} for user: ${task.user.name}`);

            // Penalty amount (e.g., 20 coins or based on effort)
            const penaltyAmount = 20;

            // Update user coins
            const user = task.user;
            const groupId = task.group._id.toString();

            if (user && user.groupCoins) {
                const groupCoins = user.groupCoins.find(gc => gc.group.toString() === groupId);
                if (groupCoins) {
                    // Allow negative coins for penalties
                    groupCoins.weeklyCoins -= penaltyAmount;
                    groupCoins.lifetimeCoins -= penaltyAmount;
                } else {
                    // Create entry if missing
                    user.groupCoins.push({
                        group: groupId,
                        weeklyCoins: -penaltyAmount,
                        lifetimeCoins: -penaltyAmount
                    });
                }
                await user.save();
            }

            // Mark task as penalized
            task.penalized = true;
            await task.save();
        }
    } catch (error) {
        console.error('Error checking overdue tasks:', error);
    }
});

module.exports = { weeklyReset: dailyResetCheck, checkAchievements, checkOverdueTasks };
