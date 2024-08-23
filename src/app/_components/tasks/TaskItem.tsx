import React, { useState, useEffect } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { ChevronUp } from "lucide-react";
import type { Task } from "~/server/db/schema";
import TaskCheckbox from "./TaskCheckbox";
import TaskMenu from "./TaskMenu";
import TaskDescription from "./TaskDescription";
import AddSubtaskInput from "./AddSubtaskInput";

interface TaskItemProps {
  task: Task;
  level: number;
}

const INDENTATION_WIDTH = 1.75; // rem
const CHECKBOX_SIZE = 1.75; // rem
const INDICATOR_SIZE = 1.75; // rem
const SUBTASK_ADJUSTMENT = 0.5; // rem (adjust this value to fine-tune the position)

export default function TaskItem({ task, level }: TaskItemProps) {
  const {
    tasks,
    updateTask,
    deleteTask,
    loadSubtasks,
    generateAISubtasks,
    refreshSubtasks,
    createSubtask,
    userId,
  } = useTaskContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [hasChildren, setHasChildren] = useState(task.children.length > 0);
  const [childrenLoaded, setChildrenLoaded] = useState(false);
  const [isLoadingSubtasks, setIsLoadingSubtasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

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
    setIsEditing(true);
  };

  const handleSave = async (description: string) => {
    await updateTask(task.id, { description });
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setIsEditing(false);
  };

  const handleAddSubtaskClick = () => {
    setIsExpanded(true);
    setIsAddingSubtask(true);
  };

  const handleAddSubtask = async (description: string) => {
    if (description && userId) {
      await createSubtask(task.id, {
        description,
        userId,
        completed: false,
        status: "todo",
        priority: "none",
        dueDate: null,
      });
      setIsAddingSubtask(false);
    }
  };

  // Effect to update hasChildren when task.children changes
  useEffect(() => {
    setHasChildren(task.children.length > 0);
  }, [task.children]);

  return (
    <li className="mb-4 py-1">
      <div className="group relative flex min-h-[3rem] items-center py-2">
        <div
          className="absolute bottom-0 left-0 top-0"
          style={{ width: `${level * INDENTATION_WIDTH}rem` }}
        ></div>
        <div
          className="absolute left-0 ml-2 flex items-center"
          style={{
            width: `${INDICATOR_SIZE + CHECKBOX_SIZE + 0.5}rem`,
            marginLeft: `${level * INDENTATION_WIDTH}rem`,
          }}
        >
          <div
            className="relative"
            style={{
              width: `${INDICATOR_SIZE}rem`,
              height: `${INDICATOR_SIZE}rem`,
            }}
          >
            {hasChildren && (
              <div
                className="absolute left-0 top-0 z-10 flex cursor-pointer items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-black shadow-md transition-all duration-200 ease-in-out hover:bg-amber-600 active:bg-amber-700 active:shadow-inner"
                style={{
                  width: `${INDICATOR_SIZE}rem`,
                  height: `${INDICATOR_SIZE}rem`,
                  boxShadow:
                    "0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
                }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp
                    size={18}
                    className="stroke-2 text-black drop-shadow-sm"
                  />
                ) : (
                  <span className="text-base font-bold text-black drop-shadow-sm">
                    {task.children.length}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="ml-2">
            <TaskCheckbox
              task={task}
              isLoadingSubtasks={isLoadingSubtasks}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
        <div
          className="flex flex-grow items-center overflow-hidden pr-10"
          style={{
            paddingLeft: `calc(${level * INDENTATION_WIDTH}rem + ${INDICATOR_SIZE}rem + ${CHECKBOX_SIZE}rem + 1rem)`,
          }}
        >
          <div className="w-full overflow-hidden">
            <TaskDescription
              task={task}
              isEditing={isEditing}
              onSave={handleSave}
              onDiscard={handleDiscard}
            />
          </div>
        </div>
        {!isEditing && (
          <div className="absolute right-0 top-0 flex h-full items-center">
            <TaskMenu
              task={task}
              isGeneratingSubtasks={isGeneratingSubtasks}
              hasChildren={hasChildren}
              onGenerateSubtasks={handleGenerateSubtasks}
              onRefreshSubtasks={handleRefreshSubtasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddSubtask={handleAddSubtaskClick}
            />
          </div>
        )}
      </div>
      {(isExpanded || isAddingSubtask) && (
        <>
          <ul className="mt-2 space-y-2">
            <li
              style={{
                paddingLeft: `calc(${level * INDENTATION_WIDTH}rem + ${INDICATOR_SIZE}rem + ${CHECKBOX_SIZE}rem + 1rem - ${SUBTASK_ADJUSTMENT}rem)`,
              }}
            >
              {isAddingSubtask && (
                <AddSubtaskInput
                  onSave={handleAddSubtask}
                  onCancel={() => setIsAddingSubtask(false)}
                />
              )}
            </li>
            {task.children.map((subtaskId) => {
              const subtask = tasks.find((t) => t.id === subtaskId);
              return subtask ? (
                <TaskItem key={subtask.id} task={subtask} level={level + 1} />
              ) : null;
            })}
          </ul>
        </>
      )}
      {error && (
        <p
          className="mt-1 text-xs text-red-500"
          style={{ marginLeft: `${(level + 1) * INDENTATION_WIDTH}rem` }}
        >
          {error}
        </p>
      )}
    </li>
  );
}