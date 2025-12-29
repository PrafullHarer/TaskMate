'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Coins } from 'lucide-react';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { useState } from 'react';

interface HeaderProps {
    pageTitle?: string;
}

export default function Header({ pageTitle }: HeaderProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');

    // Get page title from pathname if not provided
    const getPageTitle = () => {
        if (pageTitle) return pageTitle;
        if (pathname === '/dashboard') return 'Dashboard';
        if (pathname.startsWith('/dashboard/groups')) return 'Groups';
        if (pathname.startsWith('/dashboard/tasks')) return 'My Tasks';
        if (pathname.startsWith('/dashboard/leaderboard')) return 'Leaderboard';
        if (pathname.startsWith('/dashboard/settings')) return 'Settings';
        return 'Dashboard';
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-6 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))]">
            {/* Left - Page Title */}
            <h1 className="text-lg font-semibold">{getPageTitle()}</h1>

            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks, groups..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all"
                    />
                </div>
            </div>

            {/* Right - Coins, Notifications, Avatar */}
            <div className="flex items-center gap-4">
                {/* Coins */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                    <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        <span className="font-bold">{user?.weeklyCoins || 0}</span>
                    </div>
                    <span className="text-xs opacity-80">coins</span>
                </div>

                {/* Notifications */}
                {/* Notifications */}
                <NotificationsDropdown />

                {/* User Avatar */}
                <Link href="/dashboard/settings" className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
