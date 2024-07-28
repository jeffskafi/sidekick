"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { Task as BaseTask } from "~/server/db/schema";

interface Task extends BaseTask {
  subtasks?: Task[];
}

interface TaskContextType {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (
    newTask: Omit<Partial<Task>, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateTask: (
    taskId: number,
    updates: Partial<Task>,
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

  const updateTask = useCallback(async (taskId: number, updates: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json() as Task;

      setTasks((prevTasks) => {
        return prevTasks.map((task): Task => {
          if (task.id === taskId) {
            // Update the task itself
            const updatedTaskWithSubtasks = { ...task, ...updatedTask };
            
            // If this task has subtasks, update them as well
            if (updatedTaskWithSubtasks.subtasks) {
              updatedTaskWithSubtasks.subtasks = updatedTaskWithSubtasks.subtasks.map(subtask => 
                subtask.id === updates.id ? { ...subtask, ...updates } : subtask
              );
            }
            
            return updatedTaskWithSubtasks;
          } else if (task.subtasks) {
            // Check if this task contains the updated subtask
            const updatedSubtasks = task.subtasks.map(subtask => 
              subtask.id === taskId ? { ...subtask, ...updatedTask } : subtask
            );
            
            // If subtasks were updated, return a new task object
            if (updatedSubtasks.some(subtask => subtask.id === taskId)) {
              return { ...task, subtasks: updatedSubtasks };
            }
          }
          return task;
        });
      });

      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
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