import type { Task } from "~/server/db/schema";

export const getStatusColor = (status: Task['status'], theme: 'light' | 'dark') => {
    switch (status) {
        case "in_progress": return "bg-orange-500";
        case "needs_human_input": return "bg-orange-500 animate-pulse";
        case "done": return "bg-green-500";
        case "failed": return "bg-red-500";
        case "exception": return "bg-red-500";
        case "todo": return theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300';
        default: return theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300';
    }
};

// Custom isValid function
const isDateValid = (date: unknown): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
};

// Custom format function
const formatDate = (date: Date, formatString: string): string => {
    if (!isDateValid(date)) {
        return "Invalid date";
    }

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return formatString
        .replace('MMM', month ?? '')
        .replace('d', day.toString())
        .replace('yyyy', year.toString());
};

export const formatDueDate = (date: Date | null): string => {
    if (date && isDateValid(date)) {
        return formatDate(date, 'MMM d');
    }
    return "";
};

export const isInputEmpty = (input: string): boolean => {
    return input.trim() === '';
};