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
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-3xl mx-auto relative">
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 dark:bg-dark-bg p-4">
            <div className="max-w-3xl mx-auto">
              <AddTaskForm userId={userId} />
            </div>
          </div>
          <div className="pb-20">
            <TaskList />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}