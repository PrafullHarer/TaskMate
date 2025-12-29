'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Group } from '@/types';
import { X, Plus, Loader2 } from 'lucide-react';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: Group[];
    onTaskCreated?: () => void;
}

export default function AddTaskModal({ isOpen, onClose, groups, onTaskCreated }: AddTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [groupId, setGroupId] = useState(groups[0]?._id || '');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [effort, setEffort] = useState(3);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !groupId) return;

        setLoading(true);
        setError('');

        try {
            await api.createTask({
                title: title.trim(),
                description: description.trim(),
                priority,
                effort,
                dueDate,
                group: groupId,
            });
            setTitle('');
            setDescription('');
            setPriority('medium');
            setEffort(3);
            setDueDate(new Date().toISOString().split('T')[0]);
            onTaskCreated?.();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Add New Task</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-[hsl(var(--secondary))] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description (optional)"
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] resize-none"
                        />
                    </div>

                    {/* Group */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Group *</label>
                        <select
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                            required
                        >
                            {groups.map((group) => (
                                <option key={group._id} value={group._id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Priority & Effort Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                                className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Effort (1-5)</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setEffort(level)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${effort >= level
                                            ? 'bg-[hsl(var(--primary))] text-white'
                                            : 'bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))]"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !title.trim() || !groupId}
                            className="flex-1 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Add Task
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
