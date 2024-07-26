"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  File,
  Camera,
  Image as LucideImage,
  Mic,
  X,
  Zap,
  Flag,
  ClipboardList,
  Clock,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from './ThemeProvider';
import { cn } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import CustomCalendar from './CustomCalendar';
import { useTaskContext } from "~/contexts/TaskContext";
import type { Task, Subtask } from "~/server/db/schema";

interface AnimatedCheckmarkProps {
  completed: boolean;
  onToggle: () => void;
}

const AnimatedCheckmark: React.FC<AnimatedCheckmarkProps> = ({
  completed,
  onToggle,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleToggle = () => {
    onToggle();
    if (completed) {
      setIsDisabled(true);
      setTimeout(() => setIsDisabled(false), 300);
    }
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => !isDisabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`mr-2 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
        completed
          ? "bg-green-500"
          : theme === 'dark'
            ? "border border-gray-600 bg-gray-700 hover:border-green-400"
            : "border border-gray-300 bg-white hover:border-green-400"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${
          completed
            ? "opacity-100"
            : isHovered && !isDisabled
              ? "opacity-50"
              : "opacity-0"
        }`}
      >
        <path
          d="M4 8L7 11L12 6"
          stroke={completed ? "#8affb7" : "#3fcf72"}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={
            completed ? "animate-draw-checkmark" : "animate-hover-checkmark"
          }
        />
      </svg>
    </button>
  );
};

interface DeleteButtonProps {
  onDelete: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => {
  return (
    <button
      onClick={onDelete}
      className="flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300"
      aria-label="Delete task"
    >
      <X size={14} className="text-red-500" />
    </button>
  );
};

interface PriorityButtonProps {
  priority: Task['priority'];
  onToggle: () => void;
}

const PriorityButton: React.FC<PriorityButtonProps> = ({
  priority,
  onToggle,
}) => {
  const colors: Record<Task['priority'], string> = {
    none: "text-gray-300",
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };
  return (
    <button
      onClick={onToggle}
      className={`mr-2 transition-colors duration-300 focus:outline-none ${colors[priority]}`}
      title={priority === "none" ? "Set priority" : `Priority: ${priority}`}
    >
      <Flag size={12} />
    </button>
  );
};

interface DueDateButtonProps {
  hasDueDate: boolean;
  dueDate: Date | null;
  onSetDueDate: (params: { hasDueDate: boolean; dueDate: Date | null }) => void;
}

// Custom isValid function
const isValid = (date: unknown): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Custom format function
const formatDate = (date: Date, formatString: string): string => {
  if (!isValid(date)) {
    return "Invalid date";
  }

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return formatString
    .replace('MMM', month ?? '')
    .replace('d', day.toString())
    .replace('yyyy', year.toString());
};

const DueDateButton: React.FC<DueDateButtonProps> = ({
  hasDueDate,
  dueDate,
  onSetDueDate,
}) => {
  const { theme } = useTheme();

  const formatDueDate = (date: Date | null): string => {
    if (date && isValid(date)) {
      return formatDate(date, 'MMM d');
    }
    return "No due date";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-center w-auto h-5 mr-2 transition-colors duration-300 focus:outline-none"
          title={hasDueDate ? `Due: ${formatDueDate(dueDate)}` : "Set due date"}
        >
          {hasDueDate ? (
            <span className={`text-xs ${theme === 'dark' ? 'text-amber-400' : 'text-amber-500'}`}>
              {formatDueDate(dueDate)}
            </span>
          ) : (
            <Clock size={14} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-auto p-0 rounded-xl",
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        )} 
        align="start"
      >
        <CustomCalendar
          selected={hasDueDate ? dueDate : null}
          onSelect={(date: Date | null) => onSetDueDate(date ? { hasDueDate: true, dueDate: date } : { hasDueDate: false, dueDate: null })}
        />
      </PopoverContent>
    </Popover>
  );
};

interface TodoItemProps {
  todo: Task & { subtasks?: Subtask[] };
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  onDelegate: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  onDelegate,
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = useCallback(async () => {
    try {
      await onUpdate(todo.id, { description: editedText });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      // Optionally, you can add some user feedback here
    }
  }, [todo.id, editedText, onUpdate]);

  const cancelEdit = () => {
    setEditedText(todo.description);
    setIsEditing(false);
  };

  const handleSetDueDate = useCallback(async ({ hasDueDate, dueDate }: { hasDueDate: boolean; dueDate: Date | null }) => {
    try {
      await onUpdate(todo.id, { hasDueDate, dueDate });
    } catch (error) {
      console.error('Failed to set due date:', error);
      // Optionally, you can add some user feedback here
    }
  }, [todo.id, onUpdate]);

