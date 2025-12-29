'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, AtSign, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await signup(name, username, email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        if (password.length === 0) return { level: 0, text: '' };
        if (password.length < 6) return { level: 1, text: 'Weak' };
        if (password.length < 10) return { level: 2, text: 'Medium' };
        return { level: 3, text: 'Strong' };
    };

    const strength = passwordStrength();

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(var(--primary))] to-pink-600 items-center justify-center p-16">
                <div className="max-w-lg text-white">
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-8">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6">Join the Community</h2>

                    <div className="space-y-4">
                        {[
                            'Create and join study groups',
                            'Set daily tasks and track progress',
                            'Earn coins and climb leaderboards',
                            'Chat in real-time with your team'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-4 h-4" />
                                </div>
                                <span className="text-white/90">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-6 relative">
                <Link
                    href="/"
                    className="absolute top-4 left-4 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2"
                >
                    Back to Home
                </Link>

                <div className="max-w-md mx-auto w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-8 h-8 text-[hsl(var(--primary))]" />
                        <span className="text-2xl font-bold gradient-text">TaskMate</span>
                    </Link>

                    <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Start your accountability journey today
                    </p>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all text-sm"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Username</label>
                            <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all text-sm"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                                Only lowercase letters, numbers, and underscores
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all text-sm"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 w-8 rounded-full transition-colors ${strength.level >= level
                                                    ? strength.level === 1
                                                        ? 'bg-red-500'
                                                        : strength.level === 2
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    : 'bg-[hsl(var(--border))]'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className={`text-xs ${strength.level === 1 ? 'text-red-500' :
                                        strength.level === 2 ? 'text-yellow-500' :
                                            strength.level === 3 ? 'text-green-500' : ''
                                        }`}>
                                        {strength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl btn-primary font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[hsl(var(--muted-foreground))] mt-6 text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[hsl(var(--primary))] hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
}
