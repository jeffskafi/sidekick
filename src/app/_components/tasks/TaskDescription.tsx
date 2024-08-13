import React, { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Check, X } from "lucide-react";
import type { Task } from "~/server/db/schema";

interface TaskDescriptionProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (description: string) => void;
  onDiscard: () => void;
}

export default function TaskDescription({ task, isEditing, onSave, onDiscard }: TaskDescriptionProps) {
  const [editedDescription, setEditedDescription] = useState(task.description);

  useEffect(() => {
    setEditedDescription(task.description);
  }, [task.description]);

  const handleSave = () => {
    onSave(editedDescription);
  };

  if (isEditing) {
    return (
      <div className="flex items-center w-full">
        <Input
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="flex-grow border-none shadow-none focus:ring-0 bg-transparent px-0"
          autoFocus
        />
        <div className="flex-shrink-0 flex items-center">
          <Button onClick={handleSave} size="sm" variant="ghost" className="text-green-500 hover:text-green-600 hover:bg-green-100">
            <Check size={20} />
          </Button>
          <Button onClick={onDiscard} size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-100">
            <X size={20} />
          </Button>
        </div>
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