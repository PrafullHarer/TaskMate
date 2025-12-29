import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl text-gray-300 mb-6">Page Not Found</h2>
                <p className="text-gray-400 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
