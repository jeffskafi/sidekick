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
      <div className="min-h-screen bg-amber-50 dark:bg-dark-bg p-10">
        <div className="w-full sm:mx-auto sm:max-w-4xl">
          <AddTaskForm userId={userId} />
          <Tabs defaultValue="all" className="mt-10">
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400 text-base px-4 py-2">All Tasks</TabsTrigger>
              <TabsTrigger value="todo" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400 text-base px-4 py-2">To Do</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400 text-base px-4 py-2">In Progress</TabsTrigger>
              <TabsTrigger value="done" className="text-amber-800 dark:text-amber-300 hover:text-amber-600 dark:hover:text-amber-400 text-base px-4 py-2">Done</TabsTrigger>
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