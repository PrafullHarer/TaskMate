'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Send, MapPin, Github } from 'lucide-react';

import LandingNavbar from '@/components/LandingNavbar';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20 pointer-events-none" />

            <LandingNavbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Info Section */}
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in <span className="gradient-text">Touch</span></h1>
                        <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8">
                            Have questions, feedback, or just want to say hello? We'd love to hear from you.
                            Fill out the form and we'll get back to you as soon as possible.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                                <div className="p-3 rounded-lg bg-[hsl(var(--primary)/0.1)]">
                                    <Mail className="w-6 h-6 text-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Email Us</h3>
                                    <p className="text-[hsl(var(--muted-foreground))]">support@taskmate.app</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                                <div className="p-3 rounded-lg bg-[hsl(var(--primary)/0.1)]">
                                    <Github className="w-6 h-6 text-[hsl(var(--primary))]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">GitHub</h3>
                                    <p className="text-[hsl(var(--muted-foreground))]">@prafullharer</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-8 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-500">
                                    <Send className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                                <p className="text-[hsl(var(--muted-foreground))] mb-6">Thanks for reaching out. We'll be in touch shortly.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="text-[hsl(var(--primary))] font-medium hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="How can we help?"
                                        className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="w-full py-4 rounded-xl btn-primary font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {status === 'sending' ? 'Sending...' : (
                                        <>Send Message <Send className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
