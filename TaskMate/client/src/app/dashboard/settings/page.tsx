'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
    User,
    Palette,
    Bell,
    Shield,
    LogOut,
    Save,
    Loader2,
    Moon,
    Sun,
    Check
} from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUser, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.updateUser(user._id, { name, username }) as { success: boolean; user: any };
            if (res.success) {
                updateUser(res.user);
                setSuccess('Profile updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-[hsl(var(--muted-foreground))]">
                    Manage your account and preferences
                </p>
            </div>

            {/* Profile Settings */}
            <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-5 border-b border-[hsl(var(--border))]">
                    <h2 className="font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-[hsl(var(--primary))]" /> Profile Settings
                    </h2>
                </div>

                <form onSubmit={handleSaveProfile} className="p-5 space-y-5">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                            <Check className="w-4 h-4" /> {success}
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-medium">{user?.name}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">@{user?.username}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{user?.email}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                                placeholder="username"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl btn-primary font-medium disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Appearance */}
            <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-5 border-b border-[hsl(var(--border))]">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[hsl(var(--primary))]" /> Appearance
                    </h2>
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                Toggle between light and dark theme
                            </p>
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className={`relative w-14 h-8 rounded-full transition-colors ${darkMode ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted-foreground))]'
                                }`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full flex items-center justify-center transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'
                                }`}>
                                {darkMode ? <Moon className="w-4 h-4 text-[hsl(var(--primary))]" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-5 border-b border-[hsl(var(--border))]">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[hsl(var(--primary))]" /> Notifications
                    </h2>
                </div>

                <div className="p-5 space-y-4">
                    {[
                        { label: 'Task reminders', desc: 'Get notified about pending tasks' },
                        { label: 'Group updates', desc: 'New members, messages, etc.' },
                        { label: 'Weekly reports', desc: 'Summary of your performance' },
                    ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                            </div>
                            <button className="w-12 h-7 rounded-full bg-[hsl(var(--primary))] relative">
                                <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Account Stats */}
            <div className="rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-5 border-b border-[hsl(var(--border))]">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[hsl(var(--primary))]" /> Account Information
                    </h2>
                </div>

                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Weekly Coins</p>
                            <p className="text-2xl font-bold text-yellow-500">{user?.weeklyCoins || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Lifetime Coins</p>
                            <p className="text-2xl font-bold text-[hsl(var(--primary))]">{user?.lifetimeCoins || 0}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">Achievements</p>
                        {user?.achievements && user.achievements.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.achievements.map((achievement, index) => (
                                    <span key={index} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-sm">
                                        {achievement.icon} {achievement.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[hsl(var(--muted-foreground))]">No achievements yet. Complete tasks to earn badges!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl bg-red-500/5 border border-red-500/20 overflow-hidden">
                <div className="p-5 border-b border-red-500/20">
                    <h2 className="font-semibold text-red-400">Danger Zone</h2>
                </div>

                <div className="p-5">
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to sign out?')) {
                                logout();
                                window.location.href = '/login';
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
