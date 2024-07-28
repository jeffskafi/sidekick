import { ChevronDown, ChevronRight, Loader2, RefreshCw, X, Zap } from "lucide-react";
import React, { useCallback, useState, useEffect, useRef } from "react";
import { useTheme } from "../ThemeProvider";
import AnimatedCheckmark from "./AnimatedCheckmark";
import PriorityButton from "./PriorityButton";
import DueDateButton from "./DueDateButtonProps";
import type { Subtask, Task } from "~/server/db/schema";
import { motion, AnimatePresence } from "framer-motion";
import DeleteButton from "./DeleteButton";

interface TodoItemProps {
  todo: Task & { subtasks?: Subtask[] };
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (
    id: number,
    updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>,
    subtasks?: Partial<Subtask>[],
  ) => Promise<void>;
  onDelegate: (id: number, options: { preserveDueDate: boolean, dueDate: string | null }) => Promise<void>;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(
  ({ todo, onToggle, onDelete, onUpdate, onDelegate }) => {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(todo.description);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
    const [isHoveringSubtasks, setIsHoveringSubtasks] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [truncatedText, setTruncatedText] = useState(todo.description);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (textRef.current) {
        const element = textRef.current;
        const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
        const maxHeight = lineHeight * 2;

        if (element.scrollHeight > maxHeight) {
          let low = 0;
          let high = todo.description.length;
          let mid;

          while (low < high) {
            mid = Math.floor((low + high + 1) / 2);
            element.textContent = todo.description.slice(0, mid) + '...';

            if (element.scrollHeight <= maxHeight) {
              low = mid;
            } else {
              high = mid - 1;
            }
          }

          setTruncatedText(todo.description.slice(0, low) + '...');
        } else {
          setTruncatedText(todo.description);
        }
      }
    }, [todo.description]);

