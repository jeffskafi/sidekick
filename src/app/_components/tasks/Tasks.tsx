"use client";
import React from "react";
import { TaskProvider } from "~/app/_contexts/TaskContext";
import TaskList from "./TaskList";
import AddTaskForm from "./AddTaskForm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import type { Task } from "~/server/db/schema";

interface TasksProps {
  initialTasks: Task[];
  userId: string;
}

export default function Tasks({ initialTasks, userId }: TasksProps) {
  return (
    <TaskProvider initialTasks={initialTasks}>
      <div className="min-h-screen bg-amber-50 dark:bg-dark-bg p-8">
        <div className="mx-auto max-w-2xl">
          <AddTaskForm userId={userId} />
          <Tabs defaultValue="all" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400">All Tasks</TabsTrigger>
              <TabsTrigger value="todo" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400">To Do</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400">In Progress</TabsTrigger>
              <TabsTrigger value="done" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400">Done</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TaskList filter="all" />
            </TabsContent>
            <TabsContent value="todo">
              <TaskList filter="todo" />
            </TabsContent>
            <TabsContent value="in_progress">
              <TaskList filter="in_progress" />
            </TabsContent>
            <TabsContent value="done">
              <TaskList filter="done" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TaskProvider>
  );
}