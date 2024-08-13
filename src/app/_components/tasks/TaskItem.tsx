import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Button } from "~/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { Task } from "~/server/db/schema";
import TaskCheckbox from "./TaskCheckbox";
import TaskMenu from "./TaskMenu";
import TaskDescription from "./TaskDescription";


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
  const [hasChildren, setHasChildren] = useState(task.children.length > 0);
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);

  const CHEVRON_WIDTH = 1.75;
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
      const parentTask = tasks.find((t) => t.id === task.parentId);
      if (parentTask) {
        const updatedParentChildren = parentTask.children.filter(
          (childId) => childId !== task.id,
        );
        await updateTask(parentTask.id, { children: updatedParentChildren });
      }
    }
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
    // Handle edit logic
  };

  const handleSave = async () => {
    // Handle save logic
  };

  const handleDiscard = () => {
    // Handle discard logic
  };

  const iconButtonClass =
    "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight";

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
          <TaskCheckbox
            task={task}
            isLoadingSubtasks={isLoadingSubtasks}
            onStatusChange={handleStatusChange}
          />
        </div>
        <div className="relative ml-4 flex flex-grow items-center overflow-hidden">
          <TaskDescription
            task={task}
            onEdit={handleEdit}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
          <TaskMenu
            task={task}
            isGeneratingSubtasks={isGeneratingSubtasks}
            hasChildren={hasChildren}
            onGenerateSubtasks={handleGenerateSubtasks}
            onRefreshSubtasks={handleRefreshSubtasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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
