"use client";
import React, { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && userId) {
      await addTask({ description, userId, status: "todo", parentId });
      setDescription("");
      onComplete?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a new task"
          className="flex-grow"
        />
        <Button type="submit" disabled={!userId}>Add Task</Button>
      </div>
    </form>
  );
}