import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if user is trying to access dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('token')?.value;

        // Redirect to login if no token
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Add Cache-Control headers to all responses to prevent back-button caching of sensitive data
    const response = NextResponse.next();

    // Completely disable caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
}

export const config = {
    // Apply to dashboard and auth verification endpoint
    matcher: [
        '/dashboard/:path*',
        '/api/auth/me'
    ],
};