  const togglePriority = useCallback(async () => {
    const priorities: Task['priority'][] = ['none', 'low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(todo.priority);
    const nextPriority = priorities[(currentIndex + 1) % priorities.length];
    try {
      await onUpdate(todo.id, { priority: nextPriority });
    } catch (error) {
      console.error('Failed to update priority:', error);
      // Optionally, you can add some user feedback here
    }
  }, [todo.id, todo.priority, onUpdate]);

  const handleDelegate = useCallback(async () => {
    try {
      setIsLoading(true);
      onDelegate(todo.id);
    } catch (error) {
      console.error('Failed to delegate task:', error);
      // Optionally, you can add some user feedback here
    } finally {
      setIsLoading(false);
    }
  }, [todo.id, onDelegate]);

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case "in_progress": return "bg-orange-500";
      case "needs_human_input": return "bg-orange-500 animate-pulse";
      case "done": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "exception": return "bg-red-500";
      case "todo": return theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300';
      default: return theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300';
    }
  };

  return (
    <li className={`group flex flex-col items-start justify-between rounded-lg ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'} p-3 shadow-sm transition-colors duration-200 w-full`}>
      <div className="flex w-full items-center justify-between">
        <div className="mr-2 flex flex-grow items-center">
          <AnimatedCheckmark
            completed={todo.completed}
            onToggle={() => onToggle(todo.id)}
          />
          <PriorityButton priority={todo.priority} onToggle={togglePriority} />
          <div className="flex-grow relative">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onBlur={handleEdit}
                  onKeyPress={(e) => e.key === "Enter" && handleEdit()}
                  className={`h-6 w-full pr-6 px-1 py-0 text-xs ${theme === 'dark' ? 'bg-surface-dark text-text-dark' : 'bg-surface-light text-text-light'}`}
                  autoFocus
                />
                <button
                  onClick={cancelEdit}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <span
                className={`cursor-pointer text-xs transition-all ${
                  todo.completed 
                    ? 'text-text-light-dark'
                    : theme === 'dark' ? 'text-text-dark' : 'text-text-light'
                }`}
                onClick={() => setIsEditing(true)}
              >
                {todo.description}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <DueDateButton hasDueDate={todo.hasDueDate} dueDate={todo.dueDate} onSetDueDate={handleSetDueDate} />
          <motion.button
            onClick={handleDelegate}
            disabled={todo.status !== 'todo' || isLoading}
            className={`transition-colors duration-300 focus:outline-none ${
              todo.status !== 'todo'
                ? getStatusColor(todo.status)
                : theme === 'dark' 
                  ? 'text-amber-400 hover:text-amber-300' 
                  : 'text-blue-500 hover:text-blue-600'
            }`}
            title={todo.status !== 'todo' ? todo.status : "Delegate to AI"}
            animate={{
              width: todo.status !== 'todo' ? '14px' : 'auto',
              height: todo.status !== 'todo' ? '14px' : 'auto',
              borderRadius: todo.status !== 'todo' ? '50%' : '0%',
            }}
            transition={{ duration: 0.15 }}
          >
            {todo.status === 'todo' ? (
              isLoading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />
            ) : null}
          </motion.button>
          <DeleteButton onDelete={() => onDelete(todo.id)} />
        </div>
      </div>
      {todo.subtasks && todo.subtasks.length > 0 && (
        <ul className="mt-2 ml-6 list-disc">
          {todo.subtasks.map((subtask) => (
            <li key={subtask.id} className="text-xs text-gray-500">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onUpdate(todo.id, { 
                  subtasks: todo.subtasks?.map(st => 
                    st.id === subtask.id ? { ...st, completed: !st.completed } : st
                  ) 
                })}
                className="mr-2"
              />
              {subtask.description}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
});

TodoItem.displayName = 'TodoItem';

const ActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  theme: 'light' | 'dark';
}> = ({ icon, onClick, label, theme }) => (
  <motion.button
    onClick={onClick}
    className={`${
      theme === 'dark'
        ? 'bg-background-dark hover:bg-gray-700 text-primary-dark'
        : 'bg-background-light hover:bg-gray-100 text-primary'
    } flex touch-manipulation items-center justify-center rounded-full transition-colors h-7 w-7`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    aria-label={label}
  >
    {icon}
  </motion.button>
);

const AccessibleImage: React.FC<{ size: number; className: string }> = (props) => {
  return (
    <span role="img" aria-hidden="true">
      <LucideImage {...props} />
    </span>
  );
};

const EmptyState: React.FC = () => {
  const { theme } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <ClipboardList size={48} className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
      <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        No tasks yet
      </h3>
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
        Add a task to get started!
      </p>
    </div>
  );
};

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

  const isInputEmpty = input.trim() === '';

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
                  className={`absolute right-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 ${isInputEmpty ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={isInputEmpty ? {} : { scale: 1.125 }}
                  whileTap={isInputEmpty ? {} : { scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  aria-label="Add task"
                  disabled={isInputEmpty}
                >
                  <Plus size={16} className={`${theme === 'dark' ? 'text-primary-dark' : 'text-primary'} ${isInputEmpty ? 'opacity-50' : ''}`} />
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
