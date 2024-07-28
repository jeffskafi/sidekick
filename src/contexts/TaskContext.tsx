"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Task } from "~/server/db/schema";

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (
    newTask: Omit<Partial<Task>, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateTask: (
    taskId: number,
    updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  delegateTask: (
    taskId: number,
    options: { preserveDueDate: boolean; dueDate: string | null },
  ) => Promise<Task>;
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

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

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

  const updateTask = useCallback(async (taskId: number, updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>) => {
    console.log('updateTask called with taskId:', taskId, 'Type:', typeof taskId);
    console.log('Updates:', JSON.stringify(updates, null, 2));
    try {
      if (typeof taskId !== 'number') {
        throw new Error('Invalid taskId: must be a number');
      }
      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
      }
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({id: taskId, ...updates}),
      });
      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error ?? 'Failed to update task');
      }
      const updatedTask = await response.json() as Task;
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
      return updatedTask;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }, []);

  const delegateTask = useCallback(
    async (
      taskId: number,
      options: { preserveDueDate: boolean; dueDate: string | null },
    ) => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/generate-subtasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options),
        });
        if (!response.ok) {
          throw new Error("Failed to delegate task");
        }
        const updatedTask = (await response.json()) as Task;
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          ),
        );
        return updatedTask;
      } catch (error) {
        console.error("Error delegating task:", error);
        throw error;
      }
    },
    [],
  );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        delegateTask,
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