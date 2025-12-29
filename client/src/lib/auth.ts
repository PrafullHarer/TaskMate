import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverApi } from './server-api';
import { User } from '@/types';

interface AuthResponse {
    success: boolean;
    user: User;
}

/**
 * Get the current user from the server.
 * Returns null if not authenticated.
 */
export async function getServerUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
        return null;
    }

    try {
        const response = await serverApi.getMe() as AuthResponse;
        if (response.success) {
            return response.user;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Require authentication for a page.
 * Redirects to login if not authenticated.
 */
export async function requireAuth(): Promise<User> {
    const user = await getServerUser();

    if (!user) {
        redirect('/login');
    }

    return user;
}

/**
 * Redirect to dashboard if already authenticated.
 * Used on login/signup pages.
 */
export async function redirectIfAuthenticated(): Promise<void> {
    const user = await getServerUser();

    if (user) {
        redirect('/dashboard');
    }
}
