export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    profilePicture?: string;
    weeklyCoins: number;
    lifetimeCoins: number;
    achievements: Achievement[];
    groups: Group[] | string[];
    isAdmin?: boolean;
    lastActive?: string;
    createdAt: string;
}

export interface Achievement {
    name: string;
    icon: string;
    description?: string;
    earnedAt: string;
}

export interface Group {
    _id: string;
    name: string;
    description?: string;
    admin: User | string;
    members: User[];
    inviteCode: string;
    pendingRequests: {
        user: User;
        requestedAt: string;
    }[];
    settings: {
        taskVerification: 'self' | 'group' | 'admin';
        coinMultiplier: number;
        allowMemberInvites: boolean;
        resetFrequency?: 'weekly' | 'biweekly' | 'monthly';
    };
    weeklyLeader?: {
        user: User;
        coins: number;
        weekEnding: string;
    };
    weeklyLoser?: {
        user: User;
        coins: number;
        weekEnding: string;
    };
    createdAt: string;
}

export interface Task {
    _id: string;
    user: User | string;
    group: Group | string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    effort: number;
    status: 'pending' | 'completed' | 'verified';
    dueDate: string;
    completedAt?: string;
    verifiedBy?: User;
    verifiedAt?: string;
    coinsEarned: number;
    createdAt: string;
}

export interface Message {
    _id: string;
    group: string;
    sender: User;
    content: string;
    messageType: 'text' | 'link' | 'system';
    createdAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    _id: string;
    name: string;
    username: string;
    profilePicture?: string;
    weeklyCoins: number;
    lifetimeCoins: number;
}

export interface TaskStats {
    today: {
        total: number;
        completed: number;
        completionRate: number;
    };
    week: {
        total: number;
        completed: number;
        completionRate: number;
        coinsEarned: number;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    [key: string]: T | boolean | string | undefined;
}
