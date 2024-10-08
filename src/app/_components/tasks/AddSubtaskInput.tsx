import React, { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "~/components/ui/button";

interface AddSubtaskInputProps {
  onSave: (description: string) => void;
  onCancel: () => void;
}

export default function AddSubtaskInput({ onSave, onCancel }: AddSubtaskInputProps) {
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (description.trim()) {
      onSave(description.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="flex items-center">
      <div className="w-7 h-7 rounded-full border-2 border-primary-light dark:border-primary-dark mr-2"></div>
      <input
        ref={inputRef}
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow bg-transparent outline-none"
        placeholder="New subtask..."
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        className="p-1 text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
      >
        <Check size={20} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
      >
        <X size={20} />
      </Button>
    </div>
  );
}