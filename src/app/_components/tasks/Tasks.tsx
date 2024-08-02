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
      <div className="min-h-screen bg-amber-50 dark:bg-dark-bg p-4 sm:p-6 md:p-9">
        <div className="w-full max-w-3xl mx-auto">
          <AddTaskForm userId={userId} />
          <div className="mt-6 sm:mt-9">
            <TaskList />
          </div>
        </div>
      </div>
    </TaskProvider>
  );
}