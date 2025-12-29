import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: object;
    headers?: Record<string, string>;
}

/**
 * Server-side API client for use in Server Components.
 * Automatically forwards auth cookies from the incoming request.
 */
class ServerApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private async getAuthCookie(): Promise<string | undefined> {
        const cookieStore = await cookies();
        return cookieStore.get('token')?.value;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const token = await this.getAuthCookie();
        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
            requestHeaders['Cookie'] = `token=${token}`;
        }

        const config: RequestInit = {
            method,
            headers: requestHeaders,
            cache: 'no-store', // Disable caching for authenticated requests
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    }

    // Auth
    async getMe() {
        return this.request('/auth/me');
    }

    // Groups
    async getGroups() {
        return this.request('/groups');
    }

    async getGroup(id: string) {
        return this.request(`/groups/${id}`);
    }

    // Tasks
    async getMyTasks(params?: { date?: string; status?: string; groupId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.date) queryParams.append('date', params.date);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.groupId) queryParams.append('groupId', params.groupId);

        const queryString = queryParams.toString();
        return this.request(`/tasks/my-tasks${queryString ? `?${queryString}` : ''}`);
    }

    async getGroupTasks(groupId: string, params?: { date?: string; status?: string; userId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.date) queryParams.append('date', params.date);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.userId) queryParams.append('userId', params.userId);

        const queryString = queryParams.toString();
        return this.request(`/tasks/group/${groupId}${queryString ? `?${queryString}` : ''}`);
    }

    async getTaskStats(groupId: string) {
        return this.request(`/tasks/stats/${groupId}`);
    }

    // Leaderboard
    async getLeaderboard(groupId: string) {
        return this.request(`/leaderboard/${groupId}`);
    }

    async getGlobalLeaderboard() {
        return this.request('/leaderboard/global/top');
    }
}

export const serverApi = new ServerApiClient();
