import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateTime(date: string | Date): string {
    return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function getPriorityColor(priority: 'low' | 'medium' | 'high'): string {
    switch (priority) {
        case 'high':
            return 'text-red-500 bg-red-500/10';
        case 'medium':
            return 'text-yellow-500 bg-yellow-500/10';
        case 'low':
            return 'text-green-500 bg-green-500/10';
        default:
            return 'text-gray-500 bg-gray-500/10';
    }
}

export function getStatusColor(status: 'pending' | 'completed' | 'verified'): string {
    switch (status) {
        case 'verified':
            return 'text-green-500 bg-green-500/10';
        case 'completed':
            return 'text-blue-500 bg-blue-500/10';
        case 'pending':
            return 'text-orange-500 bg-orange-500/10';
        default:
            return 'text-gray-500 bg-gray-500/10';
    }
}

export function isToday(date: string | Date): boolean {
    const today = new Date();
    const d = new Date(date);
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

export function isOverdue(date: string | Date): boolean {
    const now = new Date();
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d < now;
}

export function getDaysUntil(date: string | Date): number {
    const now = new Date();
    const d = new Date(date);
    const diff = d.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
}

export function getRelativeTime(date: string | Date): string {
    const now = new Date();
    const d = new Date(date);
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}