    const handleEdit = useCallback(async () => {
      try {
        await onUpdate(todo.id, { description: editedText }, todo.subtasks);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    }, [todo.id, editedText, onUpdate, todo.subtasks]);

    const cancelEdit = () => {
      setEditedText(todo.description);
      setIsEditing(false);
    };

    const handleSetDueDate = useCallback(
      async ({
        hasDueDate,
        dueDate,
      }: {
        hasDueDate: boolean;
        dueDate: string | null;
      }) => {
        try {
          await onUpdate(todo.id, {  // Make sure todo.id is a number
            hasDueDate,
            dueDate,
          });
        } catch (error) {
          console.error("Failed to set due date:", error);
        }
      },
      [todo.id, onUpdate],
    );

    const togglePriority = useCallback(async () => {
      const priorities: Task["priority"][] = ["none", "low", "medium", "high"];
      const currentIndex = priorities.indexOf(todo.priority);
      const nextPriority = priorities[(currentIndex + 1) % priorities.length];
      try {
        await onUpdate(todo.id, { priority: nextPriority }, todo.subtasks);
      } catch (error) {
        console.error("Failed to update priority:", error);
      }
    }, [todo.id, todo.priority, onUpdate, todo.subtasks]);

    const handleDelegate = useCallback(async () => {
      if (isLoading) return;
      try {
        setIsLoading(true);
        await onDelegate(todo.id, {
          preserveDueDate: todo.hasDueDate,
          dueDate: todo.dueDate,
        });
      } catch (error) {
        console.error("Failed to delegate task:", error);
      } finally {
        setIsLoading(false);
      }
    }, [todo.id, todo.hasDueDate, todo.dueDate, onDelegate, isLoading]);

    const iconSize = 14;

    const hasSubtasks = Array.isArray(todo.subtasks) && todo.subtasks.length > 0;

    return (
      <li
        className={`group flex flex-col items-start justify-between rounded-lg ${theme === "dark" ? "bg-background-dark" : "bg-background-light"} w-full p-3 shadow-sm transition-colors duration-200`}
      >
        <div className="flex w-full items-start">
          <div className="flex-shrink-0 mr-2 flex items-center">
            <AnimatedCheckmark
              completed={todo.completed}
              onToggle={() => onToggle(todo.id)}
              size={iconSize}
            />
            <PriorityButton
              priority={todo.priority}
              onToggle={togglePriority}
              size={iconSize}
            />
          </div>
          <div className="flex-grow min-w-0 relative">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onBlur={handleEdit}
                  onKeyPress={(e) => e.key === "Enter" && handleEdit()}
                  className={`w-full px-1 py-0 pr-6 text-xs ${theme === "dark" ? "bg-surface-dark text-text-dark" : "bg-surface-light text-text-light"}`}
                  autoFocus
                />
                <button
                  onClick={cancelEdit}
                  className="absolute right-1 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={iconSize} />
                </button>
              </>
            ) : (
              <p
                ref={textRef}
                className={`cursor-pointer text-xs transition-all line-clamp-2 ${
                  todo.completed
                    ? "text-text-light-dark"
                    : theme === "dark"
                      ? "text-text-dark"
                      : "text-text-light"
                }`}
                onClick={() => setIsEditing(true)}
                title={todo.description}
              >
                {truncatedText}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2 ml-2">
            <DueDateButton
              hasDueDate={todo.hasDueDate}
              dueDate={todo.dueDate}
              onSetDueDate={handleSetDueDate}
              size={iconSize}
            />
            {!hasSubtasks && (
              <motion.button
                onClick={handleDelegate}
                disabled={isLoading}
                className={`flex items-center justify-center w-${iconSize} h-${iconSize} transition-colors duration-300 focus:outline-none ${
                  theme === "dark"
                    ? "hover:text-amber-300 text-amber-400"
                    : "text-blue-500 hover:text-blue-600"
                }`}
                title="Delegate to AI"
                animate={{
                  width: `${iconSize}px`,
                  height: `${iconSize}px`,
                  borderRadius: "50%",
                }}
                transition={{ duration: 0.15 }}
              >
                {isLoading ? (
                  <Loader2 size={iconSize} className="animate-spin" />
                ) : (
                  <Zap size={iconSize} />
                )}
              </motion.button>
            )}
            <DeleteButton onDelete={() => onDelete(todo.id)} size={iconSize} />
          </div>
        </div>
        {mounted && hasSubtasks && (
          <div 
            className="mt-2 w-full pl-7 relative"
            onMouseEnter={() => setIsHoveringSubtasks(true)}
            onMouseLeave={() => setIsHoveringSubtasks(false)}
          >
            <div className="flex items-center justify-between h-6 relative">
              <button
                onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
                className={`flex items-center text-xs ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"} transition-colors duration-200`}
              >
                {isSubtasksExpanded ? (
                  <ChevronDown size={iconSize} />
                ) : (
                  <ChevronRight size={iconSize} />
                )}
                <span className="ml-1">Subtasks ({todo.subtasks?.length})</span>
              </button>
              <AnimatePresence>
                {(isHoveringSubtasks || isLoading) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDelegate}
                    disabled={isLoading}
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"
                    } transition-colors duration-200 flex items-center justify-center w-6 h-6 absolute right-0 top-0`}
                    title="Regenerate subtasks"
                  >
                    {isLoading ? (
                      <Loader2 size={iconSize} className="animate-spin" />
                    ) : (
                      <RefreshCw size={iconSize} />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            {isSubtasksExpanded && Array.isArray(todo.subtasks) && (
              <ul className="mt-2 space-y-2 pl-6">
                {todo.subtasks.map((subtask) => (
                  <li key={subtask.id} className="flex items-center text-xs">
                    <AnimatedCheckmark
                      completed={subtask.completed}
                      onToggle={() =>
                        onUpdate(todo.id, {
                          subtasks: todo.subtasks?.map((st) =>
                            st.id === subtask.id
                              ? { ...st, completed: !st.completed }
                              : st,
                          ),
                        }, todo.subtasks)
                      }
                      size={iconSize}
                    />
                    <span
                      className={`ml-2 ${subtask.completed ? "line-through" : ""} ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {subtask.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </li>
    );
  },
);

TodoItem.displayName = "TodoItem";

export default TodoItem;