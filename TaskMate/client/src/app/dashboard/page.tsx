import { serverApi } from '@/lib/server-api';
import { requireAuth } from '@/lib/auth';
import { Group, Task, TaskStats } from '@/types';
import DashboardContent from './DashboardContent';

interface GroupsResponse {
    success: boolean;
    groups: Group[];
}

interface TasksResponse {
    success: boolean;
    tasks: Task[];
}

interface StatsResponse {
    success: boolean;
    stats: TaskStats;
}

export default async function DashboardPage() {
    // Get authenticated user (already verified by layout)
    const user = await requireAuth();

    // Fetch dashboard data on the server
    let groups: Group[] = [];
    let todayTasks: Task[] = [];
    let stats: TaskStats | null = null;

    try {
        // Fetch groups
        const groupsRes = await serverApi.getGroups() as GroupsResponse;
        if (groupsRes.success) {
            groups = groupsRes.groups;
        }

        // Fetch today's tasks
        const today = new Date().toISOString().split('T')[0];
        const tasksRes = await serverApi.getMyTasks({ date: today }) as TasksResponse;
        if (tasksRes.success) {
            todayTasks = tasksRes.tasks;
        }

        // Get stats from first group if exists
        if (groups.length > 0) {
            const statsRes = await serverApi.getTaskStats(groups[0]._id) as StatsResponse;
            if (statsRes.success) {
                stats = statsRes.stats;
            }
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }

    return (
        <DashboardContent
            userName={user.name}
            weeklyCoins={user.weeklyCoins || 0}
            lifetimeCoins={user.lifetimeCoins || 0}
            groups={groups}
            todayTasks={todayTasks}
            stats={stats}
        />
    );
}
