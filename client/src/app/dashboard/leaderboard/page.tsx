'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Group } from '@/types';
import {
    Trophy,
    Coins,
    Calendar,
    ChevronDown
} from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
    weeklyCoins: number;
    lifetimeCoins: number;
    points?: number;
}



export default function LeaderboardPage() {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>('');
    const [leaderboard, setLeaderboard] = useState<any>(null);
    const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [view, setView] = useState<'group' | 'global'>('group');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.getGroups() as { success: boolean; groups: Group[] };
                if (res.success && res.groups.length > 0) {
                    setGroups(res.groups);
                    setSelectedGroup(res.groups[0]._id);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
            }
        };
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (!selectedGroup) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.getLeaderboard(selectedGroup) as { success: boolean; leaderboard: any };
                if (res.success) {
                    setLeaderboard(res.leaderboard);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (view === 'group') {
            fetchLeaderboard();
        }
    }, [selectedGroup, view]);

    useEffect(() => {
        const fetchGlobalLeaderboard = async () => {
            try {
                const res = await api.getGlobalLeaderboard() as { success: boolean; leaderboard: LeaderboardEntry[] };
                if (res.success) {
                    setGlobalLeaderboard(res.leaderboard);
                }
            } catch (error) {
                console.error('Error fetching global leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        if (view === 'global') {
            fetchGlobalLeaderboard();
        }
    }, [view]);

    const activeGroup = groups.find(g => g._id === selectedGroup);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-10 w-48 bg-[hsl(var(--secondary))] rounded-lg animate-pulse" />
                <div className="h-64 bg-[hsl(var(--secondary))] rounded-xl animate-pulse" />
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-[hsl(var(--secondary))] rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    const weeklyData = leaderboard?.weekly || [];
    const top3 = weeklyData.slice(0, 3);
    const restOfLeaderboard = weeklyData.slice(3);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Leaderboard</h1>
                    <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                        {activeGroup?.name || 'Select a group'} • Weekly Rankings
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--secondary))] px-4 py-2">
                    <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Resets Sunday</span>
                </div>
            </div>

            {/* View Toggle + Group Selector */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => setView('group')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'group'
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'
                        }`}
                >
                    Group
                </button>
                <button
                    onClick={() => setView('global')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'global'
                        ? 'bg-[hsl(var(--primary))] text-white'
                        : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]'
                        }`}
                >
                    Global
                </button>

                {view === 'group' && groups.length > 0 && (
                    <div className="relative ml-auto">
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="appearance-none px-4 py-2 pr-10 rounded-lg bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] cursor-pointer"
                        >
                            {groups.map(group => (
                                <option key={group._id} value={group._id}>{group.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))] pointer-events-none" />
                    </div>
                )}
            </div>

            {view === 'group' && (
                <>
                    {groups.length === 0 ? (
                        <div className="text-center py-16 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                            <Trophy className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                Join a group to see leaderboard rankings
                            </p>
                        </div>
                    ) : leaderboard && (
                        <>
                            {/* Top 3 Podium */}
                            {top3.length > 0 && (
                                <div className="grid grid-cols-3 gap-4">
                                    {/* 2nd Place */}
                                    <div className="flex flex-col items-center justify-end pt-8">
                                        {top3[1] && (
                                            <div className="text-center">
                                                <div className="relative">
                                                    <div className="h-16 w-16 mx-auto rounded-full ring-4 ring-slate-400 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                                                        {top3[1].profilePicture ? (
                                                            <img src={top3[1].profilePicture} alt={top3[1].name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            top3[1].name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white">
                                                        2
                                                    </div>
                                                </div>
                                                <p className="mt-4 font-semibold truncate max-w-[120px] mx-auto">{top3[1].name}</p>
                                                <div className="flex items-center justify-center gap-1 text-yellow-500">
                                                    <Coins className="h-4 w-4" />
                                                    <span className="font-bold">{top3[1].weeklyCoins}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 h-24 w-full rounded-t-xl bg-gradient-to-t from-slate-500/20 to-slate-400/10" />
                                    </div>

                                    {/* 1st Place */}
                                    <div className="flex flex-col items-center justify-end">
                                        {top3[0] && (
                                            <div className="text-center">
                                                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                                                <div className="relative">
                                                    <div className="h-20 w-20 mx-auto rounded-full ring-4 ring-yellow-400 shadow-lg shadow-yellow-500/20 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                                                        {top3[0].profilePicture ? (
                                                            <img src={top3[0].profilePicture} alt={top3[0].name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            top3[0].name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-black">
                                                        1
                                                    </div>
                                                </div>
                                                <p className="mt-4 font-bold text-lg truncate max-w-[140px] mx-auto">{top3[0].name}</p>
                                                <div className="flex items-center justify-center gap-1 text-yellow-500">
                                                    <Coins className="h-5 w-5" />
                                                    <span className="text-xl font-bold">{top3[0].weeklyCoins}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 h-32 w-full rounded-t-xl bg-gradient-to-t from-yellow-500/20 to-yellow-400/10" />
                                    </div>

                                    {/* 3rd Place */}
                                    <div className="flex flex-col items-center justify-end pt-12">
                                        {top3[2] && (
                                            <div className="text-center">
                                                <div className="relative">
                                                    <div className="h-14 w-14 mx-auto rounded-full ring-4 ring-amber-700 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                                                        {top3[2].profilePicture ? (
                                                            <img src={top3[2].profilePicture} alt={top3[2].name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            top3[2].name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-xs font-bold text-white">
                                                        3
                                                    </div>
                                                </div>
                                                <p className="mt-4 font-semibold truncate max-w-[100px] mx-auto">{top3[2].name}</p>
                                                <div className="flex items-center justify-center gap-1 text-yellow-500">
                                                    <Coins className="h-4 w-4" />
                                                    <span className="font-bold">{top3[2].weeklyCoins}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="mt-4 h-16 w-full rounded-t-xl bg-gradient-to-t from-amber-700/20 to-orange-600/10" />
                                    </div>
                                </div>
                            )}

                            {/* Full Rankings */}
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold">Full Rankings</h2>
                                {weeklyData.map((entry: LeaderboardEntry) => {
                                    const isCurrentUser = entry._id === user?._id;
                                    return (
                                        <LeaderboardCard
                                            key={entry._id}
                                            entry={entry}
                                            isCurrentUser={isCurrentUser}
                                            showWeekly={true}
                                        />
                                    );
                                })}
                            </div>

                            {/* Lowest Performer */}
                            {leaderboard.lowestPerformer && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <p className="text-sm text-red-400 mb-2 font-medium">⚠️ Needs more effort this week:</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-medium">
                                            {leaderboard.lowestPerformer.user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{leaderboard.lowestPerformer.user.name}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-red-400">
                                            <Coins className="w-4 h-4" />
                                            <span>{leaderboard.lowestPerformer.coins} coins</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {view === 'global' && (
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[hsl(var(--primary))]" /> All-Time Top Performers
                    </h2>
                    {globalLeaderboard.length === 0 ? (
                        <div className="text-center py-12 rounded-xl border border-dashed border-[hsl(var(--border))]">
                            <Trophy className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-3" />
                            <p className="text-[hsl(var(--muted-foreground))]">No rankings yet</p>
                        </div>
                    ) : (
                        globalLeaderboard.map((entry) => {
                            const isCurrentUser = entry._id === user?._id;
                            return (
                                <LeaderboardCard
                                    key={entry._id}
                                    entry={entry}
                                    isCurrentUser={isCurrentUser}
                                    showWeekly={false}
                                />
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

interface LeaderboardCardProps {
    entry: LeaderboardEntry;
    isCurrentUser: boolean;
    showWeekly: boolean;
}

function LeaderboardCard({ entry, isCurrentUser, showWeekly }: LeaderboardCardProps) {
    const rankStyles = {
        1: 'bg-yellow-500/10 border-yellow-500/20',
        2: 'bg-slate-400/10 border-slate-400/20',
        3: 'bg-amber-700/10 border-amber-700/20',
    };

    const rankBadge = {
        1: 'bg-yellow-500 text-white',
        2: 'bg-slate-400 text-white',
        3: 'bg-amber-700 text-white',
    };

    const style = rankStyles[entry.rank as keyof typeof rankStyles] || 'bg-[hsl(var(--secondary))]';
    const badge = rankBadge[entry.rank as keyof typeof rankBadge] || 'bg-[hsl(var(--muted-foreground))] text-white';

    const displayValue = showWeekly
        ? entry.weeklyCoins
        : (entry.points ?? Math.floor(entry.lifetimeCoins / 10));

    return (
        <div className={`flex items-center gap-4 p-4 rounded-xl border border-[hsl(var(--border))] ${style} ${isCurrentUser ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${badge}`}>
                {entry.rank}
            </div>

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold overflow-hidden">
                {entry.profilePicture ? (
                    <img src={entry.profilePicture} alt={entry.name} className="w-full h-full object-cover" />
                ) : (
                    entry.name.charAt(0)
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{entry.name}</span>
                    {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--primary))] text-white">
                            You
                        </span>
                    )}
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {showWeekly
                        ? `${entry.weeklyCoins} tasks completed`
                        : `${displayValue} points (${entry.lifetimeCoins} lifetime coins)`}
                </p>
            </div>

            <div className="flex items-center gap-1 text-yellow-500">
                {showWeekly ? <Coins className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                <span className="font-bold text-lg">{displayValue}</span>
            </div>
        </div>
    );
}
