import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketClient {
    private socket: Socket | null = null;
    private static instance: SocketClient;

    private constructor() { }

    public static getInstance(): SocketClient {
        if (!SocketClient.instance) {
            SocketClient.instance = new SocketClient();
        }
        return SocketClient.instance;
    }

    public connect(): Socket {
        if (!this.socket) {
            this.socket = io(SOCKET_URL, {
                autoConnect: true,
                transports: ['websocket', 'polling'],
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });
        }
        return this.socket;
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public joinGroup(groupId: string): void {
        if (this.socket) {
            this.socket.emit('join-group', groupId);
        }
    }

    public leaveGroup(groupId: string): void {
        if (this.socket) {
            this.socket.emit('leave-group', groupId);
        }
    }

    public joinUser(userId: string): void {
        if (this.socket) {
            this.socket.emit('join-user', userId);
        }
    }

    public onNotification(callback: (notification: object) => void): void {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    public sendMessage(groupId: string, message: object): void {
        if (this.socket) {
            this.socket.emit('send-message', { groupId, ...message });
        }
    }

    public emitTaskUpdate(groupId: string, task: object): void {
        if (this.socket) {
            this.socket.emit('task-update', { groupId, task });
        }
    }

    public onNewMessage(callback: (message: object) => void): void {
        if (this.socket) {
            this.socket.on('new-message', callback);
        }
    }

    public onTaskUpdate(callback: (data: object) => void): void {
        if (this.socket) {
            this.socket.on('task-updated', callback);
        }
    }

    public onTaskCreated(callback: (data: object) => void): void {
        if (this.socket) {
            this.socket.on('task-created', callback);
        }
    }

    public onTaskCompleted(callback: (data: object) => void): void {
        if (this.socket) {
            this.socket.on('task-completed', callback);
        }
    }

    public onTaskDeleted(callback: (data: { taskId: string }) => void): void {
        if (this.socket) {
            this.socket.on('task-deleted', callback);
        }
    }

    public onMessageDeleted(callback: (data: { messageId: string }) => void): void {
        if (this.socket) {
            this.socket.on('message-deleted', callback);
        }
    }

    public onCoinsUpdated(callback: (data: object) => void): void {
        if (this.socket) {
            this.socket.on('coins-updated', callback);
        }
    }

    public removeListener(event: string): void {
        if (this.socket) {
            this.socket.off(event);
        }
    }
}

export const socketClient = SocketClient.getInstance();
