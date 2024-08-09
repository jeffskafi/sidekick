import React, { createContext, useContext, useState, useCallback } from "react";
import type { Task, NewTask, TaskSelect, TaskUpdate } from "~/server/db/schema";
import {
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  getSubtasks as getSubtasksAction,
  generateSubtasks as generateSubtasksAction,
  refreshSubtasks as refreshSubtasksAction,
} from "~/server/actions/taskActions";
import { useAuth } from "@clerk/nextjs";

type TaskContextType = {
  tasks: Task[];
  addTask: (newTask: NewTask) => Promise<void>;
  updateTask: (id: TaskSelect["id"], updates: TaskUpdate) => Promise<void>;
  deleteTask: (id: TaskSelect["id"]) => Promise<void>;
  loadSubtasks: (taskId: TaskSelect["id"]) => Promise<Task[]>;
  generateAISubtasks: (taskId: TaskSelect["id"]) => Promise<Task[]>;
  refreshSubtasks: (taskId: TaskSelect["id"]) => Promise<Task[]>;
  userId: string | null;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children, initialTasks }: { children: React.ReactNode; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { userId } = useAuth();

  const addTask = useCallback(async (newTask: NewTask) => {
    const createdTask = await createTaskAction(newTask);
    setTasks(prevTasks => [createdTask, ...prevTasks]); // Add new task to the beginning of the list
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
      // Find the parent task
      const parentTask = prevTasks.find(task => task.id === taskId);
      if (!parentTask) return prevTasks;

      // Get the new subtask IDs that are not already in the parent's children
      const newSubtaskIds = subtasks.map(st => st.id).filter(id => !parentTask.children.includes(id));

      // Update the parent task with new children
      const updatedParentTask = {
        ...parentTask,
        children: [...parentTask.children, ...newSubtaskIds]
      };

      // Create a map of existing tasks for quick lookup
      const taskMap = new Map(prevTasks.map(task => [task.id, task]));

      // Update existing tasks and add new ones
      subtasks.forEach(subtask => {
        if (taskMap.has(subtask.id)) {
          // Update existing task
          taskMap.set(subtask.id, { ...taskMap.get(subtask.id)!, ...subtask });
        } else {
          // Add new task
          taskMap.set(subtask.id, subtask);
        }
      });

      // Convert map back to array
      const updatedTasks = Array.from(taskMap.values());

      // Replace the parent task with the updated version
      const finalTasks = updatedTasks.map(task => task.id === taskId ? updatedParentTask : task);

      return finalTasks;
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

  const refreshSubtasks = useCallback(async (taskId: TaskSelect["id"]) => {
    const refreshedSubtasks = await refreshSubtasksAction(taskId);
    setTasks(prevTasks => {
      // Find the index of the parent task
      const parentIndex = prevTasks.findIndex(task => task.id === taskId);
      if (parentIndex === -1) return prevTasks; // If parent not found, return unchanged

      // Create a new array with all tasks except the parent and its old subtasks
      const updatedTasks = prevTasks.filter(task => task.id !== taskId && task.parentId !== taskId);

      // Update the parent task with new children
      const updatedParentTask = {
        ...prevTasks[parentIndex],
        children: refreshedSubtasks.slice(1).map(subtask => subtask.id)
      } as Task;

      // Insert the updated parent task and new subtasks at the original parent's position
      updatedTasks.splice(parentIndex, 0, updatedParentTask, ...refreshedSubtasks.slice(1));

      return updatedTasks;
    });
    return refreshedSubtasks;
  }, []);

  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    loadSubtasks,
    generateAISubtasks,
    refreshSubtasks,
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