import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronRight, Plus, Zap, Loader2, X } from "lucide-react";
import type { Task } from "~/server/db/schema";
import AddTaskForm from "./AddTaskForm";
import { Input } from "~/components/ui/input";

interface TaskItemProps {
  task: Task;
  level: number;
}

export default function TaskItem({ task, level }: TaskItemProps) {
  const { tasks, updateTask, deleteTask, loadSubtasks, generateAISubtasks, userId } = useTaskContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const subtasks = tasks.filter(t => task.children.includes(t.id));
  const hasChildren = task.children.length > 0;

  useEffect(() => {
    if (isExpanded && hasChildren && subtasks.length === 0) {
      loadSubtasks(task.id).catch(error => {
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

  return (
    <li className="mb-2">
      <div className="flex items-center group" style={{ marginLeft: `${level * 20}px` }}>
        <div className="relative">
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={() => void handleStatusChange()}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors duration-200 ease-in-out
              ${task.status === "done" ? 'bg-amber-500 text-white' : 'border-2 border-amber-300 hover:border-amber-500'}`}
          />
          {isExpanded && hasChildren && (
            <div className="absolute top-full left-1/2 w-px h-2 bg-amber-200" style={{ transform: 'translateX(-50%)' }}></div>
          )}
        </div>
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 text-amber-400 hover:text-amber-600 transition-colors duration-200 ease-in-out"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        )}
        <Input
          value={task.description}
          onChange={(e) => void updateTask(task.id, { description: e.target.value })}
          className={`ml-2 flex-grow bg-transparent focus:outline-none focus:border-b-2 focus:border-amber-300 py-1 rounded-lg
            ${task.status === "done" ? 'line-through text-gray-400' : 'text-gray-700'}`}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddSubtask(!showAddSubtask)}
          className="ml-2 text-amber-400 hover:text-amber-600 transition-colors duration-200 ease-in-out"
        >
          <Plus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleGenerateSubtasks()}
          disabled={isGeneratingSubtasks}
          className="ml-2 text-amber-400 hover:text-amber-600 transition-colors duration-200 ease-in-out"
        >
          {isGeneratingSubtasks ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleDelete()}
          className="ml-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"
        >
          <X size={16} />
        </Button>
      </div>
      {showAddSubtask && userId && (
        <AddTaskForm
          userId={userId}
          parentId={task.id}
          onComplete={() => setShowAddSubtask(false)}
        />
      )}
      {isExpanded && subtasks.length > 0 && (
        <ul className="mt-2 ml-2.5 pl-4 relative">
          <div className="absolute top-0 left-0 bottom-3 w-px bg-amber-200"></div>
          <div className="absolute bottom-3 left-0 w-2 h-2 rounded-full bg-amber-200" style={{ transform: 'translateX(-50%)' }}></div>
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </ul>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </li>
  );
}