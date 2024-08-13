import React from "react";
import { Loader2 } from "lucide-react";
import type { Task } from "~/server/db/schema";

interface TaskCheckboxProps {
  task: Task;
  isLoadingSubtasks: boolean;
  onStatusChange: () => void;
}

const CHECKBOX_SIZE = 1.5; // rem

export default function TaskCheckbox({
  task,
  isLoadingSubtasks,
  onStatusChange,
}: TaskCheckboxProps) {
  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: `${CHECKBOX_SIZE}rem`,
        height: `${CHECKBOX_SIZE}rem`,
      }}
      onClick={onStatusChange}
    >
      {isLoadingSubtasks ? (
        <div
          className="flex items-center justify-center"
          style={{
            width: `${CHECKBOX_SIZE}rem`,
            height: `${CHECKBOX_SIZE}rem`,
          }}
        >
          <Loader2 className="animate-spin text-amber-500" size={20} />
        </div>
      ) : (
        <div
          className={`absolute left-0 top-0 h-full w-full rounded-full transition-all duration-200 ease-in-out ${
            task.status === "done"
              ? "border-2 border-amber-500 bg-amber-500"
              : "border-2 border-amber-400 bg-white hover:border-amber-500 dark:border-amber-600 dark:bg-gray-800 dark:hover:border-amber-500"
          }`}
          style={{
            boxShadow:
              task.status === "done"
                ? "none"
                : "inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
          }}
        />
      )}
      {task.status === "done" && (
        <svg
          className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 text-white"
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
  );
}