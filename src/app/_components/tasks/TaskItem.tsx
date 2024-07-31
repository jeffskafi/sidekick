import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Zap, Loader2, X } from "lucide-react";
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
    userId,
  } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const subtasks = tasks.filter((t) => task.children.includes(t.id));
  const hasChildren = task.children.length > 0;

  const INDENTATION_WIDTH = 25; // Fixed indentation width in pixels

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

  useEffect(() => {
    if (isExpanded && hasChildren && subtasks.length === 0) {
      loadSubtasks(task.id).catch((error) => {
        console.error("Failed to load subtasks:", error);
        setError("Failed to load subtasks");
      });
    }
  }, [isExpanded, hasChildren, subtasks.length, loadSubtasks, task.id]);

  return (
    <li className="mb-2">
      <div 
        className="flex items-center"
        style={{ marginLeft: `${level * INDENTATION_WIDTH}px` }}
      >
        <div className="group flex items-center space-x-1 rounded-full border border-amber-200 bg-white p-2 shadow-sm transition-all hover:border-amber-300 hover:shadow-md">
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={() => void handleStatusChange()}
            className={`h-5 w-5 rounded-full transition-colors duration-200 ease-in-out ${
              task.status === "done"
                ? "bg-amber-500 text-white"
                : "border-2 border-amber-300 hover:border-amber-500"
            }`}
          />
          {hasChildren && (
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-5 w-5 p-0 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </Button>
          )}
          <input
            value={task.description}
            onChange={(e) =>
              void updateTask(task.id, { description: e.target.value })
            }
            className={`flex-grow bg-transparent px-2 py-1 text-sm focus:outline-none ${
              task.status === "done" ? "text-gray-400 line-through" : "text-gray-700"
            }`}
          />
          <Button
            variant="ghost"
            onClick={() => setShowAddSubtask(!showAddSubtask)}
            className="h-6 w-6 p-0 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={() => void handleGenerateSubtasks()}
            disabled={isGeneratingSubtasks}
            className="h-6 w-6 p-0 text-amber-400 hover:bg-amber-100 hover:text-amber-600"
          >
            {isGeneratingSubtasks ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Zap size={16} />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void handleDelete()}
            className="h-6 w-6 p-0 text-gray-300 opacity-0 transition-opacity duration-200 ease-in-out hover:bg-red-100 hover:text-red-500 group-hover:opacity-100"
          >
            <X size={16} />
          </Button>
        </div>
      </div>
      {showAddSubtask && userId && (
        <div className="mt-2" style={{ marginLeft: `${(level + 1) * INDENTATION_WIDTH}px` }}>
          <AddTaskForm
            userId={userId}
            parentId={task.id}
            onComplete={() => setShowAddSubtask(false)}
          />
        </div>
      )}
      {isExpanded && subtasks.length > 0 && (
        <ul className="mt-2 space-y-2">
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-red-500" style={{ marginLeft: `${(level + 1) * INDENTATION_WIDTH}px` }}>{error}</p>}
    </li>
  );
}