'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Users,
    Sparkles,
    Loader2
} from 'lucide-react';

export default function CreateGroupPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await api.createGroup(name.trim(), description.trim()) as { success: boolean; group: { _id: string } };
            if (res.success) {
                router.push(`/dashboard/groups/${res.group._id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link
                href="/dashboard/groups"
                className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-8"
            >
                <ArrowLeft className="w-5 h-5" /> Back to Groups
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-[hsl(var(--primary))]" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Create New Group</h1>
                <p className="text-[hsl(var(--muted-foreground))]">
                    Start a study group and invite your friends to join
                </p>
            </div>

            {/* Form */}
            <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Group Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all"
                            placeholder="e.g., CS Study Group"
                            maxLength={50}
                            required
                        />
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {name.length}/50 characters
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] transition-all resize-none"
                            placeholder="What is this group for?"
                            rows={3}
                            maxLength={200}
                        />
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {description.length}/200 characters
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="w-full py-3 rounded-xl btn-primary font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Create Group
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-6">
                    You&apos;ll become the admin of this group and can invite others to join.
                </p>
            </div>
        </div>
    );
}
