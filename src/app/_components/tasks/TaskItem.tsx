import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { ChevronRight, Plus, Zap, Loader2, X, RefreshCw } from "lucide-react";
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

  const subtasks = tasks.filter((t) => t.parentId === task.id);
  const hasChildren = subtasks.length > 0 || task.children.length > 0;

  const INDENTATION_WIDTH = 24; // Increased for better visual hierarchy

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

  return (
    <li className="mb-2">
      <div className="flex items-center" style={{ marginLeft: `${level * INDENTATION_WIDTH}px` }}>
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={() => void handleStatusChange()}
          className={`mr-2 h-4 w-4 rounded-sm transition-colors duration-200 ease-in-out ${
            task.status === "done"
              ? "bg-amber-500 text-white"
              : "border-2 border-amber-300 hover:border-amber-500"
          }`}
        />
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-6 w-6 p-0 mr-1 transition-transform duration-200 ease-in-out ${
            isExpanded ? "rotate-90" : ""
          }`}
        >
          <ChevronRight size={16} className={hasChildren ? "text-amber-500" : "text-gray-300"} />
        </Button>
        <input
          value={task.description}
          onChange={(e) => void updateTask(task.id, { description: e.target.value })}
          className={`flex-grow bg-transparent py-1 text-sm focus:outline-none ${
            task.status === "done" ? "text-gray-400 line-through" : "text-gray-700"
          }`}
        />
        <div className="flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            onClick={() => setShowAddSubtask(!showAddSubtask)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-amber-500"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => void (hasChildren ? handleRefreshSubtasks() : handleGenerateSubtasks())}
            disabled={isGeneratingSubtasks}
            className="h-6 w-6 p-0 text-gray-400 hover:text-amber-500"
          >
            {isGeneratingSubtasks ? (
              <Loader2 className="animate-spin" size={16} />
            ) : hasChildren ? (
              <RefreshCw size={16} />
            ) : (
              <Zap size={16} />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void handleDelete()}
            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-1 space-y-1" style={{ marginLeft: `${(level + 1) * INDENTATION_WIDTH}px` }}>
          {showAddSubtask && userId && (
            <AddTaskForm
              userId={userId}
              parentId={task.id}
              onComplete={() => setShowAddSubtask(false)}
            />
          )}
          {subtasks.length > 0 && (
            <ul className="space-y-1">
              {subtasks.map((subtask) => (
                <TaskItem key={subtask.id} task={subtask} level={level + 1} />
              ))}
            </ul>
          )}
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500" style={{ marginLeft: `${(level + 1) * INDENTATION_WIDTH}px` }}>
          {error}
        </p>
      )}
    </li>
  );
}