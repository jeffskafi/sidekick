"use client";
import React from "react";
import { TaskProvider } from "~/app/_contexts/TaskContext";
import TaskList from "./TaskList";
import AddTaskForm from "./AddTaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Task } from "~/server/db/schema";

interface TasksProps {
  theme: "light" | "dark";
  initialTasks: Task[];
  userId: string;
}

export default function Tasks({ initialTasks, userId }: TasksProps) {
  return (
    <TaskProvider initialTasks={initialTasks}>
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex h-screen flex-col">
              <AddTaskForm userId={userId} />
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="todo">To Do</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="done">Done</TabsTrigger>
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
        </div>
      </div>
    </TaskProvider>
  );
}