'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Group, Task, TaskStats } from '@/types';
import Link from 'next/link';
import {
    CheckSquare,
    Users,
    Coins,
    Trophy,
    Plus,
    ArrowRight,
    Clock,
    CheckCircle2
} from 'lucide-react';
import AddTaskModal from '@/components/AddTaskModal';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: { value: number; positive: boolean };
    variant?: 'default' | 'primary' | 'coin' | 'warning';
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
    const variants = {
        default: {
            bg: 'bg-[hsl(var(--card))]',
            icon: 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]',
            border: 'border-[hsl(var(--border))]',
        },
        primary: {
            bg: 'bg-[hsl(var(--primary)/0.05)]',
            icon: 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]',
            border: 'border-[hsl(var(--primary)/0.2)]',
        },
        coin: {
            bg: 'bg-gradient-to-br from-amber-500/5 to-yellow-400/10',
            icon: 'bg-amber-500/20 text-yellow-500',
            border: 'border-amber-500/20',
        },
        warning: {
            bg: 'bg-red-500/5',
            icon: 'bg-red-500/20 text-red-500',
            border: 'border-red-500/20',
        },
    };

    const style = variants[variant];

    return (
        <div className={`relative overflow-hidden rounded-xl border p-5 transition-all hover:-translate-y-0.5 ${style.bg} ${style.border}`}>
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`inline-flex items-center gap-1 text-xs font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                            <span>{trend.positive ? '↑' : '↓'}</span>
                            <span>{trend.value}% from last week</span>
                        </div>
                    )}
                </div>
                <div className={`rounded-lg p-3 ${style.icon}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}

interface TaskProgressProps {
    completed: number;
    total: number;
}

function TaskProgress({ completed, total }: TaskProgressProps) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Today&apos;s Progress</h3>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{completed}/{total} tasks</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[hsl(var(--secondary))]">
                <div
                    className="h-2 rounded-full bg-[hsl(var(--primary))] transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{completed} Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span>{total - completed} Pending</span>
                    </div>
                </div>
                <span className="text-lg font-bold text-[hsl(var(--primary))]">{percentage}%</span>
            </div>
        </div>
    );
}

interface TaskCardSimpleProps {
    task: Task;
}

function TaskCardSimple({ task }: TaskCardSimpleProps) {
    const priorityStyles = {
        low: 'border-l-slate-400',
        medium: 'border-l-yellow-500',
        high: 'border-l-red-500',
    };

    const priorityBadge = {
        low: 'bg-slate-500/10 text-slate-400',
        medium: 'bg-yellow-500/10 text-yellow-500',
        high: 'bg-red-500/10 text-red-500',
    };

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] border-l-4 ${priorityStyles[task.priority]} ${task.status !== 'pending' ? 'opacity-60' : ''}`}>
            <div className={`mt-0.5 flex-shrink-0 ${task.status !== 'pending' ? 'text-green-500' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {task.status !== 'pending' ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-current" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-medium ${task.status !== 'pending' ? 'line-through text-[hsl(var(--muted-foreground))]' : ''}`}>
                        {task.title}
                    </h4>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityBadge[task.priority]}`}>
                        {task.priority}
                    </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Coins className="h-3.5 w-3.5" />
                        <span>{task.coinsEarned > 0 ? `+${task.coinsEarned}` : task.effort * 3}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface DashboardContentProps {
    userName: string;
    weeklyCoins: number;
    lifetimeCoins: number;
    groups: Group[];
    todayTasks: Task[];
    stats: TaskStats | null;
}

export default function DashboardContent({
    userName,
    weeklyCoins,
    lifetimeCoins,
    groups,
    todayTasks,
    stats
}: DashboardContentProps) {
    const router = useRouter();
    const [showAddTask, setShowAddTask] = useState(false);
    const completedToday = todayTasks.filter(t => t.status !== 'pending').length;
    const totalToday = todayTasks.length;
    const pendingTasks = todayTasks.filter(t => t.status === 'pending');

    return (
        <div className="space-y-6">
            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={showAddTask}
                onClose={() => setShowAddTask(false)}
                groups={groups}
                onTaskCreated={() => router.refresh()}
            />

            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome back, {userName.split(' ')[0]}! 👋
                    </h1>
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                        You have {pendingTasks.length} tasks pending today
                    </p>
                </div>
                <button
                    onClick={() => setShowAddTask(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-5 w-5" />
                    Add Task
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Tasks Completed"
                    value={completedToday}
                    subtitle="Today"
                    icon={CheckSquare}
                    trend={{ value: 12, positive: true }}
                    variant="primary"
                />
                <StatsCard
                    title="Weekly Coins"
                    value={weeklyCoins || 0}
                    subtitle="Keep it up!"
                    icon={Coins}
                    variant="coin"
                />
                <StatsCard
                    title="Active Groups"
                    value={groups.length}
                    icon={Users}
                />
                <StatsCard
                    title="Lifetime Coins"
                    value={lifetimeCoins?.toLocaleString() || '0'}
                    icon={Trophy}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column - Tasks */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
                        <Link
                            href="/dashboard/tasks"
                            className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {pendingTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] p-12 text-center">
                            <div className="rounded-full bg-[hsl(var(--primary)/0.1)] p-4 mb-4">
                                <CheckSquare className="h-8 w-8 text-[hsl(var(--primary))]" />
                            </div>
                            <h3 className="font-semibold">No pending tasks</h3>
                            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                                You&apos;re all caught up! Add a new task to get started.
                            </p>
                            <Link
                                href="/dashboard/groups"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white text-sm font-medium"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingTasks.slice(0, 4).map((task) => (
                                <TaskCardSimple key={task._id} task={task} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column - Progress */}
                <div className="space-y-6">
                    <TaskProgress completed={completedToday} total={totalToday} />

                    {/* Quick Groups */}
                    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">My Groups</h3>
                            <Link
                                href="/dashboard/groups"
                                className="text-sm text-[hsl(var(--primary))] hover:underline"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {groups.slice(0, 3).map((group) => (
                                <Link
                                    key={group._id}
                                    href={`/dashboard/groups/${group._id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-medium">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{group.name}</p>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {group.members.length} members
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {groups.length === 0 && (
                                <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
                                    No groups yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
