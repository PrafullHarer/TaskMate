'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuth } from './AuthContext';
import { Message, Task } from '@/types';

interface SocketContextType {
    isConnected: boolean;
    joinGroup: (groupId: string) => void;
    leaveGroup: (groupId: string) => void;
    onNewMessage: (callback: (message: Message) => void) => void;
    onTaskUpdate: (callback: (data: { task: Task }) => void) => void;
    onTaskCreated: (callback: (data: { task: Task }) => void) => void;
    onTaskCompleted: (callback: (data: { task: Task; coinsEarned: number }) => void) => void;
    onTaskDeleted: (callback: (data: { taskId: string }) => void) => void;
    onNotification: (callback: (notification: any) => void) => void;
    removeListeners: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user, updateUser } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!user || !isConnected) return;

        const handleCoinsUpdate = (data: { weeklyCoins: number; lifetimeCoins: number }) => {
            updateUser(data);
        };

        socketClient.onCoinsUpdated(handleCoinsUpdate as (data: object) => void);

        return () => {
            socketClient.removeListener('coins-updated');
        };
    }, [user, isConnected, updateUser]);

    useEffect(() => {
        if (user) {
            const socket = socketClient.connect();

            socket.on('connect', () => {
                setIsConnected(true);
                if (user && user._id) socketClient.joinUser(user._id);
            });

            socket.on('disconnect', () => {
                setIsConnected(false);
            });

            return () => {
                socketClient.disconnect();
                setIsConnected(false);
            };
        }
    }, [user]);

    const joinGroup = useCallback((groupId: string) => {
        socketClient.joinGroup(groupId);
    }, []);

    const leaveGroup = useCallback((groupId: string) => {
        socketClient.leaveGroup(groupId);
    }, []);

    const onNewMessage = useCallback((callback: (message: Message) => void) => {
        socketClient.onNewMessage(callback as (message: object) => void);
    }, []);

    const onTaskUpdate = useCallback((callback: (data: { task: Task }) => void) => {
        socketClient.onTaskUpdate(callback as (data: object) => void);
    }, []);

    const onTaskCreated = useCallback((callback: (data: { task: Task }) => void) => {
        socketClient.onTaskCreated(callback as (data: object) => void);
    }, []);

    const onTaskCompleted = useCallback((callback: (data: { task: Task; coinsEarned: number }) => void) => {
        socketClient.onTaskCompleted(callback as (data: object) => void);
    }, []);

    const onTaskDeleted = useCallback((callback: (data: { taskId: string }) => void) => {
        socketClient.onTaskDeleted(callback);
    }, []);

    const onNotification = useCallback((callback: (notification: any) => void) => {
        socketClient.onNotification(callback as (data: object) => void);
    }, []);

    const removeListeners = useCallback(() => {
        socketClient.removeListener('new-message');
        socketClient.removeListener('task-updated');
        socketClient.removeListener('task-created');
        socketClient.removeListener('task-completed');
        socketClient.removeListener('task-deleted');
        socketClient.removeListener('notification');
    }, []);

    return (
        <SocketContext.Provider
            value={{
                isConnected,
                joinGroup,
                leaveGroup,
                onNewMessage,
                onTaskUpdate,
                onTaskCreated,
                onTaskCompleted,
                onTaskDeleted,
                onNotification,
                removeListeners,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
