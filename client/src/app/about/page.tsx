import Link from 'next/link';
import { Code, Heart, Globe } from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />

            <LandingNavbar />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6">About <span className="gradient-text">TaskMate</span></h1>

                <div className="space-y-8 text-lg text-[hsl(var(--muted-foreground))]">
                    <p>
                        TaskMate was born out of a simple need: students helping students stay on track.
                        We believe that accountability is the secret sauce to consistency, and consistency is the key to success.
                    </p>
                    <p>
                        Whether you are preparing for exams, learning a new skill, or just trying to keep your daily life organized,
                        doing it with friends makes the journey easier and more fun.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                        <Heart className="w-8 h-8 text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Community First</h3>
                        <p className="text-[hsl(var(--muted-foreground))]">Built to foster genuine connections and mutual support among peers.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                        <Code className="w-8 h-8 text-blue-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Modern Tech</h3>
                        <p className="text-[hsl(var(--muted-foreground))]">Powered by Next.js 14 and refined with a premium user experience in mind.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                        <Globe className="w-8 h-8 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Global Vision</h3>
                        <p className="text-[hsl(var(--muted-foreground))]">Connecting students across the globe through shared goals.</p>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-[hsl(var(--border))] text-center">
                    <h2 className="text-2xl font-bold mb-4">Meet the Developer</h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-6">
                        Designed and developed with passion by <strong>Prafull Harer</strong>.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/contact" className="btn-secondary rounded-full px-6 py-2">Get in Touch</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
