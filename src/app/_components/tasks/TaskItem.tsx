import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Button } from "~/components/ui/button";
import { ChevronRight, Zap, Loader2, Trash2, RefreshCw, Pen, X, MoreHorizontal, Check } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { Task } from "~/server/db/schema";
import { motion, AnimatePresence } from "framer-motion";

// Define the hoverClass function
const hoverClass = (baseClass: string): string => `${baseClass} hover-effect:${baseClass}`;

interface TaskItemProps {
  task: Task;
  level: number;
}

export default function TaskItem({ task, level }: TaskItemProps) {
  const {
    tasks,
    updateTask,
    deleteTask,
    loadSubtasks,
    generateAISubtasks,
    refreshSubtasks,
  } = useTaskContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [isFocusTrapped, setIsFocusTrapped] = useState(false);
  const [hasChildren, setHasChildren] = useState(task.children.length > 0);
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const ellipsisRef = useRef<HTMLButtonElement>(null);

  const CHEVRON_WIDTH = 1.75;
  const CHECKBOX_SIZE = 1.5;
  const CHEVRON_RIGHT_PADDING = 0;
  const INDENTATION_WIDTH = CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING;

  useEffect(() => {
    if (isExpanded && hasChildren && !childrenLoaded) {
      setIsLoadingSubtasks(true);
      loadSubtasks(task.id)
        .then(() => {
          setChildrenLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to load subtasks:", error);
          setError("Failed to load subtasks");
        })
        .finally(() => {
          setIsLoadingSubtasks(false);
        });
    }
  }, [isExpanded, hasChildren, task.id, childrenLoaded, loadSubtasks]);

  const handleStatusChange = async () => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    setIsExpanded(false);
    
    // If this task has a parent, update the parent's children
    if (task.parentId) {
      const parentTask = tasks.find(t => t.id === task.parentId);
      if (parentTask) {
        const updatedParentChildren = parentTask.children.filter(childId => childId !== task.id);
        await updateTask(parentTask.id, { children: updatedParentChildren });
      }
    }
  };

  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    setShowMenu(false); // Close the menu
    try {
      await generateAISubtasks(task.id);
      setIsExpanded(true);
      // Don't reopen the menu here
    } catch (error) {
      console.error("Failed to generate subtasks:", error);
      setError("Failed to generate subtasks");
    } finally {
      setIsGeneratingSubtasks(false);
      // Ensure the menu stays closed
      setShowMenu(false);
    }
  };

  const handleRefreshSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    setShowMenu(false); // Close the menu
    try {
      await refreshSubtasks(task.id);
      setIsExpanded(true);
      // Don't reopen the menu here
    } catch (error) {
      console.error("Failed to refresh subtasks:", error);
      setError("Failed to refresh subtasks");
    } finally {
      setIsGeneratingSubtasks(false);
      // Ensure the menu stays closed
      setShowMenu(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDescription(task.description);
  };

  const handleSave = async () => {
    await updateTask(task.id, { description: editedDescription });
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setIsEditing(false);
    setEditedDescription(task.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditedDescription(task.description);
    }
  };

  const iconButtonClass = "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setShowMenu((prev) => !prev);
    if (!showMenu) {
      setIsFocusTrapped(true);
      setTimeout(() => setIsFocusTrapped(false), 100);
    }
    if (!showMenu && ellipsisRef.current) {
      ellipsisRef.current.blur();
    }
  }, [showMenu]);

  useEffect(() => {
    if (!showMenu) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.tagName === 'BUTTON') {
        activeElement.blur();
      }
    }
  }, [showMenu]);

  // Effect to update hasChildren when task.children changes
  useEffect(() => {
    setHasChildren(task.children.length > 0);
  }, [task.children]);

  return (
    <li className="mb-4 py-1">
      <div className="group flex items-center">
        <div
          style={{ width: `${level * INDENTATION_WIDTH}rem`, flexShrink: 0 }}
        ></div>
        <div className="flex items-center">
          <div
            style={{
              width: `${CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING}rem`,
              flexShrink: 0,
            }}
          >
            {hasChildren && (
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${iconButtonClass} ${
                  isExpanded ? "rotate-90" : ""
                } no-highlight`}
                style={{ marginRight: `${CHEVRON_RIGHT_PADDING}rem` }}
              >
                <ChevronRight
                  size={20}
                  className="text-amber-500 dark:text-amber-400"
                />
              </Button>
            )}
          </div>
          <div
            className="relative ml-3 cursor-pointer"
            style={{
              width: `${CHECKBOX_SIZE}rem`,
              height: `${CHECKBOX_SIZE}rem`,
            }}
            onClick={() => void handleStatusChange()}
          >
            {isLoadingSubtasks ? (
              <div
                className="flex items-center justify-center"
                style={{
                  width: `${CHECKBOX_SIZE}rem`,
                  height: `${CHECKBOX_SIZE}rem`,
                }}
              >
                <Loader2 className="animate-spin text-amber-500" size={20} />
              </div>
            ) : (
              <div
                className={`absolute left-0 top-0 h-full w-full rounded-full transition-all duration-200 ease-in-out ${
                  task.status === "done"
                    ? "border-2 border-amber-500 bg-amber-500"
                    : "border-2 border-amber-400 bg-white hover:border-amber-500 dark:border-amber-600 dark:bg-gray-800 dark:hover:border-amber-500"
                }`}
                style={{
                  boxShadow:
                    task.status === "done"
                      ? "none"
                      : "inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              />
            )}
            {task.status === "done" && (
              <svg
                className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
        <div className="relative ml-4 flex flex-grow items-center overflow-hidden">
          {isEditing ? (
            <div className="flex flex-grow items-center">
              <Input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-grow border-transparent text-sm focus:border-transparent focus:ring-0"
                variant="edit"
              />
              <Button
                variant="ghost"
                onClick={handleSave}
                className={`${iconButtonClass} ${hoverClass("text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300")}`}
              >
                <Check size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={handleDiscard}
                className={`${iconButtonClass} ${hoverClass("text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300")}`}
              >
                <X size={20} />
              </Button>
            </div>
          ) : (
            <>
              <div className="mr-8 min-w-0 flex-grow">
                <div
                  className={`line-clamp-3 overflow-hidden bg-transparent py-1.5 text-sm focus:outline-none ${
                    task.status === "done"
                      ? "text-gray-400 line-through dark:text-gray-500"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                  }}
                >
                  {task.description}
                </div>
              </div>
              <div
                className="absolute right-0 top-1/2 flex -translate-y-1/2 transform items-center"
                ref={menuRef}
              >
                {isGeneratingSubtasks ? (
                  <Button
                    variant="ghost"
                    className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400")}`}
                    disabled
                  >
                    <Loader2 className="animate-spin" size={20} />
                  </Button>
                ) : (
                  <motion.div
                    initial={false}
                    animate={{
                      width: showMenu ? "auto" : "32px",
                      borderRadius: showMenu ? "16px" : "50%",
                    }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                    className={`flex items-center overflow-hidden no-highlight ${
                      showMenu
                        ? "bg-amber-100 dark:bg-amber-900"
                        : "bg-transparent"
                    }`}
                  >
                    <AnimatePresence initial={false}>
                      {showMenu && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.1, ease: "easeInOut" }}
                          className="flex items-center space-x-2"
                        >
                          <Button
                            variant="ghost"
                            onClick={() => void (hasChildren ? handleRefreshSubtasks() : handleGenerateSubtasks())}
                            disabled={isGeneratingSubtasks || isFocusTrapped}
                            className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-white dark:hover:text-white hover:bg-amber-500 dark:hover:bg-amber-500")} ${
                              isGeneratingSubtasks || isFocusTrapped
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            {isGeneratingSubtasks ? (
                              <Loader2 className="animate-spin" size={20} />
                            ) : hasChildren ? (
                              <RefreshCw size={20} />
                            ) : (
                              <Zap size={20} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={handleEdit}
                            disabled={isFocusTrapped}
                            className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-gray-100 dark:hover:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-700/50")}`}
                          >
                            <Pen size={20} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => void handleDelete()}
                            disabled={isFocusTrapped}
                            className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900")}`}
                          >
                            <Trash2 size={20} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={toggleMenu}
                            disabled={isFocusTrapped}
                            className={`${iconButtonClass} ${hoverClass("text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900")}`}
                          >
                            <X size={20} />
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {!showMenu && (
                      <Button
                        variant="ghost"
                        onClick={toggleMenu}
                        ref={ellipsisRef}
                        className={`${iconButtonClass} ${hoverClass("text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300")}`}
                      >
                        <MoreHorizontal size={20} />
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <ul className="mt-2 space-y-2">
          {task.children.map((subtaskId) => {
            const subtask = tasks.find((t) => t.id === subtaskId);
            return subtask ? (
              <TaskItem key={subtask.id} task={subtask} level={level + 1} />
            ) : null;
          })}
        </ul>
      )}
      {error && (
        <p
          className="mt-1 text-xs text-red-500"
          style={{ marginLeft: `${level * INDENTATION_WIDTH}rem` }}
        >
          {error}
        </p>
      )}
    </li>
  );
}