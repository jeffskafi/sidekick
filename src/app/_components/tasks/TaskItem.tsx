import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { ChevronRight, ChevronLeft, Plus, Zap, Loader2, Trash2, RefreshCw, Pen, Check, X } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { Task } from "~/server/db/schema";
import AddTaskForm from "./AddTaskForm";

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
    userId,
  } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const subtasks = tasks.filter((t) => t.parentId === task.id);
  const hasChildren = subtasks.length > 0 || task.children.length > 0;

  const CHEVRON_WIDTH = 1.75; // rem units
  const CHECKBOX_SIZE = 1.125; // rem units
  const CHEVRON_RIGHT_PADDING = 0.375; // rem units
  const INDENTATION_WIDTH = CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING; // rem units

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

  const toggleIconsVisibility = () => {
    setShowIcons(!showIcons);
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

  return (
    <li className="mb-2.5">
      <div className="flex items-center">
        <div style={{ width: `${level * INDENTATION_WIDTH}rem`, flexShrink: 0 }}></div>
        <div className="flex items-center">
          <div style={{ width: `${CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING}rem`, flexShrink: 0 }}>
            {hasChildren && (
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`h-8 w-8 p-0 transition-transform duration-200 ease-in-out ${
                  isExpanded ? "rotate-90" : ""
                }`}
                style={{ marginRight: `${CHEVRON_RIGHT_PADDING}rem` }}
              >
                <ChevronRight size={20} className="text-amber-500" />
              </Button>
            )}
          </div>
          <div className="relative" style={{ width: `${CHECKBOX_SIZE}rem`, height: `${CHECKBOX_SIZE}rem` }}>
            <Checkbox
              checked={task.status === "done"}
              onCheckedChange={() => void handleStatusChange()}
              className={`absolute left-0 top-0 h-full w-full rounded-full transition-colors duration-200 ease-in-out ${
                task.status === "done"
                  ? "bg-amber-500 text-white"
                  : "border-2 border-amber-300 hover:border-amber-500"
              }`}
            />
          </div>
        </div>
        <div className="flex flex-grow items-center group overflow-hidden ml-2.5">
          {isEditing ? (
            <Input
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-sm"
            />
          ) : (
            <div
              className={`flex-grow bg-transparent py-1.5 text-sm focus:outline-none overflow-hidden line-clamp-3 ${
                task.status === "done" 
                  ? "text-gray-400 dark:text-gray-500 line-through" 
                  : "text-gray-700 dark:text-gray-200"
              }`}
              style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}
            >
              {task.description}
            </div>
          )}
          <div className="flex items-center">
            {!isEditing && (
              <Button
                variant="ghost"
                onClick={() => void (hasChildren ? handleRefreshSubtasks() : handleGenerateSubtasks())}
                disabled={isGeneratingSubtasks}
                className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400"
              >
                {isGeneratingSubtasks ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : hasChildren ? (
                  <RefreshCw size={18} />
                ) : (
                  <Zap size={18} />
                )}
              </Button>
            )}
            {showIcons && (
              <>
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleSave}
                      className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400"
                    >
                      <Check size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleDiscard}
                      className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X size={18} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleEdit}
                      className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400"
                    >
                      <Pen size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowAddSubtask(!showAddSubtask)}
                      className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400"
                    >
                      <Plus size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => void handleDelete()}
                      className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </>
                )}
              </>
            )}
            <Button
              variant="ghost"
              onClick={toggleIconsVisibility}
              className="h-7 w-7 p-0 text-gray-400 dark:text-gray-500 hover:text-amber-500 dark:hover:text-amber-400"
            >
              {showIcons ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <ul className="mt-1 space-y-1">
          {showAddSubtask && userId && (
            <li>
              <AddTaskForm
                userId={userId}
                parentId={task.id}
                onComplete={() => setShowAddSubtask(false)}
              />
            </li>
          )}
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