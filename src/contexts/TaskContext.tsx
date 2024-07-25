"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Task } from "~/server/db/schema";

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (newTask: Omit<Partial<Task>, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (updatedTaskData: Partial<Task> & { id: number }) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({
  children,
  initialTasks,
}: {
  children: React.ReactNode;
  initialTasks: Task[];
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = useCallback(
    async (newTask: Omit<Partial<Task>, "id" | "createdAt" | "updatedAt">) => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        const addedTask = (await response.json()) as Task;
        setTasks((prevTasks) => [...prevTasks, addedTask]);
      } catch (error) {
        console.error(
          "Failed to add task:",
          error instanceof Error ? error.message : String(error),
        );
      }
    },
    [],
  );

  const updateTask = useCallback(async (updatedTaskData: Partial<Task> & { id: number }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTaskData),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      const updatedTaskFromServer = (await response.json()) as Task;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTaskFromServer.id ? { ...task, ...updatedTaskFromServer } : task,
        ),
      );
      return updatedTaskFromServer;
    } catch (error) {
      console.error(
        "Failed to update task:",
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}