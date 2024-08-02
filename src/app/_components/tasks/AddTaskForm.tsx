"use client";
import { Plus } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="mb-8 w-full">
      <div className="relative w-full">
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a new task"
          className="w-full p-3 pr-12 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <Button 
          type="submit" 
          disabled={!userId}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 hover:from-amber-500 hover:to-amber-600 dark:hover:from-amber-600 dark:hover:to-amber-700 text-white w-8 h-8 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center shadow-sm p-0 overflow-hidden focus:ring-2 focus:ring-offset-2 focus:ring-amber-300 dark:focus:ring-amber-500 focus:outline-none"
        >
          <Plus size={16} />
        </Button>
      </div>
    </form>
  );
}