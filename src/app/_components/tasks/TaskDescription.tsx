import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Check, X } from "lucide-react";
import type { Task } from "~/server/db/schema";

const hoverClass = (baseClass: string): string =>
  `${baseClass} hover-effect:${baseClass}`;

interface TaskDescriptionProps {
  task: Task;
  onEdit: () => void;
  onSave: (description: string) => void;
  onDiscard: () => void;
}

export default function TaskDescription({ task, onSave, onDiscard }: TaskDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleSave = () => {
    onSave(editedDescription);
    setIsEditing(false);
  };

  const handleDiscard = () => {
    onDiscard();
    setIsEditing(false);
    setEditedDescription(task.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleDiscard();
    }
  };

  const iconButtonClass = "h-8 w-8 p-0 rounded-full transition-colors duration-200 ease-in-out no-highlight";

  if (isEditing) {
    return (
      <div className="flex flex-grow items-center">
        <Input
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-grow border-transparent text-sm focus:border-transparent focus:ring-0"
          variant="edit"
        />
        <Button
          variant="ghost"
          onClick={handleSave}
          className={`${iconButtonClass} ${hoverClass("text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300")}`}
        >
          <Check size={20} />
        </Button>
        <Button
          variant="ghost"
          onClick={handleDiscard}
          className={`${iconButtonClass} ${hoverClass("text-amber-500 hover:bg-amber-100 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-900 dark:hover:text-amber-300")}`}
        >
          <X size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className="mr-8 min-w-0 flex-grow">
      <div
        className={`line-clamp-3 overflow-hidden bg-transparent py-1.5 text-sm focus:outline-none ${
          task.status === "done"
            ? "text-gray-400 line-through dark:text-gray-500"
            : "text-gray-700 dark:text-gray-200"
        }`}
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "hidden",
        }}
      >
        {task.description}
      </div>
    </div>
  );
}