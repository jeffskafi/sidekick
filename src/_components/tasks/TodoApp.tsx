"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  File,
  Camera,
  Mic,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '../ThemeProvider';
import { useTaskContext } from "~/contexts/TaskContext";
import type { Task } from "~/server/db/schema";
import EmptyState from "./EmptyState";
import TodoItem from "./TodoItem";
import ActionButton from "./ActionButton";
import AccessibleImage from "./AccessibleImage";
import { isInputEmpty } from "./helpers";

const TodoApp: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { tasks, addTask, updateTask, deleteTask, delegateTask } = useTaskContext();
  const [input, setInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const todoListRef = useRef<HTMLUListElement>(null);

  const toggleTodo = useCallback(async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      try {
        await updateTask({ id, completed: !task.completed });
      } catch (error) {
        console.error('Failed to toggle task:', error);
        // Optionally, you can add some user feedback here
      }
    }
  }, [tasks, updateTask]);

  const updateTodo = useCallback(async (id: number, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      try {
        await updateTask({ id, ...updates });
      } catch (error) {
        console.error('Failed to update task:', error);
        // Optionally, you can add some user feedback here
      }
    }
  }, [tasks, updateTask]);

  const handleDelegateTask = useCallback(async (taskId: number) => {
    try {
      await delegateTask(taskId);
      // The task is already updated in the state by the context
    } catch (error) {
      console.error('Failed to delegate task:', error);
      // Optionally, you can add some user feedback here
    }
  }, [delegateTask]);

  const addTodo = useCallback(async () => {
    if (input.trim()) {
      try {
        await addTask({
          description: input.trim(),
          projectId: 1, // You should get this from the user's context or URL params
          status: 'todo',
          priority: 'none',
          hasDueDate: false,
          dueDate: null,
        });
        setInput("");
      } catch (error) {
        console.error('Failed to add task:', error);
        // Optionally, you can add some user feedback here
      }
    }
  }, [input, addTask]);

  useEffect(() => {
    if (todoListRef.current && tasks.length > 0) {
      todoListRef.current.scrollTop = 0;
    }
  }, [tasks.length]);

  const memoizedTodos = useMemo(() => {
    return tasks.map((task) => (
      <TodoItem
        key={task.id}
        todo={task}
        onToggle={toggleTodo}
        onDelete={deleteTask}
        onUpdate={updateTodo}
        onDelegate={handleDelegateTask}
      />
    ));
  }, [tasks, toggleTodo, deleteTask, updateTodo, handleDelegateTask]);

  const handleFileUpload = () => {
    // Implement file upload logic
  };

  const handleTakePicture = () => {
    // Implement picture taking logic
  };

  const handleImageUpload = () => {
    // Implement image upload logic
  };

  const handleMicrophoneMode = () => {
    // Implement microphone mode logic
  };

  return (
    <div className="flex justify-center items-start min-h-screen p-4 sm:p-6 md:p-8">
      <div className={`w-full max-w-[390px] rounded-lg ${theme === 'dark' ? 'bg-surface-dark' : 'bg-surface-light'} p-4 sm:p-6 text-sm shadow-md transition-colors duration-200`}>
        <div className="flex flex-col h-[75vh]">
          <h1 className={`${theme === 'dark' ? 'text-primary-dark' : 'text-primary'} mb-3 sm:mb-4 text-lg sm:text-xl font-semibold`}>Quick Tasks</h1>

          <div className="mb-3 sm:mb-4 flex-shrink-0">
            <div className="relative flex items-center">
              <div className={`relative flex items-center w-full h-10 rounded-full ${theme === 'dark' ? 'bg-background-dark border-gray-600' : 'bg-background-light border-gray-200'} border`}>
                <motion.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`flex h-8 w-8 ml-1 items-center justify-center rounded-full transition-colors duration-150`}
                  whileHover={{ scale: 1.125 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  aria-label="Other options"
                >
                  {isMenuOpen ? (
                    <ChevronUp size={16} className={theme === 'dark' ? 'text-primary-dark' : 'text-primary'} />
                  ) : (
                    <ChevronDown size={16} className={theme === 'dark' ? 'text-primary-dark' : 'text-primary'} />
                  )}
                </motion.button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  placeholder="Add a new task"
                  className={`flex-grow bg-transparent pl-2 pr-10 text-sm sm:text-base focus:outline-none ${theme === 'dark' ? 'text-text-dark placeholder-gray-500' : 'text-text-light placeholder-gray-400'}`}
                />
                <motion.button
                  onClick={addTodo}
                  className={`absolute right-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 ${isInputEmpty(input) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={isInputEmpty(input) ? {} : { scale: 1.125 }}
                  whileTap={isInputEmpty(input) ? {} : { scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  aria-label="Add task"
                  disabled={isInputEmpty(input)}
                >
                  <Plus size={16} className={`${theme === 'dark' ? 'text-primary-dark' : 'text-primary'} ${isInputEmpty(input) ? 'opacity-50' : ''}`} />
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    exit={{ y: -20 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="mt-2 flex items-center gap-2 pl-2"
                  >
                    <ActionButton
                      icon={<File size={14} className="text-amber-500" />}
                      onClick={handleFileUpload}
                      label="Upload file"
                      theme={theme}
                    />
                    <ActionButton
                      icon={<Camera size={14} className="text-amber-500" />}
                      onClick={handleTakePicture}
                      label="Take picture"
                      theme={theme}
                    />
                    <ActionButton
                      icon={<AccessibleImage size={14} className="text-amber-500" />}
                      onClick={handleImageUpload}
                      label="Upload image"
                      theme={theme}
                    />
                    <ActionButton
                      icon={<Mic size={14} className="text-amber-500" />}
                      onClick={handleMicrophoneMode}
                      label="Microphone mode"
                      theme={theme}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-grow overflow-hidden">
            {tasks.length > 0 ? (
              <ul 
                ref={todoListRef}
                className="h-full overflow-y-auto space-y-2 sm:space-y-3 pr-2"
              >
                {memoizedTodos}
              </ul>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TodoApp.displayName = 'TodoApp';

export default TodoApp;
