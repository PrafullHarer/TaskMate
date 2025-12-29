import LandingNavbar from '@/components/LandingNavbar';
import { BookOpen, CheckCircle, Coins, Trophy, Users, Star, Zap, Target, Shield, Heart } from 'lucide-react';

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />

            <LandingNavbar />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <header className="mb-16 text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] font-medium text-sm mb-6 animate-fade-in">
                        <Star className="w-4 h-4 fill-current" />
                        <span>The Ultimate Manual</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Master Your <br />
                        <span className="gradient-text">Productivity Journey</span>
                    </h1>
                    <p className="text-xl text-[hsl(var(--muted-foreground))]">
                        Discover how TaskMate turns your daily tasks into a game of success, community, and rewards.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Getting Started (Large) */}
                    <div className="lg:col-span-2 p-8 rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-all hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.1)] group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Getting Started is Instant</h2>
                        <p className="text-[hsl(var(--muted-foreground))] text-lg mb-6">
                            Jump straight into action. Upon signing up, you get a personal <strong>Dashboard</strong> that acts as your command center—tracking your active groups, pending tasks, and global ranking in real-time.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
                                <h3 className="font-semibold mb-1">1. Create Account</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sign up in seconds using your email.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
                                <h3 className="font-semibold mb-1">2. Join a Group</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Find your squad or create your own.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: The Coin Economy (Tall) */}
                    <div className="row-span-2 p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 hover:border-amber-500/40 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                            <Coins className="w-6 h-6 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-400">The Economy</h2>
                        <div className="space-y-6">
                            <p className="text-[hsl(var(--muted-foreground))]">
                                Every action has value. We use a dual-currency system to reward both short-term effort and long-term consistency.
                            </p>

                            <div className="bg-[hsl(var(--background))/0.5] p-5 rounded-2xl backdrop-blur-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> Group Coins
                                </h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Earned within groups. Resets weekly/monthly. Defines your sprint ranking.</p>
                            </div>

                            <div className="bg-[hsl(var(--background))/0.5] p-5 rounded-2xl backdrop-blur-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Global Points
                                </h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Your lifetime score. 10 Coins = 1 GP. Use these to showcase your veteran status.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Groups */}
                    <div className="p-8 rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                            <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-3">Group Dynamics</h2>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                            You're the Admin of groups you create. Invite friends with a code, manage members, and set the leaderboard reset schedule.
                        </p>
                    </div>

                    {/* Card 4: Tasks */}
                    <div className="p-8 rounded-3xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] transition-all hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-bold mb-3">Task Mastery</h2>
                        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-4">
                            Set Priority (Low/Med/High) and Effort (1-5). Higher difficulty = More coins. <span className="text-red-500 font-medium">Beware: Overdue tasks cost -20 Coins!</span>
                        </p>
                    </div>

                    {/* Card 5: Competition (Wide) */}
                    <div className="lg:col-span-3 p-8 rounded-3xl bg-gradient-to-r from-[hsl(var(--primary))/0.05] to-transparent border border-[hsl(var(--border))] flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-xs font-bold mb-4">
                                <Trophy className="w-3 h-3" />
                                <span>COMPETITION</span>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Climb the Ranks</h2>
                            <p className="text-[hsl(var(--muted-foreground))] text-lg mb-6">
                                Whether it's the weekly sprint against your friends or the global marathon against the world, there's a leaderboard for you. Avoid the "Hall of Shame" at all costs!
                            </p>
                            <a href="/signup" className="btn-primary rounded-full px-8 py-3 font-medium inline-block">
                                Start Competing Now
                            </a>
                        </div>

                        {/* Visual Decoration */}
                        <div className="w-full md:w-1/3 flex flex-col gap-3 opacity-80">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-sm transform translate-x-4">
                                <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-600 flex items-center justify-center font-bold">1</div>
                                <div className="flex-1 h-2 bg-[hsl(var(--foreground))/0.1] rounded-full overflow-hidden">
                                    <div className="w-[80%] h-full bg-yellow-500 rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-gray-400/20 text-gray-500 flex items-center justify-center font-bold">2</div>
                                <div className="flex-1 h-2 bg-[hsl(var(--foreground))/0.1] rounded-full overflow-hidden">
                                    <div className="w-[60%] h-full bg-gray-400 rounded-full" />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-sm transform translate-x-2">
                                <div className="w-8 h-8 rounded-full bg-orange-700/20 text-orange-700 flex items-center justify-center font-bold">3</div>
                                <div className="flex-1 h-2 bg-[hsl(var(--foreground))/0.1] rounded-full overflow-hidden">
                                    <div className="w-[40%] h-full bg-orange-700 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
