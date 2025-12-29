'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Task, Group } from '@/types';
import Link from 'next/link';
import {
    CheckCircle2,
    Circle,
    Clock,
    Plus,
    Filter,
    Coins,
    Search,
    Flame
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type FilterType = 'all' | 'pending' | 'completed';

export default function TasksPage() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [search, setSearch] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, groupsRes] = await Promise.all([
                    api.getMyTasks({
                        status: filter !== 'all' ? filter : undefined,
                        groupId: selectedGroup !== 'all' ? selectedGroup : undefined,
                    }),
                    api.getGroups()
                ]) as [{ success: boolean; tasks: Task[] }, { success: boolean; groups: Group[] }];

                if (tasksRes.success) setTasks(tasksRes.tasks);
                if (groupsRes.success) setGroups(groupsRes.groups);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filter, selectedGroup]);

    const handleCompleteTask = async (taskId: string) => {
        try {
            await api.completeTask(taskId);
            setTasks(prev => prev.map(t =>
                t._id === taskId
                    ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
                    : t
            ));
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const activeGroup = groups.find(g => g._id === selectedGroup);
    const groupTasks = selectedGroup === 'all'
        ? tasks
        : tasks.filter(t => {
            const taskGroupId = typeof t.group === 'object' ? t.group._id : t.group;
            return taskGroupId === selectedGroup;
        });

    const filteredTasks = groupTasks
        .filter((t) => {
            if (filter === 'pending') return t.status === 'pending';
            if (filter === 'completed') return t.status !== 'pending';
            return true;
        })
        .filter((t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase())
        );

    const myTasks = filteredTasks.filter((t) => {
        const taskUserId = typeof t.user === 'object' ? t.user._id : t.user;
        return taskUserId === user?._id;
    });

    const otherTasks = filteredTasks.filter((t) => {
        const taskUserId = typeof t.user === 'object' ? t.user._id : t.user;
        return taskUserId !== user?._id;
    });

    const filterButtons: { id: FilterType; label: string; icon: React.ElementType }[] = [
        { id: 'all', label: 'All Tasks', icon: Filter },
        { id: 'pending', label: 'Pending', icon: Clock },
        { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-[hsl(var(--secondary))] rounded-lg animate-pulse" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-[hsl(var(--secondary))] rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                        {activeGroup ? activeGroup.name : 'All Groups'} • {groupTasks.length} total tasks
                    </p>
                </div>
                <Link
                    href="/dashboard/groups"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="h-5 w-5" />
                    Add Task
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {filterButtons.map((btn) => {
                        const Icon = btn.icon;
                        const isActive = filter === btn.id;
                        return (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                                    : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{btn.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Group Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                    onClick={() => setSelectedGroup('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === 'all'
                        ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                        : 'hover:bg-[hsl(var(--secondary))]'
                        }`}
                >
                    All Groups
                </button>
                {groups.map((group) => (
                    <button
                        key={group._id}
                        onClick={() => setSelectedGroup(group._id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === group._id
                            ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                            : 'hover:bg-[hsl(var(--secondary))]'
                            }`}
                    >
                        {group.name}
                    </button>
                ))}
            </div>

            {/* My Tasks */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">My Tasks</h2>
                {myTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] p-8 text-center">
                        <p className="text-[hsl(var(--muted-foreground))]">No tasks found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myTasks.map((task, index) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onComplete={handleCompleteTask}
                                isOwner={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Team Tasks */}
            {otherTasks.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Team Tasks</h2>
                    <div className="space-y-3">
                        {otherTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onComplete={handleCompleteTask}
                                isOwner={false}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

interface TaskCardProps {
    task: Task;
    onComplete: (id: string) => void;
    isOwner: boolean;
}

function TaskCard({ task, onComplete, isOwner }: TaskCardProps) {
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

    const effortDots = Array.from({ length: 5 }, (_, i) => i < task.effort);
    const potentialCoins = task.effort * 3 + (task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1);
    const taskUser = typeof task.user === 'object' ? task.user : null;

    return (
        <div
            className={`group relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all border-l-4 ${priorityStyles[task.priority]} ${task.status !== 'pending' ? 'opacity-70' : ''}`}
        >
            <div className="flex items-start gap-4">
                {/* Completion Toggle */}
                <button
                    onClick={() => task.status === 'pending' && isOwner && onComplete(task._id)}
                    disabled={task.status !== 'pending' || !isOwner}
                    className={`mt-0.5 flex-shrink-0 transition-colors ${task.status !== 'pending'
                        ? 'text-green-500'
                        : isOwner
                            ? 'text-[hsl(var(--muted-foreground))] hover:text-green-500 cursor-pointer'
                            : 'text-[hsl(var(--muted-foreground))] cursor-not-allowed opacity-50'
                        }`}
                >
                    {task.status !== 'pending' ? (
                        <CheckCircle2 className="h-6 w-6" />
                    ) : (
                        <Circle className="h-6 w-6" />
                    )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4
                            className={`font-semibold ${task.status !== 'pending' ? 'line-through text-[hsl(var(--muted-foreground))]' : ''
                                }`}
                        >
                            {task.title}
                        </h4>
                        <span
                            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityBadge[task.priority]}`}
                        >
                            {task.priority}
                        </span>
                    </div>

                    {task.description && (
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                        {/* Effort */}
                        <div className="flex items-center gap-1.5">
                            <Flame className="h-3.5 w-3.5" />
                            <div className="flex gap-0.5">
                                {effortDots.map((filled, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 w-1.5 rounded-full ${filled ? 'bg-yellow-500' : 'bg-[hsl(var(--muted-foreground)/0.3)]'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                        </div>

                        {/* Coins */}
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Coins className="h-3.5 w-3.5" />
                            <span>
                                {task.status !== 'pending' ? `+${task.coinsEarned}` : potentialCoins}
                            </span>
                        </div>

                        {/* Owner */}
                        {!isOwner && taskUser && (
                            <div className="flex items-center gap-1">
                                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-[8px]">
                                    {taskUser.name.charAt(0)}
                                </div>
                                <span>{taskUser.name.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
