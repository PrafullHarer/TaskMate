'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Group, Task, Message, User } from '@/types';
import Link from 'next/link';
import {
    ArrowLeft,
    Copy,
    Check,
    Users,
    Crown,
    Plus,
    Target,
    MessageSquare,
    Trophy,
    Settings,
    Send,
    CheckCircle2,
    Clock,
    Coins,
    Loader2,
    MoreVertical,
    Trash2,
    X,
    LogOut
} from 'lucide-react';
import { formatDate, formatTime, getPriorityColor, getStatusColor, getRelativeTime, copyToClipboard } from '@/lib/utils';

type Tab = 'tasks' | 'chat' | 'members' | 'leaderboard' | 'settings';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { joinGroup, leaveGroup, onNewMessage, onTaskCreated, onTaskCompleted, onTaskDeleted, removeListeners } = useSocket();

    const [group, setGroup] = useState<Group | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'tasks');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Task modal
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        effort: 3,
        dueDate: new Date().toISOString().split('T')[0]
    });
    const [creatingTask, setCreatingTask] = useState(false);

    // Chat
    const [chatMessage, setChatMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    // Exit group
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitingGroup, setExitingGroup] = useState(false);

    // Group Settings
    const [editForm, setEditForm] = useState({ name: '', description: '', resetFrequency: 'weekly' });
    const [updatingGroup, setUpdatingGroup] = useState(false);

    const handleChatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setChatMessage(e.target.value);
    };

    const groupId = params.id as string;

    const fetchGroup = useCallback(async () => {
        try {
            const res = await api.getGroup(groupId) as { success: boolean; group: Group };
            if (res.success) {
                setGroup(res.group);
            }
        } catch (error) {
            console.error('Error fetching group:', error);
            router.push('/dashboard/groups');
        }
    }, [groupId, router]);

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.getGroupTasks(groupId) as { success: boolean; tasks: Task[] };
            if (res.success) {
                setTasks(res.tasks);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }, [groupId]);

    const fetchMessages = useCallback(async () => {
        try {
            const res = await api.getMessages(groupId) as { success: boolean; messages: Message[] };
            if (res.success) {
                setMessages(res.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }, [groupId]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await api.getLeaderboard(groupId) as { success: boolean; leaderboard: any };
            if (res.success) {
                setLeaderboard(res.leaderboard);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    }, [groupId]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchGroup(), fetchTasks(), fetchMessages(), fetchLeaderboard()]);
            setLoading(false);
        };
        loadData();

        // Join socket room
        joinGroup(groupId);

        // Set up socket listeners
        onNewMessage((message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        onTaskCreated((data: { task: Task }) => {
            setTasks(prev => [data.task, ...prev]);
        });

        onTaskCompleted((data: { task: Task }) => {
            setTasks(prev => prev.map(t => t._id === data.task._id ? data.task : t));
        });

        onTaskDeleted((data: { taskId: string }) => {
            setTasks(prev => prev.filter(t => t._id !== data.taskId));
        });

        return () => {
            leaveGroup(groupId);
            removeListeners();
        };
    }, [groupId, joinGroup, leaveGroup, onNewMessage, onTaskCreated, onTaskCompleted, onTaskDeleted, removeListeners, fetchGroup, fetchTasks, fetchMessages, fetchLeaderboard]);

    // Populate edit form when group loads
    useEffect(() => {
        if (group) {
            setEditForm({
                name: group.name,
                description: group.description || '',
                resetFrequency: group.settings?.resetFrequency || 'weekly'
            });
        }
    }, [group]);

    const handleCopyInvite = async () => {
        if (!group) return;
        await copyToClipboard(group.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title.trim()) return;

        setCreatingTask(true);
        try {
            const res = await api.createTask({
                ...newTask,
                group: groupId,
                dueDate: new Date(newTask.dueDate).toISOString()
            }) as { success: boolean; task: Task };

            if (res.success) {
                setShowTaskModal(false);
                setNewTask({
                    title: '',
                    description: '',
                    priority: 'medium',
                    effort: 3,
                    dueDate: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            console.error('Error creating task:', error);
        } finally {
            setCreatingTask(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await api.completeTask(taskId);
            fetchTasks();
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        setSendingMessage(true);
        try {
            await api.sendMessage(groupId, chatMessage.trim());
            setChatMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleExitGroup = async () => {
        setExitingGroup(true);
        try {
            await api.leaveGroup(groupId);
            router.push('/dashboard/groups');
        } catch (error) {
            console.error('Error leaving group:', error);
            setExitingGroup(false);
            setShowExitModal(false);
        }
    };

    const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this member from the group?')) return;

        setRemovingMemberId(memberId);
        try {
            await api.removeMember(groupId, memberId);
            fetchGroup(); // Refresh group data
        } catch (error) {
            console.error('Error removing member:', error);
            alert('Failed to remove member');
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleUpdateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!group) return;
        setUpdatingGroup(true);
        try {
            await api.updateGroup(groupId, editForm);
            // Refresh group data
            fetchGroup();
            alert('Group settings updated successfully');
        } catch (error) {
            console.error('Error updating group:', error);
            alert('Failed to update group settings');
        } finally {
            setUpdatingGroup(false);
        }
    };

    if (loading || !group) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-32 bg-[hsl(var(--secondary))] rounded-lg animate-pulse" />
                <div className="h-40 bg-[hsl(var(--secondary))] rounded-2xl animate-pulse" />
                <div className="h-96 bg-[hsl(var(--secondary))] rounded-2xl animate-pulse" />
            </div>
        );
    }

    const isAdmin = typeof group.admin === 'object'
        ? group.admin._id === user?._id
        : group.admin === user?._id;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/dashboard/groups"
                className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Groups
            </Link>

            {/* Group Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-pink-600 p-6 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{group.name}</h1>
                                {isAdmin && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">
                                        <Crown className="w-3 h-3" /> Admin
                                    </span>
                                )}
                            </div>
                            {group.description && (
                                <p className="text-white/80 mt-1">{group.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-sm text-white/70">
                                <Users className="w-4 h-4" />
                                <span>{group.members.length} members</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20">
                            <span className="text-sm">Invite Code:</span>
                            <span className="font-mono font-bold">{group.inviteCode}</span>
                            <button onClick={handleCopyInvite} className="p-1 hover:bg-white/20 rounded">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['tasks', 'chat', 'members', 'leaderboard', 'settings'] as Tab[]).map((tab) => {
                    if (tab === 'settings' && !isAdmin) return null;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                ? 'bg-[hsl(var(--primary))] text-white'
                                : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)]'
                                }`}
                        >
                            {tab === 'tasks' && <Target className="w-4 h-4" />}
                            {tab === 'chat' && <MessageSquare className="w-4 h-4" />}
                            {tab === 'members' && <Users className="w-4 h-4" />}
                            {tab === 'leaderboard' && <Trophy className="w-4 h-4" />}
                            {tab === 'settings' && <Settings className="w-4 h-4" />}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--border))]">
                            <h2 className="font-semibold">Group Tasks</h2>
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" /> Add Task
                            </button>
                        </div>

                        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                            {tasks.length === 0 ? (
                                <div className="text-center py-12">
                                    <Target className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                                    <p className="text-[hsl(var(--muted-foreground))]">No tasks yet</p>
                                    <button
                                        onClick={() => setShowTaskModal(true)}
                                        className="inline-flex items-center gap-2 mt-4 text-[hsl(var(--primary))]"
                                    >
                                        <Plus className="w-4 h-4" /> Create your first task
                                    </button>
                                </div>
                            ) : (
                                tasks.map((task) => {
                                    const isOwner = typeof task.user === 'object' ? task.user._id === user?._id : task.user === user?._id;
                                    const taskUser = typeof task.user === 'object' ? task.user : null;

                                    return (
                                        <div
                                            key={task._id}
                                            className="p-4 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)] transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => isOwner && task.status === 'pending' && handleCompleteTask(task._id)}
                                                    disabled={!isOwner || task.status !== 'pending'}
                                                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.status !== 'pending'
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : isOwner
                                                            ? 'border-[hsl(var(--muted-foreground))] hover:border-green-500 cursor-pointer'
                                                            : 'border-[hsl(var(--muted-foreground))] cursor-not-allowed opacity-50'
                                                        }`}
                                                >
                                                    {task.status !== 'pending' && <Check className="w-3 h-3" />}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`font-medium ${task.status !== 'pending' ? 'line-through opacity-60' : ''}`}>
                                                            {task.title}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                                            {task.priority}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                    </div>

                                                    {task.description && (
                                                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{task.description}</p>
                                                    )}

                                                    <div className="flex items-center gap-4 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                                                        {taskUser && (
                                                            <span className="flex items-center gap-1">
                                                                <div className="w-4 h-4 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-[10px]">
                                                                    {taskUser.name.charAt(0)}
                                                                </div>
                                                                {taskUser.name}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(task.dueDate)}
                                                        </span>
                                                        <span>Effort: {task.effort}/5</span>
                                                    </div>
                                                </div>

                                                {task.coinsEarned > 0 && (
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Coins className="w-4 h-4" />
                                                        <span className="text-sm font-medium">+{task.coinsEarned}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-[600px]">
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                                    <p className="text-[hsl(var(--muted-foreground))]">No messages yet</p>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Be the first to say hello!</p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isOwn = message.sender._id === user?._id;
                                    return (
                                        <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
                                                {!isOwn && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white text-xs">
                                                            {message.sender.name.charAt(0)}
                                                        </div>
                                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{message.sender.name}</span>
                                                    </div>
                                                )}
                                                <div className={`p-3 rounded-2xl ${isOwn
                                                    ? 'bg-[hsl(var(--primary))] text-white rounded-br-sm'
                                                    : 'bg-[hsl(var(--secondary))] rounded-bl-sm'
                                                    }`}>
                                                    <p className="text-sm">{message.content}</p>
                                                </div>
                                                <p className={`text-xs text-[hsl(var(--muted-foreground))] mt-1 ${isOwn ? 'text-right' : ''}`}>
                                                    {getRelativeTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 border-t border-[hsl(var(--border))] relative">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatMessage}
                                    onChange={handleChatChange}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={sendingMessage || !chatMessage.trim()}
                                    className="px-5 py-3 rounded-xl btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendingMessage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="p-4 space-y-2">
                        {group.members.map((member) => {
                            const memberUser = typeof member === 'object' ? member : null;
                            if (!memberUser) return null;

                            const isMemberAdmin = typeof group.admin === 'object'
                                ? group.admin._id === memberUser._id
                                : group.admin === memberUser._id;

                            return (
                                <div
                                    key={memberUser._id}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--secondary))]"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-medium">
                                        {memberUser.profilePicture ? (
                                            <img src={memberUser.profilePicture} alt={memberUser.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            memberUser.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{memberUser.name}</span>
                                            {isMemberAdmin && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs">
                                                    <Crown className="w-3 h-3" /> Admin
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">@{memberUser.username}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Coins className="w-4 h-4" />
                                                <span className="font-medium">{memberUser.weeklyCoins}</span>
                                            </div>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Weekly</p>
                                        </div>
                                        {/* Admin Remove Button - Removed from here, moved to Settings */}

                                    </div>
                                </div>
                            );
                        })}

                        {/* Exit Group Section */}
                        {!isAdmin && (
                            <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                                <button
                                    onClick={() => setShowExitModal(true)}
                                    className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Exit Group</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && leaderboard && (
                    <div className="p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" /> Weekly Rankings
                            </h3>
                            <div className="space-y-2">
                                {leaderboard.weekly?.map((entry: any, index: number) => (
                                    <div
                                        key={entry._id}
                                        className={`flex items-center gap-3 p-4 rounded-xl ${index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                                            index === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                                                index === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                                                    'bg-[hsl(var(--secondary))]'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-white' :
                                            index === 1 ? 'bg-gray-400 text-white' :
                                                index === 2 ? 'bg-orange-500 text-white' :
                                                    'bg-[hsl(var(--muted-foreground))] text-white'
                                            }`}>
                                            {entry.rank}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-medium">
                                            {entry.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{entry.name}</p>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">@{entry.username}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Coins className="w-5 h-5" />
                                            <span className="font-bold text-lg">{entry.weeklyCoins}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {leaderboard.lowestPerformer && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-red-400 mb-2">⚠️ This week&apos;s lowest performer:</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-medium">
                                        {leaderboard.lowestPerformer.user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-red-400">{leaderboard.lowestPerformer.user.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-red-400">
                                        <Coins className="w-4 h-4" />
                                        <span>{leaderboard.lowestPerformer.coins}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && isAdmin && (
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-[hsl(var(--primary))]" />
                                General Settings
                            </h3>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateGroup(e);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Group Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] transition-all"
                                        placeholder="Enter group name"
                                        required
                                    />
                                </div>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] resize-none transition-all"
                                    placeholder="Enter group description"
                                    rows={3}
                                />


                                <div>
                                    <label className="block text-sm font-medium mb-2">Leaderboard Reset Frequency</label>
                                    <div className="relative">
                                        <select
                                            value={editForm.resetFrequency}
                                            onChange={(e) => setEditForm({ ...editForm, resetFrequency: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] appearance-none transition-all"
                                        >
                                            <option value="weekly">Weekly (Every Sunday)</option>
                                            <option value="biweekly">Bi-weekly (Every 14 days)</option>
                                            <option value="monthly">Monthly (1st of Month)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[hsl(var(--muted-foreground))]">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                                        Determines how often coin counts reset and winners are announced.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={updatingGroup}
                                    className="px-6 py-2.5 rounded-xl btn-primary font-medium flex items-center gap-2 disabled:opacity-50"
                                >
                                    {updatingGroup ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </form>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-[hsl(var(--border))]">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-red-400">
                                <Users className="w-5 h-5" />
                                Member Management
                            </h3>
                            <div className="space-y-2">
                                {group.members.map((member) => {
                                    const memberUser = typeof member === 'object' ? member : null;
                                    if (!memberUser) return null;

                                    const isMemberAdmin = typeof group.admin === 'object'
                                        ? group.admin._id === memberUser._id
                                        : group.admin === memberUser._id;

                                    if (isMemberAdmin) return null; // Don't show admin in removal list

                                    return (
                                        <div
                                            key={memberUser._id}
                                            className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--secondary))]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-medium">
                                                    {memberUser.profilePicture ? (
                                                        <img src={memberUser.profilePicture} alt={memberUser.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        memberUser.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{memberUser.name}</p>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">@{memberUser.username}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveMember(memberUser._id)}
                                                disabled={removingMemberId === memberUser._id}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium disabled:opacity-50"
                                            >
                                                {removingMemberId === memberUser._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <X className="w-4 h-4" />
                                                )}
                                                Remove
                                            </button>
                                        </div>
                                    );
                                })}
                                {group.members.length <= 1 && (
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] italic">No other members to manage.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            {
                showTaskModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-md bg-[hsl(var(--card))] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Create New Task</h2>
                                <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-[hsl(var(--secondary))] rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                                        placeholder="What do you need to do?"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] resize-none"
                                        placeholder="Add details..."
                                        rows={2}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Effort (1-5)</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setNewTask({ ...newTask, effort: level })}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newTask.effort >= level
                                                        ? 'bg-[hsl(var(--primary))] text-white'
                                                        : 'bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]'
                                                        }`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={creatingTask || !newTask.title.trim()}
                                    className="w-full py-3 rounded-xl btn-primary font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {creatingTask ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" /> Create Task
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Exit Group Confirmation Modal */}
            {
                showExitModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-sm bg-[hsl(var(--card))] rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-full bg-red-500/10">
                                    <LogOut className="w-6 h-6 text-red-400" />
                                </div>
                                <h2 className="text-xl font-bold">Exit Group</h2>
                            </div>

                            <p className="text-[hsl(var(--muted-foreground))] mb-6">
                                Are you sure you want to leave <span className="font-medium text-[hsl(var(--foreground))]">{group.name}</span>?
                                You will lose access to all group tasks and chat history.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowExitModal(false)}
                                    disabled={exitingGroup}
                                    className="flex-1 py-3 rounded-xl bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.8)] font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExitGroup}
                                    disabled={exitingGroup}
                                    className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {exitingGroup ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Leaving...
                                        </>
                                    ) : (
                                        'Exit Group'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
