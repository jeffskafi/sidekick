import type { Task } from "~/server/db/schema";

export const getStatusColor = (status: Task['status'], theme: 'light' | 'dark') => {
    switch (status) {
        case "in_progress": return "bg-orange-500";
        case "done": return "bg-green-500";
        case "todo": return theme === 'dark' ? 'bg-amber-700' : 'bg-amber-200';
        default: return theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300';
    }
};

export const formatDueDate = (dueDate: Date | null): string => {
    if (!dueDate) return '';
    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const isInputEmpty = (input: string): boolean => {
    return input.trim() === '';
};