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
    <form onSubmit={handleSubmit} className="mb-8 relative">
      <Input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a new task"
        className="w-full p-3 pr-12 bg-white bg-opacity-80 rounded-full focus:outline-none focus:border-amber-300 text-gray-700 placeholder-gray-400 shadow-sm"
      />
      <Button 
        type="submit" 
        disabled={!userId}
        className="absolute right-1 top-1 bottom-1 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white w-8 h-8 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center shadow-sm p-0 overflow-hidden focus:ring-0 focus:ring-offset-0 focus-visible:outline-none"
      >
        <Plus size={16} />
      </Button>
    </form>
  );
}