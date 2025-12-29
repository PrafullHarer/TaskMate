'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function LandingNavbar() {
    const pathname = usePathname();

    // Helper to check if link is active
    const isActive = (path: string) => pathname === path;

    return (
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-[hsl(var(--primary))]" />
                <span className="text-2xl font-bold gradient-text">TaskMate</span>
            </Link>

            <div className="flex items-center gap-4">
                <Link
                    href="/about"
                    className={`hidden md:block px-4 py-2 text-sm font-medium transition-colors ${isActive('/about') ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]'
                        }`}
                >
                    About
                </Link>
                <Link
                    href="/contact"
                    className={`hidden md:block px-4 py-2 text-sm font-medium transition-colors ${isActive('/contact') ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]'
                        }`}
                >
                    Contact
                </Link>
                <Link
                    href="/guide"
                    className={`hidden md:block px-4 py-2 text-sm font-medium transition-colors ${isActive('/guide') ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]'
                        }`}
                >
                    Guide
                </Link>
                <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="px-6 py-2.5 text-sm font-medium btn-primary rounded-full"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
