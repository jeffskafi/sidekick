"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
console.log("Importing types and functions from schema");
import type { Task, NewTask, TaskNode } from "~/server/db/schema";
import { isTaskNode } from "~/server/db/schema";

console.log("Defining TaskContextType");
type TaskContextType = {
  tasks: (Task | TaskNode)[];
  setTasks: React.Dispatch<React.SetStateAction<(Task | TaskNode)[]>>;
  addTask: (newTask: Omit<NewTask, "id" | "createdAt" | "updatedAt">) => Promise<Task>;
  updateTask: (id: number, updates: Partial<Omit<NewTask, "id" | "createdAt" | "updatedAt">>) => Promise<Task | TaskNode>;
  deleteTask: (id: number) => Promise<void>;
  delegateTask: (
    id: number,
    options: { preserveDueDate: boolean; dueDate: string | null },
  ) => Promise<TaskNode>;
  fetchTaskWithChildren: (taskId: number) => Promise<TaskNode>;
};

console.log("Creating TaskContext");
const TaskContext = createContext<TaskContextType | undefined>(undefined);

console.log("Defining TaskProvider function");
export function TaskProvider({
  children,
  initialTasks,
}: {
  children: React.ReactNode;
  initialTasks: (Task | TaskNode)[];
}) {
  console.log("Initializing tasks state", initialTasks);
  const [tasks, setTasks] = useState<(Task | TaskNode)[]>(initialTasks);

  console.log("Setting up useEffect for initialTasks");
  useEffect(() => {
    console.log("useEffect triggered, setting tasks", initialTasks);
    setTasks(initialTasks);
  }, [initialTasks]);

  console.log("Defining addTask function");
  const addTask = useCallback(
    async (newTask: Omit<NewTask, "id" | "createdAt" | "updatedAt">): Promise<Task> => {
      console.log("Adding new task", newTask);
      try {
        console.log("Sending POST request to /api/tasks");
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });
        console.log("Response received", response);
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        const addedTask = (await response.json()) as Task;
        console.log("Task added successfully", addedTask);
        setTasks((prevTasks) => {
          console.log("Updating tasks state", [...prevTasks, addedTask]);
          return [...prevTasks, addedTask];
        });
        return addedTask;
      } catch (error) {
        console.error(
          "Failed to add task:",
          error instanceof Error ? error.message : String(error),
        );
        throw error;
      }
    },
    [],
  );

  console.log("Defining updateTask function");
  const updateTask = useCallback(
    async (id: number, updates: Partial<Omit<NewTask, "id" | "createdAt" | "updatedAt">>): Promise<Task | TaskNode> => {
      console.log("Updating task", id, updates);
      try {
        console.log("Sending PUT request to /api/tasks/${id}");
        const response = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        console.log("Response received", response);
        if (!response.ok) throw new Error("Failed to update task");
        const updatedTask = await response.json() as Task | TaskNode;
        console.log("Task updated successfully", updatedTask);
        
        setTasks((prevTasks) => {
          console.log("Updating tasks state");
          const updateTaskRecursively = (tasks: (Task | TaskNode)[]): (Task | TaskNode)[] => {
            return tasks.map(task => {
              if (task.id === id) {
                console.log("Found task to update", task);
                return { ...task, ...updatedTask };
              } else if (isTaskNode(task) && task.subtasks) {
                console.log("Recursing into subtasks", task);
                return { ...task, subtasks: updateTaskRecursively(task.subtasks) };
              }
              return task;
            });
          };
          
          const newTasks = updateTaskRecursively(prevTasks);
          console.log("New tasks state", newTasks);
          return newTasks;
        });
        
        return updatedTask;
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
    },
    [],
  );

  console.log("Defining deleteTask function");
  const deleteTask = useCallback(async (id: number) => {
    console.log("Deleting task", id);
    try {
      console.log("Sending DELETE request to /api/tasks/${id}");
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      console.log("Response received", response);
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks((prevTasks) => {
        const newTasks = prevTasks.filter((task) => task.id !== id);
        console.log("New tasks state after deletion", newTasks);
        return newTasks;
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  }, []);

  console.log("Defining delegateTask function");
  const delegateTask = useCallback(async (
    id: number,
    options: { preserveDueDate: boolean; dueDate: string | null },
  ): Promise<TaskNode> => {
    try {
      const response = await fetch(`/api/tasks/${id}/generate-subtasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });
      if (!response.ok) {
        throw new Error("Failed to delegate task");
      }
      const updatedTask = await response.json() as TaskNode;
      
      setTasks((prevTasks) => {
        return prevTasks.map(task => {
          if (task.id === id) {
            return updatedTask;
          } else if (isTaskNode(task)) {
            return {
              ...task,
              subtasks: task.subtasks.map(subtask => 
                subtask.id === id ? updatedTask : subtask
              )
            };
          }
          return task;
        });
      });

      console.log("Task delegated successfully:", updatedTask);
      return updatedTask;
    } catch (error) {
      console.error("Error delegating task:", error);
      throw error;
    }
  }, []);

  console.log("Defining fetchTaskWithChildren function");
  const fetchTaskWithChildren = useCallback(async (taskId: number): Promise<TaskNode> => {
    console.log("Fetching task with children", taskId);
    try {
      console.log("Sending GET request to /api/tasks/${taskId}/children");
      const response = await fetch(`/api/tasks/${taskId}/children`);
      console.log("Response received", response);
      if (!response.ok) throw new Error("Failed to fetch task with children");
      const taskWithChildren = await response.json() as TaskNode;
      console.log("Task with children fetched successfully", taskWithChildren);
      
      setTasks((prevTasks) => {
        console.log("Updating tasks state");
        const updateTaskRecursively = (tasks: (Task | TaskNode)[]): (Task | TaskNode)[] => {
          return tasks.map(task => {
            if (task.id === taskId) {
              console.log("Found task to update", task);
              return taskWithChildren;
            } else if (isTaskNode(task) && task.subtasks) {
              console.log("Recursing into subtasks", task);
              return { ...task, subtasks: updateTaskRecursively(task.subtasks) };
            }
            return task;
          });
        };
        
        const newTasks = updateTaskRecursively(prevTasks);
        console.log("New tasks state after fetching children", newTasks);
        return newTasks;
      });

      return taskWithChildren;
    } catch (error) {
      console.error("Error fetching task with children:", error);
      throw error;
    }
  }, []);

  console.log("Rendering TaskContext.Provider");
  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        delegateTask,
        fetchTaskWithChildren,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

console.log("Defining useTaskContext function");
export function useTaskContext() {
  console.log("Getting context");
  const context = useContext(TaskContext);
  console.log("Context received", context);
  if (context === undefined) {
    console.error("useTaskContext must be used within a TaskProvider");
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}

console.log("TaskContext.tsx completed");