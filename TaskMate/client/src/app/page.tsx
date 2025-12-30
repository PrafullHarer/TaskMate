import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { Sparkles, Users, Target, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';

export default async function HomePage() {
  const user = await getServerUser();

  // Redirect to dashboard if already logged in
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-pink-900/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[hsl(var(--primary))] opacity-10 blur-[150px] rounded-full" />

        {/* Navigation */}
        <LandingNavbar />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] mb-8">
            <Sparkles className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="text-sm text-[hsl(var(--primary))]">Student Accountability Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Achieve More</span>
            <br />
            <span className="text-[hsl(var(--foreground))]">Together</span>
          </h1>

          <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10">
            Join groups of motivated students, set daily goals, verify each other&apos;s progress,
            and earn rewards. Build habits that stick.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium btn-primary rounded-full"
            >
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium rounded-full border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Stay Accountable</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Built specifically for student groups who want to hold each other accountable
              and celebrate success together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Group Management',
                description: 'Create groups, invite friends via link or email, and manage your team effortlessly.'
              },
              {
                icon: Target,
                title: 'Daily Tasks',
                description: 'Set daily tasks with priorities and effort levels. Track progress in real-time.'
              },
              {
                icon: CheckCircle,
                title: 'Verification',
                description: 'Tasks are verified by group members, ensuring genuine accountability.'
              },
              {
                icon: Trophy,
                title: 'Coin Rewards',
                description: 'Earn coins for completing tasks. Compete on weekly leaderboards.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-[hsl(var(--primary)/0.1)] to-[hsl(var(--accent)/0.1)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Active Students' },
              { value: '500+', label: 'Study Groups' },
              { value: '1M+', label: 'Tasks Completed' },
              { value: '98%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to <span className="gradient-text">Level Up</span> Your Study Game?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-10 max-w-2xl mx-auto">
            Join thousands of students who are crushing their goals together.
            Start your accountability journey today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 text-lg font-medium btn-primary rounded-full animate-pulse-glow"
          >
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[hsl(var(--primary))]" />
              <span className="font-semibold">TaskMate</span>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              © 2025 TaskMate. Built for students, by students.<br />
              Developed by Prafull Harer.
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <Link href="/about" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">About Us</Link>
            <Link href="/contact" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">Contact</Link>
            <Link href="/guide" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">User Guide</Link>
            <Link href="/login" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
