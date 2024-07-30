"use client";

import { ChevronRight, Zap } from "lucide-react";
import React from "react";
import AnimatedCheckmark from "./AnimatedCheckmark";
import PriorityButton from "./PriorityButton";
import DueDateButton from "./DueDateButton";
import type { Task } from "~/server/db/schema";
import DeleteButton from "./DeleteButton";
import {
  updateTask,
  deleteTask,
  generateSubtasks,
  getSubtasks,
} from "~/server/actions/taskActions";

interface TaskItemProps {
  task: Task;
  depth?: number;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, depth = 0 }) => {
  const iconSize = 14;

  const handleToggle = async () => {
    await updateTask(task.id, { completed: !task.completed });
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
  };

  const handleUpdate = async (
    updates: Partial<Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">>,
  ) => {
    await updateTask(task.id, updates);
  };

  const handleGenerateSubtasks = async () => {
    await generateSubtasks(task.id);
  };

  const handleExpandSubtasks = async () => {
    await getSubtasks(task.id);
  };

  return (
    <li
      className={`group flex w-full flex-col items-start justify-between rounded-lg bg-background-light p-3 shadow-sm transition-colors duration-200 dark:bg-background-dark`}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="flex w-full items-start">
        <div className="mr-2 flex flex-shrink-0 items-center">
          <AnimatedCheckmark
            completed={task.completed}
            onToggle={handleToggle}
            size={iconSize}
          />
        </div>
        <div className="relative min-w-0 flex-grow">
          <p
            className={`line-clamp-2 cursor-pointer text-xs transition-all ${
              task.completed
                ? "text-text-light-dark"
                : "text-text-light dark:text-text-dark"
            }`}
            title={task.description}
          >
            {task.description}
          </p>
        </div>
        <div className="ml-2 flex flex-shrink-0 items-center space-x-2">
          <PriorityButton
            priority={task.priority}
            onToggle={() =>
              handleUpdate({
                priority: task.priority === "high" ? "low" : "high",
              })
            }
            size={iconSize}
          />
          <DueDateButton
            dueDate={task.dueDate}
            onSetDueDate={(date) => handleUpdate({ dueDate: date })}
            size={iconSize}
            theme="light"
          />
          <button
            onClick={handleGenerateSubtasks}
            className={`flex items-center justify-center w-${iconSize} h-${iconSize} text-blue-500 transition-colors duration-300 hover:text-blue-600 focus:outline-none dark:text-amber-400 dark:hover:text-amber-300`}
            title="Generate subtasks"
          >
            <Zap size={iconSize} className="pulse" />
          </button>
          <DeleteButton onDelete={handleDelete} size={iconSize} />
        </div>
      </div>
      {task.children.length > 0 && (
        <div className="relative mt-2 w-full">
          <div className="relative flex h-6 items-center justify-between">
            <button
              onClick={handleExpandSubtasks}
              className={`flex items-center text-xs text-gray-600 transition-colors duration-200 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300`}
            >
              <ChevronRight size={iconSize} />
              <span className="ml-1">Subtasks ({task.children.length})</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TaskItem;
