"use client";
import React from "react";
import { TaskProvider } from "~/app/_contexts/TaskContext";
import TaskList from "./TaskList";
import AddTaskForm from "./AddTaskForm";
import type { Task } from "~/server/db/schema";

interface TasksProps {
  initialTasks: Task[];
  userId: string;
}

const Tasks: React.FC<TasksProps> = ({ initialTasks, userId }) => {
  return (
    <div className="h-full overflow-auto">
      <TaskProvider initialTasks={initialTasks}>
        <div className="flex h-[calc(100vh-4rem)] flex-col bg-background-light dark:bg-background-dark">
          <div
            id="task-list"
            className="scrollbar-hide flex-grow overflow-y-auto px-6 pt-0 sm:px-8 md:px-12"
          >
            <div className="mx-auto h-full w-full max-w-3xl">
              <TaskList />
            </div>
          </div>
          {/* Updated background classes here */}
          <div className="sticky bottom-0 bg-background-light p-4 dark:bg-background-dark">
            <div className="mx-auto max-w-3xl">
              <AddTaskForm userId={userId} />
            </div>
          </div>
        </div>
      </TaskProvider>
    </div>
  );
};

export default Tasks;
