"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { Task, NewTask, TaskSelect, TaskUpdate } from "~/server/db/schema";
import { createTask, updateTask, deleteTask, getSubtasks, generateSubtasks } from "~/server/actions/taskActions";

type TaskContextType = {
  tasks: Task[];
  addTask: (newTask: NewTask) => Promise<void>;
  updateTask: (id: TaskSelect['id'], updates: TaskUpdate) => Promise<void>;
  deleteTask: (id: TaskSelect['id']) => Promise<void>;
  loadSubtasks: (taskId: TaskSelect['id']) => Promise<void>;
  generateAISubtasks: (taskId: TaskSelect['id']) => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children, initialTasks }: { children: React.ReactNode; initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addTask = useCallback(async (newTask: NewTask) => {
    const createdTask = await createTask(newTask);
    setTasks(prevTasks => {
      const updatedTasks = addTaskToTree(prevTasks, createdTask);
      return updatedTasks;
    });
  }, []);

  const updateTaskContext = useCallback(async (id: TaskSelect['id'], updates: TaskUpdate) => {
    const updatedTask = await updateTask(id, updates);
    setTasks(prevTasks => {
      const updatedTasks = updateTaskInTree(prevTasks, updatedTask);
      return updatedTasks;
    });
  }, []);

  const deleteTaskContext = useCallback(async (id: TaskSelect['id']) => {
    try {
      await deleteTask(id);
      setTasks(prevTasks => {
        const updatedTasks = removeTaskFromTree(prevTasks, id);
        return updatedTasks;
      });
    } catch (error) {
      // Optionally, you can set an error state here to display to the user
    }
  }, []);

  const loadSubtasks = useCallback(async (taskId: TaskSelect['id']) => {
    const subtasks = await getSubtasks(taskId);
    setTasks(prevTasks => {
      const taskToUpdate = prevTasks.find(t => t.id === taskId);
      if (!taskToUpdate) {
        return prevTasks;
      }
      const updatedTasks = updateTaskInTree(prevTasks, { ...taskToUpdate, children: subtasks.map(st => st.id) });
      const finalTasks = [...updatedTasks, ...subtasks.filter(st => !updatedTasks.some(t => t.id === st.id))];
      return finalTasks;
    });
  }, []);

  const generateAISubtasks = useCallback(async (taskId: TaskSelect['id']) => {
    const generatedSubtasks = await generateSubtasks(taskId);
    setTasks(prevTasks => {
      const updatedTasks = updateTaskInTree(prevTasks, { id: taskId, children: [...(prevTasks.find(t => t.id === taskId)?.children ?? []), ...generatedSubtasks.map(st => st.id)] });
      const finalTasks = [...updatedTasks, ...generatedSubtasks.filter(st => !updatedTasks.some(t => t.id === st.id))];
      return finalTasks;
    });
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask: updateTaskContext, deleteTask: deleteTaskContext, loadSubtasks, generateAISubtasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

function addTaskToTree(tasks: Task[], newTask: Task): Task[] {
  if (!newTask.parentId) {
    return [newTask, ...tasks];
  }
  return tasks.map(task => {
    if (task.id === newTask.parentId) {
      return { ...task, children: [...task.children, newTask.id] };
    } else if (task.children.length > 0) {
      return { 
        ...task, 
        children: addTaskToTree(
          task.children.map(id => tasks.find(t => t.id === id)!), 
          newTask
        ).map(t => t.id) 
      };
    }
    return task;
  });
}

function updateTaskInTree(tasks: Task[], updatedTask: Partial<Task> & { id: TaskSelect['id'] }): Task[] {
  return tasks.map(task => {
    if (!task) {
      return task;
    }
    if (task.id === updatedTask.id) {
      return { ...task, ...updatedTask } as Task;
    } else if (task.children && task.children.length > 0) {
      const updatedChildren = updateTaskInTree(
        task.children.map(id => tasks.find(t => t?.id === id)).filter((t): t is Task => t !== undefined),
        updatedTask
      );
      return { ...task, children: updatedChildren.map(t => t.id) };
    }
    return task;
  });
}

function removeTaskFromTree(tasks: Task[], idToRemove: TaskSelect['id']): Task[] {
  return tasks.filter((task): task is Task => {
    if (!task) {
      return false; // Filter out undefined tasks
    }
    return task.id !== idToRemove;
  }).map(task => {
    if (task.children.includes(idToRemove)) {
      return { ...task, children: task.children.filter(id => id !== idToRemove) };
    } else if (task.children.length > 0) {
      return { 
        ...task, 
        children: removeTaskFromTree(
          task.children.map(id => tasks.find(t => t?.id === id)!),
          idToRemove
        ).map(t => t.id) 
      };
    }
    return task;
  });
}