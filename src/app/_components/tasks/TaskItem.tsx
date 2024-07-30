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
      <div className="flex items-center" style={{ marginLeft: `${level * 20}px` }}>
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Button>
        ) : (
          <div style={{ width: '24px' }}></div>
        )}
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={() => void handleStatusChange()}
        />
        <span className={task.status === "done" ? "line-through" : ""}>
          {task.description}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddSubtask(!showAddSubtask)}
        >
          <Plus size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void handleGenerateSubtasks()}
          disabled={isGeneratingSubtasks}
        >
          {isGeneratingSubtasks ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => void handleDelete()}
        >
          Delete
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
        <ul className="mt-2">
          {subtasks.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} level={level + 1} />
          ))}
        </ul>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </li>
  );
}