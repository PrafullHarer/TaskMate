'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            // Check localStorage for token (client-side)
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await api.getMe() as { success: boolean; user: User };
            if (response.success) {
                setUser(response.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password) as { success: boolean; token: string; user: User };
        if (response.success) {
            // Store token in localStorage for client-side API calls
            // Cookie is automatically set by the server for SSR
            localStorage.setItem('token', response.token);
            setUser(response.user);
        }
    };

    const signup = async (name: string, username: string, email: string, password: string) => {
        const response = await api.signup(name, username, email, password) as { success: boolean; token: string; user: User };
        if (response.success) {
            // Store token in localStorage for client-side API calls
            // Cookie is automatically set by the server for SSR
            localStorage.setItem('token', response.token);
            setUser(response.user);
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
        localStorage.removeItem('token');
        setUser(null);
        router.refresh();
        router.replace('/login');
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...data });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
