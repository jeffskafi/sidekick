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

export default function Tasks({ initialTasks, userId }: TasksProps) {
  return (
    <TaskProvider initialTasks={initialTasks}>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-dark-bg">
        <div 
          id="task-list"
          className="flex-grow overflow-y-auto pt-0 px-6 sm:px-8 md:px-12 scrollbar-hide"
        >
          <div className="w-full max-w-3xl mx-auto h-full flex items-center justify-center">
            <TaskList />
          </div>
        </div>
        <div className="sticky bottom-0 bg-gray-50 dark:bg-dark-bg p-4">
          <div className="max-w-3xl mx-auto">
            <AddTaskForm userId={userId} />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}