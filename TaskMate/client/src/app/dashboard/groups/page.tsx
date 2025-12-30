'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/types';
import Link from 'next/link';
import {
    Users,
    Plus,
    Link2,
    Search,
    Loader2,
    Crown,
    Trophy,
    Copy,
    Check,
    MessageCircle,
    X
} from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

export default function GroupsPage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await api.getGroups() as { success: boolean; groups: Group[] };
            if (res.success) {
                setGroups(res.groups);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGroup = async () => {
        if (!joinCode.trim()) return;

        setJoining(true);
        setError('');

        try {
            const res = await api.joinGroup(joinCode.trim().toUpperCase()) as { success: boolean; message: string };
            if (res.success) {
                setShowJoinModal(false);
                setJoinCode('');
                fetchGroups();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join group');
        } finally {
            setJoining(false);
        }
    };

    const handleCopyCode = async (groupId: string, code: string) => {
        await copyToClipboard(code);
        setCopiedId(groupId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredGroups = groups.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-[hsl(var(--secondary))] rounded-lg animate-pulse" />
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-64 bg-[hsl(var(--secondary))] rounded-xl animate-pulse" />
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
                    <h1 className="text-2xl font-bold">My Groups</h1>
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                        Manage your accountability groups
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] font-medium transition-colors"
                    >
                        <Link2 className="h-5 w-5" />
                        Join Group
                    </button>
                    <Link
                        href="/dashboard/groups/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="h-5 w-5" />
                        Create Group
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search groups..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                />
            </div>

            {/* Groups Grid */}
            {filteredGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/0.5)] p-12 text-center">
                    <div className="rounded-full bg-[hsl(var(--primary)/0.1)] p-4 mb-4">
                        <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
                    </div>
                    <h3 className="font-semibold">No groups found</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                        Create a new group or join one with an invite code
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {filteredGroups.map((group) => {
                        const isAdmin = typeof group.admin === 'object'
                            ? group.admin._id === user?._id
                            : group.admin === user?._id;
                        const topPerformer = group.members.length > 0 ? group.members.reduce((prev, current) => {
                            return (prev.weeklyCoins || 0) > (current.weeklyCoins || 0) ? prev : current;
                        }, group.members[0]) : null;

                        return (
                            <div
                                key={group._id}
                                className="relative overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:shadow-lg"
                            >
                                {/* Admin Badge */}
                                {isAdmin && (
                                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                                        <Crown className="h-3 w-3" />
                                        Admin
                                    </div>
                                )}

                                {/* Group Info */}
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold">{group.name}</h3>
                                    {group.description && (
                                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
                                            {group.description}
                                        </p>
                                    )}
                                </div>

                                {/* Members Preview */}
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {group.members.slice(0, 4).map((member) => (
                                            <div
                                                key={member._id}
                                                className="h-8 w-8 rounded-full ring-2 ring-[hsl(var(--card))] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-xs font-medium"
                                            >
                                                {member.profilePicture ? (
                                                    <img src={member.profilePicture} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    member.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {group.members.length} members
                                    </span>
                                </div>

                                {/* Top Performer */}
                                {topPerformer && (topPerformer.weeklyCoins || 0) > 0 && (
                                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-[hsl(var(--primary)/0.1)] py-2 px-3">
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-[10px] font-medium overflow-hidden">
                                            {topPerformer.profilePicture ? (
                                                <img src={topPerformer.profilePicture} alt={topPerformer.name} className="w-full h-full object-cover" />
                                            ) : (
                                                topPerformer.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm">
                                            <span className="font-semibold text-yellow-500">{topPerformer.name.split(' ')[0]}</span>
                                            <span className="text-[hsl(var(--muted-foreground))]"> leading with {topPerformer.weeklyCoins} coins</span>
                                        </span>
                                    </div>
                                )}

                                {/* Invite Code */}
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex-1 rounded-lg bg-[hsl(var(--secondary)/0.5)] px-3 py-2">
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Invite Code</p>
                                        <p className="font-mono font-semibold">{group.inviteCode}</p>
                                    </div>
                                    <button
                                        onClick={() => handleCopyCode(group._id, group.inviteCode)}
                                        className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors"
                                    >
                                        {copiedId === group._id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                        )}
                                    </button>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link
                                        href={`/dashboard/groups/${group._id}?tab=chat`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] font-medium text-sm transition-colors"
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Chat
                                    </Link>
                                    <Link
                                        href={`/dashboard/groups/${group._id}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                                    >
                                        View Tasks
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowJoinModal(false)}
                    />
                    <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Join Group</h2>
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="rounded-lg p-2 hover:bg-[hsl(var(--secondary))] transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium">
                                    Invite Code
                                </label>
                                <input
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter group invite code"
                                    className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] font-mono text-lg tracking-wider uppercase"
                                />
                                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowJoinModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleJoinGroup}
                                    disabled={joining || !joinCode.trim()}
                                    className="flex-1 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {joining ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Join Group'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
