"use client";
import React from "react";
import { Plus, ChevronUp, ChevronDown, File, Camera, Mic } from "lucide-react";
import ActionButton from "./ActionButton";
import { isInputEmpty } from "~/app/_components/tasks/helpers";
import { createTask } from "~/server/actions/taskActions"
import AccessibleImage from "./AccessibleImage";


export default function AddTaskForm({ userId, theme }: { userId: string, theme: "light" | "dark" }) {
  const [input, setInput] = React.useState("");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInputEmpty(input)) {
      await createTask({ description: input, userId, parentId: null });
      setInput("");
      // You might want to implement a way to refresh the task list here
    }
  };

  return (
    <div className="mb-4 pt-4">
      <form onSubmit={handleAddTask} className="relative flex items-center">
        <div
          className={`relative flex h-10 w-full items-center rounded-full ${theme === "dark" ? "border-gray-600 bg-background-dark" : "border-gray-200 bg-background-light"} border`}
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`ml-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150`}
            aria-label="Other options"
          >
            {isMenuOpen ? (
              <ChevronUp
                size={16}
                className={theme === "dark" ? "text-primary-dark" : "text-primary"}
              />
            ) : (
              <ChevronDown
                size={16}
                className={theme === "dark" ? "text-primary-dark" : "text-primary"}
              />
            )}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task"
            className={`flex-grow bg-transparent pl-2 pr-10 text-sm focus:outline-none sm:text-base ${theme === "dark" ? "text-text-dark placeholder-gray-500" : "text-text-light placeholder-gray-400"}`}
          />
          <button
            type="submit"
            className={`absolute right-1 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-150 ${isInputEmpty(input) ? "cursor-not-allowed opacity-50" : ""}`}
            aria-label="Add task"
            disabled={isInputEmpty(input)}
          >
            <Plus
              size={16}
              className={`${theme === "dark" ? "text-primary-dark" : "text-primary"} ${isInputEmpty(input) ? "opacity-50" : ""}`}
            />
          </button>
        </div>
      </form>
      {isMenuOpen && (
        <div className="mt-2 flex items-center gap-2 pl-2">
          <ActionButton
            icon={<File size={14} className="text-amber-500" />}
            onClick={() => {/* Implement file upload logic */}}
            label="Upload file"
            theme={theme}
          />
          <ActionButton
            icon={<Camera size={14} className="text-amber-500" />}
            onClick={() => {/* Implement picture taking logic */}}
            label="Take picture"
            theme={theme}
          />
          <ActionButton
            icon={<AccessibleImage size={14} className="text-amber-500" />}
            onClick={() => {/* Implement image upload logic */}}
            label="Upload image"
            theme={theme}
          />
          <ActionButton
            icon={<Mic size={14} className="text-amber-500" />}
            onClick={() => {/* Implement microphone mode logic */}}
            label="Microphone mode"
            theme={theme}
          />
        </div>
      )}
    </div>
  );
}