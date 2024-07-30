import React, { createContext, useContext, useState, useCallback } from "react";
import type { Task, NewTask, TaskSelect, TaskUpdate } from "~/server/db/schema";
import {
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  getSubtasks as getSubtasksAction,
  generateSubtasks as generateSubtasksAction,
} from "~/server/actions/taskActions";
import { useAuth } from "@clerk/nextjs";

type TaskContextType = {
  tasks: Task[];
  addTask: (newTask: NewTask) => Promise<void>;
  updateTask: (id: TaskSelect["id"], updates: TaskUpdate) => Promise<void>;
  deleteTask: (id: TaskSelect["id"]) => Promise<void>;
  loadSubtasks: (taskId: TaskSelect["id"]) => Promise<Task[]>;
  generateAISubtasks: (taskId: TaskSelect["id"]) => Promise<Task[]>;
  userId: string | null;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children, initialTasks }: { children: React.ReactNode; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { userId } = useAuth();

  const addTask = useCallback(async (newTask: NewTask) => {
    const createdTask = await createTaskAction(newTask);
    setTasks(prevTasks => [...prevTasks, createdTask]);
  }, []);

  const updateTask = useCallback(async (id: TaskSelect["id"], updates: TaskUpdate) => {
    const updatedTask = await updateTaskAction(id, updates);
    setTasks(prevTasks => prevTasks.map(task => task.id === id ? { ...task, ...updatedTask } : task));
  }, []);

  const deleteTask = useCallback(async (id: TaskSelect["id"]) => {
    await deleteTaskAction(id);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  }, []);

  const loadSubtasks = useCallback(async (taskId: TaskSelect["id"]) => {
    const subtasks = await getSubtasksAction(taskId);
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId
          ? { ...task, children: [...task.children, ...subtasks.map(st => st.id)] }
          : task
      );

      return [...updatedTasks, ...subtasks];
    });

    return subtasks;
  }, []);

  const generateAISubtasks = useCallback(async (taskId: TaskSelect["id"]) => {
    const generatedSubtasks = await generateSubtasksAction(taskId);

    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => 
        task.id === taskId
          ? { ...task, children: [...task.children, ...generatedSubtasks.map(st => st.id)] }
          : task
      );

      return [
        ...updatedTasks,
        ...generatedSubtasks.map(subtask => ({
          ...subtask,
          children: subtask.children ?? [],
          parentId: subtask.parentId ?? taskId
        }))
      ];
    });

    return generatedSubtasks;
  }, []);

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    loadSubtasks,
    generateAISubtasks,
    userId: userId ?? null,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}