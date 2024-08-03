"use client";
import { Plus } from "lucide-react";
import React, { useState, useCallback } from "react";
import { useTaskContext } from "~/app/_contexts/TaskContext";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface AddTaskFormProps {
  userId: string | null;
  parentId?: string | null;
  onComplete?: () => void;
}

export default function AddTaskForm({ userId, parentId = null, onComplete }: AddTaskFormProps) {
  const [description, setDescription] = useState("");
  const { addTask } = useTaskContext();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && userId) {
      await addTask({ description, userId, status: "todo", parentId });
      setDescription("");
      onComplete?.();
    }
  }, [description, userId, addTask, parentId, onComplete]);

  const isButtonDisabled = !userId || description.trim() === "";

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <div className="relative flex-grow">
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a new task..."
          className="pr-14 py-2 text-base w-full rounded-full"
        />
        <Button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 p-0 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center"
          disabled={isButtonDisabled}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}