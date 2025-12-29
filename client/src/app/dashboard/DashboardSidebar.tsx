'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    CheckSquare,
    LayoutDashboard,
    Users,
    Trophy,
    MessageCircle,
    Settings,
    LogOut,
    Coins,
    Menu,
    X,
    Plus,
    Search,
    Bell,
    User as UserIcon
} from 'lucide-react';
import { useState } from 'react';
import { User, Group } from '@/types';

const navigation = [
    { id: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { id: 'tasks', name: 'My Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { id: 'groups', name: 'Groups', href: '/dashboard/groups', icon: Users },
    { id: 'leaderboard', name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
];

interface DashboardSidebarProps {
    initialUser: User;
    initialGroups?: Group[];
    children: React.ReactNode;
}

export default function DashboardSidebar({ initialUser, initialGroups = [], children }: DashboardSidebarProps) {
    const { user: contextUser, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Use context user if available (for real-time updates), otherwise use initial SSR user
    const user = contextUser || initialUser;
    const groups = initialGroups;

    const handleLogout = async () => {
        try {
            // Import api from lib/api
            const { api } = await import('@/lib/api');
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        logout();
        router.push('/login');
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-52 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]
                transform transition-transform duration-300 lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-6">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
                                <CheckSquare className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold">TaskMate</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-[hsl(var(--secondary))]"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Profile Mini */}
                    <div className="border-b border-[hsl(var(--border))] p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-medium ring-2 ring-[hsl(var(--primary)/0.3)]">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{user.name}</p>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Coins className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">{user.weeklyCoins || 0} this week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-3">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                                        flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                                        ${active
                                            ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
                                        }
                                    `}
                                >
                                    <item.icon className={`h-5 w-5 ${active ? 'text-[hsl(var(--primary))]' : ''}`} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Groups Quick Access */}
                    <div className="border-t border-[hsl(var(--border))] p-3">
                        <div className="mb-2 flex items-center justify-between px-3">
                            <span className="text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">
                                My Groups
                            </span>
                            <Link href="/dashboard/groups/create" className="rounded-md p-1 hover:bg-[hsl(var(--secondary))]">
                                <Plus className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            </Link>
                        </div>
                        <div className="space-y-1">
                            {groups.slice(0, 3).map((group) => (
                                <Link
                                    key={group._id}
                                    href={`/dashboard/groups/${group._id}`}
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--secondary))] text-xs font-semibold">
                                        {group.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate">{group.name}</span>
                                </Link>
                            ))}
                            {groups.length === 0 && (
                                <p className="px-3 py-2 text-xs text-[hsl(var(--muted-foreground))]">
                                    No groups yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="border-t border-[hsl(var(--border))] p-3 space-y-1">
                        <Link
                            href="/dashboard/settings"
                            onClick={() => setSidebarOpen(false)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-52">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))]"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <CheckSquare className="w-6 h-6 text-[hsl(var(--primary))]" />
                        <span className="font-bold">TaskMate</span>
                    </div>
                    <Link href="/dashboard/settings" className="p-2 rounded-lg hover:bg-[hsl(var(--secondary))]">
                        <UserIcon className="w-6 h-6" />
                    </Link>
                </header>

                {/* Desktop Header */}
                <header className="hidden lg:flex sticky top-0 z-30 items-center h-14 px-6 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
                    {/* Page Title - Left */}
                    <h1 className="text-lg font-semibold min-w-[120px]">
                        {pathname === '/dashboard' && 'Dashboard'}
                        {pathname.includes('/groups') && 'Groups'}
                        {pathname.includes('/tasks') && 'My Tasks'}
                        {pathname.includes('/leaderboard') && 'Leaderboard'}
                        {pathname.includes('/settings') && 'Settings'}
                    </h1>

                    {/* Search - Center */}
                    <div className="flex-1 flex justify-center px-8">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <input
                                type="text"
                                placeholder="Search tasks, groups..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:border-[hsl(var(--primary))] transition-all"
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {/* Coins Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))]">
                            <span className="text-xs text-[hsl(var(--primary-foreground))]/80">This Week</span>
                            <div className="flex items-center gap-1 text-[hsl(var(--primary-foreground))]">
                                <Coins className="h-4 w-4" />
                                <span className="font-bold">{user.weeklyCoins || 0} coins</span>
                            </div>
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition-colors">
                            <Bell className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[hsl(var(--destructive))]" />
                        </button>

                        {/* User Avatar */}
                        <Link href="/dashboard/settings">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-medium overflow-hidden ring-2 ring-[hsl(var(--border))]">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user.name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
