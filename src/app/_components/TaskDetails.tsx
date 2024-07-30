import React from "react";
import { useTheme } from "./ThemeProvider";
import type { Task, TaskNode } from "~/server/db/schema";
import { formatDueDate } from "./tasks/helpers";

interface TaskDetailsProps {
  task: Task | TaskNode | null;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task }) => {
  const { theme } = useTheme();

  if (!task) {
    return (
      <div className={`flex h-full items-center justify-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
        <p className="text-lg">Select a task to view details</p>
      </div>
    );
  }

  return (
    <div className={`p-4 ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}>
      <h2 className="text-xl font-bold mb-4">{task.description}</h2>
      <p>Status: {task.status}</p>
      <p>Priority: {task.priority}</p>
      <p>Due Date: {formatDueDate(task.dueDate)}</p>
      <p>Completed: {task.completed ? "Yes" : "No"}</p>
    </div>
  );
};

export default TaskDetails;