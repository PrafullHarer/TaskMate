const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: object;
    headers?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const token = this.getToken();
        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
        };

        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers: requestHeaders,
            credentials: 'include',
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
    async signup(name: string, username: string, email: string, password: string) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: { name, username, email, password },
        });
    }

    async login(email: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    }

    async getMe() {
        return this.request('/auth/me');
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // Users
    async getUser(id: string) {
        return this.request(`/users/${id}`);
    }

    async updateUser(id: string, data: object) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    async searchUsers(query: string) {
        return this.request(`/users/search/query?q=${encodeURIComponent(query)}`);
    }

    // Groups
    async createGroup(name: string, description?: string) {
        return this.request('/groups', {
            method: 'POST',
            body: { name, description },
        });
    }

    async getGroups() {
        return this.request('/groups');
    }

    async getGroup(id: string) {
        return this.request(`/groups/${id}`);
    }

    async updateGroup(id: string, data: object) {
        return this.request(`/groups/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    async joinGroup(inviteCode: string) {
        return this.request(`/groups/join/${inviteCode}`, { method: 'POST' });
    }

    async requestJoinGroup(id: string) {
        return this.request(`/groups/${id}/request`, { method: 'POST' });
    }

    async handleJoinRequest(groupId: string, userId: string, action: 'accept' | 'reject') {
        return this.request(`/groups/${groupId}/requests/${userId}`, {
            method: 'PUT',
            body: { action },
        });
    }

    async removeMember(groupId: string, userId: string) {
        return this.request(`/groups/${groupId}/members/${userId}`, {
            method: 'DELETE',
        });
    }

    async regenerateInvite(groupId: string) {
        return this.request(`/groups/${groupId}/invite`, { method: 'POST' });
    }

    async leaveGroup(id: string) {
        return this.request(`/groups/${id}/leave`, { method: 'POST' });
    }

    // Tasks
    async createTask(data: object) {
        return this.request('/tasks', {
            method: 'POST',
            body: data,
        });
    }

    async getGroupTasks(groupId: string, params?: { date?: string; status?: string; userId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.date) queryParams.append('date', params.date);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.userId) queryParams.append('userId', params.userId);

        const queryString = queryParams.toString();
        return this.request(`/tasks/group/${groupId}${queryString ? `?${queryString}` : ''}`);
    }

    async getMyTasks(params?: { date?: string; status?: string; groupId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.date) queryParams.append('date', params.date);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.groupId) queryParams.append('groupId', params.groupId);

        const queryString = queryParams.toString();
        return this.request(`/tasks/my-tasks${queryString ? `?${queryString}` : ''}`);
    }

    async updateTask(id: string, data: object) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    async completeTask(id: string) {
        return this.request(`/tasks/${id}/complete`, { method: 'POST' });
    }

    async verifyTask(id: string) {
        return this.request(`/tasks/${id}/verify`, { method: 'POST' });
    }

    async deleteTask(id: string) {
        return this.request(`/tasks/${id}`, { method: 'DELETE' });
    }

    async getTaskStats(groupId: string) {
        return this.request(`/tasks/stats/${groupId}`);
    }

    // Messages
    async getMessages(groupId: string, params?: { limit?: number; before?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.before) queryParams.append('before', params.before);

        const queryString = queryParams.toString();
        return this.request(`/messages/${groupId}${queryString ? `?${queryString}` : ''}`);
    }

    async sendMessage(groupId: string, content: string, messageType: string = 'text') {
        return this.request('/messages', {
            method: 'POST',
            body: { group: groupId, content, messageType },
        });
    }

    async deleteMessage(id: string) {
        return this.request(`/messages/${id}`, { method: 'DELETE' });
    }

    // Leaderboard
    async getLeaderboard(groupId: string) {
        return this.request(`/leaderboard/${groupId}`);
    }

    async getGlobalLeaderboard() {
        return this.request('/leaderboard/global/top');
    }

    // Notifications
    async getNotifications() {
        return this.request('/notifications');
    }

    async markNotificationRead(id: string) {
        return this.request(`/notifications/${id}/read`, { method: 'PUT' });
    }

    async markAllNotificationsRead() {
        return this.request('/notifications/read-all', { method: 'PUT' });
    }
}

export const api = new ApiClient();
