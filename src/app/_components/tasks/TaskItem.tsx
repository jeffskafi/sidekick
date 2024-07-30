import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Zap, Loader2 } from "lucide-react";
import type { Task } from "~/server/db/schema";
import AddTaskForm from "./AddTaskForm";

interface TaskItemProps {
  task: Task;
  level: number;
}

export default function TaskItem({ task, level }: TaskItemProps) {
  const { tasks, updateTask, deleteTask, loadSubtasks, generateAISubtasks } =
    useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  useEffect(() => {
    setSubtasks(
      task.children
        .map((childId) => tasks.find((t) => t.id === childId))
        .filter((t): t is Task => t !== undefined),
    );
  }, [task, tasks]);

  const handleStatusChange = async () => {
    try {
      await updateTask(task.id, {
        status: task.status === "done" ? "todo" : "done",
      });
    } catch (err) {
      setError("Failed to update task status");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    }
  };

  const handleExpand = async () => {
    if (!isExpanded && task.children.length > 0) {
      try {
        await loadSubtasks(task.id);
        setIsExpanded(true);
      } catch (err) {
        setError("Failed to load subtasks");
        console.error(err);
      }
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleGenerateAISubtasks = async () => {
    setIsGeneratingSubtasks(true);
    setError(null);
    try {
      await generateAISubtasks(task.id);
      setIsExpanded(true);
    } catch (err) {
      setError("Failed to generate AI subtasks");
      console.error(err);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  return (
    <li className={`mb-2 ${level > 0 ? "ml-4" : ""}`}>
      {error && <div className="mb-2 text-red-500">{error}</div>}
      <div
        className={`flex items-center justify-between rounded bg-white p-2 shadow dark:bg-gray-800 ${level > 0 ? "border-l-2 border-gray-300" : ""}`}
      >
        <div className="flex items-center space-x-2">
          {task.children.length > 0 && (
            <button onClick={() => void handleExpand()}>
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={() => void handleStatusChange()}
          />
          <span className={task.status === "done" ? "line-through" : ""}>
            {task.description}
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowAddSubtask(!showAddSubtask);
            }}
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void handleGenerateAISubtasks()}
            disabled={isGeneratingSubtasks}
          >
            {isGeneratingSubtasks ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </div>
      </div>
      {showAddSubtask && (
        <div className="ml-4 mt-2">
          <AddTaskForm
            userId={task.userId}
            parentId={task.id}
            onComplete={() => {
              setShowAddSubtask(false);
            }}
          />
        </div>
      )}
      {isExpanded && subtasks.length > 0 && (
        <ul className="mt-2">
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}