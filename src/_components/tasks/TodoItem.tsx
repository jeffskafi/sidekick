import { ChevronDown, ChevronRight, Loader2, X, Zap } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useTheme } from "../ThemeProvider";
import AnimatedCheckmark from "./AnimatedCheckmark";
import PriorityButton from "./PriorityButton";
import DueDateButton from "./DueDateButtonProps";
import type { Subtask, Task } from "~/server/db/schema";
import { motion } from "framer-motion";
import DeleteButton from "./DeleteButton";
import { getStatusColor } from "./helpers";


interface TodoItemProps {
  todo: Task & { subtasks?: Subtask[] };
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (
    id: number,
    updates: Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  onDelegate: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = React.memo(
  ({ todo, onToggle, onDelete, onUpdate, onDelegate }) => {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(todo.description);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(true);

    const handleEdit = useCallback(async () => {
      try {
        await onUpdate(todo.id, { description: editedText });
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update task:", error);
        // Optionally, you can add some user feedback here
      }
    }, [todo.id, editedText, onUpdate]);

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
        dueDate: Date | null;
      }) => {
        try {
          await onUpdate(todo.id, {
            hasDueDate,
            dueDate,
          });
        } catch (error) {
          console.error("Failed to set due date:", error);
          // Optionally, you can add some user feedback here
        }
      },
      [todo.id, onUpdate],
    );

    const togglePriority = useCallback(async () => {
      const priorities: Task["priority"][] = ["none", "low", "medium", "high"];
      const currentIndex = priorities.indexOf(todo.priority);
      const nextPriority = priorities[(currentIndex + 1) % priorities.length];
      try {
        await onUpdate(todo.id, { priority: nextPriority });
      } catch (error) {
        console.error("Failed to update priority:", error);
        // Optionally, you can add some user feedback here
      }
    }, [todo.id, todo.priority, onUpdate]);

    const handleDelegate = useCallback(async () => {
      try {
        setIsLoading(true);
        onDelegate(todo.id);
      } catch (error) {
        console.error("Failed to delegate task:", error);
        // Optionally, you can add some user feedback here
      } finally {
        setIsLoading(false);
      }
    }, [todo.id, onDelegate]);

    return (
      <li
        className={`group flex flex-col items-start justify-between rounded-lg ${theme === "dark" ? "bg-background-dark" : "bg-background-light"} w-full p-3 shadow-sm transition-colors duration-200`}
      >
        <div className="flex w-full items-center justify-between">
          <div className="mr-2 flex flex-grow items-center">
            <AnimatedCheckmark
              completed={todo.completed}
              onToggle={() => onToggle(todo.id)}
            />
            <PriorityButton
              priority={todo.priority}
              onToggle={togglePriority}
            />
            <div className="relative flex-grow">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    onBlur={handleEdit}
                    onKeyPress={(e) => e.key === "Enter" && handleEdit()}
                    className={`h-6 w-full px-1 py-0 pr-6 text-xs ${theme === "dark" ? "bg-surface-dark text-text-dark" : "bg-surface-light text-text-light"}`}
                    autoFocus
                  />
                  <button
                    onClick={cancelEdit}
                    className="absolute right-1 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <span
                  className={`cursor-pointer text-xs transition-all ${
                    todo.completed
                      ? "text-text-light-dark"
                      : theme === "dark"
                        ? "text-text-dark"
                        : "text-text-light"
                  }`}
                  onClick={() => setIsEditing(true)}
                >
                  {todo.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <DueDateButton
              hasDueDate={todo.hasDueDate}
              dueDate={todo.dueDate}
              onSetDueDate={handleSetDueDate}
            />
            <motion.button
              onClick={handleDelegate}
              disabled={todo.status !== "todo" || isLoading}
              className={`transition-colors duration-300 focus:outline-none ${
                todo.status !== "todo"
                  ? getStatusColor(todo.status, theme)
                  : theme === "dark"
                    ? "hover:text-amber-3000 text-amber-400"
                    : "text-blue-500 hover:text-blue-600"
              }`}
              title={todo.status !== "todo" ? todo.status : "Delegate to AI"}
              animate={{
                width: todo.status !== "todo" ? "14px" : "auto",
                height: todo.status !== "todo" ? "14px" : "auto",
                borderRadius: todo.status !== "todo" ? "50%" : "0%",
              }}
              transition={{ duration: 0.15 }}
            >
              {todo.status === "todo" ? (
                isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} />
                )
              ) : null}
            </motion.button>
            <DeleteButton onDelete={() => onDelete(todo.id)} />
          </div>
        </div>
        {todo.subtasks && todo.subtasks.length > 0 && (
          <div className="mt-2 w-full pl-7">
            <button
              onClick={() => setIsSubtasksExpanded(!isSubtasksExpanded)}
              className={`flex items-center text-xs ${theme === "dark" ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"} transition-colors duration-200`}
            >
              {isSubtasksExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              <span className="ml-1">Subtasks ({todo.subtasks.length})</span>
            </button>
            {isSubtasksExpanded && (
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
                        })
                      }
                      size="small"
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