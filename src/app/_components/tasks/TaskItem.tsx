import React, { useState, useEffect, useRef } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Button } from "~/components/ui/button";
import { ChevronRight, Zap, Loader2, Trash2, RefreshCw, Pen, X, MoreHorizontal, Check } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { Task } from "~/server/db/schema";
import { motion, AnimatePresence } from "framer-motion";

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
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const subtasks = tasks.filter((t) => t.parentId === task.id);
  const hasChildren = subtasks.length > 0 || task.children.length > 0;

  const CHEVRON_WIDTH = 2;
  const CHECKBOX_SIZE = 1.25;
  const CHEVRON_RIGHT_PADDING = 0.5;
  const INDENTATION_WIDTH = CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING;

  useEffect(() => {
    if (isExpanded && hasChildren && subtasks.length === 0) {
      loadSubtasks(task.id).catch((error) => {
        console.error("Failed to load subtasks:", error);
        setError("Failed to load subtasks");
      });
    }
  }, [isExpanded, hasChildren, subtasks.length, loadSubtasks, task.id]);

  const handleStatusChange = async () => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    try {
      await generateAISubtasks(task.id);
      setIsExpanded(true);
    } catch (error) {
      console.error("Failed to generate subtasks:", error);
      setError("Failed to generate subtasks");
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleRefreshSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    try {
      await refreshSubtasks(task.id);
      setIsExpanded(true);
    } catch (error) {
      console.error("Failed to refresh subtasks:", error);
      setError("Failed to refresh subtasks");
    } finally {
      setIsGeneratingSubtasks(false);
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
    if (e.key === 'Enter') {
      void handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedDescription(task.description);
    }
  };

  const iconButtonClass = "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out";

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

  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <li className="mb-3">
      <div className="flex items-center group">
        <div style={{ width: `${level * INDENTATION_WIDTH}rem`, flexShrink: 0 }}></div>
        <div className="flex items-center">
          <div style={{ width: `${CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING}rem`, flexShrink: 0 }}>
            {hasChildren && (
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`${iconButtonClass} ${
                  isExpanded ? "rotate-90" : ""
                }`}
                style={{ marginRight: `${CHEVRON_RIGHT_PADDING}rem` }}
              >
                <ChevronRight size={20} className="text-amber-500 dark:text-amber-400" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => void (hasChildren ? handleRefreshSubtasks() : handleGenerateSubtasks())}
            disabled={isGeneratingSubtasks}
            className={`${iconButtonClass} text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900`}
          >
            {isGeneratingSubtasks ? (
              <Loader2 className="animate-spin" size={20} />
            ) : hasChildren ? (
              <RefreshCw size={20} />
            ) : (
              <Zap size={20} />
            )}
          </Button>
          <div 
            className="relative cursor-pointer ml-2"
            style={{ width: `${CHECKBOX_SIZE}rem`, height: `${CHECKBOX_SIZE}rem` }}
            onClick={() => void handleStatusChange()}
          >
            <div
              className={`absolute left-0 top-0 h-full w-full rounded-full transition-all duration-200 ease-in-out ${
                task.status === "done"
                  ? "bg-amber-500 border-2 border-amber-500"
                  : "bg-white dark:bg-gray-800 border-2 border-amber-400 hover:border-amber-500 dark:border-amber-600 dark:hover:border-amber-500"
              }`}
              style={{
                boxShadow: task.status === "done"
                  ? "none"
                  : "inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)"
              }}
            />
            {task.status === "done" && (
              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 text-white"
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
        <div className="flex flex-grow items-center overflow-hidden ml-3 relative">
          {isEditing ? (
            <div className="flex flex-grow items-center">
              <Input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-sm flex-grow border-transparent focus:border-transparent focus:ring-0"
                variant="edit"
              />
              <Button
                variant="ghost"
                onClick={handleSave}
                className={`${iconButtonClass} text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900`}
              >
                <Check size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={handleDiscard}
                className={`${iconButtonClass} text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900`}
              >
                <X size={20} />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-grow min-w-0 mr-8">
                <div
                  className={`bg-transparent py-1.5 text-sm focus:outline-none overflow-hidden line-clamp-3 ${
                    task.status === "done" 
                      ? "text-gray-400 dark:text-gray-500 line-through" 
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}
                >
                  {task.description}
                </div>
              </div>
              <div className="flex items-center absolute right-0 top-1/2 transform -translate-y-1/2" ref={menuRef}>
                <motion.div
                  initial={false}
                  animate={{ 
                    width: showMenu ? "auto" : "32px",
                    borderRadius: showMenu ? "16px" : "50%",
                  }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center overflow-hidden ${
                    showMenu 
                      ? "bg-amber-100 dark:bg-amber-900" 
                      : "bg-transparent"
                  }`}
                >
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="flex mr-1 ml-1"
                      >
                        <Button
                          variant="ghost"
                          onClick={handleEdit}
                          className={`${iconButtonClass} text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900`}
                        >
                          <Pen size={20} />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => void handleDelete()}
                          className={`${iconButtonClass} text-amber-500 dark:text-amber-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900`}
                        >
                          <Trash2 size={20} />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button
                    variant="ghost"
                    onClick={toggleMenu}
                    className={`${iconButtonClass} text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900`}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotate: showMenu ? 180 : 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showMenu ? <X size={20} /> : <MoreHorizontal size={20} />}
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
      {isExpanded && (
        <ul className="mt-1 space-y-1">
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500" style={{ marginLeft: `${level * INDENTATION_WIDTH}rem` }}>
          {error}
        </p>
      )}
    </li>
  );
}